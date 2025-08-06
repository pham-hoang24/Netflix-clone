import { fetchMediaDetailsFromTMDB, fetchTMDBMoviesByCategory, TMDBMovie, requests, TMDBResponse, TMDBGenre, TMDBImagesResponse } from '../dao/TMDBDAO';
import { saveMovieDetailsToFirestore, saveCategoryDataToFirestore, CategoryData } from '../dao/FirestoreDAO';
import axios from 'axios';

interface GenreMap {
  [key: number]: string;
}

let genreCache: GenreMap | null = null;

export class MediaService {
  private TMDB_API_KEY: string;
  private TMDB_URL: string = "https://api.themoviedb.org/3";

  constructor() {
    this.TMDB_API_KEY = process.env.TMDB_API_KEY!;
    if (!this.TMDB_API_KEY) {
      throw new Error('TMDB_API_KEY is required in environment variables');
    }
  }

  async getGenres(type: 'movie' | 'tv'): Promise<GenreMap> {
    if (!genreCache) {
      const res = await axios.get<{ genres: TMDBGenre[] }>(`${this.TMDB_URL}/genre/${type}/list`, { 
        params: { api_key: this.TMDB_API_KEY } 
      });
      genreCache = res.data.genres.reduce((m: GenreMap, g: TMDBGenre) => {
        m[g.id] = g.name;
        return m;
      }, {});
    }
    return genreCache;
  }

  async fetchAndProcessMediaDetails(id: number, type: 'movie' | 'tv'): Promise<any> {
    const details = await fetchMediaDetailsFromTMDB(id, type);
    return details; // Return the raw details object which contains genre_ids
  }

  async populateAllCategories(): Promise<void> {
    console.log(` Processing ${Object.keys(requests).length} categories...`);

    for (const [categoryName, url] of Object.entries(requests)) {
      if (typeof url === 'string') {
        await this.populateCategory(categoryName, url);
        // Add delay between categories to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    console.log(' All categories populated successfully!');
  }

  async populateCategory(categoryName: string, url: string): Promise<void> {
    console.log(`Fetching ${categoryName}...`);
    
    try {
      const movies = await fetchTMDBMoviesByCategory(url);

      if (!movies || movies.length === 0) {
        console.warn(`No movies found for category: ${categoryName}`);
        return;
      }

      const movieIds: string[] = [];
      const batchSize = 10; // Process movies in batches to avoid rate limiting
      
      for (let i = 0; i < movies.length; i += batchSize) {
        const batch = movies.slice(i, i + batchSize);
        
        const batchPromises = batch.map(async (movie: TMDBMovie) => {
          try {
            // Determine media type
            const type: 'movie' | 'tv' = movie.media_type === 'tv' || url.includes('/tv?') ? 'tv' : 'movie';
            const movieDetails = await fetchMediaDetailsFromTMDB(movie.id, type);

            // Store in Firestore
            await saveMovieDetailsToFirestore(movieDetails);
            return String(movie.id);
          } catch (error: any) {
            console.error(`Failed to process movie ${movie.id}:`, error.message);
            return null;
          }
        });

        const batchResults = await Promise.allSettled(batchPromises);
        
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value) {
            movieIds.push(result.value);
          } else {
            console.error(`Failed to process movie in batch ${i + index + 1}`);
          }
        });

        // Add delay between batches to respect API rate limits
        if (i + batchSize < movies.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Store category information
      const categoryData: CategoryData = {
        name: categoryName,
        movies: movieIds,
      };

      await saveCategoryDataToFirestore(categoryData);

      console.log(`Successfully populated ${categoryName} with ${movieIds.length} movies.`);
    } catch (error: any) {
      console.error(`Error populating category ${categoryName}:`, error.message);
      throw error;
    }
  }

  async getTrending(type: 'movie' | 'tv'): Promise<TMDBResponse<any>> {
    const tmdbUrl = `${this.TMDB_URL}/trending/${type}/day`;
    const response = await axios.get<TMDBResponse<any>>(tmdbUrl, {
      params: { api_key: this.TMDB_API_KEY },
    });
    return response.data;
  }

  async getAllGenres(): Promise<{ genres: TMDBGenre[] }> {
    const [movieRes, tvRes] = await Promise.all([
      axios.get<{ genres: TMDBGenre[] }>(`${this.TMDB_URL}/genre/movie/list`, {
        params: { api_key: this.TMDB_API_KEY, language: 'en-US' },
      }),
      axios.get<{ genres: TMDBGenre[] }>(`${this.TMDB_URL}/genre/tv/list`, {
        params: { api_key: this.TMDB_API_KEY, language: 'en-US' },
      })
    ]);

    const allGenres = [...movieRes.data.genres, ...tvRes.data.genres];
    const genreMap: GenreMap = {};
    allGenres.forEach(g => {
      genreMap[g.id] = g.name;
    });

    return { genres: allGenres };
  }

  async getTrendingWithDetails(): Promise<any[]> {
    const [movieRes, tvRes] = await Promise.all([
      axios.get<TMDBResponse<any>>(`${this.TMDB_URL}/trending/movie/day`, {
        params: { api_key: this.TMDB_API_KEY },
      }),
      axios.get<TMDBResponse<any>>(`${this.TMDB_URL}/trending/tv/day`, {
        params: { api_key: this.TMDB_API_KEY },
      }),
    ]);

    const combinedItems = [...movieRes.data.results, ...tvRes.data.results]
      .filter((item: any) => item.poster_path || item.backdrop_path)
      .sort((a: any, b: any) => b.popularity - a.popularity)
      .slice(0, 10);

    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    const itemsWithLogos = await Promise.all(
      combinedItems.map(async (item: any) => {
        const type = item.title ? 'movie' : 'tv';
        try {
          const { data: images } = await axios.get<TMDBImagesResponse>(
            `${this.TMDB_URL}/${type}/${item.id}/images`,
            {
              params: {
                api_key: this.TMDB_API_KEY,
                include_image_language: 'en,null',
              },
            }
          );

          const logoPath = images.logos?.find(l => l.file_path?.endsWith('.png'))?.file_path;
          return {
            ...item,
            logo_url: logoPath ? `${IMAGE_BASE}${logoPath}` : null,
          };
        } catch (err: any) {
          console.error(`Logo fetch failed for ${item.title || item.name}:`, err.message);
          return { ...item, logo_url: null };
        }
      })
    );
    return itemsWithLogos;
  }

  async multiSearch(query: string): Promise<TMDBResponse<TMDBMovie>> {
    const response = await axios.get(`${this.TMDB_URL}/search/multi`, {
      params: {
        api_key: this.TMDB_API_KEY,
        query: query,
        language: 'en-US',
      },
    });
    return response.data;
  }

  async getMoviesByGenre(genre: string, limit: number = 10): Promise<TMDBMovie[]> {
    // This is a placeholder. A real implementation would query TMDB for movies by genre.
    // TMDB's /discover/movie endpoint can be used with 'with_genres' parameter.
    console.warn(`getMoviesByGenre for genre: ${genre} is a placeholder and needs full TMDB integration.`);
    try {
      const response = await axios.get<TMDBResponse<TMDBMovie>>(`${this.TMDB_URL}/discover/movie`, {
        params: {
          api_key: this.TMDB_API_KEY,
          with_genres: genre, // This assumes 'genre' is the TMDB genre ID. You might need a mapping.
          language: 'en-US',
          sort_by: 'popularity.desc',
        },
      });
      return response.data.results.slice(0, limit);
    } catch (error: any) {
      console.error(`Error fetching movies by genre ${genre} from TMDB:`, error.message);
      return [];
    }
  }
}
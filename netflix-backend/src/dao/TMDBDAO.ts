import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

// Type definitions
export interface TMDBMovie {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
  adult?: boolean;
  backdrop_path?: string;
  genre_ids?: number[];
  original_language?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  video?: boolean;
  vote_average?: number;
  vote_count?: number;
  [key: string]: any;
}

export interface TMDBResponse<T> {
  results: T[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

export interface TMDBCredits {
  crew: CrewMember[];
  cast?: any[];
}

export interface MovieDetails extends TMDBMovie {
  director: string | null;
}

export interface RequestsConfig {
  [categoryName: string]: string;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBLogo {
  file_path: string;
}

export interface TMDBImagesResponse {
  logos?: TMDBLogo[];
}

const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_URL = "https://api.themoviedb.org/3";

// Validate required environment variables
if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is required in environment variables');
}

export const requests: RequestsConfig = {
  fetchNetflixOriginals: `/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
  fetchTrending: `/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchTopRated: `/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchActionMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`,
  fetchComedyMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27`,
  fetchRomanceMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=10749`,
  fetchDocumentaries: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99`,
};

export async function fetchMediaDetailsFromTMDB(id: number, type: 'movie' | 'tv'): Promise<MovieDetails> {
  const params = { api_key: TMDB_API_KEY };
  
  try {
    const [detailsRes, creditsRes] = await Promise.all([
      axios.get<TMDBMovie>(`${TMDB_URL}/${type}/${id}`, { params }),
      axios.get<TMDBCredits>(`${TMDB_URL}/${type}/${id}/credits`, { params }),
    ]);

    const director = creditsRes.data.crew.find(c => c.job === 'Director')?.name || null;

    return {
      ...detailsRes.data,
      director,
    };
  } catch (error: any) {
    console.error(`Error fetching details for ${type} ${id} from TMDB:`, error.message);
    throw error;
  }
}

export async function fetchTMDBMoviesByCategory(url: string): Promise<TMDBMovie[]> {
  try {
    const response = await axios.get<TMDBResponse<TMDBMovie>>(`${TMDB_URL}${url}`);
    return response.data.results;
  } catch (error: any) {
    console.error(`Error fetching movies from TMDB with URL ${url}:`, error.message);
    throw error;
  }
}

export async function testTMDBConnection(): Promise<void> {
  try {
    await axios.get(`${TMDB_URL}/configuration?api_key=${TMDB_API_KEY}`);
    console.log('✅ TMDB API connection successful');
  } catch (error: any) {
    console.error('❌ TMDB API connection failed:', error.message);
    throw error;
  }
}
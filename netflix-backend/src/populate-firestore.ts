import axios from 'axios';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Type definitions
interface TMDBMovie {
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

interface TMDBResponse {
  results: TMDBMovie[];
  page?: number;
  total_pages?: number;
  total_results?: number;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path?: string;
}

interface TMDBCredits {
  crew: CrewMember[];
  cast?: any[];
}

interface MovieDetails extends TMDBMovie {
  director: string | null;
}

interface CategoryData {
  name: string;
  movies: string[];
}

interface RequestsConfig {
  [categoryName: string]: string;
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "netflix-clone-62aec",
    });
  } catch (error) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID!,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')!,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL!,
      }),
    });
  }
}

const db = admin.firestore();
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_URL = "https://api.themoviedb.org/3";

// Validate required environment variables
if (!TMDB_API_KEY) {
  throw new Error('TMDB_API_KEY is required in environment variables');
}

const requests: RequestsConfig = {
  fetchNetflixOriginals: `/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
  fetchTrending: `/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchTopRated: `/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchActionMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`,
  fetchComedyMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27`,
  fetchRomanceMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=10749`,
  fetchDocumentaries: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99`,
};

async function fetchMediaDetails(id: number, type: 'movie' | 'tv'): Promise<MovieDetails> {
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
    console.error(`Error fetching details for ${type} ${id}:`, error.message);
    throw error;
  }
}

async function populateCategory(categoryName: string, url: string): Promise<void> {
  console.log(`Fetching ${categoryName}...`);
  
  try {
    const response = await axios.get<TMDBResponse>(`${TMDB_URL}${url}`);
    const movies = response.data.results;

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
          const movieDetails = await fetchMediaDetails(movie.id, type);

          // Store in Firestore
          await db.collection('movies').doc(String(movie.id)).set(movieDetails);
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

    await db.collection('categories').doc(categoryName).set(categoryData);

    console.log(`Successfully populated ${categoryName} with ${movieIds.length} movies.`);
  } catch (error: any) {
    console.error(`Error populating category ${categoryName}:`, error.message);
    throw error;
  }
}

async function validateEnvironment(): Promise<void> {
  if (!process.env.TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY environment variable is required');
  }
  
  if (!process.env.FIREBASE_PROJECT_ID && !require('./serviceAccountKey.json')) {
    throw new Error('Firebase configuration is required (either serviceAccountKey.json or environment variables)');
  }
}

async function testFirebaseConnection(): Promise<void> {
  try {
    // Test Firestore connection
    await db.collection('_test').limit(1).get();
    console.log('✅ Firebase connection successful');
  } catch (error: any) {
    console.error('❌ Firebase connection failed:', error.message);
    throw error;
  }
}

async function testTMDBConnection(): Promise<void> {
  try {
    // Test TMDB API connection
    await axios.get(`${TMDB_URL}/configuration?api_key=${TMDB_API_KEY}`);
    console.log('✅ TMDB API connection successful');
  } catch (error: any) {
    console.error('❌ TMDB API connection failed:', error.message);
    throw error;
  }
}

async function main(): Promise<void> {
  console.log('🚀 Starting Firestore population script...');
  
  try {
    // Validate environment and connections
    await validateEnvironment();
    await testFirebaseConnection();
    await testTMDBConnection();

    console.log(`📊 Processing ${Object.keys(requests).length} categories...`);

    // Process categories sequentially to avoid overwhelming the API
    for (const [categoryName, url] of Object.entries(requests)) {
      if (typeof url === 'string') {
        await populateCategory(categoryName, url);
        
        // Add delay between categories
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('🎉 All categories populated successfully!');
    
    // Optional: Print summary
    const categoriesSnapshot = await db.collection('categories').get();
    console.log(`📈 Summary: ${categoriesSnapshot.size} categories created`);
    
  } catch (error: any) {
    console.error('💥 Error populating Firestore:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n⏹️  Script interrupted by user');
  process.exit(0);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

export { main, populateCategory, fetchMediaDetails };
import express, { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import cors from 'cors';
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

// Type definitions
interface AuthenticatedRequest extends Request {
  userId?: string;
  userEmail?: string;
}

interface EventLogRequest {
  event: string;
  movieId?: string;
  watchTimeSeconds?: number;
  searchTerm?: string;
  deviceType?: string;
  sessionId?: string;
  movieName?: string;
  genre?: string;
  publishDate?: string;
  director?: string;
  metadata?: Record<string, any>;
}

interface MediaDetails {
  movieName: string;
  genre: string | null;
  publishDate: string | null;
  director: string | null;
}

interface GenreMap {
  [key: number]: string;
}

interface TMDBGenre {
  id: number;
  name: string;
}

interface TMDBResponse<T> {
  data: T;
}

interface TMDBMovieDetails {
  title?: string;
  name?: string;
  genre_ids?: number[];
  release_date?: string;
  first_air_date?: string;
}

interface TMDBCredits {
  crew: Array<{
    job: string;
    name: string;
  }>;
}

interface TMDBTrendingResponse {
  results: Array<{
    id: number;
    title?: string;
    name?: string;
    poster_path?: string;
    backdrop_path?: string;
    popularity: number;
    [key: string]: any;
  }>;
}

interface TMDBImagesResponse {
  logos?: Array<{
    file_path: string;
  }>;
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Option 1: Using service account key file (recommended for local development)
  try {
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: "netflix-clone-62aec",
    });
  } catch (error) {
    // Option 2: Using environment variables (recommended for production)
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

const app = express();
const PORT = process.env.PORT || 2000;
const TMDB_API_KEY = process.env.TMDB_API_KEY!;
const TMDB_URL = "https://api.themoviedb.org/3";

let genreCache: GenreMap | null = null;

async function getGenres(type: 'movie' | 'tv'): Promise<GenreMap> {
  if (!genreCache) {
    const res = await axios.get<{ genres: TMDBGenre[] }>(`${TMDB_URL}/genre/${type}/list`, { 
      params: { api_key: TMDB_API_KEY } 
    });
    genreCache = res.data.genres.reduce((m: GenreMap, g: TMDBGenre) => {
      m[g.id] = g.name;
      return m;
    }, {});
  }
  return genreCache;
}

async function fetchMediaDetails(id: string, type: 'movie' | 'tv'): Promise<MediaDetails> {
  const params = { api_key: TMDB_API_KEY };
  const [detailsRes, creditsRes] = await Promise.all([
    axios.get<TMDBMovieDetails>(`${TMDB_URL}/${type}/${id}`, { params }),
    axios.get<TMDBCredits>(`${TMDB_URL}/${type}/${id}/credits`, { params }),
  ]);

  const genres = await getGenres(type);
  const director = creditsRes.data.crew.find(c => c.job === 'Director')?.name || null;

  return {
    movieName: detailsRes.data.title || detailsRes.data.name || '',
    genre: detailsRes.data.genre_ids?.map(gId => genres[gId]).filter(Boolean).join(', ') || null,
    publishDate: detailsRes.data.release_date || detailsRes.data.first_air_date || null,
    director
  };
}

app.use(cors({ origin: true }));
app.use(express.json());

// Middleware to verify Firebase ID token and extract user ID
const authenticateUser = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'No valid authorization header found' });
      return;
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    next();
  } catch (error: any) {
    console.error('Authentication error:', error.message);
    res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ✅ NEW: Event logging endpoint
app.post('/api/log-event', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      event,
      movieId,
      watchTimeSeconds,
      searchTerm,
      deviceType,
      sessionId,
      movieName,
      genre,
      publishDate,
      director,
      metadata = {}
    }: EventLogRequest = req.body;

    // Validate required fields
    if (!event) {
      res.status(400).json({ error: 'Event type is required' });
      return;
    }

    // Create the event document
    const eventData: Record<string, any> = {
      userId: req.userId,
      event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: new Date().toISOString(), // Backup timestamp
      ...(movieId && { movieId }),
      ...(watchTimeSeconds !== undefined && { watchTimeSeconds }),
      ...(searchTerm && { searchTerm }),
      ...(deviceType && { deviceType }),
      ...(sessionId && { sessionId }),
      ...(movieName && { movieName }),
      ...(genre && { genre }),
      ...(publishDate && { publishDate }),
      ...(director && { director }),
      ...metadata
    };

    // Add the event to Firestore
    const docRef = await db.collection('userEvents').add(eventData);
    
    console.log(`Event logged: ${event} for user ${req.userId}, docId: ${docRef.id}`);
    
    res.status(201).json({
      success: true,
      eventId: docRef.id,
      message: 'Event logged successfully'
    });

  } catch (error: any) {
    console.error('Error logging event:', error.message);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// ✅ NEW: Get movie details
app.get('/api/movie-details/:id/:type', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, type } = req.params;
    if (!id || !type || (type !== 'movie' && type !== 'tv')) {
      res.status(400).json({ error: 'Invalid movie ID or type' });
      return;
    }
    const details = await fetchMediaDetails(id, type as 'movie' | 'tv');
    res.json(details);
  } catch (error: any) {
    console.error('Error fetching movie details:', error.message);
    res.status(500).json({ error: 'Failed to fetch movie details' });
  }
});

// ✅ NEW: Get user events (useful for debugging/analytics)
app.get('/api/user-events', authenticateUser, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { limit = '50', eventType } = req.query;
    
    let query = db.collection('userEvents')
      .where('userId', '==', req.userId!)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit as string));

    if (eventType) {
      query = query.where('event', '==', eventType as string);
    }

    const snapshot = await query.get();
    const events: any[] = [];
    
    snapshot.forEach(doc => {
      const data = doc.data();
      events.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp?.toDate?.()?.toISOString() || data.serverTimestamp
      });
    });

    res.json({ events, total: events.length });
  } catch (error: any) {
    console.error('Error fetching user events:', error.message);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// ✅ NEW: Health check endpoint
app.get('/api/health', (req: Request, res: Response): void => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      tmdb: !!TMDB_API_KEY,
      firebase: !!admin.apps.length
    }
  });
});

// 👇 Existing routes (unchanged)
app.get('/api/trending', async (req: Request, res: Response): Promise<void> => {
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/trending/movie/day`;
    const response = await axios.get<TMDBTrendingResponse>(tmdbUrl, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching data from TMDB:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/trending/movie', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get<TMDBTrendingResponse>('https://api.themoviedb.org/3/trending/movie/day', {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

app.get('/api/trending/tv', async (req: Request, res: Response): Promise<void> => {
  try {
    const response = await axios.get<TMDBTrendingResponse>('https://api.themoviedb.org/3/trending/tv/day', {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching TV shows:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

app.get('/api/genres', async (req: Request, res: Response): Promise<void> => {
  try {
    const [movieRes, tvRes] = await Promise.all([
      axios.get<{ genres: TMDBGenre[] }>('https://api.themoviedb.org/3/genre/movie/list', {
        params: { api_key: TMDB_API_KEY, language: 'en-US' },
      }),
      axios.get<{ genres: TMDBGenre[] }>('https://api.themoviedb.org/3/genre/tv/list', {
        params: { api_key: TMDB_API_KEY, language: 'en-US' },
      })
    ]);

    const allGenres = [...movieRes.data.genres, ...tvRes.data.genres];
    const genreMap: GenreMap = {};
    allGenres.forEach(g => {
      genreMap[g.id] = g.name;
    });

    res.json({ genres: allGenres });
  } catch (error: any) {
    console.error('Error fetching genre data:', error.message);
    res.status(500).json({ error: 'Failed to fetch genre list' });
  }
});

app.get('/api/trending-with-details', async (req: Request, res: Response): Promise<void> => {
  try {
    const [movieRes, tvRes] = await Promise.all([
      axios.get<TMDBTrendingResponse>(`https://api.themoviedb.org/3/trending/movie/day`, {
        params: { api_key: TMDB_API_KEY },
      }),
      axios.get<TMDBTrendingResponse>(`https://api.themoviedb.org/3/trending/tv/day`, {
        params: { api_key: TMDB_API_KEY },
      }),
    ]);

    const combinedItems = [...movieRes.data.results, ...tvRes.data.results]
      .filter((item) => item.poster_path || item.backdrop_path)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);

    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

    const itemsWithLogos = await Promise.all(
      combinedItems.map(async (item) => {
        const type = item.title ? 'movie' : 'tv';
        try {
          const { data: images } = await axios.get<TMDBImagesResponse>(
            `https://api.themoviedb.org/3/${type}/${item.id}/images`,
            {
              params: {
                api_key: TMDB_API_KEY,
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

    res.json(itemsWithLogos);
  } catch (error: any) {
    console.error('Error fetching trending data with details:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending data with details' });
  }
});

// NEW: Multi-search endpoint
app.get('/api/search/multi', async (req: Request, res: Response): Promise<void> => {
  try {
    const searchQuery = req.query.query as string;
    if (!searchQuery) {
      res.status(400).json({ error: 'Search query is required.' });
      return;
    }

    const response = await axios.get(`${TMDB_URL}/search/multi`, {
      params: {
        api_key: TMDB_API_KEY,
        query: searchQuery,
        language: 'en-US',
      },
    });
    res.json(response.data);
  } catch (error: any) {
    console.error('Error fetching multi-search data from TMDB:', error.message);
    res.status(500).json({ error: 'Failed to fetch multi-search data.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Firebase Admin initialized: ${!!admin.apps.length}`);
});
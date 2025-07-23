const express = require('express');
const axios = require('axios');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  // Option 1: Using service account key file (recommended for local development)
  // Make sure to add your service account key file to your project
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
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
}

const db = admin.firestore();

const app = express();
const PORT = process.env.PORT || 2000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());

// Middleware to verify Firebase ID token and extract user ID
const authenticateUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No valid authorization header found' });
    }

    const idToken = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.userId = decodedToken.uid;
    req.userEmail = decodedToken.email;
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

// ✅ NEW: Event logging endpoint
app.post('/api/log-event', authenticateUser, async (req, res) => {
  try {
    const {
      event,
      movieId,
      watchTimeSeconds,
      searchTerm,
      deviceType,
      sessionId,
      metadata = {}
    } = req.body;

    // Validate required fields
    if (!event) {
      return res.status(400).json({ error: 'Event type is required' });
    }

    // Create the event document
    const eventData = {
      userId: req.userId,
      event,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      serverTimestamp: new Date().toISOString(), // Backup timestamp
      ...(movieId && { movieId }),
      ...(watchTimeSeconds !== undefined && { watchTimeSeconds }),
      ...(searchTerm && { searchTerm }),
      ...(deviceType && { deviceType }),
      ...(sessionId && { sessionId }),
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

  } catch (error) {
    console.error('Error logging event:', error.message);
    res.status(500).json({ error: 'Failed to log event' });
  }
});

// ✅ NEW: Get user events (useful for debugging/analytics)
app.get('/api/user-events', authenticateUser, async (req, res) => {
  try {
    const { limit = 50, eventType } = req.query;
    
    let query = db.collection('userEvents')
      .where('userId', '==', req.userId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit));

    if (eventType) {
      query = query.where('event', '==', eventType);
    }

    const snapshot = await query.get();
    const events = [];
    
    snapshot.forEach(doc => {
      events.push({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate?.()?.toISOString() || doc.data().serverTimestamp
      });
    });

    res.json({ events, total: events.length });
  } catch (error) {
    console.error('Error fetching user events:', error.message);
    res.status(500).json({ error: 'Failed to fetch user events' });
  }
});

// ✅ NEW: Health check endpoint
app.get('/api/health', (req, res) => {
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
app.get('/api/trending', async (req, res) => {
  try {
    const tmdbUrl = `https://api.themoviedb.org/3/trending/movie/day`;
    const response = await axios.get(tmdbUrl, {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching data from TMDB:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/trending/movie', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/trending/movie/day', {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching movies:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

app.get('/api/trending/tv', async (req, res) => {
  try {
    const response = await axios.get('https://api.themoviedb.org/3/trending/tv/day', {
      params: { api_key: TMDB_API_KEY },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching TV shows:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending TV shows' });
  }
});

app.get('/api/genres', async (req, res) => {
  try {
    const [movieRes, tvRes] = await Promise.all([
      axios.get('https://api.themoviedb.org/3/genre/movie/list', {
        params: { api_key: TMDB_API_KEY, language: 'en-US' },
      }),
      axios.get('https://api.themoviedb.org/3/genre/tv/list', {
        params: { api_key: TMDB_API_KEY, language: 'en-US' },
      })
    ]);

    const allGenres = [...movieRes.data.genres, ...tvRes.data.genres];
    const genreMap = {};
    allGenres.forEach(g => {
      genreMap[g.id] = g.name;
    });

    res.json({ genres: allGenres });
  } catch (error) {
    console.error('Error fetching genre data:', error.message);
    res.status(500).json({ error: 'Failed to fetch genre list' });
  }
});

app.get('/api/trending-with-details', async (req, res) => {
  try {
    const [movieRes, tvRes] = await Promise.all([
      axios.get(`https://api.themoviedb.org/3/trending/movie/day`, {
        params: { api_key: TMDB_API_KEY },
      }),
      axios.get(`https://api.themoviedb.org/3/trending/tv/day`, {
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
          const { data: images } = await axios.get(
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
        } catch (err) {
          console.error(`Logo fetch failed for ${item.title || item.name}:`, err.message);
          return { ...item, logo_url: null };
        }
      })
    );

    res.json(itemsWithLogos);
  } catch (error) {
    console.error('Error fetching trending data with details:', error.message);
    res.status(500).json({ error: 'Failed to fetch trending data with details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Firebase Admin initialized: ${!!admin.apps.length}`);
});
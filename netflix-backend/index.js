const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

app.use(cors());
app.use(express.json());

// 👇 Existing route (can rename if you want)
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

// ✅ New route: Trending Movies
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

// ✅ New route: Trending TV
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

// ✅ New route: Combined Genre Map
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

    res.json({ genres: genreMap });
  } catch (error) {
    console.error('Error fetching genre data:', error.message);
    res.status(500).json({ error: 'Failed to fetch genre list' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

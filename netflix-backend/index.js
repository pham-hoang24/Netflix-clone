const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 2000;
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

    res.json({ genres: allGenres });
  } catch (error) {
    console.error('Error fetching genre data:', error.message);
    res.status(500).json({ error: 'Failed to fetch genre list' });
  }
});


// ✅ New route: Getting the logo URL
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
      .slice(0, 10); // Get top 10 trending items

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
});

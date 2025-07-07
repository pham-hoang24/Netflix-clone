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


// ✅ New route: Getting the logo URL
app.get('/api/logo/map', async (req, res) => {
  const { type } = req.query; // type = "movie" or "tv"

  if (!type || !['movie', 'tv'].includes(type)) {
    return res.status(400).json({ error: 'Missing or invalid type (must be movie or tv)' });
  }

  try {
    // Fetch trending list for the given type
    const { data } = await axios.get(`https://api.themoviedb.org/3/trending/${type}/day`, {
      params: { api_key: TMDB_API_KEY },
    });

    const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
    const items = data.results.slice(0, 10);

    // Fetch logos for each item and build a name → logo_url map
    const logoMap = {};

    await Promise.all(
      items.map(async (item) => {
        const name = item.title || item.name || `ID_${item.id}`;
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
          logoMap[name] = logoPath ? `${IMAGE_BASE}${logoPath}` : null;
        } catch (err) {
          console.error(`Logo fetch failed for ${name}:`, err.message);
          logoMap[name] = null;
        }
      })
    );

    res.json(logoMap);
  } catch (error) {
    console.error('Error building logo map:', error.message);
    res.status(500).json({ error: 'Failed to build logo map' });
  }
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

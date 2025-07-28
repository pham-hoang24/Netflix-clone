

const axios = require('axios');
const admin = require('firebase-admin');
require('dotenv').config();

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
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
  }
}

const db = admin.firestore();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";

const requests = {
  fetchNetflixOriginals: `/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
  fetchTrending: `/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchTopRated: `/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`,
  fetchActionMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`,
  fetchComedyMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`,
  fetchHorrorMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27`,
  fetchRomanceMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=10749`,
  fetchDocumentaries: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99`,
};

async function fetchMediaDetails(id, type) {
  const params = { api_key: TMDB_API_KEY };
  const [detailsRes, creditsRes] = await Promise.all([
    axios.get(`${TMDB_URL}/${type}/${id}`, { params }),
    axios.get(`${TMDB_URL}/${type}/${id}/credits`, { params }),
  ]);

  const director = creditsRes.data.crew.find(c => c.job === 'Director')?.name || null;

  return {
    ...detailsRes.data,
    director,
  };
}

async function populateCategory(categoryName, url) {
  console.log(`Fetching ${categoryName}...`);
  const response = await axios.get(`${TMDB_URL}${url}`);
  const movies = response.data.results;

  const movieIds = [];

  for (const movie of movies) {
    const type = movie.media_type || (url.includes('/tv?') ? 'tv' : 'movie');
    const movieDetails = await fetchMediaDetails(movie.id, type);

    await db.collection('movies').doc(String(movie.id)).set(movieDetails);
    movieIds.push(String(movie.id));
  }

  await db.collection('categories').doc(categoryName).set({
    name: categoryName,
    movies: movieIds,
  });

  console.log(`Successfully populated ${categoryName} with ${movieIds.length} movies.`);
}

async function main() {
  try {
    for (const [categoryName, url] of Object.entries(requests)) {
      if (typeof url === 'string') {
        await populateCategory(categoryName, url);
      }
    }
    console.log('All categories populated successfully!');
  } catch (error) {
    console.error('Error populating Firestore:', error);
  }
}

main();

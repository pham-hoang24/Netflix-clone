
import axios from 'axios';
import { Movie } from '../home/HomePage/types/HomePageTypes';

const API_BASE = 'http://localhost:2000';

interface GenreResponse {
  genres: { id: number; name: string }[];
}

export const fetchGenres = async (): Promise<{ [id: number]: string }> => {
  const response = await axios.get<GenreResponse>(`${API_BASE}/api/genres`);
  const genreMap: { [id: number]: string } = {};
  response.data.genres.forEach((genre) => {
    genreMap[genre.id] = genre.name;
  });
  return genreMap;
};

export const fetchTrendingWithDetails = async (): Promise<Movie[]> => {
  const response = await axios.get<Movie[]>(`${API_BASE}/api/trending-with-details`);
  return response.data;
};

export const fetchPersonalizedRecommendations = async (idToken: string): Promise<any[]> => {
  const response = await axios.get(`${API_BASE}/api/recommendations/personalized`, {
    headers: {
      Authorization: `Bearer ${idToken}`
    }
  });
  return response.data;
};

export const fetchMoviesByGenres = async (genreIds: number[]): Promise<any[]> => {
  const response = await axios.post(`${API_BASE}/api/recommendations/by-genres`, {
    genreIds
  });
  return response.data;
};

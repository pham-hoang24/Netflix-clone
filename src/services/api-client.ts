
import axios from 'axios';

const API_BASE = 'http://localhost:2000';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_SMALL = 'https://image.tmdb.org/t/p/w780';

export interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  genre_ids?: number[];
  release_date?: string;
  logo_url?: string | null;
}

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

export const fetchTrendingWithDetails = async (): Promise<TrendingItem[]> => {
  const response = await axios.get<TrendingItem[]>(`${API_BASE}/api/trending-with-details`);
  return response.data;
};

import React, { useState, useEffect, useCallback } from 'react';
import Row from '../Row';
import YouTube, { YouTubeProps } from "react-youtube";
import { useAuth } from '../../context/AuthContext';
import { logUserEvent } from '../../services/analytics';
import { getMoviesForCategory } from '../../services/movieService';
import { TrailerService } from '../../services/trailerService';
import placeholderImg from './istockphoto-1147544807-612x612.jpg';
import { fetchPersonalizedRecommendations } from '../../services/api-client';
import { auth } from '../../services/firebase';

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
}

interface RowContainerProps {
  title: string;
  categoryId?: string; // Make categoryId optional
  rowType?: 'category' | 'personalized'; // New prop to distinguish row types
  isLargeRow?: boolean;
  onMovieClick: (movie: Movie) => void;
  isPlayerActive: boolean;
  trailerUrl: string;
  noTrailer: boolean;
  youtubeOpts: any;
  onPlayerReady: (event: any) => void;
  onPlayerStateChange: (event: any) => void;
}

const RowContainer: React.FC<RowContainerProps> = ({
  title,
  categoryId,
  rowType = 'category', // Default to category
  isLargeRow = false,
  onMovieClick,
  isPlayerActive,
  trailerUrl,
  noTrailer,
  youtubeOpts,
  onPlayerReady,
  onPlayerStateChange
}) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let fetchedMovies: Movie[] = [];

        if (rowType === 'personalized') {
          if (!currentUser || !auth.currentUser) {
            setError("Authentication required for personalized recommendations.");
            setIsLoading(false);
            return;
          }
          const idToken = await auth.currentUser.getIdToken();
          const rawRecommendations = await fetchPersonalizedRecommendations(idToken);
          console.log("[RowContainer] Raw personalized recommendations fetched:", rawRecommendations);
          fetchedMovies = rawRecommendations.map((rec: any) => ({
            id: rec.movieId ? parseInt(rec.movieId) : Math.random(), // Ensure id is a valid number, fallback to random for unique key
            name: rec.movieName || `Movie ${rec.movieId}`, // Fallback name
            title: rec.movieName || `Movie ${rec.movieId}`, // Fallback title
            poster_path: rec.poster_path,
            backdrop_path: rec.backdrop_path,
            release_date: rec.release_date, // Assuming backend will provide this
            first_air_date: rec.first_air_date, // Assuming backend will provide this for TV shows
          }));
        } else if (categoryId) {
          const categoryMovies = await getMoviesForCategory(categoryId);
          if (!categoryMovies) {
            setError("No movies found for this category");
            setMovies([]);
            return;
          }
          fetchedMovies = categoryMovies as Movie[];
        }

        if (!fetchedMovies || fetchedMovies.length === 0) {
          setError("No movies found.");
          setMovies([]);
        } else {
          setMovies(fetchedMovies);
        }
      } catch (err) {
        console.error(`Failed to fetch movies for ${rowType} row:`, err);
        setError("Failed to load movies. Please try again later.");
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (rowType === 'personalized' && currentUser) {
      fetchMovies();
    } else if (rowType === 'category' && categoryId) {
      fetchMovies();
    }
  }, [categoryId, rowType, currentUser]);
  return (
    <Row
      title={title}
      movies={movies}
      isLargeRow={isLargeRow}
      onMovieClick={onMovieClick}
      base_url={base_url}
      placeholderImg={placeholderImg}
      isLoading={isLoading}
      error={error}
      isPlayerActive={isPlayerActive}
      trailerUrl={trailerUrl}
      noTrailer={noTrailer}
      youtubeOpts={youtubeOpts}
      onPlayerReady={onPlayerReady}
      onPlayerStateChange={onPlayerStateChange}
    />
  );
};

export default RowContainer;
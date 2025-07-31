import React, { useState, useEffect, useCallback } from 'react';
import Row from '../Row';
import YouTube, { YouTubeProps } from "react-youtube";
import { useAuth } from '../../context/AuthContext';
import { logUserEvent } from '../../services/analytics';
import { getMoviesForCategory } from '../../services/movieService';
import { TrailerService } from '../../services/trailerService';
import placeholderImg from './istockphoto-1147544807-612x612.jpg';

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
  categoryId: string;
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

  useEffect(() => {
    const fetchMovies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedMovies = await getMoviesForCategory(categoryId);
        if (!fetchedMovies) {
          setError("No movies found for this category");
          setMovies([]);
          return;
        }
        setMovies(fetchedMovies as Movie[]);
      } catch (err) {
        console.error(`Failed to fetch movies for category ${categoryId}:`, err);
        setError("Failed to load movies. Please try again later.");
        setMovies([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchMovies();
    }
  }, [categoryId]);
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
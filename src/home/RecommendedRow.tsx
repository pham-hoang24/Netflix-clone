import React, { useState, useEffect } from 'react';
import { fetchPersonalizedRecommendations } from '../services/api-client';
import { useAuth } from '../context/AuthContext';
import Row from './Row';
import { auth } from '../services/firebase';

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
}


const RecommendedRow: React.FC = () => {
  const { currentUser } = useAuth();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!currentUser || !auth.currentUser) return;

      try {
        const idToken = await auth.currentUser.getIdToken();
        const recommendations = await fetchPersonalizedRecommendations(idToken);
        setMovies(recommendations);
      } catch (err) {
        setError('Failed to load recommendations.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    getRecommendations();
  }, [currentUser]);

  // Placeholder function for movie click, you can implement this later
  const handleMovieClick = (movie: Movie) => {
    console.log('Clicked movie:', movie);
  };

  return (
    <Row
      title="Recommended for You"
      movies={movies}
      isLargeRow={false}
      onMovieClick={handleMovieClick}
      base_url="https://image.tmdb.org/t/p/original"
      placeholderImg="/path/to/placeholder.jpg" // Replace with a real placeholder
      isLoading={isLoading}
      error={error}
      isPlayerActive={false} // These can be managed by a higher-level state if needed
      trailerUrl=""
      noTrailer={false}
      youtubeOpts={{}}
      onPlayerReady={() => {}}
      onPlayerStateChange={() => {}}
    />
  );
};

export default RecommendedRow;

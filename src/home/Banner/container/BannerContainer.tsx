import React, { useState, useEffect } from 'react';
import Banner from '../components/Banner'; // Import the presentational component
import { getMoviesForCategory } from '../../../services/movieService';
import placeholderImg from '../../PlaceholderPhotos/1sgfb0.jpg';

import { Movie } from '../../HomePage/types/HomePageTypes';

const BannerContainer: React.FC = () => {
const [movie, setMovie] = useState<Movie | null>(null);
const [isLoading, setIsLoading] = useState<boolean>(true);
const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      setError(null);
      try {
        const movies = await getMoviesForCategory('fetchNetflixOriginals');
        if (movies && movies.length > 0) {
          setMovie(movies[Math.floor(Math.random() * movies.length)] as Movie);
        } else {
          setError("Could not fetch trending movies.");
        }
      } catch (err) {
        console.error(err);
        setError("Failed to load banner.");
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, []);

  function truncate(str: string | undefined, n: number): string {
    if (!str) {
      return "";
    }
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  return <Banner movie={movie} truncate={truncate} placeholderImg={placeholderImg} isLoading={isLoading} error={error} />;
};

export default BannerContainer;

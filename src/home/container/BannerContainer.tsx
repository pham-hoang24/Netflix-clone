import React, { useState, useEffect } from 'react';
import Banner from '../Banner'; // Import the presentational component
import { getMoviesForCategory } from '../../services/movieService';

interface Movie {
  backdrop_path: string;
  title: string;
  name: string;
  original_name: string;
  overview: string;
}

const BannerContainer: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchData() {
      const movies = await getMoviesForCategory('fetchNetflixOriginals');
      setMovie(movies[Math.floor(Math.random() * movies.length - 1)] as Movie);
    }
    fetchData();
  }, []);

  function truncate(str: string | undefined, n: number): string {
    if (!str) {
      return "";
    }
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  return <Banner movie={movie} truncate={truncate} />;
};

export default BannerContainer;

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import axios from '../home/axios';
// import requests from '../home/requests';
import Nav from '../home/Nav';
import styles from './SearchResultsPage.module.css';

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
}

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // useEffect(() => {
  //   const fetchMovies = async () => {
  //     if (!query) return;

  //     setIsLoading(true);
  //     setError(null);

  //     try {
  //       const response = await axios.get(requests.searchMovies(query));
  //       setMovies(response.data.results);
  //     } catch (err) {
  //       setError('Failed to fetch movies.');
  //       console.error(err);
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchMovies();
  // }, [query]);

  return (
    <div className={styles.searchResultsPage}>
      <Nav />
      <div className={styles.resultsContent}>
        <h1 className={styles.title}>Search results for "{query}"</h1>
        {isLoading && <div className={styles.loading}>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}
        <div className={styles.resultsGrid}>
          {movies.map((movie) => (
            <div key={movie.id} className={styles.movieCard}>
              <img
                className={styles.poster}
                src={`${base_url}${movie.poster_path}`}
                alt={movie.name || movie.title}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;

import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../home/axios';
import requests from '../home/requests';
import Nav from '../home/Nav';
import styles from './SearchResultsPage.module.css';
import YouTube from 'react-youtube';
import movieTrailer from 'movie-trailer';
import { logUserEvent } from '../services/analytics';

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name?: string;
  title?: string;
  poster_path: string;
  backdrop_path?: string;
  media_type?: string;
}

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const [movieResults, setMovieResults] = useState<Movie[]>([]);
  const [tvResults, setTvResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [noTrailer, setNoTrailer] = useState<boolean>(false);
  const [activeMovieId, setActiveMovieId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'tv'>('all');

  useEffect(() => {
    const fetchMovies = async () => {
      if (!query) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await axios.get('/api/search/multi', { params: { query: query } });
        const filteredResults = response.data.results.filter((item: Movie) => item.poster_path);

        setMovieResults(filteredResults.filter((item: Movie) => item.media_type === 'movie'));
        setTvResults(filteredResults.filter((item: Movie) => item.media_type === 'tv'));

      } catch (err) {
        setError('Failed to fetch movies.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMovies();
  }, [query]);

  const handleMovieClick = useCallback(async (movie: Movie) => {
    logUserEvent('movie_select', { movieId: movie.id, categoryId: 'search_results' });

    if (activeMovieId === movie.id) {
      setTrailerUrl("");
      setNoTrailer(false);
      setActiveMovieId(null);
    } else {
      setTrailerUrl("");
      setNoTrailer(false);
      setActiveMovieId(movie.id);

      const movieTitle = movie.title || movie.name;
      if (!movieTitle) return;

      (movieTrailer as any)(null, { tmdbId: movie.id })
        .then((url: string | null) => {
          if (!url) throw new Error("No URL returned");
          const urlParams = new URLSearchParams(new URL(url).search);
          const id = urlParams.get("v");
          if (id) setTrailerUrl(id);
          else throw new Error("No video ID in URL");
        })
        .catch((_: any) => {
          console.warn("No trailer found for:", movieTitle);
          setNoTrailer(true);
        });
    }
  }, [trailerUrl, activeMovieId]);

  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
      origin: window.location.origin,
    },
  };

  const renderGrid = (moviesToRender: Movie[]) => (
    <div className={styles.resultsGrid}>
      {moviesToRender.map((movie) => (
        <React.Fragment key={movie.id}>
          <div
            className={`${styles.movieCard} ${activeMovieId === movie.id ? styles.activeScaled : ''}`}
            onClick={() => handleMovieClick(movie)}
          >
            <img
              className={styles.poster}
              src={`${base_url}${movie.poster_path}`}
              alt={movie.name || movie.title}
            />
          </div>
          {activeMovieId === movie.id && trailerUrl && (
            <div className={styles.trailerContainer}>
              <YouTube videoId={trailerUrl} opts={opts} />
            </div>
          )}
          {activeMovieId === movie.id && noTrailer && (
            <div className={styles.noTrailer}>
              No trailer found for this movie.
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className={styles.searchResultsPage}>
      <Nav />
      <div className={styles.resultsContent}>
        <h1 className={styles.title}>Search results for "{query}"</h1>

        <div className={styles.filterButtons}>
          <button
            className={`${styles.filterButton} ${filterType === 'all' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('all')}
          >
            All
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'movie' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('movie')}
          >
            Movies
          </button>
          <button
            className={`${styles.filterButton} ${filterType === 'tv' ? styles.activeFilter : ''}`}
            onClick={() => setFilterType('tv')}
          >
            TV Shows
          </button>
        </div>

        {isLoading && <div className={styles.loading}>Loading...</div>}
        {error && <div className={styles.error}>{error}</div>}

        {(filterType === 'all' || filterType === 'movie') && movieResults.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>Movies</h2>
            {renderGrid(movieResults)}
          </>
        )}

        {(filterType === 'all' || filterType === 'tv') && tvResults.length > 0 && (
          <>
            <h2 className={styles.sectionTitle}>TV Shows</h2>
            {renderGrid(tvResults)}
          </>
        )}

        {movieResults.length === 0 && tvResults.length === 0 && !isLoading && !error && (
          <div className={styles.noResults}>No results found.</div>
        )}
      </div>
    </div>
  );
};

export default SearchResultsPage;

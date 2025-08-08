import React from 'react';
import styles from './SearchResultsPage.module.css';
import YouTube from 'react-youtube';
import NavContainer from '../home/container/NavContainer';
import { logUserEvent } from '../services/analytics';
import { useAuth } from '../context/AuthContext';

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name?: string;
  title?: string;
  poster_path: string;
  backdrop_path?: string;
  media_type?: string;
  genres?: Array<{ id: number; name: string }>;
}

interface SearchResultsPagePresenterProps {
  query: string | undefined;
  movieResults: Movie[];
  tvResults: Movie[];
  isLoading: boolean;
  error: string | null;
  trailerUrl: string;
  noTrailer: boolean;
  activeMovieId: number | null;
  filterType: 'all' | 'movie' | 'tv';
  setFilterType: (type: 'all' | 'movie' | 'tv') => void;
  handleMovieClick: (movie: Movie) => void;
}

const SearchResultsPagePresenter: React.FC<SearchResultsPagePresenterProps> = ({
  query,
  movieResults,
  tvResults,
  isLoading,
  error,
  trailerUrl,
  noTrailer,
  activeMovieId,
  filterType,
  setFilterType,
  handleMovieClick,
}) => {
  const { currentUser } = useAuth();
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
            onClick={() => {
              handleMovieClick(movie);
              if (currentUser) {
                logUserEvent('movie_selected_from_search_results', {
                  movieId: movie.id,
                  movieName: movie.title || movie.name,
                  searchTerm: query,
                  userId: currentUser.uid,
                });
              }
            }}
          >
            <img
              className={styles.poster}
              src={`${base_url}${movie.poster_path}`}
              alt={movie.name || movie.title}
            />
          </div>
          {activeMovieId === movie.id && trailerUrl && (
            <div className={styles.trailerContainer}>
              <YouTube
                videoId={trailerUrl}
                opts={opts}
                onReady={(event) => {
                  // You can log a "trailer_started" event here if needed
                }}
                onStateChange={(event) => {
                  const playerState = event.data;
                  const movie = moviesToRender.find(m => m.id === activeMovieId);

                  if (currentUser && movie) {
                    if (playerState === YouTube.PlayerState.ENDED || playerState === YouTube.PlayerState.PAUSED) {
                      const duration = event.target.getCurrentTime(); // Convert to milliseconds
                      console.log(`Captured duration: ${duration}`);
                      if (duration > 0) {
                        const genreIds = movie.genres?.map(genre => genre.id) || [];
                        console.log(`Searching for movies with genres: (${genreIds.length})`, genreIds);
                        logUserEvent('watch_time', {
                          movieId: activeMovieId,
                          duration: duration, // Pass duration instead of watchTimeSeconds
                          movieName: movie.title || movie.name,
                          userId: currentUser.uid,
                          eventType: 'trailer_watched',
                          genres: movie.genres || [],
                        });
                        console.log(`Logged watch_time for trailer: ${movie.title || movie.name}, Duration: ${Math.floor(duration)}s`);
                      }
                    }
                  }
                }}
              />
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
      <NavContainer />
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

export default SearchResultsPagePresenter;
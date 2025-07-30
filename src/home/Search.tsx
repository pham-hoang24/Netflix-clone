import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Search.module.css';

const base_url = "https://image.tmdb.org/t/p/w200";

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
}

interface SearchPresenterProps {
  query: string;
  setQuery: (query: string) => void;
  results: Movie[];
  isLoading: boolean;
  error: string | null;
  activeIndex: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  handleSuggestionClick: (movie: Movie) => void;
  searchContainerRef: React.RefObject<HTMLDivElement | null>;
}

const highlightMatch = (text: string, highlight: string) => {
  if (!highlight.trim()) {
    return <span>{text}</span>;
  }
  const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
  return (
    <span>
      {parts.map((part, i) =>
        part.toLowerCase() === highlight.toLowerCase() ? (
          <b key={i}>{part}</b>
        ) : (
          part
        )
      )}
    </span>
  );
};

const SearchPresenter: React.FC<SearchPresenterProps> = ({
  query,
  setQuery,
  results,
  isLoading,
  error,
  activeIndex,
  handleKeyDown,
  handleSuggestionClick,
  searchContainerRef,
}) => {
  return (
    <div className={styles.searchContainer} ref={searchContainerRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Search for a movie or show"
        className={styles.searchInput}
      />
      {isLoading && <div className={styles.loading}>Loading...</div>}
      {error && <div className={styles.error}>{error}</div>}
      {results.length > 0 && (
        <div className={styles.resultsContainer}>
          <ul className={styles.resultsList}>
            {results.map((movie, index) => (
              <li
                key={movie.id}
                className={`${styles.resultItem} ${index === activeIndex ? styles.active : ''}`}
                onClick={() => handleSuggestionClick(movie)}
              >
                <div className={styles.resultLink}>
                  <img
                    src={movie.poster_path ? `${base_url}${movie.poster_path}` : 'https://via.placeholder.com/200x300'}
                    alt={movie.title}
                    className={styles.poster}
                  />
                  <div className={styles.title}>{highlightMatch(movie.title || movie.name || '', query)}</div>
                </div>
              </li>
            ))}
          </ul>
          <div className={styles.viewAll}>
            <Link to={`/search/${query}`}>View all results</Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchPresenter;

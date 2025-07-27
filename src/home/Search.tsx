import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Search.module.css';
import requests from './requests';
import axios from './axios';
import { logUserEvent } from '../services/analytics';

const base_url = "https://image.tmdb.org/t/p/w200"; // Smaller poster size for suggestions

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate(); // Initialize useNavigate

  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/search/multi', { params: { query: searchQuery } });
      setResults(response.data.results.filter((item: Movie) => item.poster_path).slice(0, 4)); // Filter and limit
    } catch (err) {
      setError('Failed to fetch search results.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchSearchResults(query);
    }, 300); // 300ms debounce

    return () => {
      clearTimeout(handler);
    };
  }, [query, fetchSearchResults]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setResults([]);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSuggestionClick = useCallback(async (movie: Movie) => {
    logUserEvent('movie_select', { movieId: movie.id, categoryId: 'search_suggestion' });
    navigate(`/search/${movie.title || movie.name}`); // Redirect to search results page
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prevIndex) => (prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSuggestionClick(results[activeIndex]); // Trigger click handler on Enter
      } else if (query.trim() !== '') {
        navigate(`/search/${query}`); // If no suggestion selected, navigate to full search results
      }
    }
  };

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
                onClick={() => handleSuggestionClick(movie)} // Add onClick handler
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

export default Search;
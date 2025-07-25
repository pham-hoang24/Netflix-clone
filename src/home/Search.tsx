import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './Search.module.css';
// import requests from './requests';
// import axios from './axios';

const base_url = "https://image.tmdb.org/t/p/w200"; // Smaller poster size for suggestions

interface Movie {
  id: number;
  title: string;
  poster_path: string;
}

const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // const fetchSearchResults = useCallback(async (searchQuery: string) => {
  //   if (searchQuery.trim() === '') {
  //     setResults([]);
  //     return;
  //   }

  //   setIsLoading(true);
  //   setError(null);

  //   try {
  //     const response = await axios.get(requests.searchMovies(searchQuery));
  //     setResults(response.data.results.slice(0, 8)); // Limit to 8 results
  //   } catch (err) {
  //     setError('Failed to fetch search results.');
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // }, []);

  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     fetchSearchResults(query);
  //   }, 300); // 300ms debounce

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [query, fetchSearchResults]);

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


  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prevIndex) => (prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        // For now, we'll just log the selection. Navigation can be added later.
        console.log('Selected movie:', results[activeIndex]);
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
              <li key={movie.id} className={`${styles.resultItem} ${index === activeIndex ? styles.active : ''}`}>
                <div className={styles.resultLink}>
                  <img
                    src={movie.poster_path ? `${base_url}${movie.poster_path}` : 'https://via.placeholder.com/200x300'}
                    alt={movie.title}
                    className={styles.poster}
                  />
                  <div className={styles.title}>{highlightMatch(movie.title, query)}</div>
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
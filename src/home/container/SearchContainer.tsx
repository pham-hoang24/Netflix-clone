import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axios';
import { logUserEvent } from '../../services/analytics';
import SearchPresenter from '../Search'; // Import the new presenter component

interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
}

const SearchContainer: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const fetchSearchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.trim() === '') {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get('/api/search/multi', { params: { query: searchQuery } });
      setResults(response.data.results.filter((item: Movie) => item.poster_path).slice(0, 4));
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
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query, fetchSearchResults]);

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
    
    navigate(`/search/${movie.title || movie.name}`);
  }, [navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      setActiveIndex((prevIndex) => (prevIndex < results.length - 1 ? prevIndex + 1 : prevIndex));
    } else if (e.key === 'ArrowUp') {
      setActiveIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && results[activeIndex]) {
        handleSuggestionClick(results[activeIndex]);
      } else if (query.trim() !== '') {
        navigate(`/search/${query}`);
      }
    }
  };

  return (
    <SearchPresenter
      query={query}
      setQuery={setQuery}
      results={results}
      isLoading={isLoading}
      error={error}
      activeIndex={activeIndex}
      handleKeyDown={handleKeyDown}
      handleSuggestionClick={handleSuggestionClick}
      searchContainerRef={searchContainerRef}
    />
  );
};

export default SearchContainer;

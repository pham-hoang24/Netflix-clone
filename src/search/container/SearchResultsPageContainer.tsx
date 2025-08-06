import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../home/axios';
import { TrailerService } from '../../services/trailerService';
import { logUserEvent } from '../../services/analytics';
import SearchResultsPagePresenter from '../SearchResultsPage';

interface Movie {
  id: number;
  name?: string;
  title?: string;
  poster_path: string;
  backdrop_path?: string;
  media_type?: string;
}

const SearchResultsPageContainer: React.FC = () => {
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

      try {
        const releaseDate = (movie as any).release_date || (movie as any).first_air_date;
        const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;

        const videoId = await TrailerService.getMovieTrailer(
          movie.id,
          movieTitle,
          year
        );

        if (videoId && TrailerService.isValidYouTubeId(videoId)) {
          setTrailerUrl(videoId);
        } else {
          setNoTrailer(true);
        }
      } catch (error) {
        console.warn("No trailer found for:", movieTitle, error);
        setNoTrailer(true);
      }
    }
  }, [activeMovieId]);

  return (
    <SearchResultsPagePresenter
      query={query}
      movieResults={movieResults}
      tvResults={tvResults}
      isLoading={isLoading}
      error={error}
      trailerUrl={trailerUrl}
      noTrailer={noTrailer}
      activeMovieId={activeMovieId}
      filterType={filterType}
      setFilterType={setFilterType}
      handleMovieClick={handleMovieClick}
    />
  );
};

export default SearchResultsPageContainer;

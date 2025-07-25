import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Row.css';
import YouTube from 'react-youtube';
import movieTrailer from 'movie-trailer';
import { useAuth } from '../context/AuthContext';
import { logUserEvent } from '../services/analytics';
import { getMoviesForCategory } from '../services/movieService';
const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
}

interface RowProps {
  title: string;
  categoryId: string;
  isLargeRow?: boolean;
}

const Row: React.FC<RowProps> = ({ title, categoryId, isLargeRow = false }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [noTrailer, setNoTrailer] = useState<boolean>(false);
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null); // New state for movie ID
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      const movies = await getMoviesForCategory(categoryId);
      setMovies(movies as Movie[]);
    };

    fetchMovies();
  }, [categoryId]);

  // Define the origin explicitly for local development
  const opts = {
    height: '390',
    width: '100%',
    playerVars: {
      autoplay: 1,
      origin: window.location.origin, // Crucial for security and communication
    },
  };

  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);
  // Removed currentPlayingMovieId state

  const onPlayerStateChange = (event: any) => {
    if (!currentUser) return;

    // const videoId = trailerUrl; // The videoId is the trailerUrl - Removed
    // if (!videoId) return; - Removed

    if (event.data === window.YT.PlayerState.PLAYING) {
      setWatchStartTime(Date.now());
      // Removed setCurrentPlayingMovieId(videoId);
      console.log(`Started playing video`); // Removed videoId from log
    } else if (
      (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) &&
      watchStartTime !== null
      // Removed && currentPlayingMovieId === videoId
    ) {
      const watchDuration = Date.now() - watchStartTime; // Duration in milliseconds
      console.log(`Stopped playing video, duration: ${watchDuration}ms`); // Removed videoId from log
      if (currentMovieId) { // Added check for currentMovieId
        logUserEvent('watch_time', {
          movieId: currentMovieId, // Using currentMovieId from state
          duration: watchDuration
        });
      }
      setWatchStartTime(null);
      // Removed setCurrentPlayingMovieId(null);
    }
  };

  const handleClick = useCallback(
    async (movie: Movie) => {
      logUserEvent('movie_select', { movieId: movie.id, categoryId: categoryId }); // Added categoryId

      if (trailerUrl) {
        setTrailerUrl("");
        setNoTrailer(false);
        setCurrentMovieId(null); // Clear currentMovieId when closing trailer
      } else {
        setNoTrailer(false);
        setCurrentMovieId(movie.id); // Set currentMovieId on click
        const query = movie?.name || movie?.title || "";
        if (!query) return;

        (movieTrailer as any)(null, { tmdbId: movie.id })
          .then((url: string | null) => {
            if (!url) throw new Error("No URL returned");
            const urlParams = new URLSearchParams(new URL(url).search);
            const id = urlParams.get("v");
            if (id) setTrailerUrl(id);
            else throw new Error("No video ID in URL");
          })
          .catch((_: any) => {
            console.warn("No trailer found for:", query);
            setNoTrailer(true);
          });
      }
    },
    [trailerUrl, currentUser, categoryId] // Added categoryId to dependencies
  );

  return (
    <div className="row">
      <h2>{title}</h2>
      <div className="row__posters">
        {movies.map((movie) => (
          <img
            key={movie.id}
            onClick={() => handleClick(movie)}
            className={`row__poster ${isLargeRow ? "row__posterLarge" : ""}`}
            src={`${base_url}${
              isLargeRow ? movie.poster_path : movie.backdrop_path
            }`}
            alt={movie.name || movie.title || "Movie poster"}
          />
        ))}
      </div>
      <YouTube videoId={trailerUrl} opts={opts} onStateChange={onPlayerStateChange} />
      {noTrailer && (
        <div className="row__noTrailer">
          This movie currently does not have a trailer.
        </div>
      )}
    </div>
  );
};
export default Row;

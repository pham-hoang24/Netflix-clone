import React, { useState, useEffect, useRef, useCallback, } from "react";
import axios from "./axios";
import "./Row.css";
import YouTube, { YouTubeProps } from "react-youtube";
import movieTrailer from "movie-trailer";
import { useAuth } from '../context/AuthContext';
import { logUserEvent } from '../services/analytics';
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
  fetchUrl: string;
  isLargeRow?: boolean;
}

const Row: React.FC<RowProps> = ({ title, fetchUrl, isLargeRow = false }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [noTrailer, setNoTrailer] = useState<boolean>(false);
  const fetchDebounce = useRef<NodeJS.Timeout | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const controller = new AbortController();

    fetchDebounce.current = setTimeout(async () => {
      try {
        const res = await axios.get(fetchUrl, { signal: controller.signal });
        setMovies(res.data.results);
      } catch (e: any) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          console.error("Fetch movies failed:", e);
        }
      }
    }, 300);

    return () => {
      if (fetchDebounce.current) {
        clearTimeout(fetchDebounce.current);
      }
      controller.abort();
    };
  }, [fetchUrl]);

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
  const [currentPlayingMovieId, setCurrentPlayingMovieId] = useState<string | null>(null);

  const onPlayerStateChange = (event: any) => {
    if (!currentUser) return;

    const videoId = trailerUrl; // The videoId is the trailerUrl
    if (!videoId) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      setWatchStartTime(Date.now());
      setCurrentPlayingMovieId(videoId);
      console.log(`Started playing video: ${videoId}`);
    } else if (
      (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) &&
      watchStartTime !== null &&
      currentPlayingMovieId === videoId
    ) {
      const watchDuration = Date.now() - watchStartTime; // Duration in milliseconds
      console.log(`Stopped playing video: ${videoId}, duration: ${watchDuration}ms`);
      logUserEvent('watch_time', { videoId: videoId, duration: watchDuration });
      setWatchStartTime(null);
      setCurrentPlayingMovieId(null);
    }
  };

  const handleClick = useCallback(
    async (movie: Movie) => {
      if (trailerUrl) {
        setTrailerUrl("");
        setNoTrailer(false);
      } else {
        setNoTrailer(false);
        const query = movie?.name || movie?.title || "";
        if (!query) return;

        // Determine media type for the backend call
        const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

        // Fetch movie details from your backend
        let movieDetails = {};
        try {
          const detailsRes = await axios.get(`/api/movie-details/${movie.id}/${mediaType}`);
          movieDetails = detailsRes.data;
          console.log("Fetched movie details:", movieDetails);
        } catch (error) {
          console.error("Error fetching movie details from backend:", error);
        }

        (movieTrailer as any)(null, { tmdbId: movie.id })
          .then((url: string | null) => {
            if (!url) throw new Error("No URL returned");
            const urlParams = new URLSearchParams(new URL(url).search);
            const id = urlParams.get("v");
            if (id) setTrailerUrl(id);
            else throw new Error("No video ID in URL");

            // Log watch event with enriched movie details
            if (currentUser) {
              logUserEvent('watch_time', {
                videoId: id,
                duration: 0, // Initial duration, will be updated on state change
                ...movieDetails,
              });
            }
          })
          .catch((_: any) => {
            console.warn("No trailer found for:", query);
            setNoTrailer(true);
          });
      }
    },
    [trailerUrl]
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

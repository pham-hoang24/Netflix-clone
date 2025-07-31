import React, { useState, useEffect, useRef, useCallback } from 'react';
import Row from '../Row'; // Import the presentational component
import YouTube, { YouTubeProps } from "react-youtube";
import movieTrailer from 'movie-trailer';
import { useAuth } from '../../context/AuthContext';
import { logUserEvent } from '../../services/analytics';
import { getMoviesForCategory } from '../../services/movieService';
import placeholderImg from './istockphoto-1147544807-612x612.jpg';

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
}

interface RowContainerProps {
  title: string;
  categoryId: string;
  isLargeRow?: boolean;
}

const RowContainer: React.FC<RowContainerProps> = ({ title, categoryId, isLargeRow = false }) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [noTrailer, setNoTrailer] = useState<boolean>(false);
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null);
  const { currentUser } = useAuth();

  useEffect(() => {
    const fetchMovies = async () => {
      const movies = await getMoviesForCategory(categoryId);
      setMovies(movies as Movie[]);
    };

    fetchMovies();
  }, [categoryId]);

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "100%",
    playerVars: { autoplay: 1 },
  };

  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);

  const onPlayerStateChange = (event: any) => {
    if (!currentUser) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      setWatchStartTime(Date.now());
      console.log(`Started playing video`);
    } else if (
      (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) &&
      watchStartTime !== null
    ) {
      const watchDuration = Date.now() - watchStartTime;
      console.log(`Stopped playing video, duration: ${watchDuration}ms`);
      if (currentMovieId) {
        logUserEvent('watch_time', {
          movieId: currentMovieId,
          duration: watchDuration
        });
      }
      setWatchStartTime(null);
    }
  };

  const handleClick = useCallback(
    async (movie: Movie) => {
      logUserEvent('movie_select', { movieId: movie.id, categoryId: categoryId });

      if (trailerUrl) {
        setTrailerUrl("");
        setNoTrailer(false);
        setCurrentMovieId(null);
      } else {
        setNoTrailer(false);
        setCurrentMovieId(movie.id);
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
    [trailerUrl, currentUser, categoryId]
  );

  return (
    <Row
      title={title}
      categoryId={categoryId}
      isLargeRow={isLargeRow}
      movies={movies}
      trailerUrl={trailerUrl}
      noTrailer={noTrailer}
      opts={opts}
      onPlayerStateChange={onPlayerStateChange}
      handleClick={handleClick}
      base_url={base_url}
      placeholderImg={placeholderImg}
    />
  );
};

export default RowContainer;

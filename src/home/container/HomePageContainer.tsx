import React, { useState, useEffect, useCallback } from 'react';
import HomePage from '../HomePage';
import { useAuth } from '../../context/AuthContext';
import { logUserEvent } from '../../services/analytics';
import { TrailerService } from '../../services/trailerService';
import { YouTubeProps } from 'react-youtube';

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[]; // Added genre_ids to Movie interface
}

const HomePageContainer: React.FC = () => {
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const [noTrailer, setNoTrailer] = useState<boolean>(false);
  const [currentMovieId, setCurrentMovieId] = useState<number | null>(null);
  const [currentMovie, setCurrentMovie] = useState<Movie | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState<boolean>(false);
  const { currentUser } = useAuth();

  const [activeRow, setActiveRow] = useState<string | null>(null);

  const youtubeOpts: YouTubeProps["opts"] = {
    height: "390",
    width: "100%",
    playerVars: { autoplay: 1 },
  };

  const [watchStartTime, setWatchStartTime] = useState<number | null>(null);

  const handlePlayerReady = (event: any) => {
    // You can use the event.target to control the player if needed
  };

  const handlePlayerStateChange = (event: any) => {
    if (!currentUser || !currentMovie) return;

    if (event.data === window.YT.PlayerState.PLAYING) {
      setWatchStartTime(Date.now());
    } else if (
      (event.data === window.YT.PlayerState.PAUSED || event.data === window.YT.PlayerState.ENDED) &&
      watchStartTime
    ) {
      const watchDuration = Date.now() - watchStartTime;
      if (currentMovie.id) {
        // Extract genre IDs from the currentMovie object and convert to string for logging
        const genreIds = currentMovie.genre_ids?.map(id => String(id)).join(', ') || '';

        logUserEvent('watch_time', {
          movieId: currentMovie.id,
          duration: watchDuration, // Pass watchDuration (already in ms)
          genre: genreIds, // Pass genre IDs as a comma-separated string
        });
      }
      setWatchStartTime(null);
    }
  };

  const handleMovieClick = useCallback(
    async (movie: Movie, categoryId: string) => {
      setCurrentMovie(movie); // Store the clicked movie

      if (currentMovieId === movie.id) {
        setTrailerUrl("");
        setCurrentMovieId(null);
        setNoTrailer(false);
        setActiveRow(null);
        setWatchStartTime(null); // Reset watchStartTime when trailer is closed
        return;
      }

      setIsLoadingTrailer(true);
      setNoTrailer(false);
      setCurrentMovieId(movie.id);
      setActiveRow(categoryId);
      setWatchStartTime(null); // Reset watchStartTime when a new movie is clicked

      try {
        const movieTitle = movie?.name || movie?.title || "";
        const releaseDate = movie.release_date || movie.first_air_date;
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
          setTrailerUrl("");
        }
      } catch (error) {
        console.warn(`No trailer found for: ${movie?.name || movie?.title}`, error);
        setNoTrailer(true);
        setTrailerUrl("");
      } finally {
        setIsLoadingTrailer(false);
      }
    },
    [currentMovieId, currentUser]
  );

  return (
    <HomePage
      trailerUrl={trailerUrl}
      noTrailer={noTrailer}
      activeRow={activeRow}
      onMovieClick={handleMovieClick}
      onPlayerReady={handlePlayerReady}
      onPlayerStateChange={handlePlayerStateChange}
      youtubeOpts={youtubeOpts}
    />
  );
};

export default HomePageContainer;
import React from 'react';
import './Row.css';
import YouTube, { YouTubeProps } from "react-youtube";
import { Movie } from '../../HomePage/types/HomePageTypes';

interface RowProps {
  title: string;
  movies: Movie[];
  isLargeRow?: boolean;
  onMovieClick: (movie: Movie) => void;
  base_url: string;
  placeholderImg: string;
  isLoading: boolean;
  error: string | null;
  isPlayerActive: boolean;
  trailerUrl: string;
  noTrailer: boolean;
  youtubeOpts: any;
  onPlayerReady: (event: any) => void;
  onPlayerStateChange: (event: any) => void;
}

const Row: React.FC<RowProps> = ({
  title,
  movies,
  isLargeRow = false,
  onMovieClick,
  base_url,
  placeholderImg,
  isLoading,
  error,
  isPlayerActive,
  trailerUrl,
  noTrailer,
  youtubeOpts,
  onPlayerReady,
  onPlayerStateChange,
}) => {
  if (isLoading) {
    return (
      <div className="row">
        <h2>{title}</h2>
        <div className="row__posters">
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="row__poster-placeholder" data-testid="row__poster-placeholder" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="row">
        <h2>{title}</h2>
        <p className="row__error">{error}</p>
      </div>
    );
  }

  return (
    <div className="row">
      <h2 style={{ paddingTop: isLargeRow ? '1rem' : '0' }}>{title}</h2>
      <div className="row__posters">
        {movies.map((movie, index) => {
          const imagePath = isLargeRow ? movie.poster_path : movie.backdrop_path;
          return (
            <img
              key={movie.id}
              onClick={() => onMovieClick(movie)}
              className={`row__poster ${isLargeRow ? "row__posterLarge" : ""}`}
              src={imagePath ? `${base_url}${imagePath}` : placeholderImg}
              alt={movie.name || movie.title || "Movie poster"}
            />
          );
        })}
      </div>
      {isPlayerActive && trailerUrl && (
        <YouTube
          videoId={trailerUrl}
          opts={youtubeOpts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          className="youtube-player"
        />
      )}
      {isPlayerActive && noTrailer && (
        <div className="row__noTrailer">
          This movie currently does not have a trailer.
        </div>
      )}
    </div>
  );
};

export default Row;
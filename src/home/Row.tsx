import React from 'react';
import './Row.css';
import YouTube, { YouTubeProps } from "react-youtube";

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
  movies: Movie[];
  trailerUrl: string;
  noTrailer: boolean;
  opts: YouTubeProps["opts"];
  onPlayerStateChange: (event: any) => void;
  handleClick: (movie: Movie) => void;
  base_url: string;
  placeholderImg: string;
}

const Row: React.FC<RowProps> = ({
  title,
  categoryId,
  isLargeRow = false,
  movies,
  trailerUrl,
  noTrailer,
  opts,
  onPlayerStateChange,
  handleClick,
  base_url,
  placeholderImg,
}) => {
  return (
    <div className="row">
      <h2>{title}</h2>
      <div className="row__posters">
        {Array.from({ length: 20 }).map((_, index) => {
          const movie = movies[index];
          const imagePath = movie
            ? isLargeRow
              ? movie.poster_path
              : movie.backdrop_path
            : null;

          return (
            <img
              key={movie ? movie.id : `placeholder-${index}`}
              onClick={() => movie && handleClick(movie)}
              className={`row__poster ${isLargeRow ? "row__posterLarge" : ""}`}
              src={imagePath ? `${base_url}${imagePath}` : placeholderImg}
              alt={movie ? movie.name || movie.title || "Movie poster" : "Placeholder"}
            />
          );
        })}
      </div>
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} onStateChange={onPlayerStateChange} />}
      {noTrailer && (
        <div className="row__noTrailer">
          This movie currently does not have a trailer.
        </div>
      )}
    </div>
  );
};

export default Row;
import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "./axios";
import "./Row.css";
import YouTube, { YouTubeProps } from "react-youtube";
import movieTrailer from "movie-trailer";

const base_url = "https://image.tmdb.org/t/p/original/";

interface Movie {
  id: number;
  name: string;
  title: string;
  poster_path: string;
  backdrop_path: string;
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

  const opts: YouTubeProps["opts"] = {
    height: "390",
    width: "100%",
    playerVars: { autoplay: 1 },
  };

  const handleClick = useCallback(
    (movie: Movie) => {
      if (trailerUrl) {
        setTrailerUrl("");
        setNoTrailer(false);
      } else {
        setNoTrailer(false);
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
      {trailerUrl && <YouTube videoId={trailerUrl} opts={opts} />}
      {noTrailer && (
        <div className="row__noTrailer">
          This movie currently does not have a trailer.
        </div>
      )}
    </div>
  );
};

export default Row;
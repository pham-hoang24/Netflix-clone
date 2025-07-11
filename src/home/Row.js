import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "./axios";
import "./Row.css";
import YouTube from "react-youtube";
import movieTrailer from "movie-trailer";

const base_url = "https://image.tmdb.org/t/p/original/";

function Row({ title, fetchUrl, isLargeRow }) {
  const [movies, setMovies] = useState([]);
  const [trailerUrl, setTrailerUrl] = useState("");
  const [noTrailer, setNoTrailer] = useState(false);
  const fetchDebounce = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    fetchDebounce.current = setTimeout(async () => {
      try {
        const res = await axios.get(fetchUrl, { signal: controller.signal });
        setMovies(res.data.results);
      } catch (e) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") {
          console.error("Fetch movies failed:", e);
        }
      }
    }, 300);

    return () => {
      clearTimeout(fetchDebounce.current);
      controller.abort();
    };
  }, [fetchUrl]);

  const opts = { height: "390", width: "100%", playerVars: { autoplay: 1 } };

  const handleClick = useCallback(
    (movie) => {
      if (trailerUrl) {
        setTrailerUrl("");
        setNoTrailer(false);
      } else {
        setNoTrailer(false);
        const query = movie?.name || movie?.title || "";
        if (!query) return;

        movieTrailer(null, { tmdbId: movie.id })
          .then((url) => {
            if (!url) throw new Error("No URL returned");
            const id = new URLSearchParams(new URL(url).search).get("v");
            if (id) setTrailerUrl(id);
            else throw new Error("No video ID in URL");
          })
          .catch((_) => {
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
}

export default Row;

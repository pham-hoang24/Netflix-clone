import React, { useState, useEffect } from 'react';
import './Banner.css';
import { useTranslation } from 'react-i18next';
import { getMoviesForCategory } from '../services/movieService';

interface Movie {
  backdrop_path: string;
  title: string;
  name: string;
  original_name: string;
  overview: string;
}

const Banner: React.FC = () => {
  const [movie, setMovie] = useState<Movie | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchData() {
      const movies = await getMoviesForCategory('fetchNetflixOriginals');
      setMovie(movies[Math.floor(Math.random() * movies.length - 1)] as Movie);
    }
    fetchData();
  }, []);

  function truncate(str: string | undefined, n: number): string {
    if (!str) {
      return "";
    }
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  }

  return (
    <header
      className="banner"
      style={{
        backgroundSize: "cover",
        backgroundImage: `url("https://image.tmdb.org/t/p/original/${movie?.backdrop_path}")`,
        backgroundPosition: "center center",
      }}
    >
      <div className="banner__contents">
        <h1 className="banner__title">
          {movie?.title || movie?.name || movie?.original_name}
        </h1>
        <div className="banner__buttons">
          <button className="banner__button">{t('banner.play')}</button>
          <button className="banner__button">{t('banner.myList')}</button>
        </div>
        <h1 className="banner__description">{truncate(movie?.overview, 150)}</h1>
      </div>
      <div className="banner--fadeBottom" />
    </header>
  );
};

export default Banner;
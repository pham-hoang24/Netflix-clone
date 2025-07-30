import React from 'react';
import './Banner.css';
import { useTranslation } from 'react-i18next';

interface Movie {
  backdrop_path: string;
  title: string;
  name: string;
  original_name: string;
  overview: string;
}

interface BannerProps {
  movie: Movie | null;
  truncate: (str: string | undefined, n: number) => string;
}

const Banner: React.FC<BannerProps> = ({ movie, truncate }) => {
  const { t } = useTranslation();

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

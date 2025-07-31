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
  placeholderImg: string;
  isLoading: boolean;
  error: string | null;
}

const Banner: React.FC<BannerProps> = ({ 
  movie, 
  truncate,
  isLoading,
  error, 
  placeholderImg 
}) => {
  const { t } = useTranslation();

  if (isLoading) {
    return <header className="banner" style={{ height: '448px', backgroundColor: '#141414' }} />;
  }

  const backgroundImageUrl = error || !movie?.backdrop_path
    ? placeholderImg
    : `https://image.tmdb.org/t/p/original/${movie.backdrop_path}`;

  return (
    <header
      className="banner"
      style={{
        backgroundSize: "cover",
        backgroundImage: `url("${backgroundImageUrl}")`,
        backgroundPosition: "center center",
      }}
    >
      <div className="banner__contents">
        <h1 className="banner__title">
          {error ? "Error" : movie?.title || movie?.name || movie?.original_name}
        </h1>
        <div className="banner__buttons">
          <button className="banner__button">{t('banner.play')}</button>
          <button className="banner__button">{t('banner.myList')}</button>
        </div>
        <h1 className="banner__description">{error ? "Could not load content." : truncate(movie?.overview, 150)}</h1>
      </div>
      <div className="banner--fadeBottom" />
    </header>
  );
};

export default Banner;

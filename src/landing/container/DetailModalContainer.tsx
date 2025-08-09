import React from 'react';
import DetailModal from '../DetailModal/DetailModal'; // The presentation component
import { Movie } from '../../home/HomePage/types/HomePageTypes';

interface DetailModalContainerProps {
  item: Movie;
  onClose: () => void;
  genreMap: { [id: number]: string };
}

const DetailModalContainer: React.FC<DetailModalContainerProps> = ({ item, onClose, genreMap }) => {
  const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

  const genreNames = item.genres?.map(genre => genre.name) || [];
  const year = item.release_date?.slice(0, 4) ?? 'Unknown';

  const truncate = (str: string | null | undefined, wordLimit: number): string => {
    if (!str) return 'No description available.';
    const words = str.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return str;
  };

  const imageUrl = item.backdrop_path ? BACKDROP_BASE + item.backdrop_path : POSTER_BASE + item.poster_path;
  const logoUrl = item.logo_url || '/netflix_logo.png';
  const altText = item.title || item.name || 'Logo';
  const displayDescription = truncate(item.overview, 70);
  const displayTags = [...genreNames, year];

  return (
    <DetailModal
      imageUrl={imageUrl}
      logoUrl={logoUrl}
      altText={altText}
      displayDescription={displayDescription}
      displayTags={displayTags}
      onClose={onClose}
    />
  );
};

export default DetailModalContainer;

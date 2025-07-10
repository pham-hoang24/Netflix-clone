import React from 'react';
import styles from './CarouselItem.module.css';

interface CarouselItemProps {
  imageUrl: string;
  altText: string;
  onClick: () => void;
  rank: number; // Add rank prop
}

const CarouselItem: React.FC<CarouselItemProps> = ({ imageUrl, altText, onClick, rank }) => {
  return (
    <div className={styles.movieItem} onClick={onClick}>
      <img className={styles.moviePoster} src={imageUrl} alt={altText} />
      <div className={styles.rankOverlay}>{rank}</div> {/* Display rank */}
    </div>
  );
};

export default CarouselItem;
import React, { RefObject } from 'react';
import styles from '../Carousel.module.css';
import CarouselItem from '../CarouselItem/CarouselItem';

interface CarouselPresentationProps {
  items: any[]; // Replace 'any' with a proper interface later
  onItemClick: (item: any) => void;
  carouselRef: RefObject<HTMLDivElement>;
  leftBtnRef: RefObject<HTMLDivElement>;
  rightBtnRef: RefObject<HTMLDivElement>;
  scrollCarousel: (direction: 'left' | 'right') => void;
}

const CarouselPresentation: React.FC<CarouselPresentationProps> = ({
  items,
  onItemClick,
  carouselRef,
  leftBtnRef,
  rightBtnRef,
  scrollCarousel,
}) => {
  return (
    <div className={styles.carouselWrapper}>
      <div
        ref={leftBtnRef}
        className={`${styles.scrollButton} ${styles.left}`}
        onClick={() => scrollCarousel('left')}
      >
        ‹
      </div>
      <div className={styles.carouselContainer}>
        <div className={styles.movieCarousel} ref={carouselRef}>
          {items.map((item, index) => (
            <CarouselItem
              key={item.id}
              imageUrl={item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : 'https://via.placeholder.com/300x450?text=No+Image'}
              altText={item.title || item.name || 'Untitled'}
              onClick={() => onItemClick(item)}
              rank={index + 1}
            />
          ))}
        </div>
      </div>
      <div
        ref={rightBtnRef}
        className={`${styles.scrollButton} ${styles.right}`}
        onClick={() => scrollCarousel('right')}
      >
        ›
      </div>
    </div>
  );
};

export default CarouselPresentation;

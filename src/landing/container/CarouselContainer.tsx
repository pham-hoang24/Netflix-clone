import React, { useRef, useEffect } from 'react';
import styles from '../Carousel/Carousel.module.css';
import CarouselItem from '../CarouselItem/CarouselItem';

interface CarouselContainerProps {
  items: any[]; // Replace 'any' with a proper interface later
  onItemClick: (item: any) => void;
}

const CarouselContainer: React.FC<CarouselContainerProps> = ({ items, onItemClick }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const leftBtnRef = useRef<HTMLDivElement>(null);
  const rightBtnRef = useRef<HTMLDivElement>(null);

  const updateScrollButtons = () => {
    if (!carouselRef.current || !leftBtnRef.current || !rightBtnRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
    const maxScrollLeft = scrollWidth - clientWidth;

    leftBtnRef.current.classList.toggle(styles.hidden, scrollLeft <= 2);
    rightBtnRef.current.classList.toggle(styles.hidden, scrollLeft + 2 >= maxScrollLeft);
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = carouselRef.current.clientWidth; // Scroll by full width
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    const carousel = carouselRef.current;
    if (carousel) {
      carousel.scrollLeft = 0; // Ensure carousel starts at the beginning
      carousel.addEventListener('scroll', updateScrollButtons);
      window.addEventListener('resize', updateScrollButtons);
      updateScrollButtons(); // Initial check

      return () => {
        carousel.removeEventListener('scroll', updateScrollButtons);
        window.removeEventListener('resize', updateScrollButtons);
      };
    }
  }, []);

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

export default CarouselContainer;

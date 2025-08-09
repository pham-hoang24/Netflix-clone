import React, { useRef, useEffect, useState } from 'react';
import styles from '../Carousel/Carousel.module.css';
import CarouselItem from '../CarouselItem/CarouselItem';

interface CarouselContainerProps {
  items: any[];
  onItemClick: (item: any) => void;
}

const PLACEHOLDER = 'src/home/container/istockphoto-1147544807-612x612.jpg';

const CarouselContainer: React.FC<CarouselContainerProps> = ({ items, onItemClick }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  const updateScrollButtons = () => {
    const el = carouselRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxScrollLeft = scrollWidth - clientWidth;
    setShowLeft(scrollLeft > 2);
    setShowRight(scrollLeft + 2 < maxScrollLeft);
  };

  const scrollCarousel = (dir: 'left' | 'right') => {
    const el = carouselRef.current;
    if (!el) return;
    const amount = el.clientWidth;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollLeft = 0;
    el.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
    updateScrollButtons();
    return () => {
      el.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, []);

  return (
    <div className={`${styles.carouselWrapper} carouselWrapper`}>
      {showLeft && (
        <div
          className={`${styles.scrollButton} ${styles.left} scrollButton left`}
          onClick={() => scrollCarousel('left')}
          aria-label="scroll left"
        >
          ‹
        </div>
      )}

      {/* Literal class so the test can query it */}
      <div className={`${styles.carouselContainer} carouselContainer`} ref={carouselRef}>
        <div className={`${styles.movieCarousel} movieCarousel`}>
          {items.map((item: any) => {
            const imageUrl =
              item.imageUrl ??
              (item.poster_path
                ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
                : item.backdrop_path
                ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}`
                : PLACEHOLDER);

            return (
              <CarouselItem
                key={item.id}
                imageUrl={imageUrl}
                altText={item.title || item.name || 'Untitled'}
                onClick={() => onItemClick(item)}
                rank={item.rank}
              />
            );
          })}
        </div>
      </div>

      {showRight && (
        <div
          className={`${styles.scrollButton} ${styles.right} scrollButton right`}
          onClick={() => scrollCarousel('right')}
          aria-label="scroll right"
        >
          ›
        </div>
      )}
    </div>
  );
};

export default CarouselContainer;


import React from 'react';
import styles from './DetailModal.module.css';
import { TrendingItem } from '../../services/api-client';

interface DetailModalProps {
  item: TrendingItem;
  onClose: () => void;
  genreMap: { [id: number]: string };
}

const DetailModal: React.FC<DetailModalProps> = ({ item, onClose, genreMap }) => {
  const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';

  const genreNames = item.genre_ids?.map((id: number) => genreMap[id]).filter(Boolean) || [];
  const year = item.release_date?.slice(0, 4) ?? 'Unknown';

  const truncate = (str: string | null | undefined, wordLimit: number): string => {
    if (!str) return 'No description available.';
    const words = str.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return str;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalFrame} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalImage}>
          <div
            className={styles.modalBackdrop}
            style={{
              backgroundImage: `url(${item.backdrop_path ? BACKDROP_BASE + item.backdrop_path : POSTER_BASE + item.poster_path})`,
            }}
          ></div>
          <div className={styles.modalBottomContainer}></div>
          <img
            className={styles.modalLogo}
            src={item.logo_url || '/netflix_logo.png'} // Use logo_url from item
            alt={item.title || item.name || 'Logo'}
          />
        </div>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <div className={styles.modalContent}>
          <div className={styles.modalTags}>
            {[...genreNames, year].map((text) => (
              <span key={text} className={styles.tagPill}>
                {text}
              </span>
            ))}
          </div>
          <p className={styles.modalDescription}>
            {truncate(item.overview, 70)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

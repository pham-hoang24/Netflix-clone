import React from 'react';
import styles from './DetailModal.module.css';
interface DetailModalProps {
  imageUrl: string;
  logoUrl: string;
  altText: string;
  displayDescription: string;
  displayTags: string[];
  onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({
  imageUrl,
  logoUrl,
  altText,
  displayDescription,
  displayTags,
  onClose,
}) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalFrame} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalImage}>
          <div
            className={styles.modalBackdrop}
            style={{
              backgroundImage: `url(${imageUrl})`,
            }}
          ></div>
          <div className={styles.modalBottomContainer}></div>
          <img
            className={styles.modalLogo}
            src={logoUrl}
            alt={altText}
          />
        </div>
        <button className={styles.modalClose} onClick={onClose}>
          ×
        </button>
        <div className={styles.modalContent}>
          <div className={styles.modalTags}>
            {displayTags.map((text) => (
              <span key={text} className={styles.tagPill}>
                {text}
              </span>
            ))}
          </div>
          <p className={styles.modalDescription}>
            {displayDescription}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DetailModal;

import React from 'react';
import styles from './ContentSection.module.css';

interface ContentSectionProps {
  title: string;
  children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children }) => {
  return (
    <section className={styles.contentSection}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </section>
  );
};

export default ContentSection;

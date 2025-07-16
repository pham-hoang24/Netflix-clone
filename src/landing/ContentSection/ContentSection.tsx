
import React from 'react';
import { useTranslation } from 'react-i18next'; // Add this import
import styles from './ContentSection.module.css';

interface ContentSectionProps {
  title: string; // This prop will now be a translation key
  children: React.ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({ title, children }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <section className={styles.contentSection}>
      <h2 className={styles.title}>{t(title)}</h2> {/* Use t() to translate the title prop */}
      {children}
    </section>
  );
};

export default ContentSection;


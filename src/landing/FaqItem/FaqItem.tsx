
import React from 'react';
import { useTranslation } from 'react-i18next'; // Add this import
import styles from './FaqItem.module.css';

interface FaqItemProps {
  question: string; // This prop will now be a translation key
  answer: string;   // This prop will now be a translation key
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  const { t } = useTranslation(); // Initialize useTranslation
  return (
    <details className={styles.faqItem}>
      <summary className={styles.faqQuestion}>{t(question)}</summary> {/* Use t() to translate the question prop */}
      <div className={styles.faqAnswer} dangerouslySetInnerHTML={{ __html: t(answer) }}></div> {/* Use t() and dangerouslySetInnerHTML for answer */}
    </details>
  );
};

export default FaqItem;


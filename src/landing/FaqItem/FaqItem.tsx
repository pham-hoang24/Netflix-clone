
import React from 'react';
import styles from './FaqItem.module.css';

interface FaqItemProps {
  question: string;
  answer: string;
}

const FaqItem: React.FC<FaqItemProps> = ({ question, answer }) => {
  return (
    <details className={styles.faqItem}>
      <summary className={styles.faqQuestion}>{question}</summary>
      <div className={styles.faqAnswer}>{answer}</div>
    </details>
  );
};

export default FaqItem;

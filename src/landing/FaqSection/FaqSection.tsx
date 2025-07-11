
import React from 'react';
import FaqItem from '../FaqItem/FaqItem';
import styles from './FaqSection.module.css';

interface FaqSectionProps {
  faqs: { question: string; answer: string }[];
}

const FaqSection: React.FC<FaqSectionProps> = ({ faqs }) => {
  return (
    <div className={styles.faqContainer}>
      {faqs.map((faq, index) => (
        <FaqItem key={index} question={faq.question} answer={faq.answer} />
      ))}
    </div>
  );
};

export default FaqSection;

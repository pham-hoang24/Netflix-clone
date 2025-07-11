import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();

  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>Ready to watch? Enter your email to create or restart your membership.</p>
        <div className={styles.emailSignup}>
          <input type="email" className={styles.emailInput} placeholder="Email address" />
          <button type="button" className={styles.ctaButton} onClick={handleGetStartedClick}>
            Get Started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" viewBox="0 0 24 24" width="24" height="24" data-icon="ChevronRightStandard" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.5859 12L8.29303 19.2928L9.70725 20.7071L17.7072 12.7071C17.8948 12.5195 18.0001 12.2652 18.0001 12C18.0001 11.7347 17.8948 11.4804 17.7072 11.2928L9.70724 3.29285L8.29303 4.70706L15.5859 12Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
      <p>Questions? Call 1-800-000-0000</p>
      <div className={styles.footerLinks}>
        <a href="#">FAQ</a>
        <a href="#">Help Centre</a>
        <a href="#">Account</a>
        <a href="#">Media Centre</a>
        <a href="#">Investor Relations</a>
        <a href="#">Jobs</a>
        <a href="#">Ways to Watch</a>
        <a href="#">Terms of Use</a>
        <a href="#">Privacy</a>
        <a href="#">Cookie Preferences</a>
        <a href="#">Corporate Information</a>
        <a href="#">Contact Us</a>
      </div>
      <p className={styles.copyright}>&copy; 2024 Netflix, Inc.</p>
    </footer>
  );
};

export default Footer;


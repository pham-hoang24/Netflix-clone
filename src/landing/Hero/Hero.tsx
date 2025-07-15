import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Hero.module.css';

// Define types for component state
interface HeroState {
  email: string;
  error: string | null;
}

const Hero: React.FC = () => {
  const [email, setEmail] = useState<HeroState['email']>('');
  const [error, setError] = useState<HeroState['error']>(null);
  const navigate = useNavigate();

  // Real-time email validation function
  const validateEmail = (email: string): boolean => {
    // Standard email regex for basic syntax validation
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setError('Please enter a valid email address.');
    } else {
      setError(null); // Clear error if email is valid or empty
    }
  };

  const handleSignInClick = () => {
    if (validateEmail(email)) {
      // Navigate to login page, passing email in state
      navigate('/login', { state: { email } });
    } else {
      setError('Please enter a valid email address to sign in.');
    }
  };

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>Unlimited films, series and more</h1>
        <p className={styles.subtitle}>Starts at €9.49. Cancel at any time.</p>
        <p className={styles.description}>Ready to watch? Enter your email to create or restart your membership.</p>
        <div className={styles.emailSignup}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              className={`${styles.emailInput} ${error ? styles.inputError : ''}`}
              placeholder="Email address"
              value={email}
              onChange={handleEmailChange}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <button type="button" className={styles.ctaButton} onClick={handleSignInClick}>
            Get started
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" viewBox="0 0 24 24" width="24" height="24" data-icon="ChevronRightStandard" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.5859 12L8.29303 19.2928L9.70725 20.7071L17.7072 12.7071C17.8948 12.5195 18.0001 12.2652 18.0001 12C18.0001 11.7347 17.8948 11.4804 17.8948 11.2928L9.70724 3.29285L8.29303 4.70706L15.5859 12Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;

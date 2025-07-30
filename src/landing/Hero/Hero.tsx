import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './Hero.module.css'; // Adjust path as needed

interface HeroPresentationProps {
  email: string;
  error: string | null;
  isLoading: boolean;
  handleEmailChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSignInClick: () => void;
}

const HeroPresentation: React.FC<HeroPresentationProps> = ({
  email,
  error,
  isLoading,
  handleEmailChange,
  handleSignInClick,
}) => {
  const { t } = useTranslation();

  return (
    <section className={styles.hero}>
      <div className={styles.heroContent}>
        <h1>{t('hero.title')}</h1>
        <p className={styles.subtitle}>{t('hero.subtitle')}</p>
        <p className={styles.description}>{t('hero.description')}</p>
        <div className={styles.emailSignup}>
          <div className={styles.inputContainer}>
            <input
              type="email"
              className={`${styles.emailInput} ${error ? styles.inputError : ''}`}
              placeholder={t('login.emailPlaceholder')}
              value={email}
              onChange={handleEmailChange}
              disabled={isLoading}
            />
            {error && <p className={styles.errorMessage}>{error}</p>}
          </div>
          <button
            type="button"
            className={styles.ctaButton}
            onClick={handleSignInClick}
            disabled={isLoading || !email || !!error}
          >
            {isLoading ? t('hero.checking') : t('hero.getStarted')}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" viewBox="0 0 24 24" width="24" height="24" data-icon="ChevronRightStandard" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.5859 12L8.29303 19.2928L9.70725 20.7071L17.7072 12.7071C17.8948 12.5195 18.0001 12.2652 18.0001 12C18.0001 11.7347 17.8948 11.4804 17.8948 11.2928L9.70724 3.29285L8.29303 4.70706L15.5859 12Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default HeroPresentation;

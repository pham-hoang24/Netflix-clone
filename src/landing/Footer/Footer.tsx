import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Add this import
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation(); // Initialize useTranslation

  const handleGetStartedClick = () => {
    navigate('/login');
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <p>{t('footer.readyToWatch')}</p> {/* Use translation key */}
        <div className={styles.emailSignup}>
          <input type="email" className={styles.emailInput} placeholder={t('footer.emailPlaceholder')} /> {/* Use translation key */}
          <button type="button" className={styles.ctaButton} onClick={handleGetStartedClick}>
            {t('footer.getStarted')} {/* Use translation key */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" role="img" viewBox="0 0 24 24" width="24" height="24" data-icon="ChevronRightStandard" aria-hidden="true">
              <path fillRule="evenodd" clipRule="evenodd" d="M15.5859 12L8.29303 19.2928L9.70725 20.7071L17.7072 12.7071C17.8948 12.5195 18.0001 12.2652 18.0001 12C18.0001 11.7347 17.8948 11.4804 17.8948 11.2928L9.70724 3.29285L8.29303 4.70706L15.5859 12Z" fill="currentColor"></path>
            </svg>
          </button>
        </div>
      </div>
      <p>{t('footer.questionsCall')}</p> {/* Use translation key */}
      <div className={styles.footerLinks}>
        <a href="#">{t('footer.faq')}</a> {/* Use translation key */}
        <a href="#">{t('footer.helpCentre')}</a> {/* Use translation key */}
        <a href="#">{t('footer.account')}</a> {/* Use translation key */}
        <a href="#">{t('footer.mediaCentre')}</a> {/* Use translation key */}
        <a href="#">{t('footer.investorRelations')}</a> {/* Use translation key */}
        <a href="#">{t('footer.jobs')}</a> {/* Use translation key */}
        <a href="#">{t('footer.waysToWatch')}</a> {/* Use translation key */}
        <a href="#">{t('footer.termsOfUse')}</a> {/* Use translation key */}
        <a href="#">{t('footer.privacy')}</a> {/* Use translation key */}
        <a href="#">{t('footer.cookiePreferences')}</a> {/* Use translation key */}
        <a href="#">{t('footer.corporateInformation')}</a> {/* Use translation key */}
        <a href="#">{t('footer.contactUs')}</a> {/* Use translation key */}
      </div>
      <p className={styles.copyright}>{t('footer.copyright')}</p> {/* Use translation key */}
    </footer>
  );
};

export default Footer;


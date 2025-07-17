import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next'; // Add this import
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation(); // Initialize useTranslation and get i18n instance

  const handleSignInClick = () => {
    navigate('/login');
  };

  const changeLanguage = (event: React.ChangeEvent<HTMLSelectElement>) => {
    i18n.changeLanguage(event.target.value);
  };

  return (
    <nav className={styles.nav}>
      <img src="/netflix_logo.png" alt="Netflix Logo" className={styles.logo} />
      <div className={styles.navActions}>
        <select className={styles.languageSelect} onChange={changeLanguage} value={i18n.language}>
          <option value="english">{t('navbar.english')}</option> {/* Use translation key */}
          <option value="tieng viet">{t('navbar.vietnamese')}</option> {/* Use translation key */}
          <option value="suomi">{t('navbar.finnish')}</option> {/* Use translation key */}
        </select>
        <button onClick={handleSignInClick} className={styles.signIn}>{t('navbar.signIn')}</button> {/* Use translation key */}
      </div>
    </nav>
  );
};

export default Navbar;

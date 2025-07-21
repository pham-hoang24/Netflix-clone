import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

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
          <option value="english">{t('navbar.english')}</option>
          <option value="tieng viet">{t('navbar.vietnamese')}</option>
          <option value="suomi">{t('navbar.finnish')}</option>
        </select>
        <button onClick={handleSignInClick} className={styles.signIn}>{t('navbar.signIn')}</button>
      </div>
    </nav>
  );
};

export default Navbar;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleSignInClick = () => {
    navigate('/login');
  };

  return (
    <nav className={styles.nav}>
      <img src="/netflix_logo.png" alt="Netflix Logo" className={styles.logo} />
      <div className={styles.navActions}>
        <select className={styles.languageSelect}>
          <option value="en">English</option>
          <option value="vi">Tiếng Việt</option>
          <option value="fi">Suomi</option>
        </select>
        <button onClick={handleSignInClick} className={styles.signIn}>Sign In</button>
      </div>
    </nav>
  );
};

export default Navbar;
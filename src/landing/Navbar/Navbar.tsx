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
      <button onClick={handleSignInClick} className={styles.signIn}>Sign In</button>
    </nav>
  );
};

export default Navbar;
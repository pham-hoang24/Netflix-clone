
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from './LoginPage.module.css';
import { useAuth } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useTranslation } from 'react-i18next';

// Define type for the location state
interface LocationState {
  email?: string;
}

interface HandleLoginResult {
    newSession: boolean;
    message?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const functions = getFunctions();
  const { t } = useTranslation();

  // Pre-fill email from location state if available
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleLoginFunction = httpsCallable(functions, 'handleLogin');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    if (!email || !password) {
      setError(t('login.fieldRequired'));
      return;
    }

    if (email.length > 255 || password.length > 255) {
        setError(t('login.tooLong'));
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newSessionId = userCredential.user.uid + Date.now();
      const result = await handleLoginFunction({ newSessionId });
      const data = result.data as HandleLoginResult;

      if (data.newSession) {
        login(); // Use login from AuthContext
        navigate('/home');
      } else {
        setError(data.message || null);
        setShowModal(true);
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError(t('login.invalidCredentials'));
      } else if (error.code === 'auth/user-disabled') {
        setError(t('login.accountDisabled'));
      }
      else {
        setError(error.message);
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
        setError(null);
    }
}

const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (error) {
        setError(null);
    }
}

  const handleModalChoice = (choice: 'stay' | 'return') => {
    if (choice === 'stay') {
        login();
    } else {
        setShowModal(false);
    }
  }

  const isButtonDisabled = !email || !password;

  return (
    
    <div className={styles.loginPage}>
      <Link to="/">
        <img
          src="https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
          alt="Netflix Logo"
          className={styles.netflixLogo}
        />
      </Link>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <h2>{t('login.signIn')}</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder={t('login.emailPlaceholder')}
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder={t('login.passwordPlaceholder')}
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit" className={styles.signInButton} disabled={isButtonDisabled}>
          {t('login.signIn')}
        </button>
        <div className={styles.helpText}>
          <label>
            <input type="checkbox" /> {t('login.rememberMe')}
          </label>
          <a href="#">{t('login.needHelp')}</a>
        </div>
        <div className={styles.signUpText}>
          {t('login.newToNetflix')} <Link to="/signup">{t('login.signUpNow')}</Link>.
        </div>
      </form>

      {showModal && (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <p>{error}</p>
                <button onClick={() => handleModalChoice('stay')}>{t('login.stayOnBrowser')}</button>
                <button onClick={() => handleModalChoice('return')}>{t('login.returnToExisting')}</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

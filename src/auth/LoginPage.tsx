
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from './LoginPage.module.css';
import { useAuth } from '../context/AuthContext';
import { getFunctions, httpsCallable } from 'firebase/functions';

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
      setError('This field is required');
      return;
    }

    if (email.length > 255 || password.length > 255) {
        setError('Too long');
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const newSessionId = userCredential.user.uid + Date.now();
      const result = await handleLoginFunction({ newSessionId });
      const data = result.data as HandleLoginResult;

      if (data.newSession) {
        login(); // Use login from AuthContext
      } else {
        setError(data.message || null);
        setShowModal(true);
      }
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else if (error.code === 'auth/user-disabled') {
        setError('Your account has been disabled. Please contact support.');
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
        <h2>Sign In</h2>
        {error && <div className={styles.errorMessage}>{error}</div>}
        <div className={styles.inputGroup}>
          <input
            type="email"
            placeholder="Email or phone number"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>
        <button type="submit" className={styles.signInButton} disabled={isButtonDisabled}>
          Sign In
        </button>
        <div className={styles.helpText}>
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Need help?</a>
        </div>
        <div className={styles.signUpText}>
          New to Netflix? <Link to="/signup">Sign up now</Link>.
        </div>
      </form>

      {showModal && (
        <div className={styles.modal}>
            <div className={styles.modalContent}>
                <p>{error}</p>
                <button onClick={() => handleModalChoice('stay')}>Stay on this browser</button>
                <button onClick={() => handleModalChoice('return')}>Return to existing browser</button>
            </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;

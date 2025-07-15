
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebase';
import styles from './LoginPage.module.css';
import { useAuth } from '../context/AuthContext';

// Define type for the location state
interface LocationState {
  email?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Pre-fill email from location state if available
  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    try {
      await signInWithEmailAndPassword(auth, email, password);
      login(); // Use login from AuthContext
    } catch (error: any) {
      if (error.code === 'auth/invalid-credential') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message);
      }
    }
  };

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
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className={styles.inputGroup}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className={styles.signInButton}>
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
    </div>
  );
};

export default LoginPage;

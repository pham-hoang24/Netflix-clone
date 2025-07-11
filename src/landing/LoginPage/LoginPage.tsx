
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LoginPage.module.css';
import { useAuth } from '../../context/AuthContext';

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

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null); // Clear previous errors

    // Simulate authentication
    if (email === 'test@example.com' && password === 'password123') {
      console.log('Login successful!');
      login(); // Use login from AuthContext
    } else {
      setError("Sorry, we can't find an account with this email address. Please try again or create a new account.");
    }
  };

  return (
    <div className={styles.loginPage}>
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
          New to Netflix? <a href="#">Sign up now</a>.
        </div>
      </form>
    </div>
  );
};

export default LoginPage;

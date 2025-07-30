import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../services/firebase';
import HeroPresentation from '../../landing/Hero/Hero'; // Import the presentational component

// Define types for component state
interface HeroState {
  email: string;
  error: string | null;
  isLoading: boolean;
}

const HeroContainer: React.FC = () => {
  const [email, setEmail] = useState<HeroState['email']>('');
  const [error, setError] = useState<HeroState['error']>(null);
  const [isLoading, setIsLoading] = useState<HeroState['isLoading']>(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Real-time email validation function
  const validateEmail = (email: string): boolean => {
    // Standard email regex for basic syntax validation
    const regex = /^[-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    return regex.test(email);
  };

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = event.target.value;
    setEmail(newEmail);

    if (newEmail && !validateEmail(newEmail)) {
      setError(t('hero.emailValidationError'));
    } else {
      setError(null);
    }
  };

  const handleSignInClick = async () => {
    if (!validateEmail(email)) {
      setError(t('hero.emailSignInError'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await signInWithEmailAndPassword(auth, email, 'dummy-password');
      navigate('/login', { state: { email } });
    } catch (err: any) {
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        navigate('/login', { state: { email } });
      } else if (err.code === 'auth/user-not-found') {
        navigate('/signup', { state: { email } });
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <HeroPresentation
      email={email}
      error={error}
      isLoading={isLoading}
      handleEmailChange={handleEmailChange}
      handleSignInClick={handleSignInClick}
    />
  );
};

export default HeroContainer;

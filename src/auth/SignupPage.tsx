import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import styles from './SignupPage.module.css';
import { useTranslation } from 'react-i18next';

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    devices: [] as string[],
    profileName: '',
    preferredShows: [] as string[],
  });
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        devices: checked
          ? [...prev.devices, value]
          : prev.devices.filter((device) => device !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleNextStep = () => {
    setError(null);
    switch (currentStep) {
      case 1:
        if (!formData.email || !formData.password) {
          setError(t('signup.emailPasswordRequired'));
          return;
        }
        if (formData.password.length < 6) {
          setError(t('signup.passwordLengthError'));
          return;
        }
        // Basic email format validation
        if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
          setError(t('signup.invalidEmail'));
          return;
        }
        break;
      case 2:
        if (formData.devices.length === 0) {
          setError(t('signup.deviceSelectionRequired'));
          return;
        }
        break;
      case 3:
        if (!formData.profileName.trim()) {
          setError(t('signup.profileNameRequired'));
          return;
        }
        break;
      default:
        break;
    }
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setError(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const { user } = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      await setDoc(doc(db, 'users', user.uid), {
        email: formData.email,
        region: 'US', // Default region
        profileType: 'Adult', // Default profile type
        devices: formData.devices,
        profileName: formData.profileName,
        preferred_genres: formData.preferredShows.map(s => s.trim()).filter(s => s.length > 0), // Clean up and filter empty strings
      });
      navigate('/home');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className={styles.stepContent}>
            <h2>{t('signup.step1Title')}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <input
              type="email"
              name="email"
              placeholder={t('signup.emailPlaceholder')}
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="password"
              name="password"
              placeholder={t('signup.passwordPlaceholder')}
              value={formData.password}
              onChange={handleChange}
            />
            <button type="button" onClick={handleNextStep}>{t('signup.next')}</button>
          </div>
        );
      case 2:
        return (
          <div className={styles.stepContent}>
            <h2>{t('signup.step2Title')}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <label>
              <input
                type="checkbox"
                name="devices"
                value="TV"
                checked={formData.devices.includes('TV')}
                onChange={handleChange}
              />
              {t('signup.deviceTV')}
            </label>
            <label>
              <input
                type="checkbox"
                name="devices"
                value="Mobile"
                checked={formData.devices.includes('Mobile')}
                onChange={handleChange}
              />
              {t('signup.deviceMobile')}
            </label>
            <label>
              <input
                type="checkbox"
                name="devices"
                value="Desktop"
                checked={formData.devices.includes('Desktop')}
                onChange={handleChange}
              />
              {t('signup.deviceDesktop')}
            </label>
            <div className={styles.navigationButtons}>
              <button type="button" onClick={handlePrevStep}>{t('signup.back')}</button>
              <button type="button" onClick={handleNextStep}>{t('signup.next')}</button>
            </div>
          </div>
        );
      case 3:
        return (
          <div className={styles.stepContent}>
            <h2>{t('signup.step3Title')}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <input
              type="text"
              name="profileName"
              placeholder={t('signup.profileNamePlaceholder')}
              value={formData.profileName}
              onChange={handleChange}
            />
            <div className={styles.navigationButtons}>
              <button type="button" onClick={handlePrevStep}>{t('signup.back')}</button>
              <button type="button" onClick={handleNextStep}>{t('signup.next')}</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className={styles.stepContent}>
            <h2>{t('signup.step4Title')}</h2>
            {error && <p className={styles.error}>{error}</p>}
            <textarea
              name="preferredShows"
              placeholder={t('signup.preferredShowsPlaceholder')}
              value={formData.preferredShows.join(', ')}
              onChange={(e) => setFormData(prev => ({ ...prev, preferredShows: e.target.value.split(',').map(s => s.trim()) }))}
            />
            <div className={styles.navigationButtons}>
              <button type="button" onClick={handlePrevStep}>{t('signup.back')}</button>
              <button type="button" onClick={handleFinalSubmit}>{t('signup.signUp')}</button>
              <button type="button" onClick={handleFinalSubmit}>{t('signup.skip')}</button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.signupContainer}>
      <form onSubmit={handleFinalSubmit} className={styles.signupForm}>
        {renderStep()}
      </form>
    </div>
  );
};

export default SignupPage;
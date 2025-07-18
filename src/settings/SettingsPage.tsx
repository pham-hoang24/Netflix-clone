import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import styles from './SettingsPage.module.css';
import { useTranslation } from 'react-i18next';

const SettingsPage: React.FC = () => {
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    profileName: '',
    devices: [] as string[],
    preferredLanguages: [] as string[],
    preferredShows: [] as string[],
  });
  const [initialData, setInitialData] = useState({});

  useEffect(() => {
    if (currentUser) {
      const fetchUserData = async () => {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            profileName: data.profileName || '',
            devices: data.devices || [],
            preferredLanguages: data.preferredLanguages || [],
            preferredShows: data.preferred_genres || [],
          });
          setInitialData(data);
        }
      };
      fetchUserData();
    }
  }, [currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      const arrayName = name as 'devices' | 'preferredLanguages';
      setFormData((prev) => ({
        ...prev,
        [arrayName]: checked
          ? [...prev[arrayName], value]
          : prev[arrayName].filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSaveChanges = async () => {
    if (currentUser) {
      const docRef = doc(db, 'users', currentUser.uid);
      await updateDoc(docRef, {
        profileName: formData.profileName,
        devices: formData.devices,
        preferredLanguages: formData.preferredLanguages,
        preferred_genres: formData.preferredShows,
      });
      navigate('/home');
    }
  };

  const handleCancel = () => {
    navigate('/home');
  };

  const handlePasswordReset = () => {
    if (currentUser?.email) {
      sendPasswordResetEmail(auth, currentUser.email)
        .then(() => {
          alert('Password reset email sent!');
        })
        .catch((error) => {
          alert(error.message);
        });
    }
  };

  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>{t('settings.title')}</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.membershipBilling')}</h2>
        <div className={styles.inputGroup}>
          <label>{t('settings.email')}</label>
          <input type="email" value={currentUser?.email || ''} readOnly />
        </div>
        <button onClick={handlePasswordReset} className={styles.button}>
          {t('settings.changePassword')}
        </button>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.profileAndParentalControls')}</h2>
        <div className={styles.inputGroup}>
          <label htmlFor="profileName">{t('settings.profileName')}</label>
          <input
            type="text"
            id="profileName"
            name="profileName"
            value={formData.profileName}
            onChange={handleChange}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>{t('settings.preferredLanguages')}</label>
          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                name="preferredLanguages"
                value="English"
                checked={formData.preferredLanguages.includes('English')}
                onChange={handleChange}
              />
              {t('signup.languageEnglish')}
            </label>
            <label>
              <input
                type="checkbox"
                name="preferredLanguages"
                value="Vietnamese"
                checked={formData.preferredLanguages.includes('Vietnamese')}
                onChange={handleChange}
              />
              {t('signup.languageVietnamese')}
            </label>
            <label>
              <input
                type="checkbox"
                name="preferredLanguages"
                value="Finnish"
                checked={formData.preferredLanguages.includes('Finnish')}
                onChange={handleChange}
              />
              {t('signup.languageFinnish')}
            </label>
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="preferredShows">{t('settings.preferredShows')}</label>
          <textarea
            id="preferredShows"
            name="preferredShows"
            value={formData.preferredShows.join(', ')}
            onChange={(e) => setFormData(prev => ({ ...prev, preferredShows: e.target.value.split(',').map(s => s.trim()) }))}
          />
        </div>

        <div className={styles.inputGroup}>
          <label>{t('settings.devices')}</label>
          <div className={styles.checkboxGroup}>
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
          </div>
        </div>
      </div>

      <div className={styles.buttonGroup}>
        <button onClick={handleCancel} className={`${styles.button} ${styles.cancelButton}`}>
          {t('settings.cancel')}
        </button>
        <button onClick={handleSaveChanges} className={`${styles.button} ${styles.saveButton}`}>
          {t('settings.save')}
        </button>
      </div>
    </div>
  );
};

export default SettingsPage;
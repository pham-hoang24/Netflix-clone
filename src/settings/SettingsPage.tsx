import React from 'react';
import styles from './SettingsPage.module.css';
import { TFunction } from 'react-i18next';

interface FormData {
  profileName: string;
  devices: string[];
  preferredLanguages: string[];
  preferredShows: string[];
}

interface SettingsPagePresenterProps {
  formData: FormData;
  currentUserEmail: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSaveChanges: () => void;
  handleCancel: () => void;
  handlePasswordReset: () => void;
  t: TFunction;
}

const SettingsPagePresenter: React.FC<SettingsPagePresenterProps> = ({
  formData,
  currentUserEmail,
  handleChange,
  handleSaveChanges,
  handleCancel,
  handlePasswordReset,
  t,
}) => {
  return (
    <div className={styles.settingsContainer}>
      <h1 className={styles.title}>{t('settings.title')}</h1>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>{t('settings.membershipBilling')}</h2>
        <div className={styles.inputGroup}>
          <label>{t('settings.email')}</label>
          <input type="email" value={currentUserEmail} readOnly />
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
            onChange={(e) => handleChange({
              ...e,
              target: { ...e.target, value: e.target.value.split(',').map(s => s.trim()).join(', ') }
            } as React.ChangeEvent<HTMLTextAreaElement>)}
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

export default SettingsPagePresenter;
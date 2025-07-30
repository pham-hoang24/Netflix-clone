import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth, db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import SettingsPagePresenter from '../SettingsPage'; // Import the presenter component

interface FormData {
  profileName: string;
  devices: string[];
  preferredLanguages: string[];
  preferredShows: string[];
}

const SettingsPageContainer: React.FC = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormData>({
    profileName: '',
    devices: [],
    preferredLanguages: [],
    preferredShows: [],
  });

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
    <SettingsPagePresenter
      formData={formData}
      currentUserEmail={currentUser?.email || ''}
      handleChange={handleChange}
      handleSaveChanges={handleSaveChanges}
      handleCancel={handleCancel}
      handlePasswordReset={handlePasswordReset}
      t={t}
    />
  );
};

export default SettingsPageContainer;

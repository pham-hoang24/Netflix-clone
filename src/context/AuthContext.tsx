import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { useLanguage, LanguageProvider } from './LanguageContext';
import { useTranslation } from 'react-i18next';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProviderContent: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [languageLoading, setLanguageLoading] = useState(true);
  const navigate = useNavigate();
  const { changeLanguage, setHasManuallySwitched } = useLanguage();
  const { i18n } = useTranslation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setCurrentUser({ ...user, ...userData });
          const preferredLanguage = userData.preferredLanguages?.[0];
          if (preferredLanguage && i18n.language !== preferredLanguage) {
            changeLanguage(preferredLanguage);
          }
        } else {
          setCurrentUser(user);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
      setLanguageLoading(false);
    });

    return unsubscribe;
  }, [changeLanguage, i18n.language]);

  const location = useLocation();
  useEffect(() => {
    if (currentUser && !loading && location.pathname === '/login') {
      navigate('/home');
    }
  }, [currentUser, loading, navigate, location.pathname]);

  const login = () => {
    // The onAuthStateChanged listener will handle the user state update
  };

  const logout = () => {
    auth.signOut();
    setHasManuallySwitched(false); // Reset manual switch on logout
    navigate('/'); // Redirect to landing page after logout
  };

  return (
    <AuthContext.Provider value={{ currentUser, loading: loading || languageLoading, login, logout }}>
      {!(loading || languageLoading) && children}
    </AuthContext.Provider>
  );
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <LanguageProvider>
      <AuthProviderContent>{children}</AuthProviderContent>
    </LanguageProvider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

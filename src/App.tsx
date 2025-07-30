import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing/container/LandingPageContainer';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import HomePage from './home/container/HomePageContainer';// Assuming this is the main component for the home page
import SettingsPageContainer from './settings/container/SettingsPageContainer';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from './services/i18n'; // Import your i18n configuration
import { AuthProvider, useAuth } from './context/AuthContext';
import SearchResultsPageContainer from './search/container/SearchResultsPageContainer';

const AppContent: React.FC = () => {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>; // You can replace this with a loading spinner
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={
        <PrivateRoute>
          <HomePage />
        </PrivateRoute>
      } />
      <Route path="/settings" element={
        <PrivateRoute>
          <SettingsPageContainer />
        </PrivateRoute>
      } />
      <Route path="/search/:query" element={
        <PrivateRoute>
          <SearchResultsPageContainer />
        </PrivateRoute>
      } />
    </Routes>
  );
}

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </I18nextProvider>
  );
};

export default App;

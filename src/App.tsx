import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing/Landing/LandingPage';
import LoginPage from './auth/LoginPage';
import SignupPage from './auth/SignupPage';
import HomePage from './home/HomePage';// Assuming this is the main component for the home page
import SettingsPage from './settings/SettingsPage';
import PrivateRoute from './components/PrivateRoute/PrivateRoute';
import { I18nextProvider } from 'react-i18next';
import i18n from './services/i18n'; // Import your i18n configuration

const App: React.FC = () => {
  return (
    <I18nextProvider i18n={i18n}>
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
            <SettingsPage />
          </PrivateRoute>
        } />
      </Routes>
    </I18nextProvider>
  );
};

export default App;

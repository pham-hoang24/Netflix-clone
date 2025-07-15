import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LandingPage from './landing/Landing/LandingPage';
import LoginPage from './landing/LoginPage/LoginPage';
import SignupPage from './landing/SignupPage/SignupPage';
import HomePage from './home/HomePage';// Assuming this is the main component for the home page
import PrivateRoute from './components/PrivateRoute/PrivateRoute';

const App: React.FC = () => {
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
    </Routes>
  );
};

export default App;

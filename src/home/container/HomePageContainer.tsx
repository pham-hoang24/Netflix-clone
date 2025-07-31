import React, { useEffect } from 'react';
import HomePage from '../HomePage'; // Import the presentational component
import { logUserEvent } from '../../services/analytics';

const HomePageContainer: React.FC = () => {
  useEffect(() => {
    logUserEvent('page_view', { page_name: 'HomePage' });
  }, []);

  return <HomePage />;
};

export default HomePageContainer;

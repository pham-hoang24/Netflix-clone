import React from 'react';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer'; // Import the Footer component
import styles from './Layout.module.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className={styles.layoutContainer}>
      <div className={styles.heroSectionWrapper}>
        <Navbar />
        {/* Hero component will be passed as children to Layout and rendered here */}
        {children && React.Children.toArray(children)[0]} {/* Assuming Hero is the first child */}
      </div>
      <main className={styles.mainContent}>
        {children && React.Children.toArray(children).slice(1)} {/* Render other children here */}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
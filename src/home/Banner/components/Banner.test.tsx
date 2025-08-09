
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Banner from './Banner';

// Mock i18n
jest.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('Banner Presenter', () => {
  const truncate = (str: string | undefined, n: number) => {
    if (!str) return "";
    return str.length > n ? str.substr(0, n - 1) + "..." : str;
  };

  it('should render a placeholder when loading', () => {
    render(<Banner movie={null} truncate={truncate} placeholderImg="" isLoading={true} error={null} />);
    const banner = screen.getByRole('banner');
    expect(banner).toBeInTheDocument();
    expect(banner.style.backgroundColor).toBe('rgb(20, 20, 20)');
  });

  it('should render the movie content when not loading', () => {
    const movie = {
      id: 1,
      poster_path: '/poster.jpg',
      title: 'Test Movie',
      name: 'Test Movie Name',
      original_name: 'Test Original Name',
      overview: 'This is a test overview.',
      backdrop_path: '/test.jpg',
    };
    render(<Banner movie={movie} truncate={truncate} placeholderImg="" isLoading={false} error={null} />);

    expect(screen.getByRole('heading', { name: /Test Movie/ })).toBeInTheDocument();
    expect(screen.getByText(/This is a test overview./)).toBeInTheDocument();
    const banner = screen.getByRole('banner');
    expect(banner.style.backgroundImage).toContain('/test.jpg');
  });

  it('should render an error state', () => {
    render(<Banner movie={null} truncate={truncate} placeholderImg="placeholder.jpg" isLoading={false} error="Test Error" />);
    expect(screen.getByRole('heading', { name: /Error/ })).toBeInTheDocument();
    expect(screen.getByText(/Could not load content./)).toBeInTheDocument();
    const banner = screen.getByRole('banner');
    expect(banner.style.backgroundImage).toContain('placeholder.jpg');
  });
});

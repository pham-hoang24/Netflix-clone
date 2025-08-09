
jest.mock('../../../services/firebase');

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import BannerContainer from './BannerContainer';
import { getMoviesForCategory } from '../../../services/movieService';

// Mock services
jest.mock('../../../services/movieService', () => ({
  getMoviesForCategory: jest.fn(),
}));

// Mock Banner presenter
jest.mock('../components/Banner', () => (props: any) => (
  <div data-testid="banner-presenter">
    <div data-testid="banner-loading">{props.isLoading.toString()}</div>
    <div data-testid="banner-error">{props.error}</div>
    <div data-testid="banner-movie">{props.movie ? props.movie.title : ''}</div>
  </div>
));

describe('BannerContainer', () => {
  const mockGetMoviesForCategory = getMoviesForCategory as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle loading and success states correctly', async () => {
    const mockMovies = [{ title: 'Test Movie', backdrop_path: '/test.jpg' }];
    mockGetMoviesForCategory.mockResolvedValue(mockMovies);

    render(<BannerContainer />);

    expect(screen.getByTestId('banner-loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('banner-loading').textContent).toBe('false');
      expect(screen.getByTestId('banner-movie').textContent).toBe('Test Movie');
      expect(screen.getByTestId('banner-error').textContent).toBe('');
    });
  });

  it('should handle error state correctly', async () => {
    mockGetMoviesForCategory.mockRejectedValue(new Error('Failed to fetch'));

    render(<BannerContainer />);

    expect(screen.getByTestId('banner-loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('banner-loading').textContent).toBe('false');
      expect(screen.getByTestId('banner-error').textContent).toBe('Failed to load banner.');
    });
  });

  it('should handle no movies found case', async () => {
    mockGetMoviesForCategory.mockResolvedValue([]);

    render(<BannerContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('banner-loading').textContent).toBe('false');
      expect(screen.getByTestId('banner-error').textContent).toBe('Could not fetch trending movies.');
    });
  });
});

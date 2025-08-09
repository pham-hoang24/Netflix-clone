
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RowContainer from './RowContainer';
import { getMoviesForCategory } from '../../../services/movieService';
import { fetchPersonalizedRecommendations } from '../../../services/api-client';
import { auth } from '../../../services/firebase';

// Mock services and auth
jest.mock('../../../services/movieService');
jest.mock('../../../services/api-client');
jest.mock('../../../services/firebase');
jest.mock('../../../services/firebase', () => ({
  auth: {
    currentUser: {
      getIdToken: jest.fn(),
    },
  },
}));
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-user' } }),
}));

// Mock Row presenter
jest.mock('../components/Row', () => (props: any) => (
  <div data-testid="row-presenter">
    <div data-testid="row-loading">{props.isLoading.toString()}</div>
    <div data-testid="row-error">{props.error}</div>
    <div data-testid="row-movies">{JSON.stringify(props.movies)}</div>
  </div>
));

describe('RowContainer', () => {
  const mockGetMoviesForCategory = getMoviesForCategory as jest.Mock;
  const mockFetchPersonalizedRecommendations = fetchPersonalizedRecommendations as jest.Mock;
  const mockGetIdToken = auth.currentUser?.getIdToken as jest.Mock;

  const defaultProps = {
    isPlayerActive: false,
    trailerUrl: '',
    noTrailer: false,
    youtubeOpts: {},
    onPlayerReady: jest.fn(),
    onPlayerStateChange: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Category Row', () => {
    it('should fetch category movies and handle success state', async () => {
      const mockMovies = [{ id: 1, title: 'Test Movie' }];
      mockGetMoviesForCategory.mockResolvedValue(mockMovies);

      render(<RowContainer {...defaultProps} title="Test Category" categoryId="fetchActionMovies" onMovieClick={jest.fn()} />);

      expect(screen.getByTestId('row-loading').textContent).toBe('true');

      await waitFor(() => {
        expect(screen.getByTestId('row-loading').textContent).toBe('false');
        expect(screen.getByTestId('row-movies').textContent).toBe(JSON.stringify(mockMovies));
      });
    });
  });

  describe('Personalized Row', () => {
    it('should fetch personalized recommendations and handle success state', async () => {
      const mockRecs = [{ id: 2, name: 'Personalized Rec',title: 'Personalized Rec' }];
      if (auth.currentUser) {
        mockGetIdToken.mockResolvedValue('test-token');
      }
      mockFetchPersonalizedRecommendations.mockResolvedValue(mockRecs);

      render(<RowContainer {...defaultProps} title="Personalized For You" rowType="personalized" onMovieClick={jest.fn()} />);

      expect(screen.getByTestId('row-loading').textContent).toBe('true');

      await waitFor(() => {
        expect(mockFetchPersonalizedRecommendations).toHaveBeenCalledWith('test-token');
        expect(screen.getByTestId('row-loading').textContent).toBe('false');
        // The container maps the recommendations, so we need to match that structure
        const expectedMovies = mockRecs.map(rec => ({ ...rec, title: rec.title, poster_path: undefined, backdrop_path: undefined, release_date: undefined, first_air_date: undefined, genres: [] }));
        expect(screen.getByTestId('row-movies').textContent).toBe(JSON.stringify(expectedMovies));
      });
    });
  });

  it('should handle error state', async () => {
    mockGetMoviesForCategory.mockRejectedValue(new Error('Failed to fetch'));
    render(<RowContainer {...defaultProps} title="Test Category" categoryId="fetchActionMovies" onMovieClick={jest.fn()} />);

    await waitFor(() => {
      expect(screen.getByTestId('row-loading').textContent).toBe('false');
      expect(screen.getByTestId('row-error').textContent).toBe('Failed to load movies. Please try again later.');
    });
  });
});

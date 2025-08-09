
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResultsPageContainer from './SearchResultsPageContainer';
import { useParams } from 'react-router-dom';
import axios from '../../home/axios';
import { fetchGenres } from '../../services/api-client';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));
jest.mock('../../home/axios');
jest.mock('../../services/api-client');

// Mock Presenter
jest.mock('../SearchResultsPage', () => (props: any) => (
  <div data-testid="search-presenter">
    <div data-testid="search-loading">{props.isLoading.toString()}</div>
    <div data-testid="search-error">{props.error}</div>
    <div data-testid="search-movies">{JSON.stringify(props.movieResults)}</div>
    <div data-testid="search-tv">{JSON.stringify(props.tvResults)}</div>
  </div>
));

describe('SearchResultsPageContainer', () => {
  const mockUseParams = useParams as jest.Mock;
  const mockAxiosGet = axios.get as jest.Mock;
  const mockFetchGenres = fetchGenres as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseParams.mockReturnValue({ query: 'test-query' });
  });

  it('should fetch data, map genres, and set state correctly on success', async () => {
    const searchResults = {
      data: {
        results: [
          { media_type: 'movie', genre_ids: [28], poster_path: '/p.jpg' },
          { media_type: 'tv', genre_ids: [10759], poster_path: '/p.jpg' },
        ],
      },
    };
    const genresMap = { 28: 'Action', 10759: 'Action & Adventure' };

    mockAxiosGet.mockResolvedValue(searchResults);
    mockFetchGenres.mockResolvedValue(genresMap);

    render(<SearchResultsPageContainer />);

    expect(screen.getByTestId('search-loading').textContent).toBe('true');

    await waitFor(() => {
      expect(screen.getByTestId('search-loading').textContent).toBe('false');
      const expectedMovies = [{ media_type: 'movie', genre_ids: [28], poster_path: '/p.jpg', genres: [{ id: 28, name: 'Action' }] }];
      const expectedTv = [{ media_type: 'tv', genre_ids: [10759], poster_path: '/p.jpg', genres: [{ id: 10759, name: 'Action & Adventure' }] }];
      expect(screen.getByTestId('search-movies').textContent).toBe(JSON.stringify(expectedMovies));
      expect(screen.getByTestId('search-tv').textContent).toBe(JSON.stringify(expectedTv));
    });
  });

  it('should handle error state correctly', async () => {
    mockAxiosGet.mockRejectedValue(new Error('Failed to fetch'));
    mockFetchGenres.mockResolvedValue({});

    render(<SearchResultsPageContainer />);

    await waitFor(() => {
      expect(screen.getByTestId('search-loading').textContent).toBe('false');
      expect(screen.getByTestId('search-error').textContent).toBe('Failed to fetch movies.');
    });
  });
});

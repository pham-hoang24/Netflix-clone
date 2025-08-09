
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SearchResultsPagePresenter from './SearchResultsPage';

// Mock dependencies
jest.mock('../home/Navigation /container/NavContainer', () => () => <div data-testid="nav-container"></div>);
jest.mock('../services/analytics', () => ({
  logUserEvent: jest.fn(),
}));
jest.mock('../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: null }),
}));

describe('SearchResultsPage Presenter', () => {
  const mockMovieResults = [{ id: 1, title: 'Movie 1', name: 'Movie 1', overview: 'Overview 1', poster_path: '/p1.jpg', backdrop_path: '/b1.jpg' }];
  const mockTvResults = [{ id: 2, name: 'TV Show 1', title: 'TV Show 1', overview: 'Overview 2', poster_path: '/p2.jpg', backdrop_path: '/b2.jpg' }];
  const mockSetFilterType = jest.fn();

  const defaultProps = {
    query: 'test',
    movieResults: mockMovieResults,
    tvResults: mockTvResults,
    isLoading: false,
    error: null,
    trailerUrl: '',
    noTrailer: false,
    activeMovieId: null,
    filterType: 'all' as const,
    setFilterType: mockSetFilterType,
    handleMovieClick: jest.fn(),
  };

  it('should render content correctly', () => {
    render(<SearchResultsPagePresenter {...defaultProps} />);

    expect(screen.getByRole('heading', { name: /Search results for "test"/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Movies/ })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /TV Shows/ })).toBeInTheDocument();
    expect(screen.getAllByRole('img').length).toBe(2);
  });

  it('should display a loading message', () => {
    render(<SearchResultsPagePresenter {...defaultProps} isLoading={true} />);
    expect(screen.getByText(/Loading.../)).toBeInTheDocument();
  });

  it('should display an error message', () => {
    render(<SearchResultsPagePresenter {...defaultProps} error="Test Error" />);
    expect(screen.getByText(/Test Error/)).toBeInTheDocument();
  });

  it('should display a no results message', () => {
    render(<SearchResultsPagePresenter {...defaultProps} movieResults={[]} tvResults={[]} />);
    expect(screen.getByText(/No results found./)).toBeInTheDocument();
  });

  it('should call setFilterType when filter buttons are clicked', () => {
    render(<SearchResultsPagePresenter {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /Movies/ }));
    expect(mockSetFilterType).toHaveBeenCalledWith('movie');

    fireEvent.click(screen.getByRole('button', { name: /TV Shows/ }));
    expect(mockSetFilterType).toHaveBeenCalledWith('tv');

    fireEvent.click(screen.getByRole('button', { name: /All/ }));
    expect(mockSetFilterType).toHaveBeenCalledWith('all');
  });
});

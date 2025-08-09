
jest.mock('../../../services/firebase');

import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import HomePageContainer from './HomePageContainer';
import { TrailerService } from '../../../services/trailerService';
import { logUserEvent } from '../../../services/analytics';
jest.mock('../../../services/trailerService', () => ({
  TrailerService: {
    getMovieTrailer: jest.fn(),
    isValidYouTubeId: jest.fn(),
  },
}));
jest.mock('../../../services/analytics', () => ({
  logUserEvent: jest.fn(),
}));
jest.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({ currentUser: { uid: 'test-user' } }),
}));

// Mock HomePage presenter
jest.mock('../../HomePage/components/HomePage', () => (props: any) => (
  <div data-testid="homepage-presenter">
    <button onClick={() => props.onMovieClick({ id: 1, title: 'Test Movie' }, 'test-row')}>Click Movie</button>
    <div data-testid="trailer-url">{props.trailerUrl}</div>
    <div data-testid="no-trailer">{props.noTrailer.toString()}</div>
  </div>
));

describe('HomePageContainer', () => {
  const mockTrailerService = TrailerService as jest.Mocked<typeof TrailerService>;
  const mockLogUserEvent = logUserEvent as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle movie click and fetch trailer successfully', async () => {
    mockTrailerService.getMovieTrailer.mockResolvedValue('test-video-id');
    mockTrailerService.isValidYouTubeId.mockReturnValue(true);

    render(<HomePageContainer />);

    await act(async () => {
      fireEvent.click(screen.getByText('Click Movie'));
    });

    expect(mockTrailerService.getMovieTrailer).toHaveBeenCalledWith(1, 'Test Movie', undefined);
    expect(screen.getByTestId('trailer-url').textContent).toBe('test-video-id');
    expect(screen.getByTestId('no-trailer').textContent).toBe('false');
  });

  it('should handle movie click when no trailer is found', async () => {
    mockTrailerService.getMovieTrailer.mockResolvedValue(null);

    render(<HomePageContainer />);

    await act(async () => {
      fireEvent.click(screen.getByText('Click Movie'));
    });

    expect(screen.getByTestId('trailer-url').textContent).toBe('');
    expect(screen.getByTestId('no-trailer').textContent).toBe('true');
  });

  it('should close trailer when the same movie is clicked again', async () => {
    mockTrailerService.getMovieTrailer.mockResolvedValue('test-video-id');
    mockTrailerService.isValidYouTubeId.mockReturnValue(true);

    render(<HomePageContainer />);

    // First click to open
    await act(async () => {
      fireEvent.click(screen.getByText('Click Movie'));
    });

    expect(screen.getByTestId('trailer-url').textContent).toBe('test-video-id');

    // Second click to close
    await act(async () => {
      fireEvent.click(screen.getByText('Click Movie'));
    });

    expect(screen.getByTestId('trailer-url').textContent).toBe('');
  });
});

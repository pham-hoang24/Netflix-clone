
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import Row from './Row';

// Mock YouTube component
jest.mock('react-youtube', () => (props: any) => <div data-testid="youtube-player"></div>);

describe('Row Presenter', () => {
  const mockMovies = [
    { id: 1, title: 'Movie 1', name: 'Movie 1', overview: 'Overview 1', poster_path: '/poster1.jpg', backdrop_path: '/backdrop1.jpg' },
    { id: 2, title: 'Movie 2', name: 'Movie 2', overview: 'Overview 2', poster_path: null, backdrop_path: null },
  ];
  const mockOnMovieClick = jest.fn();

  it('should render a placeholder when loading', () => {
    render(
      <Row
        title="Test Row"
        movies={[]}
        isLoading={true}
        onMovieClick={mockOnMovieClick}
        base_url=""
        placeholderImg=""
        error={null}
        isPlayerActive={false}
        trailerUrl=""
        noTrailer={false}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    expect(screen.getByText('Test Row')).toBeInTheDocument();
    expect(screen.getAllByTestId('row__poster-placeholder').length).toBe(10);
  });

  it('should render movie posters when not loading', () => {
    render(
      <Row
        title="Test Row"
        movies={mockMovies}
        isLoading={false}
        onMovieClick={mockOnMovieClick}
        base_url="https://image.tmdb.org/t/p/original/"
        placeholderImg="placeholder.jpg"
        error={null}
        isPlayerActive={false}
        trailerUrl=""
        noTrailer={false}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    const movieImages = screen.getAllByRole('img');
    expect(movieImages.length).toBe(2);
    expect(movieImages[0]).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original//backdrop1.jpg');
    expect(movieImages[1]).toHaveAttribute('src', 'placeholder.jpg');
  });

  it('should use large posters when isLargeRow is true', () => {
    render(
      <Row
        title="Test Row"
        movies={mockMovies}
        isLargeRow={true}
        isLoading={false}
        onMovieClick={mockOnMovieClick}
        base_url="https://image.tmdb.org/t/p/original/"
        placeholderImg="placeholder.jpg"
        error={null}
        isPlayerActive={false}
        trailerUrl=""
        noTrailer={false}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    const movieImages = screen.getAllByRole('img');
    expect(movieImages[0]).toHaveAttribute('src', 'https://image.tmdb.org/t/p/original//poster1.jpg');
    expect(movieImages[0]).toHaveClass('row__posterLarge');
  });

  it('should call onMovieClick when a poster is clicked', () => {
    render(
      <Row
        title="Test Row"
        movies={mockMovies}
        isLoading={false}
        onMovieClick={mockOnMovieClick}
        base_url=""
        placeholderImg=""
        error={null}
        isPlayerActive={false}
        trailerUrl=""
        noTrailer={false}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    fireEvent.click(screen.getAllByRole('img')[0]);
    expect(mockOnMovieClick).toHaveBeenCalledWith(mockMovies[0]);
  });

  it('should render the YouTube player when active', () => {
    render(
      <Row
        title="Test Row"
        movies={[]}
        isLoading={false}
        onMovieClick={mockOnMovieClick}
        base_url=""
        placeholderImg=""
        error={null}
        isPlayerActive={true}
        trailerUrl="test-id"
        noTrailer={false}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    expect(screen.getByTestId('youtube-player')).toBeInTheDocument();
  });

  it('should render no trailer message when active and noTrailer is true', () => {
    render(
      <Row
        title="Test Row"
        movies={[]}
        isLoading={false}
        onMovieClick={mockOnMovieClick}
        base_url=""
        placeholderImg=""
        error={null}
        isPlayerActive={true}
        trailerUrl=""
        noTrailer={true}
        youtubeOpts={{}}
        onPlayerReady={() => {}}
        onPlayerStateChange={() => {}}
      />
    );

    expect(screen.getByText(/This movie currently does not have a trailer./)).toBeInTheDocument();
  });
});

declare module 'movie-trailer' {
  function movieTrailer(
    movieName: string | null,
    options?: { tmdbId?: number; year?: number; age?: number }
  ): Promise<string | null>;

  export default movieTrailer;
}
// src/services/trailerService.ts

export class TrailerService {
  /**
   * Primary Method: Search YouTube API directly for a trailer.
   */
  static async searchYouTubeAPI(movieTitle: string, year?: number): Promise<string | null> {
    const YOUTUBE_API_KEY = process.env.REACT_APP_YOUTUBE_API_KEY;

    if (!YOUTUBE_API_KEY) {
      console.warn('YouTube API key not found. Skipping direct YouTube search.');
      return null;
    }

    try {
      // Construct a search query that a human would use
      const searchTerms = [
        movieTitle,
        year ? year.toString() : '',
        'official trailer'
      ].filter(Boolean).join(' ');

      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&maxResults=5&q=${encodeURIComponent(searchTerms)}&` +
        `type=video&videoDefinition=high&key=${YOUTUBE_API_KEY}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();

      if (!data.items?.length) {
        return null;
      }

      // Look for the most likely official trailer in the results
      for (const item of data.items) {
        const title = item.snippet.title.toLowerCase();
        if (title.includes('official trailer') || title.includes('main trailer')) {
          return item.id.videoId;
        }
      }

      // If no "official" trailer is found, fall back to the top result
      return data.items[0].id.videoId;

    } catch (error) {
      console.error('Error searching YouTube API:', error);
      return null;
    }
  }

  /**
   * Fallback Method: Use the movie-trailer library.
   */
  static async searchWithMovieTrailerLib(
    movieTitle: string,
    year?: number,
    tmdbId?: number
  ): Promise<string | null> {
    try {
      const movieTrailer = (await import('movie-trailer')).default;

      // First, try with the TMDB ID, as it's the most reliable
      if (tmdbId) {
        try {
          const url = await movieTrailer(null, { tmdbId });
          if (url) {
            const videoId = new URLSearchParams(new URL(url).search).get('v');
            if (videoId && this.isValidYouTubeId(videoId)) return videoId;
          }
        } catch (error) {
          // Ignore error and proceed to text-based search
        }
      }

      // If TMDB ID fails, try several text-based search variations
      const searchVariations = [
        `${movieTitle} ${year || ''} official trailer`,
        `${movieTitle} ${year || ''} trailer`,
        `${movieTitle} official trailer`,
        movieTitle,
      ].filter(Boolean);

      for (const searchTerm of searchVariations) {
        try {
          const url = await movieTrailer(searchTerm);
          if (url) {
            const videoId = new URLSearchParams(new URL(url).search).get('v');
            if (videoId && this.isValidYouTubeId(videoId)) return videoId;
          }
        } catch (error) {
          // Continue to the next search term
          continue;
        }
      }

      return null;
    } catch (error) {
      console.error('Error with movie-trailer library:', error);
      return null;
    }
  }

  /**
   * Main method: Tries all approaches in order of reliability.
   */
  static async getMovieTrailer(
    movieId: number,
    movieTitle: string,
    year?: number
  ): Promise<string | null> {
    console.log(`Searching for trailer: ${movieTitle} (${year || 'unknown year'})`);

    // 1. Try the direct YouTube API search first
    let trailerKey = await this.searchYouTubeAPI(movieTitle, year);
    if (trailerKey) {
      console.log('Trailer found via YouTube API search');
      return trailerKey;
    }

    // 2. If that fails, fall back to the movie-trailer library
    trailerKey = await this.searchWithMovieTrailerLib(movieTitle, year, movieId);
    if (trailerKey) {
      console.log('Trailer found via movie-trailer library');
      return trailerKey;
    }

    console.log(`No trailer found for: ${movieTitle}`);
    return null;
  }

  /**
   * Helper function to validate a YouTube video ID.
   */
  static isValidYouTubeId(videoId: string): boolean {
    return /^[a-zA-Z0-9_-]{11}$/.test(videoId);
  }
}

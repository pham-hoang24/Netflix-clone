export interface UserProfile {
  userId: string;
  email?: string;
  displayName?: string;
  createdAt: Date;
  lastActiveAt: Date;
  preferences?: {
    favoriteGenres: string[];
    favoriteActors: string[];
    favoriteDirectors: string[];
    preferredLanguage: string;
    contentRating: string;
  };
  viewingStats?: {
    totalWatchTime: number;
    moviesWatched: number;
    tvShowsWatched: number;
    averageRating: number;
  };
}

export interface UserEvent {
  id?: string;
  userId: string;
  event: string;
  timestamp: Date;
  movieId?: string;
  movieName?: string;
  genre?: string;
  director?: string;
  rating?: number;
  watchTimeSeconds?: number;
  completionPercentage?: number;
  deviceType?: string;
  sessionId?: string;
  // Recommendation-specific fields
  tmdbId?: string;
  contentType?: 'movie' | 'tv';
  language?: string;
  releaseYear?: number;
  searchTerm?: string;
  metadata?: Record<string, any>;
}

export interface StoredRecommendation {
  movieId: string;
  movieName?: string;
  poster_path?: string;
  backdrop_path?: string;
  release_date?: string; // Added for movies
  first_air_date?: string; // Added for TV shows
  score?: number; // Optional: for ranking within the stored list
  type?: 'collaborative' | 'content-based' | 'trending' | 'initial'; // Optional: origin of the recommendation
  generatedAt: Date;
}

export interface RecommendationContext {
  userId: string;
  similarUsers: string[];
  favoriteGenres: string[];
  recentlyWatched: string[];
  highlyRated: string[];
}

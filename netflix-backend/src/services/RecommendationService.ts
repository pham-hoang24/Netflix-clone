import { UserEventDAO } from '../dao/UserEventDAO';
import { UserProfileDAO } from '../dao/UserProfileDAO';
import { RecommendationDAO } from '../dao/RecommendationDAO';
import { MediaService } from './MediaService';
import { UserEvent, StoredRecommendation } from '../types/recommendation';
import admin from 'firebase-admin';

export class RecommendationService {
  private userEventDAO: UserEventDAO;
  private userProfileDAO: UserProfileDAO;
  private recommendationDAO: RecommendationDAO;
  private mediaService: MediaService;

  constructor(dbInstance: admin.firestore.Firestore) {
    this.userEventDAO = new UserEventDAO(dbInstance);
    this.userProfileDAO = new UserProfileDAO(dbInstance);
    this.recommendationDAO = new RecommendationDAO(dbInstance);
    this.mediaService = new MediaService();
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    // 1. Check Cache First
    const cachedRecommendations = await this.recommendationDAO.getRecommendations(userId, limit);
    if (cachedRecommendations && cachedRecommendations.length > 0) {
      const latestRec = cachedRecommendations[0];
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1); // Recommendations are fresh for 24 hours

      if (latestRec.generatedAt > oneDayAgo) {
        console.log(`Returning cached recommendations for user ${userId}`);
        // You might want to fetch full movie details here if only IDs are stored
        return cachedRecommendations.map(rec => ({ movieId: rec.movieId, score: rec.score }));
      }
    }

    // 2. Generate New Recommendations if cache is empty or stale
    console.log(`Generating new recommendations for user ${userId}`);
    const [userEvents, userProfile] = await Promise.all([
      this.userEventDAO.getUserEvents(userId, 100),
      this.userProfileDAO.getUserProfile(userId)
    ]);

    if (!userEvents.length) {
      const fallback = await this.getFallbackRecommendations(limit);
      // Optionally cache fallback recommendations
      const storedFallback: StoredRecommendation[] = fallback.map(rec => ({
        movieId: rec.movieId, // Assuming rec has a movieId
        generatedAt: new Date(),
        type: 'trending'
      }));
      await this.recommendationDAO.saveRecommendations(userId, storedFallback);
      return fallback;
    }

    // 2. Extract user preferences
    const watchedMovies = userEvents
      .filter(e => e.movieId && ['movie_completed', 'positive_rating'].includes(e.event))
      .map(e => e.movieId!);

    const favoriteGenres = this.extractFavoriteGenres(userEvents);

    // 3. Find similar users (using main collection for efficiency)
    const similarUsers = await this.userEventDAO.findSimilarUsers(userId, watchedMovies, 20);

    // 4. Get movies liked by similar users
    const collaborativeRecommendations = await this.getCollaborativeRecommendations(
      similarUsers, 
      watchedMovies, 
      limit / 2
    );

    // 5. Get content-based recommendations
    const contentBasedRecommendations = await this.getContentBasedRecommendations(
      favoriteGenres,
      watchedMovies,
      limit / 2
    );

    // 6. Combine and rank recommendations
    const generatedRecommendations = this.combineAndRankRecommendations(
      collaborativeRecommendations,
      contentBasedRecommendations,
      limit
    );

    // 7. Save to Cache
    const storedRecommendations: StoredRecommendation[] = generatedRecommendations.map(rec => ({
      movieId: rec.movieId, // Assuming rec has a movieId
      generatedAt: new Date(),
      // You might want to add score and type here if your combineAndRankRecommendations returns them
    }));
    await this.recommendationDAO.saveRecommendations(userId, storedRecommendations);

    return generatedRecommendations;
  }

  async getCollaborativeRecommendations(
    similarUserIds: string[], 
    watchedMovies: string[], 
    limit: number
  ): Promise<any[]> {
    // Use main collection to efficiently find what similar users liked
    const events = await this.userEventDAO.getEventsForRecommendations({
      eventTypes: ['movie_completed', 'positive_rating'],
      minRating: 4,
      limit: 200
    });

    const movieScores: Record<string, number> = {};
    
    events.forEach(event => {
      if (similarUserIds.includes(event.userId) && 
          event.movieId && 
          !watchedMovies.includes(event.movieId)) {
        movieScores[event.movieId] = (movieScores[event.movieId] || 0) + 1;
      }
    });

    const topMovies = Object.entries(movieScores)
      .sort(([,a], [,b]) => b - a)
      .slice(0, limit)
      .map(([movieId]) => movieId);

    return topMovies;
  }

  async getContentBasedRecommendations(
    favoriteGenres: string[], 
    watchedMovies: string[], 
    limit: number
  ): Promise<any[]> {
    // Use TMDB API to find movies in favorite genres
    const recommendations = [];
    
    for (const genre of favoriteGenres.slice(0, 3)) {
      // Use MediaService to get movies by genre
      const genreMovies = await this.mediaService.getMoviesByGenre(genre, 10);
      recommendations.push(...genreMovies.filter(m => !watchedMovies.includes(String(m.id))));
    }

    return recommendations.slice(0, limit);
  }

  async getTrendingRecommendations(timeframe: 'day' | 'week' | 'month' = 'week'): Promise<any[]> {
    const date = new Date();
    date.setDate(date.getDate() - (timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30));

    return this.userEventDAO.getTrendingContent(date, 20);
  }

  private extractFavoriteGenres(events: UserEvent[]): string[] {
    const genreCounts: Record<string, number> = {};
    
    events.forEach(event => {
      if (event.genre && ['movie_completed', 'positive_rating'].includes(event.event)) {
        const genres = event.genre.split(', ');
        genres.forEach(genre => {
          genreCounts[genre] = (genreCounts[genre] || 0) + 1;
        });
      }
    });

    return Object.entries(genreCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([genre]) => genre);
  }

  private async getFallbackRecommendations(limit: number): Promise<any[]> {
    // Return trending content for new users
    return this.getTrendingRecommendations('week');
  }

  private combineAndRankRecommendations(
    collaborative: any[], 
    contentBased: any[], 
    limit: number
  ): any[] {
    // Combine and deduplicate recommendations
    const combined = [...collaborative, ...contentBased];
    const unique = Array.from(new Set(combined));
    return unique.slice(0, limit);
  }
}

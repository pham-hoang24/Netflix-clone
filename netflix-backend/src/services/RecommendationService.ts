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

  public async initializeRecommendationsForNewUser(userId: string, limit: number = 20): Promise<void> {
    console.log(`[RecService] Initializing recommendations for new user ${userId}`);

    const userEvents = await this.userEventDAO.getUserEvents(userId, 50);
    console.log(`[RecService] Found ${userEvents.length} raw events for user ${userId}:`, JSON.stringify(userEvents, null, 2));

    let recommendations: any[] = [];

    if (userEvents && userEvents.length > 0) {
        const movieIds = userEvents
            .map(event => event.movieId) // Get all movieIds (which can be numbers or undefined)
            .filter(id => id !== undefined && id !== null) // Filter out events without a movieId
            .map(id => String(id)); // Convert the valid IDs to strings
        
        if (movieIds.length > 0) {
            const recentMovieIds = [...new Set(movieIds)].slice(0, 5);
            const movieDetails = await Promise.all(
                recentMovieIds.map(id => this.mediaService.fetchAndProcessMediaDetails(parseInt(id), 'movie').catch((e: any) => null))
            );
            console.log(`[RecService] Fetched movie details:`, JSON.stringify(movieDetails, null, 2));

            const validMovieDetails = movieDetails.filter((details: any) => details !== null);

            // Extract genre_ids directly from the raw movie details
            const genreIds = Array.from(new Set(validMovieDetails.flatMap((movie: any) => movie.genres?.map((g: any) => g.id) || [])));

            if (genreIds.length > 0) {
                const genreRecs = await Promise.all(
                    genreIds.slice(0, 3).map(gid => this.mediaService.getMoviesByGenre(String(gid), 10).catch(e => []))
                );
                recommendations = genreRecs.flat().map((movie: any) => ({ movieId: String(movie.id), ...movie }));
            }
        }
    }

    if (recommendations.length === 0) {
        console.log(`No user events with movie IDs found for ${userId} or no genres could be extracted, falling back to trending.`);
        recommendations = await this.getFallbackRecommendations(limit);
    }

    const normalizedRecs = recommendations.map(rec => ({
        id: rec.id || rec.movieId,
        ...rec
    }));
    const uniqueRecs = Array.from(new Map(normalizedRecs.map(rec => [rec.id, rec])).values());

    const watchedMovieIds = new Set(userEvents.map(e => e.movieId));
    const finalRecs = uniqueRecs.filter(rec => !watchedMovieIds.has(String(rec.id)));

    const storedRecommendations: StoredRecommendation[] = finalRecs.slice(0, limit).map(rec => ({
        movieId: String(rec.id),
        movieName: rec.title || rec.name, // Assuming 'title' or 'name' exists on the movie object
        poster_path: rec.poster_path,
        backdrop_path: rec.backdrop_path,
        type: 'initial',
        generatedAt: new Date(),
    }));

    if (storedRecommendations.length > 0) {
        await this.recommendationDAO.saveRecommendations(userId, storedRecommendations);
        console.log(`Successfully initialized and stored ${storedRecommendations.length} recommendations for user ${userId}.`);
    } else {
        console.log(`Could not generate any new recommendations for user ${userId}.`);
    }
  }

  async getPersonalizedRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    console.log(`[RecommendationService] getPersonalizedRecommendations called for userId: ${userId}`);

    const cachedRecommendations = await this.recommendationDAO.getRecommendations(userId, limit);

    if (cachedRecommendations && cachedRecommendations.length > 0) {
        const latestRec = cachedRecommendations[0];
        const oneMinuteAgo = new Date();
        oneMinuteAgo.setMinutes(oneMinuteAgo.getMinutes() - 1); // Recommendations are fresh for 1 minute

        if (latestRec.generatedAt > oneMinuteAgo) {
            console.log(`[RecommendationService] Returning ${cachedRecommendations.length} FRESH cached recommendations for user ${userId}`);
            return cachedRecommendations.map(rec => ({
                id: parseInt(rec.movieId),
                name: rec.movieName || rec.movieId,
                title: rec.movieName || rec.movieId,
                poster_path: rec.poster_path,
                backdrop_path: rec.backdrop_path,
            }));
        } else {
            console.log(`[RecommendationService] Cached recommendations for user ${userId} are STALE. Generating new ones.`);
        }
    }

    console.log(`[RecommendationService] No recommendations found for user ${userId}. Initializing...`);
    await this.initializeRecommendationsForNewUser(userId, limit);

    const newRecommendations = await this.recommendationDAO.getRecommendations(userId, limit);
    if (newRecommendations && newRecommendations.length > 0) {
        console.log(`[RecommendationService] Successfully initialized and returning ${newRecommendations.length} recommendations for user ${userId}`);
        return newRecommendations.map(rec => ({ movieId: rec.movieId, score: rec.score }));
    }

    console.log(`[RecommendationService] Failed to initialize or fetch new recommendations for user ${userId}. Returning empty array.`);
    return [];
  }

  private async getFallbackRecommendations(limit: number): Promise<any[]> {
    const trending = await this.mediaService.getGeneralTrendingMovies(Math.floor(limit / 2));
    const topRated = await this.mediaService.getTopRatedMovies(limit - trending.length);

    const combined = [...trending, ...topRated];
    // Ensure unique movies and return the specified limit
    const uniqueMovies = Array.from(new Map(combined.map(movie => [movie.id, movie])).values());
    return uniqueMovies.slice(0, limit);
  }
}

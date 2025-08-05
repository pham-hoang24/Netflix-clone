"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const UserEventDAO_1 = require("../dao/UserEventDAO");
const UserProfileDAO_1 = require("../dao/UserProfileDAO");
const RecommendationDAO_1 = require("../dao/RecommendationDAO");
const MediaService_1 = require("./MediaService");
class RecommendationService {
    constructor(dbInstance) {
        this.userEventDAO = new UserEventDAO_1.UserEventDAO(dbInstance);
        this.userProfileDAO = new UserProfileDAO_1.UserProfileDAO(dbInstance);
        this.recommendationDAO = new RecommendationDAO_1.RecommendationDAO(dbInstance);
        this.mediaService = new MediaService_1.MediaService();
    }
    getPersonalizedRecommendations(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            // 1. Check Cache First
            const cachedRecommendations = yield this.recommendationDAO.getRecommendations(userId, limit);
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
            const [userEvents, userProfile] = yield Promise.all([
                this.userEventDAO.getUserEvents(userId, 100),
                this.userProfileDAO.getUserProfile(userId)
            ]);
            if (!userEvents.length) {
                const fallback = yield this.getFallbackRecommendations(limit);
                // Optionally cache fallback recommendations
                const storedFallback = fallback.map(rec => ({
                    movieId: rec.movieId, // Assuming rec has a movieId
                    generatedAt: new Date(),
                    type: 'trending'
                }));
                yield this.recommendationDAO.saveRecommendations(userId, storedFallback);
                return fallback;
            }
            // 2. Extract user preferences
            const watchedMovies = userEvents
                .filter(e => e.movieId && ['movie_completed', 'positive_rating'].includes(e.event))
                .map(e => e.movieId);
            const favoriteGenres = this.extractFavoriteGenres(userEvents);
            // 3. Find similar users (using main collection for efficiency)
            const similarUsers = yield this.userEventDAO.findSimilarUsers(userId, watchedMovies, 20);
            // 4. Get movies liked by similar users
            const collaborativeRecommendations = yield this.getCollaborativeRecommendations(similarUsers, watchedMovies, limit / 2);
            // 5. Get content-based recommendations
            const contentBasedRecommendations = yield this.getContentBasedRecommendations(favoriteGenres, watchedMovies, limit / 2);
            // 6. Combine and rank recommendations
            const generatedRecommendations = this.combineAndRankRecommendations(collaborativeRecommendations, contentBasedRecommendations, limit);
            // 7. Save to Cache
            const storedRecommendations = generatedRecommendations.map(rec => ({
                movieId: rec.movieId, // Assuming rec has a movieId
                generatedAt: new Date(),
                // You might want to add score and type here if your combineAndRankRecommendations returns them
            }));
            yield this.recommendationDAO.saveRecommendations(userId, storedRecommendations);
            return generatedRecommendations;
        });
    }
    getCollaborativeRecommendations(similarUserIds, watchedMovies, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use main collection to efficiently find what similar users liked
            const events = yield this.userEventDAO.getEventsForRecommendations({
                eventTypes: ['movie_completed', 'positive_rating'],
                minRating: 4,
                limit: 200
            });
            const movieScores = {};
            events.forEach(event => {
                if (similarUserIds.includes(event.userId) &&
                    event.movieId &&
                    !watchedMovies.includes(event.movieId)) {
                    movieScores[event.movieId] = (movieScores[event.movieId] || 0) + 1;
                }
            });
            const topMovies = Object.entries(movieScores)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([movieId]) => movieId);
            return topMovies;
        });
    }
    getContentBasedRecommendations(favoriteGenres, watchedMovies, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            // Use TMDB API to find movies in favorite genres
            const recommendations = [];
            for (const genre of favoriteGenres.slice(0, 3)) {
                // Use MediaService to get movies by genre
                const genreMovies = yield this.mediaService.getMoviesByGenre(genre, 10);
                recommendations.push(...genreMovies.filter(m => !watchedMovies.includes(String(m.id))));
            }
            return recommendations.slice(0, limit);
        });
    }
    getTrendingRecommendations() {
        return __awaiter(this, arguments, void 0, function* (timeframe = 'week') {
            const date = new Date();
            date.setDate(date.getDate() - (timeframe === 'day' ? 1 : timeframe === 'week' ? 7 : 30));
            return this.userEventDAO.getTrendingContent(date, 20);
        });
    }
    extractFavoriteGenres(events) {
        const genreCounts = {};
        events.forEach(event => {
            if (event.genre && ['movie_completed', 'positive_rating'].includes(event.event)) {
                const genres = event.genre.split(', ');
                genres.forEach(genre => {
                    genreCounts[genre] = (genreCounts[genre] || 0) + 1;
                });
            }
        });
        return Object.entries(genreCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([genre]) => genre);
    }
    getFallbackRecommendations(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            // Return trending content for new users
            return this.getTrendingRecommendations('week');
        });
    }
    combineAndRankRecommendations(collaborative, contentBased, limit) {
        // Combine and deduplicate recommendations
        const combined = [...collaborative, ...contentBased];
        const unique = Array.from(new Set(combined));
        return unique.slice(0, limit);
    }
}
exports.RecommendationService = RecommendationService;

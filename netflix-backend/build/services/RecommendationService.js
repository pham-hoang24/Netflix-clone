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
    initializeRecommendationsForNewUser(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 20) {
            console.log(`[RecService] Initializing recommendations for new user ${userId}`);
            const userEvents = yield this.userEventDAO.getUserEvents(userId, 50);
            console.log(`[RecService] Found ${userEvents.length} raw events for user ${userId}:`, JSON.stringify(userEvents, null, 2));
            let recommendations = [];
            if (userEvents && userEvents.length > 0) {
                const movieIds = userEvents
                    .map(event => event.movieId) // Get all movieIds (which can be numbers or undefined)
                    .filter(id => id !== undefined && id !== null) // Filter out events without a movieId
                    .map(id => String(id)); // Convert the valid IDs to strings
                if (movieIds.length > 0) {
                    const recentMovieIds = [...new Set(movieIds)].slice(0, 5);
                    const movieDetails = yield Promise.all(recentMovieIds.map(id => this.mediaService.fetchAndProcessMediaDetails(parseInt(id), 'movie').catch((e) => null)));
                    console.log(`[RecService] Fetched movie details:`, JSON.stringify(movieDetails, null, 2));
                    const validMovieDetails = movieDetails.filter((details) => details !== null);
                    // Extract genre_ids directly from the raw movie details
                    const genreIds = Array.from(new Set(validMovieDetails.flatMap((movie) => { var _a; return ((_a = movie.genres) === null || _a === void 0 ? void 0 : _a.map((g) => g.id)) || []; })));
                    if (genreIds.length > 0) {
                        const genreRecs = yield Promise.all(genreIds.slice(0, 3).map(gid => this.mediaService.getMoviesByGenre(String(gid), 10).catch(e => [])));
                        const genresMap = yield this.mediaService.getGenres('movie');
                        recommendations = genreRecs.flat().map((movie) => (Object.assign(Object.assign({ movieId: String(movie.id) }, movie), { genres: movie.genre_ids ? movie.genre_ids.map((id) => ({ id, name: genresMap[id] || '' })) : [] })));
                    }
                }
            }
            if (recommendations.length === 0) {
                console.log(`No user events with movie IDs found for ${userId} or no genres could be extracted, falling back to trending.`);
                recommendations = yield this.getFallbackRecommendations(limit);
            }
            const normalizedRecs = recommendations.map(rec => (Object.assign({ id: rec.id || rec.movieId }, rec)));
            const uniqueRecs = Array.from(new Map(normalizedRecs.map(rec => [rec.id, rec])).values());
            const watchedMovieIds = new Set(userEvents.map(e => e.movieId));
            const finalRecs = uniqueRecs.filter(rec => !watchedMovieIds.has(String(rec.id)));
            console.log(`[RecService] Final recommendations before storing:`, JSON.stringify(finalRecs, null, 2));
            const storedRecommendations = finalRecs.slice(0, limit).map(rec => ({
                movieId: String(rec.id),
                movieName: rec.title || rec.name, // Assuming 'title' or 'name' exists on the movie object
                poster_path: rec.poster_path,
                backdrop_path: rec.backdrop_path,
                release_date: rec.release_date || null, // Ensure release_date is always present, or null
                first_air_date: rec.first_air_date || null, // Ensure first_air_date is always present, or null
                genres: rec.genres || [], // Store genre names (already processed in MediaService)
                type: 'initial',
                generatedAt: new Date(),
            }));
            if (storedRecommendations.length > 0) {
                yield this.recommendationDAO.saveRecommendations(userId, storedRecommendations);
                console.log(`Successfully initialized and stored ${storedRecommendations.length} recommendations for user ${userId}.`);
            }
            else {
                console.log(`Could not generate any new recommendations for user ${userId}.`);
            }
        });
    }
    getPersonalizedRecommendations(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 10) {
            console.log(`[RecommendationService] getPersonalizedRecommendations called for userId: ${userId}`);
            const cachedRecommendations = yield this.recommendationDAO.getRecommendations(userId, limit);
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
                        release_date: rec.release_date,
                        first_air_date: rec.first_air_date,
                        genres: rec.genres || [],
                    }));
                }
                else {
                    console.log(`[RecommendationService] Cached recommendations for user ${userId} are STALE. Generating new ones.`);
                }
            }
            console.log(`[RecommendationService] No recommendations found for user ${userId}. Initializing...`);
            yield this.initializeRecommendationsForNewUser(userId, limit);
            const newRecommendations = yield this.recommendationDAO.getRecommendations(userId, limit);
            if (newRecommendations && newRecommendations.length > 0) {
                console.log(`[RecommendationService] Successfully initialized and returning ${newRecommendations.length} recommendations for user ${userId}`);
                return newRecommendations.map(rec => ({
                    id: parseInt(rec.movieId),
                    name: rec.movieName || rec.movieId,
                    title: rec.movieName || rec.movieId,
                    poster_path: rec.poster_path,
                    backdrop_path: rec.backdrop_path,
                    release_date: rec.release_date,
                    first_air_date: rec.first_air_date,
                    genres: rec.genres || [],
                }));
            }
            console.log(`[RecommendationService] Failed to initialize or fetch new recommendations for user ${userId}. Returning empty array.`);
            return [];
        });
    }
    getMoviesByGenres(genreIds_1) {
        return __awaiter(this, arguments, void 0, function* (genreIds, limit = 10) {
            const moviesByGenre = [];
            for (const genreId of genreIds) {
                const movies = yield this.mediaService.getMoviesByGenre(String(genreId), limit);
                const genresMap = yield this.mediaService.getGenres('movie');
                const moviesWithGenres = movies.map((movie) => (Object.assign(Object.assign({}, movie), { genres: movie.genre_ids ? movie.genre_ids.map((id) => ({ id, name: genresMap[id] || '' })) : [] })));
                moviesByGenre.push(...moviesWithGenres);
            }
            // Remove duplicates and limit the results
            const uniqueMovies = Array.from(new Map(moviesByGenre.map(movie => [movie.id, movie])).values());
            return uniqueMovies.slice(0, limit);
        });
    }
    getFallbackRecommendations(limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const trending = yield this.mediaService.getGeneralTrendingMovies(Math.floor(limit / 2));
            const topRated = yield this.mediaService.getTopRatedMovies(limit - trending.length);
            const combined = [...trending, ...topRated];
            // Ensure unique movies and return the specified limit
            const uniqueMovies = Array.from(new Map(combined.map(movie => [movie.id, movie])).values());
            const genresMap = yield this.mediaService.getGenres('movie');
            return uniqueMovies.slice(0, limit).map((movie) => (Object.assign(Object.assign({}, movie), { genres: movie.genre_ids ? movie.genre_ids.map((id) => ({ id, name: genresMap[id] || '' })) : [] })));
        });
    }
}
exports.RecommendationService = RecommendationService;

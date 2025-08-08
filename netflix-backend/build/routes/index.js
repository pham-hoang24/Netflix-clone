"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const UserEventController_1 = require("../controllers/UserEventController");
const MediaController_1 = require("../controllers/MediaController");
const RecommendationController_1 = require("../controllers/RecommendationController");
exports.default = (db) => {
    const router = (0, express_1.Router)();
    const userEventController = new UserEventController_1.UserEventController(db);
    const mediaController = new MediaController_1.MediaController();
    const recommendationController = new RecommendationController_1.RecommendationController(db);
    // User Event Routes
    router.post('/log-event', authMiddleware_1.authenticateUser, userEventController.logEvent);
    router.get('/user-events', authMiddleware_1.authenticateUser, userEventController.getUserEvents);
    // Media Routes
    router.get('/movie-details/:id/:type', mediaController.getMovieDetails);
    router.get('/trending', mediaController.getTrending);
    router.get('/trending/:type', mediaController.getTrending);
    router.get('/genres', mediaController.getAllGenres);
    router.get('/trending-with-details', mediaController.getTrendingWithDetails);
    router.get('/search/multi', mediaController.multiSearch);
    // Recommendation Routes
    router.get('/recommendations/personalized', authMiddleware_1.authenticateUser, recommendationController.getPersonalizedRecommendations);
    router.post('/recommendations/by-genres', authMiddleware_1.authenticateUser, recommendationController.getMoviesByGenres);
    // Health Check
    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
                tmdb: !!process.env.TMDB_API_KEY,
                firebase: true // Assuming Firebase is initialized via FirestoreDAO
            }
        });
    });
    return router;
};

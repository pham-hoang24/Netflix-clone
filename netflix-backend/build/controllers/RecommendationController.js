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
exports.RecommendationController = void 0;
const RecommendationService_1 = require("../services/RecommendationService");
class RecommendationController {
    constructor(db) {
        this.recommendationService = new RecommendationService_1.RecommendationService(db);
        this.getPersonalizedRecommendations = this.getPersonalizedRecommendations.bind(this);
    }
    getPersonalizedRecommendations(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!req.userId) {
                    res.status(401).json({ error: 'Authentication required' });
                    return;
                }
                const limit = req.query.limit ? parseInt(req.query.limit) : 10;
                const recommendations = yield this.recommendationService.getPersonalizedRecommendations(req.userId, limit);
                console.log("[RecommendationController] Sending personalized recommendations:", JSON.stringify(recommendations, null, 2));
                res.json(recommendations);
            }
            catch (error) {
                console.error('Error fetching personalized recommendations:', error.message);
                res.status(500).json({ error: 'Failed to fetch personalized recommendations' });
            }
        });
    }
    getMoviesByGenres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { genreIds } = req.body;
                if (!genreIds || !Array.isArray(genreIds) || genreIds.length === 0) {
                    res.status(400).json({ error: 'genreIds array is required in the request body' });
                    return;
                }
                const movies = yield this.recommendationService.getMoviesByGenres(genreIds);
                res.json(movies);
            }
            catch (error) {
                console.error('Error fetching movies by genres:', error.message);
                res.status(500).json({ error: 'Failed to fetch movies by genres' });
            }
        });
    }
}
exports.RecommendationController = RecommendationController;

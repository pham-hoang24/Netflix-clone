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
exports.MediaController = void 0;
const MediaService_1 = require("../services/MediaService");
const mediaService = new MediaService_1.MediaService();
class MediaController {
    getMovieDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id, type } = req.params;
                if (!id || !type || (type !== 'movie' && type !== 'tv')) {
                    res.status(400).json({ error: 'Invalid media ID or type' });
                    return;
                }
                const details = yield mediaService.fetchAndProcessMediaDetails(parseInt(id), type);
                res.json(details);
            }
            catch (error) {
                console.error('Error fetching media details:', error.message);
                res.status(500).json({ error: 'Failed to fetch media details' });
            }
        });
    }
    getTrending(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { type } = req.params;
                if (type && type !== 'movie' && type !== 'tv') {
                    res.status(400).json({ error: 'Invalid trending type' });
                    return;
                }
                const trendingData = yield mediaService.getTrending(type || 'movie'); // Default to movie if type is not provided
                res.json(trendingData);
            }
            catch (error) {
                console.error('Error fetching trending data:', error.message);
                res.status(500).json({ error: 'Failed to fetch trending data' });
            }
        });
    }
    getAllGenres(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const genres = yield mediaService.getAllGenres();
                res.json(genres);
            }
            catch (error) {
                console.error('Error fetching genre data:', error.message);
                res.status(500).json({ error: 'Failed to fetch genre list' });
            }
        });
    }
    getTrendingWithDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const items = yield mediaService.getTrendingWithDetails();
                res.json(items);
            }
            catch (error) {
                console.error('Error fetching trending data with details:', error.message);
                res.status(500).json({ error: 'Failed to fetch trending data with details' });
            }
        });
    }
    multiSearch(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const searchQuery = req.query.query;
                if (!searchQuery) {
                    res.status(400).json({ error: 'Search query is required.' });
                    return;
                }
                const searchResults = yield mediaService.multiSearch(searchQuery);
                res.json(searchResults);
            }
            catch (error) {
                console.error('Error fetching multi-search data:', error.message);
                res.status(500).json({ error: 'Failed to fetch multi-search data.' });
            }
        });
    }
}
exports.MediaController = MediaController;

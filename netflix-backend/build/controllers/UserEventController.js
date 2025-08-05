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
exports.UserEventController = void 0;
const UserEventService_1 = require("../services/UserEventService");
class UserEventController {
    constructor(db) {
        this.userEventService = new UserEventService_1.UserEventService(db);
        this.logEvent = this.logEvent.bind(this);
        this.getUserEvents = this.getUserEvents.bind(this);
    }
    logEvent(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { event, movieId, watchTimeSeconds, searchTerm, deviceType, sessionId, movieName, genre, director, rating, completionPercentage, tmdbId, contentType, language, releaseYear, metadata = {} } = req.body;
                if (!event) {
                    res.status(400).json({ error: 'Event type is required' });
                    return;
                }
                const eventId = yield this.userEventService.logEvent(req.userId, req.userEmail, {
                    userId: req.userId,
                    event,
                    timestamp: new Date(), // Will be overwritten by serverTimestamp in DAO
                    movieId,
                    watchTimeSeconds,
                    searchTerm,
                    deviceType,
                    sessionId,
                    movieName,
                    genre,
                    director,
                    rating,
                    completionPercentage,
                    tmdbId,
                    contentType,
                    language,
                    releaseYear,
                    metadata
                });
                res.status(201).json({
                    success: true,
                    eventId,
                    message: 'Event logged successfully'
                });
            }
            catch (error) {
                console.error('Error logging event:', error.message);
                res.status(500).json({ error: 'Failed to log event' });
            }
        });
    }
    getUserEvents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { limit = '50', eventType } = req.query;
                const events = yield this.userEventService.getEvents(req.userId, parseInt(limit), eventType);
                res.json({ events, total: events.length });
            }
            catch (error) {
                console.error('Error fetching user events:', error.message);
                res.status(500).json({ error: 'Failed to fetch user events' });
            }
        });
    }
}
exports.UserEventController = UserEventController;

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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserEventDAO = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class UserEventDAO {
    constructor(dbInstance) {
        this.db = dbInstance;
    }
    createEvent(eventData) {
        return __awaiter(this, void 0, void 0, function* () {
            const batch = this.db.batch();
            // Helper to remove undefined values
            const removeUndefined = (obj) => {
                return Object.fromEntries(Object.entries(obj).filter(([, value]) => value !== undefined));
            };
            const cleanedEventData = removeUndefined(eventData);
            // Store in main userEvents collection for recommendations
            const eventRef = this.db.collection('userEvents').doc();
            batch.set(eventRef, Object.assign(Object.assign({}, cleanedEventData), { timestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(), serverTimestamp: new Date().toISOString() }));
            // ALSO store in user subcollection for user-specific queries
            const userEventRef = this.db
                .collection('users')
                .doc(eventData.userId)
                .collection('events')
                .doc(eventRef.id);
            const { userId } = cleanedEventData, eventDataWithoutUserId = __rest(cleanedEventData, ["userId"]); // Use cleaned data here too
            batch.set(userEventRef, Object.assign(Object.assign({}, eventDataWithoutUserId), { timestamp: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(), serverTimestamp: new Date().toISOString() }));
            yield batch.commit();
            return eventRef.id;
        });
    }
    getUserEvents(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, limit = 50, eventType) {
            let query = this.db
                .collection('users')
                .doc(userId)
                .collection('events')
                .orderBy('timestamp', 'desc')
                .limit(limit);
            if (eventType) {
                query = query.where('event', '==', eventType);
            }
            const snapshot = yield query.get();
            return this.mapEventsFromSnapshot(snapshot, userId);
        });
    }
    getEventsForRecommendations(filters) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            let query = this.db.collection('userEvents');
            if ((_a = filters.movieIds) === null || _a === void 0 ? void 0 : _a.length) {
                query = query.where('movieId', 'in', filters.movieIds.slice(0, 10)); // Firestore limit
            }
            if ((_b = filters.eventTypes) === null || _b === void 0 ? void 0 : _b.length) {
                query = query.where('event', 'in', filters.eventTypes);
            }
            if (filters.minRating) {
                query = query.where('rating', '>=', filters.minRating);
            }
            if (filters.timeframe) {
                query = query
                    .where('timestamp', '>=', filters.timeframe.start)
                    .where('timestamp', '<=', filters.timeframe.end);
            }
            if (filters.limit) {
                query = query.limit(filters.limit);
            }
            const snapshot = yield query.get();
            return this.mapEventsFromSnapshot(snapshot);
        });
    }
    findSimilarUsers(userId_1, movieIds_1) {
        return __awaiter(this, arguments, void 0, function* (userId, movieIds, limit = 50) {
            const snapshot = yield this.db.collection('userEvents')
                .where('movieId', 'in', movieIds.slice(0, 10))
                .where('event', 'in', ['movie_completed', 'positive_rating'])
                .where('userId', '!=', userId)
                .limit(limit * 2) // Get more to filter duplicates
                .get();
            const userCounts = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                userCounts[data.userId] = (userCounts[data.userId] || 0) + 1;
            });
            return Object.entries(userCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([userId]) => userId);
        });
    }
    getTrendingContent(timeframe_1) {
        return __awaiter(this, arguments, void 0, function* (timeframe, limit = 20) {
            const snapshot = yield this.db.collection('userEvents')
                .where('timestamp', '>=', timeframe)
                .where('event', 'in', ['movie_view', 'movie_completed'])
                .get();
            const movieCounts = {};
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.movieId) {
                    movieCounts[data.movieId] = (movieCounts[data.movieId] || 0) + 1;
                }
            });
            return Object.entries(movieCounts)
                .sort(([, a], [, b]) => b - a)
                .slice(0, limit)
                .map(([movieId, count]) => ({ movieId, count }));
        });
    }
    mapEventsFromSnapshot(snapshot, userId) {
        const events = [];
        snapshot.forEach(doc => {
            var _a, _b;
            const data = doc.data();
            events.push(Object.assign(Object.assign({ id: doc.id }, data), { userId: userId || data.userId, timestamp: ((_b = (_a = data.timestamp) === null || _a === void 0 ? void 0 : _a.toDate) === null || _b === void 0 ? void 0 : _b.call(_a)) || new Date(data.serverTimestamp) }));
        });
        return events;
    }
}
exports.UserEventDAO = UserEventDAO;

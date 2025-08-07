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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationDAO = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class RecommendationDAO {
    constructor(dbInstance) {
        this.db = dbInstance;
    }
    saveRecommendations(userId, recommendations) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
            // Clear existing recommendations for simplicity, or implement more complex merging
            const existingRecs = yield userRecsRef.get();
            const batch = this.db.batch();
            existingRecs.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            // Save new recommendations
            recommendations.forEach(rec => {
                const docRef = userRecsRef.doc(); // Firestore generates a unique ID
                batch.set(docRef, Object.assign(Object.assign({}, rec), { generatedAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() }));
            });
            yield batch.commit();
        });
    }
    getRecommendations(userId, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
            let query = userRecsRef.orderBy('generatedAt', 'desc');
            if (limit) {
                query = query.limit(limit);
            }
            const snapshot = yield query.get();
            if (snapshot.empty) {
                return null;
            }
            const recommendations = [];
            snapshot.forEach(doc => {
                var _a;
                const data = doc.data();
                recommendations.push({
                    movieId: data.movieId,
                    movieName: data.movieName || null,
                    poster_path: data.poster_path || null,
                    backdrop_path: data.backdrop_path || null,
                    release_date: data.release_date || null,
                    first_air_date: data.first_air_date || null,
                    score: data.score || null,
                    type: data.type || null,
                    generatedAt: ((_a = data.generatedAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(),
                });
            });
            return recommendations;
        });
    }
    deleteRecommendations(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRecsRef = this.db.collection('users').doc(userId).collection('recommendations');
            const snapshot = yield userRecsRef.get();
            const batch = this.db.batch();
            snapshot.docs.forEach(doc => {
                batch.delete(doc.ref);
            });
            yield batch.commit();
        });
    }
}
exports.RecommendationDAO = RecommendationDAO;

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
exports.UserProfileDAO = void 0;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
class UserProfileDAO {
    constructor(dbInstance) {
        this.db = dbInstance;
    }
    createOrUpdateProfile(userId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRef = this.db.collection('users').doc(userId);
            yield userRef.set(Object.assign(Object.assign({ userId }, profileData), { lastActiveAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp() }), { merge: true });
        });
    }
    getUserProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const doc = yield this.db.collection('users').doc(userId).get();
            if (!doc.exists)
                return null;
            const data = doc.data();
            return Object.assign(Object.assign({}, data), { createdAt: ((_a = data.createdAt) === null || _a === void 0 ? void 0 : _a.toDate()) || new Date(), lastActiveAt: ((_b = data.lastActiveAt) === null || _b === void 0 ? void 0 : _b.toDate()) || new Date() });
        });
    }
    updateViewingStats(userId, stats) {
        return __awaiter(this, void 0, void 0, function* () {
            const userRef = this.db.collection('users').doc(userId);
            yield userRef.update({
                viewingStats: stats,
                lastActiveAt: firebase_admin_1.default.firestore.FieldValue.serverTimestamp(),
            });
        });
    }
    getUsersByGenrePreference(genre_1) {
        return __awaiter(this, arguments, void 0, function* (genre, limit = 100) {
            const snapshot = yield this.db.collection('users')
                .where('preferences.favoriteGenres', 'array-contains', genre)
                .limit(limit)
                .get();
            return snapshot.docs.map(doc => doc.id);
        });
    }
}
exports.UserProfileDAO = UserProfileDAO;

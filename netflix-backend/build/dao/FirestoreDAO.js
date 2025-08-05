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
exports.db = void 0;
exports.initializeFirebase = initializeFirebase;
exports.saveMovieDetailsToFirestore = saveMovieDetailsToFirestore;
exports.saveCategoryDataToFirestore = saveCategoryDataToFirestore;
exports.testFirebaseConnection = testFirebaseConnection;
exports.getCategoriesSummary = getCategoriesSummary;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
let initialized = false;
let _db;
function initializeFirebase() {
    var _a;
    if (!initialized) {
        if (!firebase_admin_1.default.apps.length) {
            try {
                const serviceAccount = require('../serviceAccountKey.json');
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert(serviceAccount),
                    projectId: "netflix-clone-62aec",
                });
            }
            catch (error) {
                firebase_admin_1.default.initializeApp({
                    credential: firebase_admin_1.default.credential.cert({
                        projectId: process.env.FIREBASE_PROJECT_ID,
                        privateKey: (_a = process.env.FIREBASE_PRIVATE_KEY) === null || _a === void 0 ? void 0 : _a.replace(/\\n/g, '\n'),
                        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                    }),
                });
            }
        }
        _db = firebase_admin_1.default.firestore();
        initialized = true;
    }
    return _db;
}
exports.db = initializeFirebase();
function saveMovieDetailsToFirestore(movieDetails) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.db.collection('movies').doc(String(movieDetails.id)).set(movieDetails);
        }
        catch (error) {
            console.error(`Error saving movie ${movieDetails.id} to Firestore:`, error.message);
            throw error;
        }
    });
}
function saveCategoryDataToFirestore(categoryData) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.db.collection('categories').doc(categoryData.name).set(categoryData);
        }
        catch (error) {
            console.error(`Error saving category ${categoryData.name} to Firestore:`, error.message);
            throw error;
        }
    });
}
function testFirebaseConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.db.collection('_test').limit(1).get();
            console.log('✅ Firebase connection successful');
        }
        catch (error) {
            console.error('❌ Firebase connection failed:', error.message);
            throw error;
        }
    });
}
function getCategoriesSummary() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const categoriesSnapshot = yield exports.db.collection('categories').get();
            return categoriesSnapshot.size;
        }
        catch (error) {
            console.error('Error getting categories summary:', error.message);
            throw error;
        }
    });
}

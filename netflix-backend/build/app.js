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
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const routes_1 = __importDefault(require("./routes"));
const FirestoreDAO_1 = require("./dao/FirestoreDAO");
const TMDBDAO_1 = require("./dao/TMDBDAO");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 2000;
// Initialize Firebase and get the db instance
const db = (0, FirestoreDAO_1.initializeFirebase)();
// Global Middleware
app.use((0, cors_1.default)({ origin: 'http://localhost:3000' }));
app.use(express_1.default.json());
// API Routes
app.use('/api', (0, routes_1.default)(db)); // Pass db to routes
// Error handling middleware (optional, but good practice)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});
// Start the server
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`Server running on port ${PORT}`);
    // Perform connection tests on startup
    console.log('Testing external connections...');
    try {
        yield (0, FirestoreDAO_1.testFirebaseConnection)();
        yield (0, TMDBDAO_1.testTMDBConnection)();
        console.log('All external connections are healthy.');
    }
    catch (error) {
        console.error('One or more external connections failed:', error);
        // Depending on criticality, you might want to exit here: process.exit(1);
    }
}));

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
const MediaService_1 = require("./services/MediaService");
const FirestoreDAO_1 = require("./dao/FirestoreDAO");
const TMDBDAO_1 = require("./dao/TMDBDAO");
const FirestoreDAO_2 = require("./dao/FirestoreDAO");
function validateEnvironment() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!process.env.TMDB_API_KEY) {
            throw new Error('TMDB_API_KEY environment variable is required');
        }
        if (!process.env.FIREBASE_PROJECT_ID && !require('../serviceAccountKey.json')) {
            throw new Error('Firebase configuration is required (either serviceAccountKey.json or environment variables)');
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('🚀 Starting Firestore population script...');
        try {
            // Validate environment and connections
            yield validateEnvironment();
            yield (0, FirestoreDAO_1.testFirebaseConnection)();
            yield (0, TMDBDAO_1.testTMDBConnection)();
            const mediaService = new MediaService_1.MediaService();
            yield mediaService.populateAllCategories();
            console.log('🎉 All categories populated successfully!');
            // Optional: Print summary
            const categoriesCount = yield (0, FirestoreDAO_2.getCategoriesSummary)();
            console.log(`📈 Summary: ${categoriesCount} categories created`);
        }
        catch (error) {
            console.error('💥 Error populating Firestore:', error.message);
            process.exit(1);
        }
    });
}
// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Script interrupted by user');
    process.exit(0);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Run the script
if (require.main === module) {
    main();
}

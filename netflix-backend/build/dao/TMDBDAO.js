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
exports.requests = void 0;
exports.fetchMediaDetailsFromTMDB = fetchMediaDetailsFromTMDB;
exports.fetchTMDBMoviesByCategory = fetchTMDBMoviesByCategory;
exports.testTMDBConnection = testTMDBConnection;
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_URL = "https://api.themoviedb.org/3";
// Validate required environment variables
if (!TMDB_API_KEY) {
    throw new Error('TMDB_API_KEY is required in environment variables');
}
exports.requests = {
    fetchNetflixOriginals: `/discover/tv?api_key=${TMDB_API_KEY}&with_networks=213`,
    fetchTrending: `/trending/all/week?api_key=${TMDB_API_KEY}&language=en-US`,
    fetchTopRated: `/movie/top_rated?api_key=${TMDB_API_KEY}&language=en-US`,
    fetchActionMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=28`,
    fetchComedyMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=35`,
    fetchHorrorMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=27`,
    fetchRomanceMovies: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=10749`,
    fetchDocumentaries: `/discover/movie?api_key=${TMDB_API_KEY}&with_genres=99`,
};
function fetchMediaDetailsFromTMDB(id, type) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const params = { api_key: TMDB_API_KEY };
        try {
            const [detailsRes, creditsRes] = yield Promise.all([
                axios_1.default.get(`${TMDB_URL}/${type}/${id}`, { params }),
                axios_1.default.get(`${TMDB_URL}/${type}/${id}/credits`, { params }),
            ]);
            const director = ((_a = creditsRes.data.crew.find(c => c.job === 'Director')) === null || _a === void 0 ? void 0 : _a.name) || null;
            return Object.assign(Object.assign({}, detailsRes.data), { director });
        }
        catch (error) {
            console.error(`Error fetching details for ${type} ${id} from TMDB:`, error.message);
            throw error;
        }
    });
}
function fetchTMDBMoviesByCategory(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`${TMDB_URL}${url}`);
            return response.data.results;
        }
        catch (error) {
            console.error(`Error fetching movies from TMDB with URL ${url}:`, error.message);
            throw error;
        }
    });
}
function testTMDBConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield axios_1.default.get(`${TMDB_URL}/configuration?api_key=${TMDB_API_KEY}`);
            console.log('✅ TMDB API connection successful');
        }
        catch (error) {
            console.error('❌ TMDB API connection failed:', error.message);
            throw error;
        }
    });
}

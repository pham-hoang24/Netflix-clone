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
exports.MediaService = void 0;
const TMDBDAO_1 = require("../dao/TMDBDAO");
const FirestoreDAO_1 = require("../dao/FirestoreDAO");
const axios_1 = __importDefault(require("axios"));
let genreCache = null;
class MediaService {
    constructor() {
        this.TMDB_URL = "https://api.themoviedb.org/3";
        this.TMDB_API_KEY = process.env.TMDB_API_KEY;
        if (!this.TMDB_API_KEY) {
            throw new Error('TMDB_API_KEY is required in environment variables');
        }
    }
    getGenres(type) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!genreCache) {
                const res = yield axios_1.default.get(`${this.TMDB_URL}/genre/${type}/list`, {
                    params: { api_key: this.TMDB_API_KEY }
                });
                genreCache = res.data.genres.reduce((m, g) => {
                    m[g.id] = g.name;
                    return m;
                }, {});
            }
            return genreCache;
        });
    }
    fetchAndProcessMediaDetails(id, type) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const details = yield (0, TMDBDAO_1.fetchMediaDetailsFromTMDB)(id, type);
            const genres = yield this.getGenres(type);
            return {
                movieName: details.title || details.name || '',
                genre: ((_a = details.genre_ids) === null || _a === void 0 ? void 0 : _a.map(gId => genres[gId]).filter(Boolean).join(', ')) || null,
                publishDate: details.release_date || details.first_air_date || null,
                director: details.director
            };
        });
    }
    populateAllCategories() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(` Processing ${Object.keys(TMDBDAO_1.requests).length} categories...`);
            for (const [categoryName, url] of Object.entries(TMDBDAO_1.requests)) {
                if (typeof url === 'string') {
                    yield this.populateCategory(categoryName, url);
                    // Add delay between categories to respect API rate limits
                    yield new Promise(resolve => setTimeout(resolve, 2000));
                }
            }
            console.log(' All categories populated successfully!');
        });
    }
    populateCategory(categoryName, url) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`Fetching ${categoryName}...`);
            try {
                const movies = yield (0, TMDBDAO_1.fetchTMDBMoviesByCategory)(url);
                if (!movies || movies.length === 0) {
                    console.warn(`No movies found for category: ${categoryName}`);
                    return;
                }
                const movieIds = [];
                const batchSize = 10; // Process movies in batches to avoid rate limiting
                for (let i = 0; i < movies.length; i += batchSize) {
                    const batch = movies.slice(i, i + batchSize);
                    const batchPromises = batch.map((movie) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            // Determine media type
                            const type = movie.media_type === 'tv' || url.includes('/tv?') ? 'tv' : 'movie';
                            const movieDetails = yield (0, TMDBDAO_1.fetchMediaDetailsFromTMDB)(movie.id, type);
                            // Store in Firestore
                            yield (0, FirestoreDAO_1.saveMovieDetailsToFirestore)(movieDetails);
                            return String(movie.id);
                        }
                        catch (error) {
                            console.error(`Failed to process movie ${movie.id}:`, error.message);
                            return null;
                        }
                    }));
                    const batchResults = yield Promise.allSettled(batchPromises);
                    batchResults.forEach((result, index) => {
                        if (result.status === 'fulfilled' && result.value) {
                            movieIds.push(result.value);
                        }
                        else {
                            console.error(`Failed to process movie in batch ${i + index + 1}`);
                        }
                    });
                    // Add delay between batches to respect API rate limits
                    if (i + batchSize < movies.length) {
                        yield new Promise(resolve => setTimeout(resolve, 1000));
                    }
                }
                // Store category information
                const categoryData = {
                    name: categoryName,
                    movies: movieIds,
                };
                yield (0, FirestoreDAO_1.saveCategoryDataToFirestore)(categoryData);
                console.log(`Successfully populated ${categoryName} with ${movieIds.length} movies.`);
            }
            catch (error) {
                console.error(`Error populating category ${categoryName}:`, error.message);
                throw error;
            }
        });
    }
    getTrending(type) {
        return __awaiter(this, void 0, void 0, function* () {
            const tmdbUrl = `${this.TMDB_URL}/trending/${type}/day`;
            const response = yield axios_1.default.get(tmdbUrl, {
                params: { api_key: this.TMDB_API_KEY },
            });
            return response.data;
        });
    }
    getAllGenres() {
        return __awaiter(this, void 0, void 0, function* () {
            const [movieRes, tvRes] = yield Promise.all([
                axios_1.default.get(`${this.TMDB_URL}/genre/movie/list`, {
                    params: { api_key: this.TMDB_API_KEY, language: 'en-US' },
                }),
                axios_1.default.get(`${this.TMDB_URL}/genre/tv/list`, {
                    params: { api_key: this.TMDB_API_KEY, language: 'en-US' },
                })
            ]);
            const allGenres = [...movieRes.data.genres, ...tvRes.data.genres];
            const genreMap = {};
            allGenres.forEach(g => {
                genreMap[g.id] = g.name;
            });
            return { genres: allGenres };
        });
    }
    getTrendingWithDetails() {
        return __awaiter(this, void 0, void 0, function* () {
            const [movieRes, tvRes] = yield Promise.all([
                axios_1.default.get(`${this.TMDB_URL}/trending/movie/day`, {
                    params: { api_key: this.TMDB_API_KEY },
                }),
                axios_1.default.get(`${this.TMDB_URL}/trending/tv/day`, {
                    params: { api_key: this.TMDB_API_KEY },
                }),
            ]);
            const combinedItems = [...movieRes.data.results, ...tvRes.data.results]
                .filter((item) => item.poster_path || item.backdrop_path)
                .sort((a, b) => b.popularity - a.popularity)
                .slice(0, 10);
            const IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';
            const itemsWithLogos = yield Promise.all(combinedItems.map((item) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                const type = item.title ? 'movie' : 'tv';
                try {
                    const { data: images } = yield axios_1.default.get(`${this.TMDB_URL}/${type}/${item.id}/images`, {
                        params: {
                            api_key: this.TMDB_API_KEY,
                            include_image_language: 'en,null',
                        },
                    });
                    const logoPath = (_b = (_a = images.logos) === null || _a === void 0 ? void 0 : _a.find(l => { var _a; return (_a = l.file_path) === null || _a === void 0 ? void 0 : _a.endsWith('.png'); })) === null || _b === void 0 ? void 0 : _b.file_path;
                    return Object.assign(Object.assign({}, item), { logo_url: logoPath ? `${IMAGE_BASE}${logoPath}` : null });
                }
                catch (err) {
                    console.error(`Logo fetch failed for ${item.title || item.name}:`, err.message);
                    return Object.assign(Object.assign({}, item), { logo_url: null });
                }
            })));
            return itemsWithLogos;
        });
    }
    multiSearch(query) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = yield axios_1.default.get(`${this.TMDB_URL}/search/multi`, {
                params: {
                    api_key: this.TMDB_API_KEY,
                    query: query,
                    language: 'en-US',
                },
            });
            return response.data;
        });
    }
    getMoviesByGenre(genre_1) {
        return __awaiter(this, arguments, void 0, function* (genre, limit = 10) {
            // This is a placeholder. A real implementation would query TMDB for movies by genre.
            // TMDB's /discover/movie endpoint can be used with 'with_genres' parameter.
            console.warn(`getMoviesByGenre for genre: ${genre} is a placeholder and needs full TMDB integration.`);
            try {
                const response = yield axios_1.default.get(`${this.TMDB_URL}/discover/movie`, {
                    params: {
                        api_key: this.TMDB_API_KEY,
                        with_genres: genre, // This assumes 'genre' is the TMDB genre ID. You might need a mapping.
                        language: 'en-US',
                        sort_by: 'popularity.desc',
                    },
                });
                return response.data.results.slice(0, limit);
            }
            catch (error) {
                console.error(`Error fetching movies by genre ${genre} from TMDB:`, error.message);
                return [];
            }
        });
    }
}
exports.MediaService = MediaService;

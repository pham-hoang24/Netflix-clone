var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
document.addEventListener('DOMContentLoaded', function () {
    console.log('TS is connected!');
    var GENRE_MAP = {};
    var MOVIE_LOGO_MAP = {};
    var TV_LOGO_MAP = {};
    var POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
    var BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
    var BACKDROP_SMALL = 'https://image.tmdb.org/t/p/w780';
    var API_BASE = 'http://localhost:3000';
    var scrollAmount = 1056;
    var carousel = document.querySelector('.movie-carousel');
    var leftBtn = document.querySelector('.scroll-button.left');
    var rightBtn = document.querySelector('.scroll-button.right');
    function fetchGenreMap() {
        return __awaiter(this, void 0, void 0, function () {
            var res, data;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, fetch("".concat(API_BASE, "/api/genres"))];
                    case 1:
                        res = _a.sent();
                        return [4 /*yield*/, res.json()];
                    case 2:
                        data = _a.sent();
                        GENRE_MAP = data.genres || {};
                        return [2 /*return*/];
                }
            });
        });
    }
    function fetchLogoMaps() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, movieRes, tvRes;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fetch("".concat(API_BASE, "/api/logo/map?type=movie")),
                            fetch("".concat(API_BASE, "/api/logo/map?type=tv"))
                        ])];
                    case 1:
                        _a = _b.sent(), movieRes = _a[0], tvRes = _a[1];
                        return [4 /*yield*/, movieRes.json()];
                    case 2:
                        MOVIE_LOGO_MAP = _b.sent();
                        return [4 /*yield*/, tvRes.json()];
                    case 3:
                        TV_LOGO_MAP = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    }
    function updateScrollButtons() {
        if (!carousel || !leftBtn || !rightBtn)
            return;
        var maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
        leftBtn.classList.toggle('hidden', carousel.scrollLeft <= 2);
        rightBtn.classList.toggle('hidden', carousel.scrollLeft + 2 >= maxScrollLeft);
    }
    if (leftBtn && rightBtn && carousel) {
        leftBtn.addEventListener('click', function () {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
        rightBtn.addEventListener('click', function () {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
        carousel.addEventListener('scroll', updateScrollButtons);
        window.addEventListener('resize', updateScrollButtons);
    }
    function fetchTrending() {
        return __awaiter(this, void 0, void 0, function () {
            var _a, movieRes, tvRes;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, Promise.all([
                            fetch("".concat(API_BASE, "/api/trending/movie")),
                            fetch("".concat(API_BASE, "/api/trending/tv"))
                        ])];
                    case 1:
                        _a = _c.sent(), movieRes = _a[0], tvRes = _a[1];
                        if (!movieRes.ok || !tvRes.ok) {
                            throw new Error('Failed to fetch trending data.');
                        }
                        _b = {};
                        return [4 /*yield*/, movieRes.json()];
                    case 2:
                        _b.movies = (_c.sent()).results.slice(0, 10);
                        return [4 /*yield*/, tvRes.json()];
                    case 3: return [2 /*return*/, (_b.tvShows = (_c.sent()).results.slice(0, 10),
                            _b)];
                }
            });
        });
    }
    function combineAndSort(movies, tvShows) {
        return __spreadArray(__spreadArray([], movies, true), tvShows, true).filter(function (item) { return item.poster_path || item.backdrop_path; })
            .sort(function (a, b) { return b.popularity - a.popularity; })
            .slice(0, 10);
    }
    function populateCarousel(items) {
        if (!carousel)
            return;
        carousel.innerHTML = '';
        items.forEach(function (item) {
            var _a, _b;
            var container = document.createElement('div');
            container.className = 'movie-item';
            var img = document.createElement('img');
            img.className = 'movie-poster';
            img.alt = (_b = (_a = item.title) !== null && _a !== void 0 ? _a : item.name) !== null && _b !== void 0 ? _b : 'Untitled';
            img.src = item.poster_path
                ? "".concat(POSTER_BASE).concat(item.poster_path)
                : item.backdrop_path
                    ? "".concat(BACKDROP_SMALL).concat(item.backdrop_path)
                    : 'https://via.placeholder.com/300x450?text=No+Image';
            img.addEventListener('click', function () {
                if (!Object.keys(GENRE_MAP).length) {
                    console.warn('Genre map not loaded yet.');
                    return;
                }
                openDetailModal(item);
            });
            container.appendChild(img);
            carousel.appendChild(container);
        });
        updateScrollButtons();
    }
    function openDetailModal(item) {
        var _a, _b, _c, _d, _e;
        var overlay = document.createElement('div');
        overlay.className = 'modal-overlay';
        var content = document.createElement('div');
        content.className = 'modal-content';
        var backdrop = document.createElement('div');
        backdrop.className = 'modal-backdrop';
        backdrop.style.backgroundImage = "url(".concat(item.backdrop_path ? BACKDROP_BASE + item.backdrop_path : POSTER_BASE + item.poster_path, ")");
        var closeBtn = document.createElement('button');
        closeBtn.className = 'modal-close';
        closeBtn.textContent = '×';
        closeBtn.onclick = function () { return overlay.remove(); };
        var logo = document.createElement('img');
        logo.className = 'modal-logo';
        var logoUrl = item.title && MOVIE_LOGO_MAP[item.title]
            ? MOVIE_LOGO_MAP[item.title]
            : item.name && TV_LOGO_MAP[item.name]
                ? TV_LOGO_MAP[item.name]
                : null;
        logo.src = logoUrl || 'netflix_logo.png';
        logo.alt = (_b = (_a = item.title) !== null && _a !== void 0 ? _a : item.name) !== null && _b !== void 0 ? _b : 'Logo';
        var tags = document.createElement('div');
        tags.className = 'modal-tags';
        var genreNames = ((_c = item.genre_ids) === null || _c === void 0 ? void 0 : _c.map(function (id) { return GENRE_MAP[id]; }).filter(Boolean)) || [];
        var year = (_e = (_d = item.release_date) === null || _d === void 0 ? void 0 : _d.slice(0, 4)) !== null && _e !== void 0 ? _e : 'Unknown';
        __spreadArray(__spreadArray([], genreNames, true), [year], false).forEach(function (text) {
            var span = document.createElement('span');
            span.className = 'tag-pill';
            span.textContent = text;
            tags.appendChild(span);
        });
        var description = document.createElement('p');
        description.className = 'modal-description';
        description.textContent = item.overview || 'No description available.';
        var bottomContainer = document.createElement('div');
        bottomContainer.className = 'modal-bottom-container';
        bottomContainer.append(logo, tags, description);
        content.append(backdrop, closeBtn, bottomContainer);
        overlay.appendChild(content);
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay)
                overlay.remove();
        });
        document.body.appendChild(overlay);
    }
    fetchGenreMap()
        .then(fetchLogoMaps)
        .then(fetchTrending)
        .then(function (_a) {
        var movies = _a.movies, tvShows = _a.tvShows;
        return populateCarousel(combineAndSort(movies, tvShows));
    })
        .catch(function (err) { return console.error('Failed to load app data:', err); });
});

interface TrendingItem {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
  genre_ids?: number[];
  release_date?: string;
  logo_url?: string | null;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('TS is connected!');

  let GENRE_MAP: { [id: number]: string } = {};
  let MOVIE_LOGO_MAP: { [title: string]: string | null } = {};
  let TV_LOGO_MAP: { [title: string]: string | null } = {};

  const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
  const BACKDROP_SMALL = 'https://image.tmdb.org/t/p/w780';
  const API_BASE = 'http://localhost:3000';
  const scrollAmount = 1056;

  const carousel = document.querySelector('.movie-carousel') as HTMLElement;
  const leftBtn = document.querySelector('.scroll-button.left') as HTMLElement;
  const rightBtn = document.querySelector('.scroll-button.right') as HTMLElement;

  async function fetchGenreMap() {
    const res = await fetch(`${API_BASE}/api/genres`);
    const data = await res.json();
    GENRE_MAP = data.genres || {};
  }

  async function fetchLogoMaps() {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${API_BASE}/api/logo/map?type=movie`),
      fetch(`${API_BASE}/api/logo/map?type=tv`)
    ]);
    MOVIE_LOGO_MAP = await movieRes.json();
    TV_LOGO_MAP = await tvRes.json();
  }

  function updateScrollButtons() {
    if (!carousel || !leftBtn || !rightBtn) return;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;

    leftBtn.classList.toggle('hidden', carousel.scrollLeft <= 2);
    rightBtn.classList.toggle('hidden', carousel.scrollLeft + 2 >= maxScrollLeft);
  }

  if (leftBtn && rightBtn && carousel) {
    leftBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });

    rightBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    carousel.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
  }

  async function fetchTrending(): Promise<{ movies: TrendingItem[]; tvShows: TrendingItem[] }> {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${API_BASE}/api/trending/movie`),
      fetch(`${API_BASE}/api/trending/tv`)
    ]);
    if (!movieRes.ok || !tvRes.ok) {
      throw new Error('Failed to fetch trending data.');
    }
    return {
      movies: (await movieRes.json()).results.slice(0, 10),
      tvShows: (await tvRes.json()).results.slice(0, 10)
    };
  }

  function combineAndSort(movies: TrendingItem[], tvShows: TrendingItem[]): TrendingItem[] {
    return [...movies, ...tvShows]
      .filter(item => item.poster_path || item.backdrop_path)
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 10);
  }

  function populateCarousel(items: TrendingItem[]) {
    if (!carousel) return;
    carousel.innerHTML = '';

    items.forEach(item => {
      const container = document.createElement('div');
      container.className = 'movie-item';

      const img = document.createElement('img');
      img.className = 'movie-poster';
      img.alt = item.title ?? item.name ?? 'Untitled';
      img.src = item.poster_path
        ? `${POSTER_BASE}${item.poster_path}`
        : item.backdrop_path
        ? `${BACKDROP_SMALL}${item.backdrop_path}`
        : 'https://via.placeholder.com/300x450?text=No+Image';

      img.addEventListener('click', () => {
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

  function openDetailModal(item: TrendingItem) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';

    const content = document.createElement('div');
    content.className = 'modal-content';

    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop';
    backdrop.style.backgroundImage = `url(${item.backdrop_path ? BACKDROP_BASE + item.backdrop_path : POSTER_BASE + item.poster_path})`;

    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.textContent = '×';
    closeBtn.onclick = () => overlay.remove();

    const logo = document.createElement('img');
    logo.className = 'modal-logo';
    const logoUrl =
      item.title && MOVIE_LOGO_MAP[item.title]
        ? MOVIE_LOGO_MAP[item.title]
        : item.name && TV_LOGO_MAP[item.name]
        ? TV_LOGO_MAP[item.name]
        : null;
    logo.src = logoUrl || 'netflix_logo.png';
    logo.alt = item.title ?? item.name ?? 'Logo';

    const tags = document.createElement('div');
    tags.className = 'modal-tags';
    const genreNames = item.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];
    const year = item.release_date?.slice(0, 4) ?? 'Unknown';
    [...genreNames, year].forEach(text => {
      const span = document.createElement('span');
      span.className = 'tag-pill';
      span.textContent = text;
      tags.appendChild(span);
    });

    const description = document.createElement('p');
    description.className = 'modal-description';
    description.textContent = item.overview || 'No description available.';

    const bottomContainer = document.createElement('div');
    bottomContainer.className = 'modal-bottom-container';
    bottomContainer.append(logo, tags, description);

    content.append(backdrop, closeBtn, bottomContainer);
    overlay.appendChild(content);
    overlay.addEventListener('click', e => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  fetchGenreMap()
    .then(fetchLogoMaps)
    .then(fetchTrending)
    .then(({ movies, tvShows }) => populateCarousel(combineAndSort(movies, tvShows)))
    .catch(err => console.error('Failed to load app data:', err));
});

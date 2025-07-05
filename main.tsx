interface TrendingItem {
    title?: string;
    name?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    popularity: number;
    genre_ids?: number[];
    release_date?: string;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('TS is connected!');

  let GENRE_MAP: { [id: number]: string } = {};

  async function fetchGenreMap() {
    const res = await fetch('http://localhost:3000/api/genres');
    const data = await res.json();
    GENRE_MAP = data.genres || {};
  }


  const carousel = document.querySelector('.movie-carousel') as HTMLElement;
  const leftBtn = document.querySelector('.scroll-button.left') as HTMLElement;
  const rightBtn = document.querySelector('.scroll-button.right') as HTMLElement;
  const scrollAmount = 1056;

  function updateScrollButtons() {
    if (!carousel || !leftBtn || !rightBtn) return;
    const maxScrollLeft = carousel.scrollWidth - carousel.clientWidth;
    leftBtn.classList.toggle('hidden', carousel.scrollLeft <= 0);
    rightBtn.classList.toggle('hidden', carousel.scrollLeft + 2 >= maxScrollLeft );
  }

  if (leftBtn && rightBtn && carousel) {
    leftBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    });
    rightBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(updateScrollButtons, 300);
    });

    carousel.addEventListener('scroll', updateScrollButtons);
    window.addEventListener('resize', updateScrollButtons);
  }

  const POSTER_BASE = 'https://image.tmdb.org/t/p/w500';
  const BACKDROP_BASE = 'https://image.tmdb.org/t/p/w1280';
  const BACKDROP_SMALL = 'https://image.tmdb.org/t/p/w780';


async function fetchTrending(): Promise<{ movies: TrendingItem[]; tvShows: TrendingItem[] }> {
  // Fetch trending movies and TV shows from the Express backend
const API_BASE = 'http://localhost:3000';
  const [movieRes, tvRes] = await Promise.all([
  fetch(`${API_BASE}/api/trending/movie`),
  fetch(`${API_BASE}/api/trending/tv`)
  ]);
  if (!movieRes.ok || !tvRes.ok) {
    throw new Error('Failed to fetch trending data.');
  }

  // Parse the JSON responses (assuming each returns an object with a `results` array)
  const moviesData = await movieRes.json();
  const tvData = await tvRes.json();

  return {
    movies: moviesData.results.slice(0, 10),   // top 10 movies
    tvShows: tvData.results.slice(0, 10)       // top 10 TV shows
  };
}

// Combine and sort results by popularity, then populate carousel (unchanged logic)
fetchTrending()
  .then(({ movies, tvShows }) => {
    const topItems = combineAndSort(movies, tvShows);
    populateCarousel(topItems);
  })
  .catch(err => console.error('Failed to load trending data:', err));


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

    updateScrollButtons(); // Call after content is populated
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
  logo.src = '/25b45a29-02f9-45e3-b65e-61d103e62694.png'; // Your uploaded PNG logo
  logo.alt = 'Logo';

const tags = document.createElement('div');
    tags.className = 'modal-tags';
    tags.innerHTML = '';

    const genreNames = item.genre_ids?.map(id => GENRE_MAP[id]).filter(Boolean) || [];
    const year = item.release_date?.slice(0, 4) ?? 'Unknown';
    const tagList = [...genreNames, year].filter(Boolean);

    tagList.forEach(text => {
      const span = document.createElement('span');
      span.className = 'tag-pill';
      span.textContent = text ?? '';
      tags.appendChild(span);
    });

  const description = document.createElement('p');
  description.className = 'modal-description';
  description.textContent = item.overview || 'No description available.';


  const bottomContainer = document.createElement('div');
bottomContainer.className = 'modal-bottom-container';
bottomContainer.append(logo, tags, description);

content.append(bottomContainer,backdrop, closeBtn);
  overlay.appendChild(content);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove();
  });

  document.body.appendChild(overlay);
}

 fetchGenreMap()
    .then(() => fetchTrending())
    .then(({ movies, tvShows }) => populateCarousel(combineAndSort(movies, tvShows)))
    .catch(err => console.error('Failed to load app data:', err));
});
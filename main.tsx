interface TrendingItem {
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  popularity: number;
}

document.addEventListener('DOMContentLoaded', () => {
  console.log('TS is connected!');

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

      img.addEventListener('click', () => openDetailModal(item));

      container.appendChild(img);
      carousel.appendChild(container);
    });

    updateScrollButtons(); // Call after content is populated
  }

  function openDetailModal(item: TrendingItem) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0, 0, 0, 0.8); display: flex;
      align-items: center; justify-content: center; z-index: 1000;
    `;

    const content = document.createElement('div');
    content.className = 'modal-content';
    content.style.cssText = `
      position: relative; background: #000; padding: 1rem;
      border-radius: 8px; max-width: 800px; width: 90%;
      max-height: 90%; overflow-y: auto; color: #fff;
    `;

    const closeBtn = document.createElement('button');
    closeBtn.textContent = '×';
    closeBtn.style.cssText = `
      position: absolute; top: 0.5rem; right: 0.5rem;
      background: transparent; border: none; color: #fff;
      font-size: 2rem; cursor: pointer;
    `;
    closeBtn.addEventListener('click', () => overlay.remove());

    const imageElem = document.createElement('img');
    imageElem.src = item.backdrop_path
      ? `${BACKDROP_BASE}${item.backdrop_path}`
      : item.poster_path
      ? `${POSTER_BASE}${item.poster_path}`
      : 'https://via.placeholder.com/1280x720?text=No+Image';
    imageElem.alt = item.title ?? item.name ?? 'Backdrop';
    imageElem.style.width = '100%';
    imageElem.style.borderRadius = '4px';

    const descriptionElem = document.createElement('p');
    descriptionElem.textContent = item.overview || 'No description available.';
    descriptionElem.style.marginTop = '1rem';

    content.append(closeBtn, imageElem, descriptionElem);
    overlay.appendChild(content);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.remove();
    });

    document.body.appendChild(overlay);
  }

  fetchTrending()
    .then(({ movies, tvShows }) => populateCarousel(combineAndSort(movies, tvShows)))
    .catch(err => console.error('Failed to load TMDB trending:', err));
});

const API_key: string | undefined = process.env.REACT_APP_TMDB_API_KEY;

interface Requests {
  searchMovies:(query: string) => string;
}

const requests: Requests = {
  searchMovies: (query: string) => `/search/movie?api_key=${API_key}&query=${query}&language=en-US&page=1&include_adult=false`,
};
export default requests;
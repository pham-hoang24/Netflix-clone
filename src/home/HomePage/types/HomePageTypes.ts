export interface Movie {
    id: number;
    name: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    media_type?: string;
    release_date?: string;
    first_air_date?: string;
    genres?: Array<{ id: number; name: string }>;
  }
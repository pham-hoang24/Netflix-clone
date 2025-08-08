export interface Movie {
    id: number;
    name: string;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    popularity?: number;
    logo_url?: string;
    media_type?: string;
    release_date?: string;
    first_air_date?: string | null;
    genres?: Array<{ id: number; name: string }>;
  }
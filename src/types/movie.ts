export interface Genre {
  id: number
  name: string
}

export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
}

export interface TorrentInfo {
  title: string;
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  url: string;
  magnet: string;
  hash: string;
  language?: string;  // Optional language field
  region?: string;    // Optional region field
}

export interface Movie {
  adult?: boolean;
  backdrop_path?: string;
  media_type?: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
  genres?: Genre[];
  id: number;
  name?: string;
  title?: string;
  origin_country?: string[];
  original_language?: string;
  original_name?: string;
  original_title?: string;
  overview?: string;
  popularity?: number;
  poster_path?: string;
  vote_average?: number;
  video?: boolean;
  status?: string;
  vote_count?: number;
  production_companies?: ProductionCompany[];
  runtime?: number;
  cast?: any[];
  crew?: any[];
}

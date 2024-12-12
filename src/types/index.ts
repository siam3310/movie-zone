export interface TorrentInfo {
  infoHash: string;
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  provider: string;
  magnetLink: string;
}

export interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

export interface TMDBEpisode {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  season_number: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

export interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episodes?: TMDBEpisode[];
}

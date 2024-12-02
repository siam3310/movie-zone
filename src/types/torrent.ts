// Media Processor Types
export interface MediaProcessorConfig {
  tmdbApiKey: string;
  userAgent: string;
  primaryEndpoints: string[];
  secondaryEndpoints: string[];
  fallbackEndpoints: string[];
  trackers?: string[];
}

// YTS Specific Types
export interface YTSTorrent {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
  date_uploaded_unix: number;
}

export interface YTSMovie {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  synopsis: string;
  yt_trailer_code: string;
  language: string;
  mpa_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  state: string;
  torrents: YTSTorrent[];
  date_uploaded: string;
  date_uploaded_unix: number;
}

// Stream and Episode Types
export interface StreamData {
  title: string;
  url?: string;
  infoHash?: string;
  size?: number | string;
  seeds?: number;
  peers?: number;
  quality?: string;
  streams?: StreamData[];
}

export interface EpisodeInfo {
  season: number | null;
  episode: number | null;
}

// Season Types
export interface SeasonInfo {
  season_number: number;
  name: string;
  episode_count: number;
  air_date: string;
  overview: string;
}

export interface ProcessedSeason {
  season: number;
  name: string;
  episode_count: number;
  available_episodes: number;
  air_date: string;
  overview: string;
}

// Torrent Types
export interface TorrentInfo {
  title: string;
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  url: string;
  magnet: string;
  hash: string;
}

export interface MovieDetails {
  tmdb_id: number;
  title: string;
  year: number;
  torrents: TorrentInfo[];
}

export interface TVSeason {
  season: number;
  name: string;
  episode_count: number;
  available_episodes: number;
  air_date: string;
  overview: string;
}

export interface TVSeriesDetails {
  tmdb_id: number;
  title: string;
  seasons: TVSeason[];
  episodes: TVEpisode[];
}

export interface TVEpisode extends TorrentInfo {
  season: number;
  episode: number;
  torrents: TorrentInfo[];
}

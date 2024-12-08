interface TorrentInfo {
    url: string;
    hash: string;
    quality: string;
    type: string;
    seeds: number;
    peers: number;
    size: string;
    size_bytes: number;
    date_uploaded: string;
  }
  
  interface MovieDetails {
    id: number;
    title: string;
    year: number;
    rating: number;
    runtime: number;
    genres: string[];
    summary: string;
    description_full: string;
    language: string;
    torrents: TorrentInfo[];
    background_image: string;
    background_image_original: string;
    small_cover_image: string;
    medium_cover_image: string;
    large_cover_image: string;
  }
  
  interface TVEpisode {
    title: string;
    episode: number;
    season: number;
    magnet_link: string;
    size: string;
    seeds: number;
    peers: number;
    quality: string;
  }
  
  interface TVSeriesDetails {
    episodes: TVEpisode[];
    seasons: number[];
  }
  
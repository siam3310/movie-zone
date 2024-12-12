export const BASE_URL = "https://api.themoviedb.org/3";

export const baseUrl = "https://image.tmdb.org/t/p/original/";
export const thumbnailUrl = "https://image.tmdb.org/t/p/w500";

export const requests = {
  fetchTrending: `/trending/all/week`,
  fetchTopRatedTV: `/tv/top_rated`,
  fetchPopularTV: `/tv/popular`,
  fetchNetflixOriginals: `/discover/tv?with_networks=213`,
  fetchActionMovies: `/discover/movie?with_genres=28`,
  fetchComedyMovies: `/discover/movie?with_genres=35`,
  fetchHorrorMovies: `/discover/movie?with_genres=27`,
  fetchRomanceMovies: `/discover/movie?with_genres=10749`,
  fetchDocumentaries: `/discover/movie?with_genres=99`,
};

export default requests;

interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

interface Credits {
  cast: Cast[];
  crew: any[];
}

interface ProductionCompany {
  id: number;
  logo_path: string | null;
  name: string;
  origin_country: string;
}

interface TMDBSeason {
  air_date: string;
  episode_count: number;
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
}

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  media_type?: string;
  original_language: string;
  original_title?: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video?: boolean;
  vote_average: number;
  vote_count: number;
  name?: string;
  first_air_date?: string;
  imdb_id?: string;
  credits?: Credits;
  production_companies?: ProductionCompany[];
  genres?: { id: number; name: string }[];
  runtime?: number;
  status?: string;
  tagline?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: TMDBSeason[];
}

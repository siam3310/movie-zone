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

export interface Movie {
  adult: boolean;
  backdrop_path: string;
  id: number;
  title: string;
  original_language: string;
  original_title: string;
  overview: string;
  poster_path: string;
  media_type: string;
  genre_ids: number[];
  popularity: number;
  release_date: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
  name?: string;
  first_air_date?: string;
  cast?: any[];
  crew?: any[];
  production_companies: {
    id: number;
    name: string;
    logo_path: string | null;
  }[];
  genres: { id: number; name: string }[];
  runtime: number;
}

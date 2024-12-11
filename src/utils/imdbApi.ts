import axios from 'axios';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

export interface TMDBEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  air_date: string;
  episode_number: number;
  season_number: number;
  vote_average: number;
  imdb_id?: string;
}

export interface TMDBSeason {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes: TMDBEpisode[];
}

export interface TMDBTVSeries {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  poster_path: string;
  seasons: TMDBSeason[];
  number_of_seasons: number;
  errorMessage?: string;
}

export const fetchTVSeriesSeasons = async (tvId: string | number): Promise<TMDBTVSeries> => {
  try {
    // First, get the TV show details
    const tvResponse = await axios.get(
      `${BASE_URL}/tv/${tvId}?api_key=${TMDB_API_KEY}&language=en-US`
    );
    
    const tvData = tvResponse.data;
    
    // Then, fetch details for each season including episodes
    const seasons = await Promise.all(
      tvData.seasons.map(async (season: any) => {
        const seasonResponse = await axios.get(
          `${BASE_URL}/tv/${tvId}/season/${season.season_number}?api_key=${TMDB_API_KEY}&language=en-US`
        );
        return seasonResponse.data;
      })
    );

    return {
      id: tvData.id,
      name: tvData.name,
      overview: tvData.overview,
      first_air_date: tvData.first_air_date,
      poster_path: tvData.poster_path,
      number_of_seasons: tvData.number_of_seasons,
      seasons: seasons.map(season => ({
        id: season.id,
        name: season.name,
        season_number: season.season_number,
        episode_count: season.episodes.length,
        air_date: season.air_date,
        episodes: season.episodes.map((episode: any) => ({
          id: episode.id,
          name: episode.name,
          overview: episode.overview,
          still_path: episode.still_path,
          air_date: episode.air_date,
          episode_number: episode.episode_number,
          season_number: episode.season_number,
          vote_average: episode.vote_average
        }))
      }))
    };
  } catch (error) {
    console.error('Error fetching TV series data:', error);
    throw error;
  }
};

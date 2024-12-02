import { getMovieProcessor, getTVProcessor } from './media';
import { MovieDetails, TVSeriesDetails } from '../types/torrent';

/**
 * Fetch movie data and torrents
 */
export const fetchMovieData = async (
  tmdbId: number,
  title: string
): Promise<MovieDetails | null> => {
  try {
    const movieProcessor = getMovieProcessor();
    return await movieProcessor.fetchMovieData(tmdbId, title);
  } catch (error) {
    console.error('Error fetching movie data:', error);
    return null;
  }
};

/**
 * Fetch TV series data and torrents
 */
export const fetchTVSeriesData = async (
  tmdbId: number,
  title: string
): Promise<TVSeriesDetails | null> => {
  try {
    const tvProcessor = getTVProcessor();
    return await tvProcessor.fetchTVSeriesData(tmdbId, title);
  } catch (error) {
    console.error('Error fetching TV series data:', error);
    return null;
  }
};

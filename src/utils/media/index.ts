export * from './streamProcessor';
export * from './movieProcessor';
export * from './tvProcessor';
export * from './endpoints';

import { MovieProcessor } from './movieProcessor';
import { TVProcessor } from './tvProcessor';
import { MediaProcessorConfig } from '../../types/torrent';

// Create singleton instances
let movieProcessor: MovieProcessor | null = null;
let tvProcessor: TVProcessor | null = null;

export const initializeMediaProcessors = (config: MediaProcessorConfig) => {
  movieProcessor = new MovieProcessor(config);
  tvProcessor = new TVProcessor(config);
};

export const getMovieProcessor = (): MovieProcessor => {
  if (!movieProcessor) {
    throw new Error('MovieProcessor not initialized. Call initializeMediaProcessors first.');
  }
  return movieProcessor;
};

export const getTVProcessor = (): TVProcessor => {
  if (!tvProcessor) {
    throw new Error('TVProcessor not initialized. Call initializeMediaProcessors first.');
  }
  return tvProcessor;
};

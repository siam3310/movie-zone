import { MediaProcessorConfig, MovieDetails, StreamData, TorrentInfo } from '../../types/torrent';
import { StreamProcessor } from './streamProcessor';
import { fetchWithRetry } from '../helpers';
import { getQualityFromTitle, getSizeFromTitle, formatBytes } from '../helpers';

export class MovieProcessor extends StreamProcessor {
  constructor(config: MediaProcessorConfig) {
    super(config);
  }

  /**
   * Find movie streams with enhanced metadata
   */
  private async findMovieStreams(
    title: string,
    tmdbId: string | number,
    imdbId?: string
  ): Promise<StreamData[] | null> {
    if (!title || !tmdbId) {
      console.log('Missing title or TMDB ID');
      return null;
    }

    // Check cache first
    const cacheKey = `${tmdbId}_${title}`;
    const cached = this.streamCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      console.log('Returning cached streams for:', title);
      return cached.data;
    }

    try {
      const { primary, secondary, fallback } = this.getPrioritizedEndpoints(imdbId || String(tmdbId));
      
      // Try primary endpoints first (fastest sources)
      console.log('Trying primary endpoints for:', title);
      let streams = await this.fetchStreamsByPriority(primary, title);
      
      // Always try secondary endpoints to get more qualities
      console.log('Trying secondary endpoints for:', title);
      const secondaryStreams = await this.fetchStreamsByPriority(secondary, title);
      streams = [...streams, ...secondaryStreams];

      // If we don't have enough qualities, try fallback endpoints
      const uniqueQualities = new Set(streams.map(s => getQualityFromTitle(s.title || '')));
      if (uniqueQualities.size < 3) {
        console.log('Missing qualities, trying fallback endpoints for:', title);
        const fallbackStreams = await this.fetchStreamsByPriority(fallback, title);
        streams = [...streams, ...fallbackStreams];
      }

      // Deduplicate streams but preserve different qualities
      const uniqueStreams = new Map<string, StreamData>();
      
      streams.forEach(stream => {
        if (!stream?.title || !stream.infoHash) return;
        
        const quality = getQualityFromTitle(stream.title, stream);
        const existingStream = uniqueStreams.get(quality);
        
        // If we don't have this quality yet, or if this one has more seeds
        if (!existingStream || (stream.seeds || 0) > (existingStream.seeds || 0)) {
          uniqueStreams.set(quality, stream);
        }
      });

      const finalStreams = Array.from(uniqueStreams.values())
        .sort((a, b) => {
          // First by seeds
          const aSeeds = a.seeds || 0;
          const bSeeds = b.seeds || 0;
          if (aSeeds !== bSeeds) {
            return bSeeds - aSeeds;
          }
          // Then by quality
          const aQuality = getQualityFromTitle(a.title || '', a);
          const bQuality = getQualityFromTitle(b.title || '', b);
          return bQuality.localeCompare(aQuality);
        });

      if (finalStreams.length > 0) {
        // Cache the results
        this.streamCache.set(cacheKey, { data: finalStreams, timestamp: Date.now() });
        console.log(`Found ${finalStreams.length} total valid streams for:`, title);
        return finalStreams;
      }

      console.log('No streams found for:', title);
      return null;
    } catch (error) {
      console.error('Error finding movie streams:', error);
      return null;
    }
  }

  /**
   * Process stream data into torrent info
   */
  private processStreamData(stream: StreamData, title: string): TorrentInfo {
    // Extract seeds and peers from stream data
    const seeds = typeof stream.seeds === 'number' ? stream.seeds : 0;
    const peers = typeof stream.peers === 'number' ? stream.peers : 0;

    // Get quality and size
    const quality = getQualityFromTitle(stream.title || title) || '720p';
    const size = getSizeFromTitle(stream.title || title) || stream.size || 'Unknown';

    // Create magnet link with trackers
    const magnetUrl = this.createMagnetLink(stream, title);

    return {
      title: stream.title || title,
      quality: quality.toUpperCase(),
      size: typeof size === 'string' ? size : formatBytes(Number(size)),
      seeds,
      peers,
      url: stream.url || '',
      magnet: magnetUrl,
      hash: stream.infoHash || ''
    };
  }

  /**
   * Fetch movie data from TMDB and process streams
   */
  public async fetchMovieData(
    tmdbId: number,
    title: string
  ): Promise<MovieDetails | null> {
    if (!tmdbId || !title) {
      console.error('TMDB ID and title are required');
      return null;
    }

    try {
      // Check cache first
      const cacheKey = `movie-${tmdbId}`;
      const cachedData = this.getCachedData<MovieDetails>(cacheKey);
      if (cachedData) {
        console.log('Using cached movie data');
        return cachedData;
      }

      // Get IMDB ID from TMDB
      const imdbData = await fetchWithRetry<{ external_ids: { imdb_id: string } }>(
        `https://api.themoviedb.org/3/movie/${tmdbId}/external_ids`,
        {
          params: {
            api_key: this.config.tmdbApiKey
          }
        }
      );

      const imdbId = imdbData?.external_ids?.imdb_id;

      // Find streams for the movie
      const streams = await this.findMovieStreams(title, tmdbId, imdbId);
      if (!streams) {
        console.log('No streams found for movie:', title);
        return null;
      }

      // Process streams into torrents
      const torrents = streams.map(stream => this.processStreamData(stream, title));

      // Sort torrents by seeds and quality
      torrents.sort((a, b) => {
        // First by seeds + peers
        const aAvailability = (a.seeds || 0) + (a.peers || 0);
        const bAvailability = (b.seeds || 0) + (b.peers || 0);
        if (aAvailability !== bAvailability) {
          return bAvailability - aAvailability;
        }

        // Then by quality
        const qualities = { '2160P': 4, '1080P': 3, '720P': 2, '480P': 1 };
        const aQuality = qualities[a.quality.toUpperCase() as keyof typeof qualities] || 0;
        const bQuality = qualities[b.quality.toUpperCase() as keyof typeof qualities] || 0;
        return bQuality - aQuality;
      });

      const result: MovieDetails = {
        tmdb_id: tmdbId,
        title,
        torrents
      };

      // Cache the result
      this.setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error fetching movie data:', error);
      return null;
    }
  }
}

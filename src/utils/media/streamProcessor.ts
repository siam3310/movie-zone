import { MediaProcessorConfig, StreamData } from '../../types/torrent';
import { fetchWithRetry } from '../helpers';
import { getQualityFromTitle, getSizeFromTitle, formatBytes } from '../helpers';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export abstract class StreamProcessor {
  protected readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  protected readonly streamCache = new Map<string, CacheEntry<StreamData[]>>();
  protected readonly dataCache = new Map<string, CacheEntry<any>>();

  constructor(protected readonly config: MediaProcessorConfig) {}

  /**
   * Get prioritized endpoints for stream discovery
   */
  protected getPrioritizedEndpoints(id: string) {
    return {
      primary: this.config.primaryEndpoints.map(endpoint => 
        endpoint.replace('{id}', id)),
      secondary: this.config.secondaryEndpoints.map(endpoint => 
        endpoint.replace('{id}', id)),
      fallback: this.config.fallbackEndpoints.map(endpoint => 
        endpoint.replace('{id}', id))
    };
  }

  /**
   * Get headers for specific endpoint
   */
  private getEndpointHeaders(endpoint: string): HeadersInit {
    const baseHeaders = {
      'Accept': 'application/json',
      'User-Agent': this.config.userAgent
    };

    // TMDB specific headers
    if (endpoint.includes('api.themoviedb.org')) {
      return {
        ...baseHeaders,
        'Accept': 'application/json'
      };
    }

    // YTS specific headers
    if (endpoint.includes('yts.mx')) {
      return {
        ...baseHeaders,
        'Origin': 'https://yts.mx',
        'Referer': 'https://yts.mx/'
      };
    }

    // Torrentio specific headers
    if (endpoint.includes('torrentio')) {
      return {
        ...baseHeaders,
        'Origin': 'https://torrentio.strem.fun',
        'Referer': 'https://torrentio.strem.fun/'
      };
    }

    return baseHeaders;
  }

  /**
   * Fetch streams from a list of endpoints
   */
  protected async fetchStreamsByPriority(
    endpoints: string[],
    title: string
  ): Promise<StreamData[]> {
    const streams: StreamData[] = [];

    for (const endpoint of endpoints) {
      try {
        const headers = this.getEndpointHeaders(endpoint);
        let url = endpoint;
        // TMDB API authorization to use the API key as a query parameter
        if (endpoint.includes('api.themoviedb.org')) {
          url += `?api_key=${this.config.tmdbApiKey}`;
        }
        const response = await fetchWithRetry<any>(url, { headers });

        if (!response) continue;

        // Handle YTS API response
        if (endpoint.includes('yts.mx')) {
          if (response.data?.movie?.torrents) {
            streams.push(...response.data.movie.torrents.map((t: any) => ({
              title: `${title} ${t.quality}`,
              infoHash: t.hash,
              size: t.size_bytes,
              seeds: t.seeds,
              peers: t.peers,
              quality: t.quality
            })));
          } else if (response.data?.movies?.[0]?.torrents) {
            // Handle search results
            const movie = response.data.movies[0];
            streams.push(...movie.torrents.map((t: any) => ({
              title: `${title} ${t.quality}`,
              infoHash: t.hash,
              size: t.size_bytes,
              seeds: t.seeds,
              peers: t.peers,
              quality: t.quality
            })));
          }
          continue;
        }

        // Handle Torrentio API response
        if (endpoint.includes('torrentio')) {
          if (Array.isArray(response.streams)) {
            streams.push(...response.streams.map((s: any) => ({
              title: s.title,
              infoHash: s.infoHash,
              size: s.filesize,
              seeds: s.seeders,
              peers: s.peers,
              quality: s.quality || this.getQualityFromTitle(s.title)
            })));
          }
          continue;
        }

        // Handle TMDB external IDs
        if (endpoint.includes('external_ids')) {
          if (response.imdb_id) {
            // Use IMDB ID for other endpoints
            const torrentioEndpoint = endpoint.includes('movie') 
              ? `https://torrentio.strem.fun/stream/movie/${response.imdb_id}.json`
              : `https://torrentio.strem.fun/stream/series/${response.imdb_id}.json`;
            
            const torrentioHeaders = this.getEndpointHeaders(torrentioEndpoint);
            const torrentioResponse = await fetchWithRetry<any>(torrentioEndpoint, { headers: torrentioHeaders });
            if (torrentioResponse?.streams) {
              streams.push(...torrentioResponse.streams.map((s: any) => ({
                title: s.title,
                infoHash: s.infoHash,
                size: s.filesize,
                seeds: s.seeders,
                peers: s.peers,
                quality: s.quality || this.getQualityFromTitle(s.title)
              })));
            }
          }
          continue;
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error);
      }
    }

    return streams;
  }

  /**
   * Get quality from title
   */
  private getQualityFromTitle(title: string): string {
    const qualityMatch = title.match(/\b(2160p|1080p|720p|480p)\b/i);
    return qualityMatch ? qualityMatch[1].toUpperCase() : '720P';
  }

  /**
   * Create a magnet link from stream data
   */
  protected createMagnetLink(stream: StreamData, title: string): string {
    if (!stream.infoHash) return '';

    const trackers = this.config.trackers || [];
    const trackersString = trackers
      .map(tracker => `&tr=${encodeURIComponent(tracker)}`)
      .join('');

    return `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(title)}${trackersString}`;
  }

  /**
   * Process stream size
   */
  protected processStreamSize(stream: StreamData, title: string): string {
    const size = getSizeFromTitle(title) || stream.size || 'Unknown';
    return typeof size === 'string' ? size : formatBytes(Number(size));
  }

  /**
   * Process stream quality
   */
  protected processQuality(quality: string): string {
    return quality.toUpperCase();
  }

  /**
   * Get cached data
   */
  protected getCachedData<T>(key: string): T | null {
    const cached = this.dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  /**
   * Set cached data
   */
  protected setCachedData<T>(key: string, data: T): void {
    this.dataCache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}

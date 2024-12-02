import { MediaProcessorConfig, TVSeriesDetails, TVEpisode, SeasonInfo, StreamData, TorrentInfo } from '../../types/torrent';
import { StreamProcessor } from './streamProcessor';
import { fetchWithRetry } from '../helpers';
import { extractEpisodeInfo, getQualityFromTitle, getSizeFromTitle, formatBytes } from '../helpers';

export class TVProcessor extends StreamProcessor {
  constructor(config: MediaProcessorConfig) {
    super(config);
  }

  /**
   * Find TV series streams with enhanced metadata
   */
  private async findTVSeriesStreams(
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
      
      // Always try secondary endpoints to get more qualities and seasons
      console.log('Trying secondary endpoints for:', title);
      const secondaryStreams = await this.fetchStreamsByPriority(secondary, title);
      streams = [...streams, ...secondaryStreams];

      // If we're missing seasons, try fallback endpoints
      const uniqueSeasons = new Set(streams.map(s => {
        const info = extractEpisodeInfo(s.title || '');
        return info.season;
      }).filter(Boolean));

      console.log('Found seasons:', Array.from(uniqueSeasons));

      // Get expected season count from TMDB
      try {
        const tmdbResponse = await fetchWithRetry<{ number_of_seasons: number }>(
          `https://api.themoviedb.org/3/tv/${tmdbId}`,
          {
            params: {
              api_key: this.config.tmdbApiKey
            }
          }
        );
        
        const expectedSeasons = tmdbResponse?.number_of_seasons || 0;
        console.log('Expected seasons:', expectedSeasons);
        
        // If we're missing seasons, try fallback endpoints
        if (expectedSeasons > uniqueSeasons.size) {
          console.log('Missing seasons, trying fallback endpoints for:', title);
          const fallbackStreams = await this.fetchStreamsByPriority(fallback, title);
          streams = [...streams, ...fallbackStreams];
        }
      } catch (error) {
        console.error('Error checking TMDB seasons:', error);
      }

      // Deduplicate streams but preserve different qualities
      const uniqueStreams = new Map<string, StreamData[]>();
      
      streams.forEach(stream => {
        if (!stream?.title || !stream.infoHash) return;
        
        const { season, episode } = extractEpisodeInfo(stream.title);
        if (!season || !episode) return;
        
        const key = `S${season}E${episode}`;
        const quality = getQualityFromTitle(stream.title, stream);
        
        if (!uniqueStreams.has(key)) {
          uniqueStreams.set(key, []);
        }
        
        const episodeStreams = uniqueStreams.get(key)!;
        const existingQuality = episodeStreams.find(s => 
          getQualityFromTitle(s.title || '', s) === quality
        );
        
        // If we don't have this quality yet, or if this one has more seeds
        if (!existingQuality || (stream.seeds || 0) > (existingQuality.seeds || 0)) {
          // Remove existing stream with same quality if any
          const filteredStreams = episodeStreams.filter(s => 
            getQualityFromTitle(s.title || '', s) !== quality
          );
          // Add the new stream
          uniqueStreams.set(key, [...filteredStreams, stream]);
        }
      });

      // Flatten and sort the streams
      const finalStreams = Array.from(uniqueStreams.values())
        .flat()
        .sort((a, b) => {
          // First by season/episode
          const aInfo = extractEpisodeInfo(a.title || '');
          const bInfo = extractEpisodeInfo(b.title || '');
          if (aInfo.season !== bInfo.season) {
            return aInfo.season! - bInfo.season!;
          }
          if (aInfo.episode !== bInfo.episode) {
            return aInfo.episode! - bInfo.episode!;
          }
          // Then by quality
          const aQuality = getQualityFromTitle(a.title || '', a);
          const bQuality = getQualityFromTitle(b.title || '', b);
          return bQuality.localeCompare(aQuality); // Higher quality first
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
      console.error('Error finding TV series streams:', error);
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
   * Fetch TV series data from TMDB and process streams
   */
  public async fetchTVSeriesData(
    tmdbId: number,
    title: string
  ): Promise<TVSeriesDetails | null> {
    if (!tmdbId || !title) {
      console.error('TMDB ID and title are required');
      return null;
    }

    try {
      // Check cache first
      const cacheKey = `tv-${tmdbId}`;
      const cachedData = this.getCachedData<TVSeriesDetails>(cacheKey);
      if (cachedData) {
        console.log('Using cached TV series data');
        return cachedData;
      }

      // Get TMDB seasons data first
      const tmdbSeriesData = await fetchWithRetry<{ seasons: SeasonInfo[] }>(
        `https://api.themoviedb.org/3/tv/${tmdbId}?api_key=${this.config.tmdbApiKey}`
      );

      if (!tmdbSeriesData?.seasons?.length) {
        console.error('No seasons data found in TMDB for TV series:', title);
        return null;
      }

      // Get IMDB ID from TMDB
      const imdbData = await fetchWithRetry<{ external_ids: { imdb_id: string } }>(
        `https://api.themoviedb.org/3/tv/${tmdbId}/external_ids?api_key=${this.config.tmdbApiKey}`
      );

      const imdbId = imdbData?.external_ids?.imdb_id;

      // Find streams for the series
      const streams = await this.findTVSeriesStreams(title, tmdbId, imdbId);
      if (!streams) {
        console.log('No streams found for TV series:', title);
        return null;
      }

      const processedEpisodes: TVEpisode[] = [];
      const seasonsSet = new Set<number>();
      const processedMagnets = new Set<string>();

      // Process streams more efficiently
      streams.forEach((stream: StreamData) => {
        if (!stream?.title) return;

        const { season, episode } = extractEpisodeInfo(stream.title);
        if (!season || !episode) {
          console.log('Could not extract season/episode from:', stream.title);
          return;
        }

        seasonsSet.add(season);

        const magnetLink = this.createMagnetLink(stream, stream.title);
        if (!magnetLink || processedMagnets.has(magnetLink)) {
          console.log('Skipping duplicate or invalid magnet:', stream.title);
          return;
        }

        // Find existing episode or create new one
        let episodeEntry = processedEpisodes.find(
          e => e.season === season && e.episode === episode
        );

        if (!episodeEntry) {
          episodeEntry = {
            title: `${title} S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`,
            season,
            episode,
            torrents: [],
            url: magnetLink,
            magnet: magnetLink,
            hash: stream.infoHash || '',
            size: this.processStreamSize(stream, stream.title),
            seeds: typeof stream.seeds === 'number' ? stream.seeds : 0,
            peers: typeof stream.peers === 'number' ? stream.peers : 0,
            quality: this.processQuality(getQualityFromTitle(stream.title, stream))
          };
          processedEpisodes.push(episodeEntry);
        }

        // Add torrent to episode
        const torrentInfo = this.processStreamData(stream, stream.title);
        episodeEntry.torrents.push(torrentInfo);

        // Sort torrents by seeds and quality
        episodeEntry.torrents.sort((a, b) => {
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

        // Update episode with best torrent's info
        const bestTorrent = episodeEntry.torrents[0];
        episodeEntry.quality = bestTorrent.quality;
        episodeEntry.size = bestTorrent.size;
        episodeEntry.seeds = bestTorrent.seeds;
        episodeEntry.peers = bestTorrent.peers;
        episodeEntry.url = bestTorrent.url;
        episodeEntry.magnet = bestTorrent.magnet;
        episodeEntry.hash = bestTorrent.hash;

        console.log(`Processed episode S${season}E${episode}:`, {
          title: stream.title,
          quality: bestTorrent.quality,
          size: bestTorrent.size,
          seeds: bestTorrent.seeds,
          peers: bestTorrent.peers
        });
      });

      // Create seasons array from TMDB data and available episodes
      const seasons = tmdbSeriesData.seasons
        .filter((s: SeasonInfo) => s.season_number > 0)
        .map((s: SeasonInfo) => {
          const seasonEpisodes = processedEpisodes.filter(e => e.season === s.season_number);
          return {
            season: s.season_number,
            name: s.name,
            episode_count: s.episode_count,
            available_episodes: seasonEpisodes.length,
            air_date: s.air_date,
            overview: s.overview
          };
        })
        .filter(s => s.available_episodes > 0)
        .sort((a, b) => a.season - b.season);

      const result: TVSeriesDetails = {
        tmdb_id: tmdbId,
        title,
        seasons,
        episodes: processedEpisodes,
      };

      // Cache the result
      this.setCachedData(cacheKey, result);

      return result;
    } catch (error) {
      console.error('Error fetching TV series data:', error);
      return null;
    }
  }
}

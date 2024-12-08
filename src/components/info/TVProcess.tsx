import { useEffect, useState, useMemo } from "react";
import { Movie } from "../../utils/requests";
import { FaDownload } from "react-icons/fa";
import Pagination from '../common/Pagination';

interface TVProcessProps {
  content: Movie | null;
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

interface Episode {
  title: string;
  season: number;
  episode: number;
  quality: string;
  size: string;
  hash: string;
  source?: string;
  seeders?: number;
  trustScore: number;
  releaseDate?: string;
  releaseYear?: number;
  description?: string;
  downloadCount?: number;
  uploadDate?: string;
  uploader?: string;
  language?: string;
}

interface TorrentResponse {
  streams: {
    title: string;
    infoHash: string;
    fileIdx?: number;
    size?: number;
    source?: string;
  }[];
}

export const TVProcess = ({
  content,
  selectedSeason,
  setSelectedSeason,
  selectedQuality,
  setSelectedQuality,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: TVProcessProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [expandedEpisodes, setExpandedEpisodes] = useState<number[]>([]);

  const fetchFromEndpoint = async (endpoint: string, imdbId: string) => {
    try {
      // Use a more reliable CORS proxy
      const proxyUrl = 'https://corsproxy.io/?';
      const targetUrl = endpoint.replace('{imdbId}', imdbId);
      
      // Skip proxy for TMDB and Torrentio as they already support CORS
      const needsProxy = targetUrl.includes('eztv.re') || 
                        targetUrl.includes('yts.mx');
      
      const finalUrl = needsProxy ? `${proxyUrl}${encodeURIComponent(targetUrl)}` : targetUrl;
      
      const response = await fetch(finalUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      
      if (!response.ok) return null;
      
      const data = await response.json();
      
      // Handle different API response formats
      if (data.streams) return data.streams;
      if (data.data?.movies) return data.data.movies;
      if (data.torrents) return data.torrents;
      if (Array.isArray(data)) return data;
      
      return [];
    } catch (error) {
      console.warn(`Failed to fetch from ${endpoint}:`, error);
      return null;
    }
  };

  const normalizeTitle = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]/g, '');
  };

  const calculateTrustScore = (stream: any, content: Movie | null): number => {
    let score = 0;
    const maxScore = 100;
    
    // Title Matching (25%)
    const titleScore = (() => {
      let points = 0;
      const normalizedStreamTitle = normalizeTitle(stream.title || '');
      const normalizedContentTitle = normalizeTitle(content?.name || content?.title || '');
      
      // Exact title match
      if (normalizedStreamTitle.includes(normalizedContentTitle)) points += 15;
      
      // Season and episode number format
      if (stream.title?.match(/S\d{2}E\d{2}/i)) points += 5;
      
      // Release group mentioned
      if (stream.title?.match(/\b(RARBG|SPARKS|AMIABLE|GECKOS|FUM|ION10)\b/i)) points += 5;
      
      return Math.min(points, 25);
    })();
    score += titleScore;

    // Source and Seeders (25%)
    const sourceScore = (() => {
      let points = 0;
      
      // Source reputation
      if (stream.source?.includes('torrentio.strem.fun')) points += 10;
      else if (stream.source?.includes('yts.mx')) points += 8;
      else if (stream.source?.includes('eztv.re')) points += 8;
      
      // Seeders count
      if (stream.seeders) {
        if (stream.seeders > 1000) points += 15;
        else if (stream.seeders > 500) points += 12;
        else if (stream.seeders > 100) points += 10;
        else if (stream.seeders > 50) points += 8;
        else if (stream.seeders > 10) points += 5;
      }
      
      return Math.min(points, 25);
    })();
    score += sourceScore;

    // Quality and Size (25%)
    const qualityScore = (() => {
      let points = 0;
      
      // Video quality
      const qualityMatch = stream.title?.match(/\b(4K|2160p|1080p|720p|480p|HDRip|BRRip|BluRay|WEB-DL|WEBDL|WEB)\b/i);
      if (qualityMatch) {
        const quality = qualityMatch[1].toLowerCase();
        if (quality === '4k' || quality === '2160p' || quality === 'bluray') points += 10;
        else if (quality === '1080p' || quality === 'web-dl' || quality === 'webdl') points += 8;
        else if (quality === '720p' || quality === 'brrip') points += 6;
      }
      
      // Audio quality
      if (stream.title?.match(/\b(DTS|DD5\.1|Atmos|TrueHD|AAC)\b/i)) points += 5;
      
      // File size
      const sizeInGB = stream.size ? stream.size / (1024 * 1024 * 1024) : 0;
      if (sizeInGB >= 1 && sizeInGB <= 8) points += 10;
      else if (sizeInGB > 0.5 && sizeInGB <= 15) points += 8;
      else if (sizeInGB > 0.1 && sizeInGB <= 20) points += 5;
      
      return Math.min(points, 25);
    })();
    score += qualityScore;

    // Additional Metadata (25%)
    const metadataScore = (() => {
      let points = 0;
      
      // Release year match
      const yearMatch = stream.title?.match(/\b(19|20)\d{2}\b/);
      if (yearMatch && content?.first_air_date) {
        const releaseYear = parseInt(yearMatch[0]);
        const contentYear = new Date(content.first_air_date).getFullYear();
        if (releaseYear === contentYear) points += 8;
      }
      
      // Language indicators
      if (stream.title?.match(/\b(Multi|DUAL|MULTI)\b/i)) points += 4;
      
      // Additional features
      if (stream.title?.match(/\b(HDR|10bit|HEVC|x265)\b/i)) points += 5;
      
      // Download count/popularity
      if (stream.downloadCount) {
        if (stream.downloadCount > 10000) points += 8;
        else if (stream.downloadCount > 1000) points += 5;
        else if (stream.downloadCount > 100) points += 3;
      }
      
      return Math.min(points, 25);
    })();
    score += metadataScore;

    return Math.min(score, maxScore);
  };

  const extractSeasonEpisode = (title: string): { season: number | null; episode: number | null } => {
    const patterns = [
      // Standard S01E01 format
      /\bS(\d{1,2})[\s.-]*E(\d{1,2})\b/i,
      
      // Season 1 Episode 1 format
      /\bSeason[\s.-]*(\d{1,2})[\s.-]*Episode[\s.-]*(\d{1,2})\b/i,
      
      // 1x01 format
      /\b(\d{1,2})x(\d{2})\b/i,
      
      // S01.E01 format
      /\bS(\d{1,2})\.E(\d{1,2})\b/i,
      
      // [1.01] format
      /\[(\d{1,2})\.(\d{2})\]/i,
      
      // Season 1 - 01 format
      /Season[\s.-]*(\d{1,2})[\s.-]+(\d{2})\b/i,
      
      // SE 1-01 format
      /SE[\s.-]*(\d{1,2})[\s.-]*(\d{2})\b/i,
      
      // 101, 102 format (only for clear TV show titles)
      /\b(\d)(\d{2})\b/
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        // For the last pattern (101 format), we need special handling
        if (pattern === patterns[patterns.length - 1]) {
          // Only use this pattern if we're confident it's actually season/episode
          // and not just a random number
          if (title.toLowerCase().includes('episode') || 
              title.toLowerCase().includes('season') ||
              /\b(tv|series|show)\b/i.test(title)) {
            return {
              season: parseInt(match[1]),
              episode: parseInt(match[2])
            };
          }
          continue;
        }
        return {
          season: parseInt(match[1]),
          episode: parseInt(match[2])
        };
      }
    }

    // Fallback patterns for season-only or episode-only matches
    const seasonOnlyPatterns = [
      /\bS(\d{1,2})\b/i,
      /\bSeason[\s.-]*(\d{1,2})\b/i,
      /\bSeries[\s.-]*(\d{1,2})\b/i
    ];

    const episodeOnlyPatterns = [
      /\bE(\d{1,2})\b/i,
      /\bEp(\d{1,2})\b/i,
      /\bEpisode[\s.-]*(\d{1,2})\b/i
    ];

    // Try to find season number
    let season: number | null = null;
    for (const pattern of seasonOnlyPatterns) {
      const match = title.match(pattern);
      if (match) {
        season = parseInt(match[1]);
        break;
      }
    }

    // Try to find episode number
    let episode: number | null = null;
    for (const pattern of episodeOnlyPatterns) {
      const match = title.match(pattern);
      if (match) {
        episode = parseInt(match[1]);
        break;
      }
    }

    return { season, episode };
  };

  const validateSeasonEpisode = (
    season: number | null, 
    episode: number | null, 
    content: Movie | null
  ): boolean => {
    if (!season || !episode) return false;

    // Basic range validation
    if (season < 1 || season > 100) return false;
    if (episode < 1 || episode > 100) return false;

    // If we have content info, validate against it
    if (content?.number_of_seasons) {
      if (season > content.number_of_seasons) return false;
    }

    if (content?.seasons) {
      const seasonInfo = content.seasons.find(s => s.season_number === season);
      if (seasonInfo?.episode_count && episode > seasonInfo.episode_count) {
        return false;
      }
    }

    return true;
  };

  useEffect(() => {
    const fetchTVSeries = async () => {
      if (!content?.id) {
        setError("No content ID found");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // First fetch IMDB ID
        const imdbResponse = await fetch(
          `https://api.themoviedb.org/3/${content.media_type || 'tv'}/${content.id}/external_ids?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );

        if (!imdbResponse.ok) {
          throw new Error('Failed to fetch IMDB ID');
        }

        const imdbData = await imdbResponse.json();
        const imdbId = imdbData.imdb_id;

        if (!imdbId) {
          throw new Error("IMDB ID not found");
        }

        // List of endpoints to try (removed problematic IMDB endpoint)
        const endpoints = [
          'https://torrentio.strem.fun/stream/series/{imdbId}.json',
          'https://torrentio.strem.fun/stream/movie/{imdbId}.json',
          'https://yts.mx/api/v2/movie_details.json?imdb_id={imdbId}',
          'https://eztv.re/api/get-torrents?imdb_id={imdbId}'
        ];

        let allStreams: any[] = [];
        let hasValidResponse = false;

        // Try all endpoints in parallel
        const streamResponses = await Promise.all(
          endpoints.map(endpoint => fetchFromEndpoint(endpoint, imdbId))
        );

        streamResponses.forEach((streams, index) => {
          if (streams) {
            hasValidResponse = true;
            const source = new URL(endpoints[index]).hostname;
            allStreams = [...allStreams, ...streams.map((s: any) => ({
              ...s,
              source
            }))];
          }
        });

        // If no streams found, try searching by title
        if (!hasValidResponse || allStreams.length === 0) {
          const searchEndpoints = [
            `https://torrentio.strem.fun/providers=torrentio/stream/series/${encodeURIComponent(content.name || content.title || '')}.json`,
            `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(content.name || content.title || '')}`
          ];

          const searchResponses = await Promise.all(
            searchEndpoints.map(endpoint => fetchFromEndpoint(endpoint, imdbId))
          );

          searchResponses.forEach((streams, index) => {
            if (streams) {
              hasValidResponse = true;
              const source = new URL(searchEndpoints[index]).hostname;
              allStreams = [...allStreams, ...streams.map((s: any) => ({
                ...s,
                source
              }))];
            }
          });
        }

        if (!hasValidResponse || allStreams.length === 0) {
          setError("No episodes found from any source");
          return;
        }

        const normalizedContentTitle = normalizeTitle(content.name || content.title || '');

        const processedEpisodes = allStreams
          .map((stream) => {
            const title = stream.title || '';
            const normalizedStreamTitle = normalizeTitle(title);
            
            // Skip if titles don't match at all
            if (!normalizedStreamTitle.includes(normalizedContentTitle) && 
                !normalizedContentTitle.includes(normalizedStreamTitle)) {
              return null;
            }

            // Extract season and episode numbers
            const { season, episode } = extractSeasonEpisode(title);
            
            // Validate season and episode numbers
            if (!validateSeasonEpisode(season, episode, content)) {
              return null;
            }

            const qualityMatch = title.match(/\b(4K|2160p|1080p|720p|480p|HDRip|BRRip|BluRay|WEB-DL|WEBDL|WEB)\b/i);
            const quality = qualityMatch ? qualityMatch[1].toUpperCase() : 'Unknown';

            const sizeInMB = stream.size
              ? Math.round(stream.size / (1024 * 1024))
              : 0;
            const sizeStr = sizeInMB > 1024
              ? `${(sizeInMB / 1024).toFixed(2)} GB`
              : `${sizeInMB} MB`;

            return {
              title,
              season,
              episode,
              quality,
              size: sizeStr,
              hash: stream.infoHash || stream.hash,
              source: stream.source,
              seeders: stream.seeders,
              trustScore: calculateTrustScore(stream, content),
              releaseDate: stream.releaseDate,
              releaseYear: stream.releaseYear,
              description: stream.description,
              downloadCount: stream.downloadCount,
              uploadDate: stream.uploadDate,
              uploader: stream.uploader,
              language: stream.language
            };
          })
          .filter((ep): ep is Episode => 
            ep !== null && 
            typeof ep.season === 'number' && 
            typeof ep.episode === 'number'
          );

        if (processedEpisodes.length === 0) {
          if (searchAttempts < 2) {
            setSearchAttempts(prev => prev + 1);
            return; // Will trigger another search attempt
          }
          setError("No valid episodes found");
          return;
        }

        // Sort episodes by season and episode number
        processedEpisodes.sort((a, b) => {
          if (a.season !== b.season) return a.season - b.season;
          return a.episode - b.episode;
        });

        setEpisodes(processedEpisodes);

        // Set initial season if not already set
        if (!selectedSeason) {
          const seasons = [...new Set(processedEpisodes.map(ep => ep.season))];
          if (seasons.length > 0) {
            setSelectedSeason(Math.min(...seasons));
          }
        }
      } catch (err) {
        console.error("Error fetching TV series:", err);
        setError(`Failed to fetch episodes: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTVSeries();
  }, [content?.id, content?.name, content?.title, selectedSeason, setSelectedSeason, searchAttempts]);

  const handleDownload = (episode: Episode) => {
    if (!episode.hash) {
      console.error("No hash found for episode");
      return;
    }

    const trackers = [
      "udp://open.demonii.com:1337/announce",
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.coppersurfer.tk:6969",
      "udp://glotorrents.pw:6969/announce",
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://torrent.gresille.org:80/announce",
      "udp://p4p.arenabg.com:1337",
      "udp://tracker.leechers-paradise.org:6969",
    ];

    const magnetLink = `magnet:?xt=urn:btih:${
      episode.hash
    }&dn=${encodeURIComponent(episode.title)}&${trackers
      .map((t) => `tr=${encodeURIComponent(t)}`)
      .join("&")}`;

    const a = document.createElement("a");
    a.href = magnetLink;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const getAvailableSeasons = () => {
    const seasons = new Set(episodes.map((ep) => ep.season));
    return Array.from(seasons).sort((a, b) => a - b);
  };

  const getAvailableQualities = () => {
    const qualities = new Set(episodes.map((ep) => ep.quality));
    return Array.from(qualities).sort();
  };

  const filteredEpisodes = episodes
    .filter((ep) => ep.season === selectedSeason)
    .filter(
      (ep) => selectedQuality === "All" || ep.quality === selectedQuality
    )
    .sort((a, b) => a.episode - b.episode);

  const groupedEpisodes = useMemo(() => {
    const groups: { [key: number]: any[] } = {};
    filteredEpisodes.forEach(episode => {
      const epNum = episode.episode || 0;
      if (!groups[epNum]) {
        groups[epNum] = [];
      }
      groups[epNum].push(episode);
    });
    return groups;
  }, [filteredEpisodes]);

  const getQualityGroups = (episodes: any[]) => {
    const groups: { [key: string]: any[] } = {
      '4K': [],
      '1080p': [],
      '720p': [],
      'Other': []
    };

    episodes.forEach(episode => {
      if (episode.quality?.includes('4k') || episode.quality?.includes('2160p')) {
        groups['4K'].push(episode);
      } else if (episode.quality?.includes('1080')) {
        groups['1080p'].push(episode);
      } else if (episode.quality?.includes('720')) {
        groups['720p'].push(episode);
      } else {
        groups['Other'].push(episode);
      }
    });

    return Object.entries(groups).filter(([_, episodes]) => episodes.length > 0);
  };

  const toggleExpanded = (episodeNum: number) => {
    setExpandedEpisodes(prev => 
      prev.includes(episodeNum) 
        ? prev.filter(num => num !== episodeNum)
        : [...prev, episodeNum]
    );
  };

  const getCurrentItems = (items: Episode[]): Episode[] => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  const paginatedEpisodes = useMemo(() => {
    const episodeEntries = Object.entries(groupedEpisodes);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return Object.fromEntries(episodeEntries.slice(startIndex, endIndex));
  }, [groupedEpisodes, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason, selectedQuality]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {isLoading ? (
        <div className="flex justify-center items-center p-4">
          <div className="w-5 h-5 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-red-400 p-3 text-sm text-center">{error}</div>
      ) : (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex gap-2 mb-4">
            <select
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(Number(e.target.value))}
              className="bg-gray-800/50 text-gray-200 text-sm rounded px-3 py-1.5 border border-gray-700/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
            >
              {getAvailableSeasons().map((season) => (
                <option key={season} value={season}>S{String(season).padStart(2, '0')}</option>
              ))}
            </select>
            <select
              value={selectedQuality}
              onChange={(e) => setSelectedQuality(e.target.value)}
              className="bg-gray-800/50 text-gray-200 text-sm rounded px-3 py-1.5 border border-gray-700/50 focus:ring-1 focus:ring-blue-500/50 outline-none"
            >
              <option value="All">All Qualities</option>
              {getAvailableQualities().map((quality) => (
                <option key={quality} value={quality}>{quality}</option>
              ))}
            </select>
          </div>

          {/* Episodes List */}
          <div className="space-y-2">
            {Object.entries(paginatedEpisodes).map(([episodeNum, episodes]) => (
              <div
                key={episodeNum}
                className="bg-gray-800/50 rounded-lg overflow-hidden"
              >
                {/* Episode Header */}
                <div
                  onClick={() => toggleExpanded(Number(episodeNum))}
                  className="flex items-center px-4 py-3 cursor-pointer hover:bg-gray-700/50 transition-colors"
                >
                  {/* Episode Number */}
                  <div className="w-12 text-center">
                    <span className="text-lg font-semibold text-gray-300">
                      {String(episodeNum).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Episode Info */}
                  <div className="flex-grow px-4">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-gray-400">{episodes.length} version{episodes.length !== 1 ? 's' : ''}</span>
                      <div className="flex gap-1">
                        {getQualityGroups(episodes).map(([quality]) => (
                          <span
                            key={quality}
                            className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium ${
                              quality === '4K' ? 'bg-purple-500/10 text-purple-400' :
                              quality === '1080p' ? 'bg-green-500/10 text-green-400' :
                              quality === '720p' ? 'bg-blue-500/10 text-blue-400' :
                              'bg-gray-500/10 text-gray-400'
                            }`}
                          >
                            {quality}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Expand Icon */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      expandedEpisodes.includes(Number(episodeNum)) ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {/* Expanded Content */}
                {expandedEpisodes.includes(Number(episodeNum)) && (
                  <div className="border-t border-gray-700/50 divide-y divide-gray-700/50">
                    {getQualityGroups(episodes).map(([quality, qualityEpisodes]) => (
                      <div key={quality} className="px-4 py-2">
                        <div className="flex items-center gap-2 py-1 text-xs text-gray-400">
                          <span className={`px-1.5 py-0.5 rounded font-medium ${
                            quality === '4K' ? 'bg-purple-500/10 text-purple-400' :
                            quality === '1080p' ? 'bg-green-500/10 text-green-400' :
                            quality === '720p' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-gray-500/10 text-gray-400'
                          }`}>
                            {quality}
                          </span>
                          <span>·</span>
                          <span>{qualityEpisodes.length} version{qualityEpisodes.length !== 1 ? 's' : ''}</span>
                        </div>

                        <div className="space-y-1 mt-1">
                          {qualityEpisodes.map((episode: any, index: number) => (
                            <div
                              key={index}
                              className="flex flex-col gap-2 p-2 rounded hover:bg-gray-700/30 transition-colors group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 min-w-0 text-xs">
                                  <span className="text-gray-300">
                                    {episode.size}
                                  </span>
                                  <span className="text-gray-500">·</span>
                                  <span className="text-gray-400 truncate">{episode.source || 'Unknown Source'}</span>
                                  <span className="text-gray-500">·</span>
                                  <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-medium ${
                                    episode.trustScore >= 80 ? 'bg-green-500/10 text-green-400' :
                                    episode.trustScore >= 60 ? 'bg-blue-500/10 text-blue-400' :
                                    episode.trustScore >= 40 ? 'bg-yellow-500/10 text-yellow-400' :
                                    'bg-red-500/10 text-red-400'
                                  }`}>
                                    {episode.trustScore}% trusted
                                  </span>
                                  {episode.seeders && (
                                    <>
                                      <span className="text-gray-500">·</span>
                                      <span className="text-gray-400">{episode.seeders} seeders</span>
                                    </>
                                  )}
                                  {episode.uploadDate && (
                                    <>
                                      <span className="text-gray-500">·</span>
                                      <span className="text-gray-400">{new Date(episode.uploadDate).toLocaleDateString()}</span>
                                    </>
                                  )}
                                  {episode.language && (
                                    <>
                                      <span className="text-gray-500">·</span>
                                      <span className="text-gray-400">{episode.language}</span>
                                    </>
                                  )}
                                </div>

                                <button
                                  onClick={() => handleDownload(episode)}
                                  className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-blue-400 hover:bg-blue-500/10 transition-colors"
                                >
                                  <svg
                                    className="w-3.5 h-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                    />
                                  </svg>
                                  <span>Download</span>
                                </button>
                              </div>

                              {/* Additional Details */}
                              <div className="text-xs text-gray-500">
                                <div className="line-clamp-2">{episode.title}</div>
                                {episode.description && (
                                  <div className="mt-1 text-gray-400 line-clamp-2">{episode.description}</div>
                                )}
                                {episode.uploader && (
                                  <div className="mt-1">
                                    <span className="text-gray-400">Uploaded by: </span>
                                    <span className="text-gray-300">{episode.uploader}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pagination */}
          {Object.keys(groupedEpisodes).length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalItems={Object.keys(groupedEpisodes).length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          )}

          {/* No Results */}
          {Object.keys(groupedEpisodes).length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="text-sm text-gray-400">
                No episodes found. Try adjusting your filters.
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

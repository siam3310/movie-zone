import React, { useState, useMemo, useCallback } from 'react';
import { MovieDetails, TVSeriesDetails, TVEpisode } from '../types/torrent';
import { FaChevronDown, FaSeedling, FaUsers } from 'react-icons/fa';
import { getQualityColor } from '../utils/qualityHelper';
import TorrentRow from './TorrentRow';
import Pagination from './Pagination';

interface DownloadSectionProps {
  type: 'movie' | 'tv';
  content: MovieDetails | TVSeriesDetails | null;
}

interface ContentData {
  seasons: TVSeriesDetails['seasons'];
  episodes: TVEpisode[];
  torrents: any[];
}

interface SeasonInfo {
  episodeCount: number;
  isActive: boolean;
  isUpcoming: boolean;
  hasNoEpisodes: boolean;
  progress: number;
}

const ITEMS_PER_PAGE = 5;

const DownloadSection: React.FC<DownloadSectionProps> = ({ type, content }) => {
  if (!content) return null;

  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [expandedEpisode, setExpandedEpisode] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Memoize content data
  const { seasons, episodes, torrents } = useMemo<ContentData>(() => {
    if (type === 'tv') {
      return {
        seasons: (content as TVSeriesDetails).seasons || [],
        episodes: (content as TVSeriesDetails).episodes || [],
        torrents: []
      };
    }
    return {
      seasons: [],
      episodes: [],
      torrents: 'torrents' in content ? content.torrents : []
    };
  }, [content, type]);

  // Memoize episode grouping
  const groupedEpisodes = useMemo(() => {
    if (type !== 'tv') return {};
    
    return episodes.reduce<Record<string, TVEpisode[]>>((acc, episode) => {
      if (!episode.season || !episode.episode) return acc;
      const key = `${episode.season}-${episode.episode}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(episode);
      return acc;
    }, {});
  }, [episodes, type]);

  // Memoize current season episodes
  const currentSeasonEpisodes = useMemo(() => {
    if (type !== 'tv') return [];
    
    return Object.entries(groupedEpisodes)
      .filter(([key]) => {
        const [season] = key.split('-').map(Number);
        return season === selectedSeason;
      })
      .sort((a, b) => {
        const [, aEp] = a[0].split('-').map(Number);
        const [, bEp] = b[0].split('-').map(Number);
        return aEp - bEp;
      });
  }, [groupedEpisodes, selectedSeason, type]);

  // Memoize pagination data
  const { totalPages, currentItems } = useMemo(() => {
    if (type === 'tv') {
      const total = Math.ceil(currentSeasonEpisodes.length / ITEMS_PER_PAGE);
      const items = currentSeasonEpisodes.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );
      return { totalPages: total, currentItems: items };
    }
    
    const total = Math.ceil(torrents.length / ITEMS_PER_PAGE);
    const items = torrents.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
    return { totalPages: total, currentItems: items };
  }, [currentPage, currentSeasonEpisodes, torrents, type]);

  // Callbacks
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    setExpandedEpisode(null);
  }, []);

  const handleSeasonChange = useCallback((season: number) => {
    setSelectedSeason(season);
    setExpandedEpisode(null);
    setCurrentPage(1);
  }, []);

  const handleEpisodeExpand = useCallback((episodeKey: string) => {
    setExpandedEpisode(prev => prev === episodeKey ? null : episodeKey);
  }, []);

  // Helper functions
  const hasNoDownloads = useCallback((): boolean => {
    if (type === 'movie') {
      return !('torrents' in content) || !content.torrents?.length;
    }
    return Object.keys(groupedEpisodes).length === 0;
  }, [content, groupedEpisodes, type]);

  const renderSeasonInfo = useCallback((season: TVSeriesDetails['seasons'][0]): SeasonInfo => {
    const episodeCount = episodes.filter(ep => ep.season === season.season).length;
    return {
      episodeCount,
      isActive: selectedSeason === season.season,
      isUpcoming: new Date(season.air_date) > new Date(),
      hasNoEpisodes: episodeCount === 0,
      progress: (episodeCount / season.episode_count) * 100
    };
  }, [episodes, selectedSeason]);

  if (hasNoDownloads()) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-400">No downloads available at this time.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Season Selector for TV Shows */}
      {type === 'tv' && seasons.length > 0 && (
        <div className="mb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              <span className="">
                Season {selectedSeason}
              </span>
            </h2>
            <div className="text-sm">
              {(() => {
                const currentSeason = seasons.find(s => s.season === selectedSeason);
                if (!currentSeason) return null;
                const episodeCount = episodes.filter(ep => ep.season === selectedSeason).length;
                return (
                  <div className="px-4 py-2 bg-[#1a1a1a] rounded-full font-medium">
                    <span className="text-white/60">{episodeCount}</span>
                    <span className="mx-2 text-white/20">|</span>
                    <span className="text-white">{currentSeason.episode_count} Episodes</span>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Season Grid */}
          <div className="relative">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
              {seasons.map((season) => {
                const { episodeCount, isActive, isUpcoming, hasNoEpisodes, progress } = renderSeasonInfo(season);

                return (
                  <button
                    key={`season-${season.season}`}
                    onClick={() => handleSeasonChange(season.season)}
                    disabled={hasNoEpisodes && isUpcoming}
                    className={`
                      group relative overflow-hidden rounded-xl transition-all duration-300
                      ${isActive
                        ? 'bg-gradient-to-br from-[#1f1f1f] via-[#2a2a2a] to-[#333333] scale-[1.02] shadow-lg shadow-black/40 ring-1 ring-orange-500/20'
                        : hasNoEpisodes
                          ? 'bg-[#1a1a1a]/50 cursor-not-allowed'
                          : 'bg-[#1a1a1a] hover:bg-[#2a2a2a] hover:scale-[1.02]'
                      }
                    `}
                  >
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10">
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
                    </div>

                    {/* Content */}
                    <div className="relative p-4">
                      <div className={`
                        text-3xl font-bold mb-2
                        ${isActive ? 'text-white' : hasNoEpisodes ? 'text-white/30' : 'text-white/80'}
                      `}>
                        {season.season}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-sm">
                          {episodeCount} / {season.episode_count}
                        </div>
                        {hasNoEpisodes && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider bg-yellow-500/20 text-yellow-500">
                            {isUpcoming ? 'Soon' : 'N/A'}
                          </span>
                        )}
                      </div>

                      {/* Progress Bar */}
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300
                            ${isActive
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                              : 'bg-white/20'
                            }
                          `}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Downloads Section */}
      <div className="space-y-4 bg-[#1a1a1a] rounded-xl">
        {type === 'movie' && currentItems.map((torrent, index) => (
          <TorrentRow
            key={`${torrent.hash}-${index}`}
            torrent={torrent}
            type="movie"
            title={content.title}
            year={content.year}
          />
        ))}

        {type === 'tv' && currentItems.map(([key, episodes]) => {
          const [season, episode] = key.split('-').map(Number);
          const isExpanded = expandedEpisode === key;

          return (
            <div key={key} className="bg-[#1a1a1a] rounded-xl overflow-hidden">
              <button
                onClick={() => handleEpisodeExpand(key)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <span className="text-lg font-medium">
                    Episode {episode}
                  </span>
                  <div className="flex items-center gap-2 text-sm text-white/60">
                    <span>{episodes.length} versions</span>
                  </div>
                </div>
                <FaChevronDown
                  className={`transform transition-transform ${
                    isExpanded ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isExpanded && (
                <div className="border-t border-white/10">
                  {episodes.map((episode, index) => (
                    <TorrentRow
                      key={`${episode.hash}-${index}`}
                      torrent={episode}
                      type="tv"
                      title={content.title}
                      season={season}
                      episode={episode.episode}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default React.memo(DownloadSection);

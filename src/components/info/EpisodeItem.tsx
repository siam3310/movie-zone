import React, { useState, useMemo } from 'react';
import { FaPlay, FaDownload, FaMagnet, FaSeedling, FaInfoCircle, FaChevronDown } from 'react-icons/fa';
import { TMDBEpisode } from '../../utils/imdbApi';

interface TorrentInfo {
  infoHash: string;
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  provider: string;
  magnetLink: string;
}

interface EpisodeItemProps {
  episode: TMDBEpisode;
  torrents: TorrentInfo[];
  onDownload?: (torrent: TorrentInfo) => void;
  onExpand?: () => void;
  onWatch?: () => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ episode, torrents = [], onDownload, onExpand, onWatch }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showTorrents, setShowTorrents] = useState(false);
  const bestTorrent = useMemo(() => torrents[0], [torrents]);

  const handleExpand = () => {
    if (!isExpanded && onExpand) {
      onExpand();
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className={`bg-gray-800/40 rounded-lg transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
      {/* Main Episode Header - Always Visible */}
      <div 
        onClick={handleExpand}
        className="flex items-center justify-between cursor-pointer group"
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Episode Number */}
          <div className="w-12 h-12 flex items-center justify-center bg-gray-700/50 rounded-lg">
            <span className="text-lg font-semibold text-gray-300">
              {episode.episode_number}
            </span>
          </div>

          {/* Episode Title & Basic Info */}
          <div className="flex-1">
            <h3 className="text-lg font-medium text-gray-200 group-hover:text-blue-400 transition-colors">
              {episode.name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-400">
              <span>{episode.air_date}</span>
              {episode.vote_average > 0 && (
                <span className="flex items-center">
                  <svg className="w-4 h-4 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {episode.vote_average.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-4" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => {
                const baseUrl = 'https://vidsrc.xyz/embed/tv';
                if (episode.imdb_id) {
                  window.open(`${baseUrl}/${episode.imdb_id}?season=${episode.season_number}&episode=${episode.episode_number}`, '_blank');
                } else {
                  window.open(`${baseUrl}?tmdb=${episode.id}&season=${episode.season_number}&episode=${episode.episode_number}`, '_blank');
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-colors"
            >
              <FaPlay className="w-4 h-4" />
              <span className="hidden sm:inline">Watch Now</span>
            </button>
            {bestTorrent && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload?.(bestTorrent);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
              >
                <FaMagnet className="w-4 h-4" />
                <span className="hidden sm:inline">Download Best</span>
              </button>
            )}
            <div className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
              <FaChevronDown className="w-5 h-5 text-gray-400 group-hover:text-gray-200" />
            </div>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      <div className={`overflow-hidden transition-all duration-300 ${isExpanded ? 'max-h-[1000px] mt-6' : 'max-h-0'}`}>
        <div className="space-y-4">
          {/* Overview */}
          {episode.overview && (
            <div className="p-4 bg-gray-700/30 rounded-lg">
              <p className="text-gray-300 text-sm leading-relaxed">
                {episode.overview}
              </p>
            </div>
          )}

          {/* Download Options */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-300">Download Options</h4>
              {torrents.length > 1 && (
                <button
                  onClick={() => setShowTorrents(!showTorrents)}
                  className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
                >
                  {showTorrents ? 'Hide Options' : 'Show All Options'}
                </button>
              )}
            </div>

            <div className={`space-y-2 transition-all duration-300 ${showTorrents ? 'opacity-100' : 'opacity-0 max-h-0'}`}>
              {torrents.map((torrent, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="px-2 py-1 bg-gray-800/60 rounded text-sm font-medium text-gray-300">
                      {torrent.quality}
                    </span>
                    <span className="text-sm text-gray-400">{torrent.size}</span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center text-sm text-green-400">
                        <FaSeedling className="w-4 h-4 mr-1" />
                        {torrent.seeds}
                      </span>
                      <span className="text-sm text-gray-400">
                        {torrent.peers} peers
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => onDownload?.(torrent)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors text-sm font-medium"
                  >
                    <FaMagnet className="w-4 h-4" />
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpisodeItem;

import React, { useState } from 'react';
import { TMDBEpisode } from '../../utils/imdbApi';
import { FaPlay, FaCalendar, FaStar, FaChevronDown, FaMagnet } from 'react-icons/fa';
import { TorrentInfo } from '../../types/torrent';
import VideoModal from '../common/VideoModal';

interface EpisodeItemProps {
  episode: TMDBEpisode;
  onWatch: () => void;
  torrents?: TorrentInfo[];
  imdbId?: string;
  tmdbId?: string;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ 
  episode, 
  onWatch, 
  torrents = [],
  imdbId,
  tmdbId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleDownload = (magnetLink: string) => {
    window.open(magnetLink);
  };

  const getEmbedUrl = () => {
    if (imdbId) {
      return `https://vidsrc.xyz/embed/tv/${imdbId}/${episode.season_number}-${episode.episode_number}`;
    } else if (tmdbId) {
      return `https://vidsrc.xyz/embed/tv/${tmdbId}/${episode.season_number}-${episode.episode_number}`;
    }
    return '';
  };

  return (
    <>
      <div className="group flex flex-col gap-4 bg-gray-800/40 hover:bg-gray-800/60 
                    border border-gray-700/50 rounded-lg transition-all duration-200">
        {/* Main Episode Info - Always Visible */}
        <div 
          className="flex flex-col sm:flex-row gap-4 p-4 cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {/* Episode Thumbnail */}
          <div className="relative w-full sm:w-48 aspect-video rounded-lg overflow-hidden flex-shrink-0">
            <img
              src={episode.still_path 
                ? `https://image.tmdb.org/t/p/w300${episode.still_path}`
                : 'https://via.placeholder.com/300x169?text=No+Image'}
              alt={episode.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 
                          transition-opacity duration-200 flex items-center justify-center">
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg 
                         transform scale-90 group-hover:scale-100 transition-transform duration-200"
              >
                <FaPlay className="w-4 h-4" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>

          {/* Episode Info */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              {/* Episode Header */}
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium">{episode.name}</h3>
                  <p className="text-sm text-gray-400">
                    Episode {episode.episode_number}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaStar className="w-4 h-4" />
                    <span className="font-medium">{episode.vote_average.toFixed(1)}</span>
                  </div>
                  <FaChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                  />
                </div>
              </div>

              {/* Air Date */}
              <div className="flex items-center gap-2 text-gray-400">
                <FaCalendar className="w-4 h-4" />
                <span className="text-sm">{formatDate(episode.air_date)}</span>
              </div>

              {/* Overview - Truncated when not expanded */}
              <p className={`text-sm text-gray-300 ${isExpanded ? '' : 'line-clamp-2'}`}>
                {episode.overview || 'No overview available.'}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-4 mt-4" onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white 
                         rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                <FaPlay className="w-4 h-4" />
                <span>Watch Now</span>
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {isExpanded && (
          <div className="px-4 pb-4 border-t border-gray-700/50">
            <div className="pt-4 space-y-4">
              <h4 className="text-sm font-medium text-gray-300">Download Options</h4>
              {torrents.length > 0 ? (
                <div className="grid gap-2">
                  {torrents.map((torrent, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg"
                    >
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                            {torrent.quality}
                          </span>
                          <span className="text-sm text-gray-400">{torrent.size}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          Seeds: {torrent.seeds} | Peers: {torrent.peers}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(torrent.magnetLink)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 
                                   rounded transition-colors duration-200"
                        >
                          <FaMagnet className="w-4 h-4" />
                          <span>Magnet</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No download options available.</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isVideoModalOpen}
        onClose={() => setIsVideoModalOpen(false)}
        embedUrl={getEmbedUrl()}
      />
    </>
  );
};

export default EpisodeItem;

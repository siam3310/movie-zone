import React, { useState } from 'react';
import { FaPlay, FaCalendar, FaStar, FaInfoCircle, FaMagnet } from 'react-icons/fa';
import VideoModal from '../common/VideoModal';
import { TMDBEpisode } from '@/types/movie';
import { TorrentInfo } from '@/types/torrent';

interface EpisodeItemProps {
  episode: TMDBEpisode;
  onWatch: () => void;
  torrents?: TorrentInfo[];
  selectedQuality: string;
  imdbId?: string;
  tmdbId?: string;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
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
      <div className="group bg-gray-800/40 hover:bg-gray-800/60 border border-gray-700/50 
                    rounded-lg transition-all duration-200">
        {/* Main Row */}
        <div className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Episode Info */}
            <div className="flex items-center gap-6 flex-1 min-w-0">
              {/* Episode Number and Title */}
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg 
                             bg-gray-700/50 text-gray-300">
                  <span className="text-lg font-medium">{episode.episode_number}</span>
                </div>
                <div>
                  <h3 className="text-base font-medium line-clamp-1">{episode.name}</h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1 text-yellow-400">
                      <FaStar className="w-3.5 h-3.5" />
                      <span className="text-sm">{episode.vote_average.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-400">
                      <FaCalendar className="w-3.5 h-3.5" />
                      <span className="text-sm">{formatDate(episode.air_date)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 
                         text-white rounded-lg transition-colors duration-200"
              >
                <FaPlay className="w-3.5 h-3.5" />
                <span>Watch</span>
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-2 text-gray-400 hover:text-white transition-colors duration-200"
                title="Toggle details"
              >
                <FaInfoCircle className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Expanded Content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-700/50">
              {/* Overview */}
              <p className="text-sm text-gray-300 mb-4">
                {episode.overview || 'No overview available.'}
              </p>

              {/* Download Options */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Download Options</h4>
                {torrents.length > 0 ? (
                  <div className="grid gap-2">
                    {torrents.map((torrent, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-800/60 rounded-lg"
                      >
                        <div className="flex items-center gap-4">
                          <span className="px-2 py-1 text-xs font-medium bg-blue-500/20 text-blue-400 rounded">
                            {torrent.quality}
                          </span>
                          <span className="text-sm text-gray-400">{torrent.size}</span>
                          <span className="text-xs text-gray-500">
                            Seeds: {torrent.seeds} | Peers: {torrent.peers}
                          </span>
                        </div>
                        <button
                          onClick={() => handleDownload(torrent.magnetLink)}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-700 hover:bg-gray-600 
                                   rounded transition-colors duration-200"
                        >
                          <FaMagnet className="w-4 h-4" />
                          <span>Magnet</span>
                        </button>
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

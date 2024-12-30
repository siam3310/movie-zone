import React, { useState } from 'react';
import { FaPlay, FaCalendar, FaStar, FaInfoCircle, FaMagnet, FaSpinner } from 'react-icons/fa';
import { TMDBEpisode } from '@/types/movie';
import { TorrentInfo } from '@/types/torrent';
import { useVideoModal } from '@/context/VideoModalContext';

interface EpisodeItemProps {
  episode: TMDBEpisode;
  onWatch: () => void;
  torrents?: TorrentInfo[];
  selectedQuality: string;
  imdbId?: string;
  tmdbId?: string;
  isLoadingTorrents?: boolean;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({
  episode,
  torrents = [],
  imdbId,
  tmdbId,
  isLoadingTorrents = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { openModal } = useVideoModal();

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

  const getVideoEmbedUrl = () => {
    if (imdbId) {
      return `https://vidsrc.xyz/embed/tv/${imdbId}/${episode.season_number}-${episode.episode_number}`;
    } else if (tmdbId) {
      return `https://vidsrc.xyz/embed/tv/${tmdbId}/${episode.season_number}-${episode.episode_number}`;
    }
    return '';
  };

  const handlePlayClick = () => {
    const embedUrl = getVideoEmbedUrl();
    if (embedUrl) {
      openModal(embedUrl);
    }
  };
  
  return (
    <div className="group bg-slate-900/40 hover:bg-slate-800/40 border border-slate-800/50 
                    rounded-xl transition-all duration-200 shadow-lg hover:shadow-slate-900/20">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-6 flex-1 min-w-0">
            <div className="flex items-center gap-4">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl 
                           bg-gradient-to-br from-violet-600/10 to-indigo-600/10 
                           text-indigo-400 border border-slate-800/50">
                <span className="text-lg font-medium">{episode.episode_number}</span>
              </div>
              <div>
                <h3 className="text-base font-medium text-slate-200 line-clamp-1">{episode.name}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1 text-amber-400">
                    <FaStar className="w-3.5 h-3.5" />
                    <span className="text-sm">{episode.vote_average.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <FaCalendar className="w-3.5 h-3.5" />
                    <span className="text-sm">{formatDate(episode.air_date)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePlayClick}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 
                       hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg transition-all 
                       duration-200 shadow-lg shadow-indigo-500/25"
            >
              <FaPlay className="w-3.5 h-3.5" />
              <span>Watch</span>
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-2 text-slate-400 hover:text-white transition-colors duration-200"
              title="Toggle details"
            >
              <FaInfoCircle className="w-5 h-5" />
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-slate-800/50">
            <p className="text-sm text-slate-300 mb-4">
              {episode.overview || 'No overview available.'}
            </p>

            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-300 mb-2">Download Options</h4>
              {isLoadingTorrents ? (
                <div className="flex items-center gap-2 text-slate-400 py-4">
                  <FaSpinner className="w-4 h-4 animate-spin" />
                  <span>Loading download sources...</span>
                </div>
              ) : torrents.length > 0 ? (
                <div className="grid gap-2">
                  {torrents.map((torrent, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-slate-800/40 
                               rounded-lg border border-slate-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <span className="px-2 py-1 text-xs font-medium bg-violet-500/20 
                                     text-violet-400 rounded">
                          {torrent.quality}
                        </span>
                        <span className="text-sm text-slate-400">{torrent.size}</span>
                        <span className="text-xs text-slate-500">
                          Seeds: {torrent.seeds} | Peers: {torrent.peers}
                        </span>
                      </div>
                      <button
                        onClick={() => handleDownload(torrent.magnetLink)}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm bg-slate-700/50 
                                 hover:bg-slate-700 rounded transition-colors duration-200"
                      >
                        <FaMagnet className="w-4 h-4" />
                        <span>Magnet</span>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-slate-500 py-4 px-3 bg-slate-800/20 rounded-lg border border-slate-800/50">
                  <FaInfoCircle className="w-4 h-4" />
                  <p className="text-sm">No download options available for this episode.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EpisodeItem;

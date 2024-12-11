import React, { useState } from 'react';
import { TMDBEpisode } from '../../utils/imdbApi';
import EpisodeItem from './EpisodeItem';
import LoadingIndicator from '../common/LoadingIndicator';
import { TorrentioResult } from '../../utils/torrentioApi';
import { getStreamingSources, StreamingSource } from '../../utils/streamingApi';
import VideoPlayer from '../common/VideoPlayer';

interface EpisodeListProps {
  episodes: TMDBEpisode[];
  seasonNumber: number;
  imdbId: string;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, seasonNumber, imdbId }) => {
  const [episodeTorrents, setEpisodeTorrents] = useState<{ [key: number]: TorrentioResult[] }>({});
  const [loadingTorrents, setLoadingTorrents] = useState<{ [key: number]: boolean }>({});
  const [streamingSources, setStreamingSources] = useState<StreamingSource[]>([]);
  const [loadingStream, setLoadingStream] = useState(false);

  // Function to load torrents for a specific episode
  const loadTorrentsForEpisode = async (episodeNumber: number) => {
    if (episodeTorrents[episodeNumber] || loadingTorrents[episodeNumber]) return;

    setLoadingTorrents(prev => ({ ...prev, [episodeNumber]: true }));
    try {
      const torrents = await getTVShowTorrents(imdbId, seasonNumber, episodeNumber);
      setEpisodeTorrents(prev => ({ ...prev, [episodeNumber]: torrents }));
    } catch (error) {
      console.error('Error loading torrents for episode:', error);
    } finally {
      setLoadingTorrents(prev => ({ ...prev, [episodeNumber]: false }));
    }
  };

  // Handle stream selection
  const handleWatch = async (episodeNumber: number) => {
    setLoadingStream(true);
    try {
      const sources = await getStreamingSources(imdbId, seasonNumber, episodeNumber);
      if (sources.length > 0) {
        setStreamingSources(sources);
      }
    } catch (error) {
      console.error('Error loading streaming sources:', error);
    } finally {
      setLoadingStream(false);
    }
  };

  // Handle magnet link click
  const handleDownload = (magnetLink: string) => {
    window.location.href = magnetLink;
  };

  if (!episodes || episodes.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-400">No episodes found for this season.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Season Info */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-200">
            Season {seasonNumber}
          </h2>
          <p className="text-sm text-gray-400 mt-1">
            {episodes.length} Episodes
          </p>
        </div>
        
        {/* Season Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              const bestTorrents = episodes.map(ep => {
                const epTorrents = episodeTorrents[ep.episode_number] || [];
                return epTorrents[0];
              }).filter(Boolean);
              
              if (bestTorrents.length > 0) {
                // Download all episodes in best quality
                bestTorrents.forEach(torrent => {
                  if (torrent) handleDownload(torrent.magnetLink);
                });
              }
            }}
            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors text-sm font-medium"
          >
            Download All Episodes (Best Quality)
          </button>
        </div>
      </div>

      {/* Episodes Grid */}
      <div className="grid grid-cols-1 gap-4">
        {episodes.map((episode) => (
          <div key={episode.id}>
            <EpisodeItem
              episode={episode}
              torrents={episodeTorrents[episode.episode_number] || []}
              onDownload={(torrent) => handleDownload(torrent.magnetLink)}
              onExpand={() => loadTorrentsForEpisode(episode.episode_number)}
              onWatch={() => handleWatch(episode.episode_number)}
            />
            {loadingTorrents[episode.episode_number] && (
              <div className="mt-2">
                <LoadingIndicator />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Video Player Modal */}
      {streamingSources.length > 0 && (
        <VideoPlayer
          source={streamingSources[0]}
          allSources={streamingSources}
          onClose={() => setStreamingSources([])}
        />
      )}

      {/* Loading Overlay */}
      {loadingStream && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <LoadingIndicator />
        </div>
      )}
    </div>
  );
};

export default EpisodeList;

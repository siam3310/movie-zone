import { useEffect } from 'react';
import EpisodeItem from './EpisodeItem';
import Pagination from '../common/Pagination';
import { TMDBEpisode } from '@/types/movie';
import { TorrentInfo } from '@/types/torrent';

interface EpisodeListProps {
  episodes: TMDBEpisode[];
  selectedSeason: number;
  onWatch: (episode: TMDBEpisode) => void;
  torrents: { [key: string]: TorrentInfo[] };
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  imdbId?: string;
  tmdbId?: string;
}

const EpisodeList = ({
  episodes,
  selectedSeason,
  onWatch,
  torrents,
  selectedQuality,
  setSelectedQuality,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  imdbId,
  tmdbId
}: EpisodeListProps) => {
  // Reset pagination when season changes
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedSeason, setCurrentPage]);

  const qualities = ['2160p', '1080p', '720p', '480p', 'All'];
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEpisodes = episodes.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Quality Filter */}
      <div className="flex flex-wrap gap-2 p-1">
        {qualities.map((quality) => (
          <button
            key={quality}
            onClick={() => setSelectedQuality(quality)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 
            ${selectedQuality === quality
              ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25 scale-105'
              : 'bg-slate-800/50 text-slate-300 hover:bg-gradient-to-r hover:from-violet-500/20 hover:to-indigo-500/20 hover:text-white border border-violet-500/20'
            }`}
          >
            {quality}
          </button>
        ))}
      </div>

      {/* Episodes Grid */}
      <div className="grid gap-4 sm:grid-cols-1">
        {currentEpisodes.map((episode) => (
          <EpisodeItem
            key={episode.id}
            episode={episode}
            onWatch={() => onWatch(episode)}
            torrents={torrents[`${episode.episode_number}`] || []}
            selectedQuality={selectedQuality}
            imdbId={imdbId}
            tmdbId={tmdbId}
          />
        ))}
      </div>

      {/* Pagination */}
      {episodes.length > itemsPerPage && (
        <Pagination
          currentPage={currentPage}
          totalItems={episodes.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default EpisodeList;

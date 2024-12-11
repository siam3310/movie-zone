import React, { useState } from 'react';
import { TMDBEpisode, TMDBSeason } from '../../utils/imdbApi';
import EpisodeItem from './EpisodeItem';
import { FaChevronDown } from 'react-icons/fa';
import Pagination from '../common/Pagination';
import { TorrentInfo } from '../../types/torrent';

interface EpisodeListProps {
  seasons: TMDBSeason[];
  episodes: TMDBEpisode[];
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
  onWatch: (episode: TMDBEpisode) => void;
  torrents: { [key: string]: TorrentInfo[] };
  imdbId?: string;
  tmdbId?: string;
}

const ITEMS_PER_PAGE = 5;

const EpisodeList: React.FC<EpisodeListProps> = ({
  seasons,
  episodes,
  selectedSeason,
  onSeasonChange,
  onWatch,
  torrents,
  imdbId,
  tmdbId
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  const selectedSeasonData = seasons.find(s => s.season_number === selectedSeason);
  const totalPages = Math.ceil(episodes.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const displayedEpisodes = episodes.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="space-y-6">
      {/* Season Overview */}
      <div className="relative">
        <button
          onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
          className="w-full flex items-center justify-between gap-2 p-4 bg-gray-800/40 
                     hover:bg-gray-800/60 rounded-lg transition-colors duration-200"
        >
          <div>
            <h3 className="text-lg font-medium">Season {selectedSeason}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {selectedSeasonData?.overview || 'No overview available.'}
            </p>
          </div>
          <FaChevronDown className={`w-4 h-4 transform transition-transform duration-200 
                                   ${isSeasonDropdownOpen ? 'rotate-180' : ''}`} />
        </button>

        {/* Season Dropdown */}
        {isSeasonDropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-lg 
                         shadow-lg z-10 max-h-64 overflow-y-auto">
            {seasons.map((season) => (
              <button
                key={season.season_number}
                onClick={() => {
                  onSeasonChange(season.season_number);
                  setIsSeasonDropdownOpen(false);
                  setCurrentPage(1);
                }}
                className={`w-full px-4 py-3 text-left hover:bg-gray-700/50 transition-colors 
                           duration-200 ${selectedSeason === season.season_number ? 'bg-gray-700' : ''}`}
              >
                <h4 className="font-medium">Season {season.season_number}</h4>
                <p className="text-sm text-gray-400 line-clamp-1 mt-1">
                  {season.overview || 'No overview available.'}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Episodes */}
      <div className="space-y-4">
        {displayedEpisodes.map((episode) => (
          <EpisodeItem
            key={episode.episode_number}
            episode={episode}
            onWatch={() => onWatch(episode)}
            torrents={torrents[`${selectedSeason}:${episode.episode_number}`] || []}
            imdbId={imdbId}
            tmdbId={tmdbId}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
};

export default EpisodeList;

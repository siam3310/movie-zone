import React, { useState } from 'react';
import { TorrentItem } from './TorrentItem';
import { TorrentInfo } from '../../types/torrent';
import { FaFilter, FaSort } from 'react-icons/fa';
import Pagination from './Pagination';

interface TorrentListProps {
  torrents: TorrentInfo[];
  currentPage: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onDownload: (torrent: TorrentInfo) => void;
  onMagnetDownload: (torrent: TorrentInfo) => void;
}

export const TorrentList: React.FC<TorrentListProps> = ({
  torrents,
  currentPage,
  itemsPerPage,
  onPageChange,
  onDownload,
  onMagnetDownload,
}) => {
  const [sortBy, setSortBy] = useState<'seeds' | 'quality'>('seeds');
  const [qualityFilter, setQualityFilter] = useState<string>('all');

  // Get unique quality values
  const qualities = ['all', ...new Set(torrents.map(t => t.quality))];

  // Sort and filter torrents
  const sortedTorrents = [...torrents].sort((a, b) => {
    if (sortBy === 'seeds') return b.seeds - a.seeds;
    return b.quality.localeCompare(a.quality);
  });

  const filteredTorrents = sortedTorrents.filter(torrent => 
    qualityFilter === 'all' || torrent.quality === qualityFilter
  );

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTorrents = filteredTorrents.slice(indexOfFirstItem, indexOfLastItem);

  // Reset to first page when filter/sort changes
  const handleFilterChange = (quality: string) => {
    setQualityFilter(quality);
    onPageChange(1);
  };

  const handleSortChange = (sort: 'seeds' | 'quality') => {
    setSortBy(sort);
    onPageChange(1);
  };

  return (
    <div className="w-full space-y-4">
      {/* Filters and Sort */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-gray-800/60 rounded-lg">
        {/* Quality Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400">
            <FaFilter className="w-4 h-4" />
            <span className="text-sm">Quality:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {qualities.map(quality => (
              <button
                key={quality}
                onClick={() => handleFilterChange(quality)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                  qualityFilter === quality
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {quality.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-gray-400">
            <FaSort className="w-4 h-4" />
            <span className="text-sm">Sort by:</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleSortChange('seeds')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                sortBy === 'seeds'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Seeds
            </button>
            <button
              onClick={() => handleSortChange('quality')}
              className={`px-3 py-1.5 text-sm rounded-md transition-all duration-200 ${
                sortBy === 'quality'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Quality
            </button>
          </div>
        </div>
      </div>

      {/* Torrent List */}
      <div className="space-y-2">
        {currentTorrents.length > 0 ? (
          currentTorrents.map((torrent, index) => (
            <TorrentItem
              key={`${torrent.infoHash}-${index}`}
              torrent={torrent}
              onDownload={onDownload}
              onMagnetDownload={onMagnetDownload}
            />
          ))
        ) : (
          <div className="flex items-center justify-center p-8 text-gray-400 bg-gray-800/40 rounded-lg">
            <p>No torrents found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {filteredTorrents.length > itemsPerPage && (
        <div className="flex justify-center pt-4">
          <Pagination
            currentPage={currentPage}
            totalItems={filteredTorrents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

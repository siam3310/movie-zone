import React from 'react';
import { TorrentInfo } from '../../types/torrent';
import { TorrentItem } from './TorrentItem';
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
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentTorrents = torrents.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="w-full bg-gray-900/50 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 py-2 px-4 bg-gray-800/60 text-gray-400 text-sm">
        <div className="hidden sm:block min-w-[100px]">Quality</div>
        <div className="flex-1 min-w-[120px]">Info</div>
        <div className="min-w-[80px]">Seeds</div>
        <div className="min-w-[160px] text-right sm:text-center">Download</div>
      </div>

      {/* Torrent List */}
      <div className="divide-y divide-gray-700/30">
        {currentTorrents.map((torrent, index) => (
          <TorrentItem
            key={`${torrent.hash}-${index}`}
            torrent={torrent}
            onDownload={onDownload}
            onMagnetDownload={onMagnetDownload}
          />
        ))}
      </div>

      {/* Pagination */}
      {torrents.length > itemsPerPage && (
        <div className="p-4 bg-gray-800/60">
          <Pagination
            currentPage={currentPage}
            totalItems={torrents.length}
            itemsPerPage={itemsPerPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

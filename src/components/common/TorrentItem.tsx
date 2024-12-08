import React from 'react';
import { FaSeedling, FaFileDownload, FaMagnet } from "react-icons/fa";
import { TorrentInfo } from '../../types/torrent';

interface TorrentItemProps {
  torrent: TorrentInfo;
  onDownload: (torrent: TorrentInfo) => void;
  onMagnetDownload: (torrent: TorrentInfo) => void;
}

const getTrustLevelColor = (trustScore: number) => {
  if (trustScore >= 80) return "bg-green-500";
  if (trustScore >= 60) return "bg-blue-500";
  if (trustScore >= 40) return "bg-yellow-500";
  return "bg-red-500";
};

const formatSize = (size: string) => {
  return size.replace(/\s*bytes/i, 'B').replace(/\s*gigabytes/i, 'GB').replace(/\s*megabytes/i, 'MB');
};

export const TorrentItem: React.FC<TorrentItemProps> = ({ torrent, onDownload, onMagnetDownload }) => {
  return (
    <div className="group flex items-center justify-between gap-4 py-2 px-4 bg-gray-800/40 hover:bg-gray-800/60 border-b border-gray-700/50 transition-colors duration-200">
      {/* Quality Badge */}
      <div className="hidden sm:flex items-center gap-2 min-w-[100px]">
        <div className={`h-2 w-2 rounded-full ${getTrustLevelColor(torrent.trustScore || 0)}`} />
        <span className="font-medium whitespace-nowrap">{torrent.quality}</span>
      </div>

      {/* Type & Size */}
      <div className="flex items-center gap-4 flex-1 min-w-[120px]">
        <span className="text-sm text-gray-400 hidden md:inline">{torrent.type}</span>
        <span className="text-sm text-gray-400">{formatSize(torrent.size)}</span>
      </div>

      {/* Seeds */}
      <div className="flex items-center gap-2 text-green-500 min-w-[80px]">
        <FaSeedling className="text-sm" />
        <span className="font-medium">{torrent.seeds}</span>
      </div>

      {/* Download Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onDownload(torrent)}
          className="flex items-center gap-1 px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600 border border-blue-500/50 
                   rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/20"
          title="Download .torrent file"
        >
          <FaFileDownload className="text-sm" />
          <span className="hidden sm:inline text-sm">Torrent</span>
        </button>
        <button
          onClick={() => onMagnetDownload(torrent)}
          className="flex items-center gap-1 px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 border border-purple-500/50 
                   rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/20"
          title="Download magnet link"
        >
          <FaMagnet className="text-sm" />
          <span className="hidden sm:inline text-sm">Magnet</span>
        </button>
      </div>

      {/* Hover Info - Small Screens */}
      <div className="absolute left-0 right-0 top-full bg-gray-800/95 backdrop-blur-sm py-2 px-4 text-sm text-gray-400
                    opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 sm:hidden">
        <div className="flex justify-between">
          <span>Quality: {torrent.quality} {torrent.type}</span>
          <span>Trust: {torrent.trustScore}%</span>
        </div>
      </div>
    </div>
  );
};

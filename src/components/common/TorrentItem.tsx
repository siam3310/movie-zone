import React from 'react';
import { FaSeedling, FaFileDownload, FaMagnet, FaFilm, FaHdd, FaDownload, FaUsers, FaShieldAlt, FaServer } from "react-icons/fa";
import { TorrentInfo } from '../../types/torrent';

interface TorrentItemProps {
  torrent: TorrentInfo;
  onDownload: (torrent: TorrentInfo) => void;
  onMagnetDownload: (torrent: TorrentInfo) => void;
}

const getTrustLevelColor = (trustScore: number) => {
  if (trustScore >= 80) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  if (trustScore >= 60) return "text-blue-500 bg-blue-500/10 border-blue-500/30";
  if (trustScore >= 40) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/30";
  return "text-red-500 bg-red-500/10 border-red-500/30";
};

const formatSize = (size: string) => {
  return size.replace(/\s*bytes/i, 'B').replace(/\s*gigabytes/i, 'GB').replace(/\s*megabytes/i, 'MB');
};

export const TorrentItem: React.FC<TorrentItemProps> = ({ torrent, onDownload, onMagnetDownload }) => {
  const trustLevelClass = getTrustLevelColor(torrent.trustScore || 0);
  
  return (
    <div className="group relative flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 
                    bg-[#1a1a1a]/90 hover:bg-[#232323]/90 border border-gray-800/50 rounded-xl 
                    transition-all duration-200 hover:shadow-lg hover:scale-[1.01]">
      {/* Left Section - Quality and Trust Score */}
      <div className="flex flex-wrap items-center gap-3 min-w-[140px]">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md border ${trustLevelClass}`}>
          <FaShieldAlt className="w-3.5 h-3.5" />
          <span className="text-sm font-medium">{torrent.quality}</span>
        </div>
      </div>

      {/* Middle Section - Type, Size, Seeds */}
      <div className="flex flex-wrap items-center gap-6 flex-1">
        {/* Type */}
        <div className="flex items-center gap-2 text-gray-300">
          <FaFilm className="w-4 h-4 text-red-500" />
          <span className="text-sm">{torrent.type}</span>
        </div>

        {/* Size */}
        <div className="flex items-center gap-2 text-gray-300">
          <FaHdd className="w-4 h-4 text-emerald-500" />
          <span className="text-sm">{formatSize(torrent.size)}</span>
        </div>

        {/* Provider */}
        <div className="flex items-center gap-2 text-gray-300">
          <FaServer className="w-4 h-4 text-blue-500" />
          <span className="text-sm">{torrent.provider}</span>
        </div>

        {/* Seeds/Peers */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaSeedling className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-500">{torrent.seeds}</span>
          </div>
          <div className="flex items-center gap-2">
            <FaUsers className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-medium text-blue-500">{torrent.peers}</span>
          </div>
        </div>
      </div>

      {/* Right Section - Download Buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={() => onDownload(torrent)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500 
                   border border-red-500/30 rounded-xl transition-all duration-200 
                   hover:shadow-lg hover:shadow-red-500/20 group/btn"
          title="Download .torrent file"
        >
          <FaFileDownload className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline text-sm font-medium">Torrent</span>
        </button>
        <button
          onClick={() => onMagnetDownload(torrent)}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 
                   border border-emerald-500/30 rounded-xl transition-all duration-200 
                   hover:shadow-lg hover:shadow-emerald-500/20 group/btn"
          title="Download magnet link"
        >
          <FaMagnet className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
          <span className="hidden sm:inline text-sm font-medium">Magnet</span>
        </button>
      </div>

      {/* Mobile Info Tooltip */}
      <div className="absolute left-0 right-0 -bottom-1 translate-y-full bg-[#1a1a1a]/95 
                    backdrop-blur-sm py-3 px-4 text-sm text-gray-400 rounded-xl 
                    border border-gray-800/50 opacity-0 group-hover:opacity-100 
                    transition-all duration-200 z-10 sm:hidden">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <FaShieldAlt className="w-3.5 h-3.5" />
              Trust Score: {torrent.trustScore}%
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2">
              <FaDownload className="w-3.5 h-3.5" />
              Provider: {torrent.provider}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { FaDownload } from 'react-icons/fa';
import { Episode } from '../../types/torrent';

interface EpisodeItemProps {
  episode: Episode;
  onDownload: (episode: Episode) => void;
  onMagnetDownload: (episode: Episode) => void;
}

const EpisodeItem: React.FC<EpisodeItemProps> = ({ episode, onDownload, onMagnetDownload }) => {
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-300 hover:bg-gray-100 transition">
      <div className="flex flex-col">
        <h3 className="text-md font-semibold">{episode.title}</h3>
        <p className="text-sm text-gray-500">S{episode.season}E{episode.episode}</p>
      </div>
      <div className="flex space-x-2">
        <button onClick={() => onDownload(episode)} className="flex items-center px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">
          <FaDownload className="mr-1" /> Download
        </button>
        <button onClick={() => onMagnetDownload(episode)} className="flex items-center px-2 py-1 bg-purple-500 text-white rounded hover:bg-purple-600">
          <FaDownload className="mr-1" /> Magnet
        </button>
      </div>
    </div>
  );
};

export default EpisodeItem;

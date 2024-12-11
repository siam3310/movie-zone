import React, { useState } from 'react';
import { StreamingSource } from '../../utils/streamingApi';

interface VideoPlayerProps {
  source: StreamingSource;
  allSources: StreamingSource[];
  onClose: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ source: initialSource, allSources, onClose }) => {
  const [currentSource, setCurrentSource] = useState(initialSource);
  const [showSources, setShowSources] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
        {/* Source Selection */}
        <div className="relative">
          <button
            onClick={() => setShowSources(!showSources)}
            className="px-4 py-2 bg-gray-800/80 text-white rounded-lg hover:bg-gray-700/80 transition-colors flex items-center gap-2"
          >
            <span>{currentSource.name}</span>
            <svg
              className={`w-4 h-4 transform transition-transform ${showSources ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Source Options Dropdown */}
          {showSources && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              {allSources.map((source, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setCurrentSource(source);
                    setShowSources(false);
                  }}
                  className={`w-full px-4 py-2 text-left hover:bg-gray-700/80 transition-colors ${
                    source.name === currentSource.name ? 'bg-blue-500/20 text-blue-400' : 'text-white'
                  }`}
                >
                  {source.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="p-2 text-white hover:text-gray-300 bg-red-500/20 hover:bg-red-500/30 rounded-full transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Video Container */}
      <div className="w-full h-full p-0 relative flex items-center justify-center">
        <div className="w-full h-full max-w-[1200px] max-h-[800px] mx-auto relative">
          <iframe
            key={currentSource.url} // Force iframe refresh when source changes
            src={currentSource.url}
            className="w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            style={{ border: 'none' }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoPlayer;

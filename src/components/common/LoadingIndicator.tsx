import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <div className="relative">
        {/* Primary spinner */}
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
        
        {/* Secondary spinner (optional) */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-8 h-8 rounded-full border-4 border-blue-400/20 border-t-blue-400 animate-spin"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;

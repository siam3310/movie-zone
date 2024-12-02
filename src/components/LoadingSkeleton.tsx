import React from 'react';

const LoadingSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#141414] animate-pulse">
      {/* Hero Section Skeleton */}
      <div className="relative h-[90vh]">
        {/* Background Image Skeleton */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#2b2b2b] via-[#1f1f1f] to-[#2b2b2b]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Title */}
            <div className="h-16 bg-[#2b2b2b] rounded-lg w-3/4" />

            {/* Metadata */}
            <div className="flex flex-wrap gap-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-6 bg-[#2b2b2b] rounded-full w-20"
                />
              ))}
            </div>

            {/* Overview */}
            <div className="space-y-3 max-w-3xl">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 bg-[#2b2b2b] rounded w-${100 - i * 15}%`}
                />
              ))}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3">
              <div className="h-12 bg-[#2b2b2b] rounded-lg w-40" />
              <div className="h-12 bg-[#2b2b2b] rounded-full w-12" />
              <div className="h-12 bg-[#2b2b2b] rounded-full w-12" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section Skeleton */}
      <div className="px-4 py-12 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Title */}
          <div className="h-8 bg-[#2b2b2b] rounded w-48 mb-8" />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-[#2b2b2b] rounded-lg p-6 space-y-4"
              >
                <div className="h-6 bg-[#3f3f3f] rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-[#3f3f3f] rounded w-full" />
                  <div className="h-4 bg-[#3f3f3f] rounded w-2/3" />
                </div>
                <div className="h-10 bg-[#3f3f3f] rounded-md w-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSkeleton;

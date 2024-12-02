import React, { useMemo, useCallback } from 'react';
import { TVSeriesDetails } from '../types/torrent';

interface SeasonSelectorProps {
  tvSeries: TVSeriesDetails;
  selectedSeason: number;
  onSeasonChange: (season: number) => void;
}

interface SeasonInfo {
  season: number;
  episodeCount: number;
}

const SeasonSelector: React.FC<SeasonSelectorProps> = ({
  tvSeries,
  selectedSeason,
  onSeasonChange,
}) => {
  // Memoize season data to avoid recalculation on every render
  const seasonData: SeasonInfo[] = useMemo(() => {
    return tvSeries.seasons.map((season) => ({
      season: season.season,
      episodeCount: tvSeries.episodes.filter(ep => ep.season === season.season).length
    }));
  }, [tvSeries.seasons, tvSeries.episodes]);

  // Memoize season change handler
  const handleSeasonChange = useCallback((season: number) => {
    onSeasonChange(season);
  }, [onSeasonChange]);

  return (
    <div className="mb-8" role="region" aria-label="Season Selection">
      <h3 className="text-xl font-medium text-white mb-4">Select Season</h3>
      <div 
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Available Seasons"
      >
        {seasonData.map(({ season, episodeCount }) => (
          <button
            key={season}
            onClick={() => handleSeasonChange(season)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedSeason === season
                ? 'bg-white text-black'
                : 'bg-white/10 text-white hover:bg-white/20'
            }`}
            aria-pressed={selectedSeason === season}
            aria-label={`Season ${season} with ${episodeCount} episodes`}
            title={`Select Season ${season}`}
          >
            Season {season}
            <span 
              className="ml-2 text-sm opacity-75"
              aria-label={`${episodeCount} episodes`}
            >
              ({episodeCount} episodes)
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Prevent unnecessary re-renders
export default React.memo(SeasonSelector);

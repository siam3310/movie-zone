import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Thumbnail from "../components/Thumbnail";
import { Skeleton } from "@mui/material";
import { Movie } from "@/types/movie";
import ViewMode from "../components/common/ViewMode";
import Filter from "../components/common/Filter";

interface TVShowDetails extends Movie {
  vote_average: number;
  number_of_seasons?: number;
  first_air_date: string;
  status?: string;
  networks?: Array<{ name: string }>;
}

interface FilterOptions {
  genre: string;
  year: string;
  sort: string;
  tag?: string;
}

function TVShows() {
  const [popularShows, setPopularShows] = useState<TVShowDetails[]>([]);
  const [trendingShows, setTrendingShows] = useState<TVShowDetails[]>([]);
  const [allShows, setAllShows] = useState<TVShowDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filteredShows, setFilteredShows] = useState<TVShowDetails[]>([]);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    genre: "",
    year: "",
    sort: "popularity.desc",
    tag: "",
  });

  useEffect(() => {
    document.title = "TV Shows - MovieZone";

    async function fetchTVShowDetails(shows: any[]) {
      const detailedShows = await Promise.all(
        shows.map(async (show) => {
          try {
            const response = await axios.get(`/tv/${show.id}`);
            return {
              ...show,
              number_of_seasons: response.data.number_of_seasons,
              status: response.data.status,
              networks: response.data.networks
            };
          } catch (error) {
            console.error(`Error fetching details for show ${show.id}:`, error);
            return show;
          }
        })
      );
      return detailedShows;
    }

    async function fetchTVShows() {
      try {
        // Fetch trending, popular, and all TV shows
        const [trendingResponse, popularResponse, allShowsResponse] = await Promise.all([
          axios.get('/trending/tv/day'),
          axios.get('/discover/tv', {
            params: {
              sort_by: 'popularity.desc',
              page: 1,
              include_adult: false,
              include_null_first_air_dates: false,
              'vote_count.gte': 100,
              'first_air_date.gte': '1990-01-01'
            }
          }),
          axios.get('/discover/tv', {
            params: {
              sort_by: 'first_air_date.desc',
              page: 1,
              include_adult: false,
              include_null_first_air_dates: false,
              'first_air_date.lte': new Date().toISOString().split('T')[0], // Today's date
              'first_air_date.gte': new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Last 90 days
            }
          })
        ]);

        const processShows = (shows: any[]) => shows.map((show: any) => ({
          ...show,
          media_type: 'tv',
          title: show.name,
          release_date: show.first_air_date
        })).filter((show: Movie) =>
          show.backdrop_path !== null && show.poster_path !== null
        );

        const trendingTvShows = processShows(trendingResponse.data.results);
        const popularTvShows = processShows(popularResponse.data.results);
        const allTvShows = processShows(allShowsResponse.data.results);

        // Fetch details for all sets of shows
        const [detailedTrendingShows, detailedPopularShows, detailedAllShows] = await Promise.all([
          fetchTVShowDetails(trendingTvShows),
          fetchTVShowDetails(popularTvShows),
          fetchTVShowDetails(allTvShows)
        ]);

        setTrendingShows(detailedTrendingShows);
        setPopularShows(detailedPopularShows);
        setAllShows(detailedAllShows);
      } catch (error) {
        console.error("Error fetching TV shows:", error);
        setError("Failed to load TV shows. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTVShows();
  }, []);

  const filterShows = (shows: TVShowDetails[], filters: FilterOptions) => {
    return shows.filter(show => {
      // Genre filter
      if (filters.genre && !show.genre_ids?.includes(getGenreId(filters.genre))) {
        return false;
      }

      // Year filter
      if (filters.year && filters.year !== "") {
        const showYear = new Date(show.release_date).getFullYear();
        const filterYear = parseInt(filters.year);
        if (showYear !== filterYear) {
          return false;
        }
      }

      // Tag filter
      if (filters.tag) {
        switch (filters.tag) {
          case "New Releases":
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return new Date(show.release_date) >= threeMonthsAgo;
          
          case "Trending Now":
            return trendingShows.some(trending => trending.id === show.id);
          
          case "Popular Series":
            return popularShows.some(popular => popular.id === show.id);
          
          case "Netflix Originals":
            return show.networks?.some(network => network.name === "Netflix");
          
          case "Action Movies":
            return show.genre_ids?.includes(28); // 28 is the ID for Action
          
          case "Award Winners":
            return show.vote_average >= 8.0; // Consider shows with high ratings as award winners
          
          default:
            return true;
        }
      }

      return true;
    });
  };

  const sortShows = (shows: TVShowDetails[], sortBy: string) => {
    return [...shows].sort((a, b) => {
      switch (sortBy) {
        case "popularity.desc":
          return (b.popularity || 0) - (a.popularity || 0);
        case "vote_average.desc":
          const aVote = a.vote_average || 0;
          const bVote = b.vote_average || 0;
          return bVote - aVote;
        case "release_date.desc":
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        case "release_date.asc":
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        default:
          return 0;
      }
    });
  };

  // Helper function to convert genre name to ID (you'll need to add actual genre IDs)
  const getGenreId = (genreName: string): number => {
    const genreMap: { [key: string]: number } = {
      action: 28,
      comedy: 35,
      drama: 18,
      horror: 27,
      // Add more genres and their IDs
    };
    return genreMap[genreName.toLowerCase()] || 0;
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // Get all unique shows
    let shows = getAllShows();
    
    // Apply filters
    shows = filterShows(shows, filters);
    
    // Apply sorting
    shows = sortShows(shows, filters.sort);
    
    setFilteredShows(shows);
  };

  const ShowsGrid = ({ shows, title }: { shows: TVShowDetails[], title: string }) => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-white md:text-2xl lg:text-3xl">
          {title}
        </h2>
      </div>
      <div className={`${
        viewMode === 'grid' 
          ? 'grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4'
          : 'flex flex-col gap-4'
      }`}>
        {shows.map((show) => (
          <div key={show.id} className="group relative">
            <Thumbnail movie={show} viewMode={viewMode} />
          </div>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="mt-[68px] min-h-screen bg-[#141414]">
        <div className="px-2 py-6 md:px-3 lg:px-4">
          <Skeleton
            variant="text"
            width={200}
            height={40}
            sx={{ bgcolor: '#2b2b2b', marginBottom: '24px' }}
          />
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(15)].map((_, index) => (
              <div key={index} className="relative h-[280px] min-w-[160px] md:h-[420px] md:min-w-[280px]">
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    bgcolor: '#2b2b2b',
                    borderRadius: '0.125rem',
                    transform: 'scale(1)',
                    '&::after': {
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)'
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-[68px] min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-white text-center">
          <p className="text-xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-red-600 rounded hover:bg-red-700 transition"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const getAllShows = () => {
    // Combine and remove duplicates using Set and id comparison
    const combinedShows = [...new Map(
      [...trendingShows, ...popularShows, ...allShows]
        .map(show => [show.id, show])
    ).values()];

    // Sort by release date (newest first)
    return combinedShows.sort((a, b) => 
      new Date(b.release_date).getTime() - new Date(a.release_date).getTime()
    );
  };

  return (
    <div className="mt-[68px] min-h-screen bg-[#141414]">
      <div className="px-2 py-6 md:px-3 lg:px-4">
        <div className="flex gap-6">
          <Filter onFilterChange={handleFilterChange} />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                TV Shows
              </h1>
              <ViewMode viewMode={viewMode} onViewChange={setViewMode} />
            </div>

            <ShowsGrid 
              shows={filteredShows.length > 0 ? filteredShows : getAllShows()} 
              title="All TV Shows" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default TVShows;

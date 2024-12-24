import { useEffect, useState } from "react";
import axios from "../utils/axios";
import Thumbnail from "../components/Thumbnail";
import { Skeleton } from "@mui/material";
import { Movie } from "@/types/movie";

interface TVShowDetails extends Movie {
  vote_average: number;
  number_of_seasons?: number;
  first_air_date: string;
  status?: string;
  networks?: Array<{ name: string }>;
}

function TVShows() {
  const [popularShows, setPopularShows] = useState<TVShowDetails[]>([]);
  const [netflixShows, setNetflixShows] = useState<TVShowDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        // Fetch popular TV shows
        const popularResponse = await axios.get('/discover/tv', {
          params: {
            sort_by: 'popularity.desc',
            page: 1,
            include_adult: false,
            include_null_first_air_dates: false,
            'vote_count.gte': 100
          }
        });

        // Fetch Netflix originals
        const netflixResponse = await axios.get('/discover/tv', {
          params: {
            with_networks: 213, // Netflix's network ID
            sort_by: 'popularity.desc',
            page: 1,
            include_adult: false
          }
        });

        const processShows = (shows: any[]) => shows.map((show: any) => ({
          ...show,
          media_type: 'tv',
          title: show.name,
          release_date: show.first_air_date
        })).filter((show: Movie) =>
          show.backdrop_path !== null && show.poster_path !== null
        );

        const popularTVShows = processShows(popularResponse.data.results);
        const netflixTVShows = processShows(netflixResponse.data.results);

        // Fetch additional details for both sets of shows
        const [detailedPopularShows, detailedNetflixShows] = await Promise.all([
          fetchTVShowDetails(popularTVShows),
          fetchTVShowDetails(netflixTVShows)
        ]);

        setPopularShows(detailedPopularShows);
        setNetflixShows(detailedNetflixShows);
      } catch (error) {
        console.error("Error fetching TV shows:", error);
        setError("Failed to load TV shows. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchTVShows();
  }, []);

  const ShowsGrid = ({ shows, title }: { shows: TVShowDetails[], title: string }) => (
    <div className="mb-8">
      <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl lg:text-3xl">
        {title}
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {shows.map((show) => (
          <div key={show.id} className="group relative">
            <Thumbnail movie={show} />
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
          <div className="grid grid-cPols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {[...Array(15)].map((_, index) => (
              <div key={index} className="relative h-[230px] min-w-[160px] md:h-[420px] md:min-w-[280px]">
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

  return (
    <div className="mt-[68px] min-h-screen bg-[#141414]">
      <div className="px-2 py-6 md:px-3 lg:px-4">
        {netflixShows.length > 0 && (
          <ShowsGrid shows={netflixShows} title="Netflix Originals" />
        )}
        <ShowsGrid shows={popularShows} title="Popular TV Shows" />
      </div>
    </div>
  );
}

export default TVShows;

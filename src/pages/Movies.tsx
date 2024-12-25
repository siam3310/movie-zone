import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import Thumbnail from '../components/Thumbnail'
import { Movie } from '../types/movie'
import { Skeleton } from '@mui/material'
import ViewMode from '../components/common/ViewMode'
import Filter from '../components/common/Filter'

interface FilterOptions {
  genre: string;
  year: string;
  sort: string;
  tag?: string;
}

function Movies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [trendingMovies, setTrendingMovies] = useState<Movie[]>([])
  const [popularMovies, setPopularMovies] = useState<Movie[]>([])
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    genre: "",
    year: "",
    sort: "popularity.desc",
    tag: "",
  });

  useEffect(() => {
    document.title = 'Movies - MovieZone'

    async function fetchMovies() {
      try {
        const [trendingRes, popularRes, actionRes, comedyRes, horrorRes, romanceRes] = await Promise.all([
          axios.get('/trending/movie/day'),
          axios.get('/movie/popular'),
          axios.get('/discover/movie', {
            params: {
              with_genres: '28',
              sort_by: 'popularity.desc'
            }
          }),
          axios.get('/discover/movie', {
            params: {
              with_genres: '35',
              sort_by: 'popularity.desc'
            }
          }),
          axios.get('/discover/movie', {
            params: {
              with_genres: '27',
              sort_by: 'popularity.desc'
            }
          }),
          axios.get('/discover/movie', {
            params: {
              with_genres: '10749',
              sort_by: 'popularity.desc'
            }
          })
        ])

        const processMovies = (movies: any[]) => movies
          .filter(movie => movie.backdrop_path !== null && movie.poster_path !== null)
          .map(movie => ({
            ...movie,
            media_type: 'movie'
          }));

        setTrendingMovies(processMovies(trendingRes.data.results));
        setPopularMovies(processMovies(popularRes.data.results));

        // Combine all movies and remove duplicates
        const allMovies = [...actionRes.data.results, ...comedyRes.data.results, 
                          ...horrorRes.data.results, ...romanceRes.data.results]
        
        const uniqueMovies = [...new Map(
          processMovies(allMovies)
            .map(movie => [movie.id, movie])
        ).values()];

        setMovies(uniqueMovies)
        setError(null)
      } catch (error) {
        setError('Failed to load movies. Please try again later.')
        console.error('Error fetching movies:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMovies()
  }, [ activeFilters ])

  const filterMovies = (movies: Movie[], filters: FilterOptions) => {
    return movies.filter(movie => {
      // Genre filter
      if (filters.genre && !movie.genre_ids?.includes(getGenreId(filters.genre))) {
        return false;
      }

      // Year filter
      if (filters.year && filters.year !== "") {
        const movieYear = new Date(movie.release_date).getFullYear();
        const filterYear = parseInt(filters.year);
        if (movieYear !== filterYear) {
          return false;
        }
      }

      // Tag filter
      if (filters.tag) {
        switch (filters.tag) {
          case "New Releases":
            const threeMonthsAgo = new Date();
            threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
            return new Date(movie.release_date) >= threeMonthsAgo;
          case "Trending Now":
            return trendingMovies.some(trending => trending.id === movie.id);
          case "Popular Series":
            return popularMovies.some(popular => popular.id === movie.id);
          case "Action Movies":
            return movie.genre_ids?.includes(28); // 28 is Action genre ID
          case "Award Winners":
            return (movie.vote_average || 0) >= 8.0;
          default:
            return true;
        }
      }

      return true;
    });
  };

  const sortMovies = (movies: Movie[], sortBy: string) => {
    return [...movies].sort((a, b) => {
      switch (sortBy) {
        case "popularity.desc":
          return (b.popularity || 0) - (a.popularity || 0);
        case "vote_average.desc":
          return (b.vote_average || 0) - (a.vote_average || 0);
        case "release_date.desc":
          return new Date(b.release_date).getTime() - new Date(a.release_date).getTime();
        case "release_date.asc":
          return new Date(a.release_date).getTime() - new Date(b.release_date).getTime();
        default:
          return 0;
      }
    });
  };

  const getGenreId = (genreName: string): number => {
    const genreMap: { [key: string]: number } = {
      action: 28,
      adventure: 12,
      animation: 16,
      comedy: 35,
      crime: 80,
      documentary: 99,
      drama: 18,
      family: 10751,
      fantasy: 14,
      horror: 27,
      mystery: 9648,
      romance: 10749,
      'sci-fi': 878,
      thriller: 53
    };
    return genreMap[genreName.toLowerCase()] || 0;
  };

  const handleFilterChange = (filters: FilterOptions) => {
    setActiveFilters(filters);
    
    // Apply filters and sorting
    let filtered = filterMovies(movies, filters);
    filtered = sortMovies(filtered, filters.sort);
    
    setFilteredMovies(filtered);
  };

  const MoviesGrid = ({ movies, title }: { movies: Movie[], title: string }) => (
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
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <Thumbnail movie={movie} viewMode={viewMode} />
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
    )
  }

  return (
    <div className="mt-[68px] min-h-screen bg-[#141414]">
      <div className="px-2 py-6 md:px-3 lg:px-4">
        <div className="flex gap-6">
          <Filter onFilterChange={handleFilterChange} />
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-white md:text-3xl">
                Movies
              </h1>
              <ViewMode viewMode={viewMode} onViewChange={setViewMode} />
            </div>

            <MoviesGrid 
              movies={filteredMovies.length > 0 ? filteredMovies : movies} 
              title="All Movies" 
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Movies

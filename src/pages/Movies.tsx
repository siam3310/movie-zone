import { useEffect, useState } from 'react'
import axios from '../utils/axios'
import Thumbnail from '../components/Thumbnail'
import { Movie } from '../types/movie'
import { Skeleton } from '@mui/material'

function Movies() {
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    document.title = 'Movies - MovieZone'

    async function fetchMovies() {
      try {
        const [actionRes, comedyRes, horrorRes, romanceRes] = await Promise.all([
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

        const action = actionRes.data.results || []
        const comedy = comedyRes.data.results || []
        const horror = horrorRes.data.results || []
        const romance = romanceRes.data.results || []

        // Combine all movies and remove duplicates
        const allMovies = [...action, ...comedy, ...horror, ...romance]
          .filter(movie => movie.backdrop_path !== null && movie.poster_path !== null)
          .map(movie => ({
            ...movie,
            media_type: 'movie'
          }))

        // Remove duplicates based on id
        const uniqueMovies = Array.from(
          new Map(allMovies.map(movie => [movie.id, movie])).values()
        )

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
  }, [])

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
              <div key={index} className="relative h-[345px] min-w-[160px] md:h-[420px] md:min-w-[280px]">
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
        <h2 className="mb-6 text-xl font-semibold text-white md:text-2xl lg:text-3xl">
          Movies
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {movies.map((movie) => (
            <Thumbnail key={movie.id} movie={movie} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Movies

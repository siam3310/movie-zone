import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Movie } from '../types/movie'
import { baseUrl } from '../constants/movie'
import { Play, Info } from 'lucide-react'

interface SearchResult extends Movie {
  media_type: 'movie' | 'tv' | string
}

function Search() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = `Search - ${query} - Netflix`

    async function searchContent() {
      if (!query) {
        setResults([])
        setLoading(false)
        return
      }

      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY
        const response = await fetch(
          `https://api.themoviedb.org/3/search/multi?api_key=${API_KEY}&language=en-US&query=${encodeURIComponent(
            query
          )}&page=1&include_adult=false`
        )
        const data = await response.json()
        // Filter for movies and TV shows with valid images
        const filteredResults = data.results.filter((item: SearchResult) => 
          (item.media_type === 'movie' || item.media_type === 'tv') && 
          (item.backdrop_path || item.poster_path)
        )
        setResults(filteredResults)
      } catch (error) {
        console.error('Error searching content:', error)
      } finally {
        setLoading(false)
      }
    }

    searchContent()
  }, [query])

  const handleNavigateToInfo = (result: SearchResult) => {
    const type = result.media_type || (result.first_air_date ? 'tv' : 'movie')
    window.scrollTo(0, 0)
    navigate(`/info/${type}/${result.id}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 mt-16">
      <h1 className="text-3xl font-bold mb-4 text-white">
        {results.length > 0
          ? `Search results for "${query}"`
          : `No results found for "${query}"`}
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {results.map((result) => (
          <div
            key={result.id}
            className="group relative h-48 cursor-pointer md:h-64 hover:z-20"
            onClick={() => handleNavigateToInfo(result)}
          >
            <img
              src={`${baseUrl}${result.backdrop_path || result.poster_path}`}
              alt={result.title || result.name}
              className="rounded-sm object-cover transition duration-200 ease-out group-hover:scale-110 h-full w-full brightness-90 group-hover:brightness-100"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition duration-200" />
            <div className="absolute bottom-0 left-0 right-0 p-4 opacity-100 transition-all duration-200">
              <div className="flex items-center space-x-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button 
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white hover:bg-white/80 transition"
                  onClick={(e) => {
                    e.stopPropagation()
                    // Handle play functionality
                  }}
                >
                  <Play className="h-4 w-4 text-black fill-black" />
                </button>
                <button 
                  className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white/60 hover:border-white transition"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleNavigateToInfo(result)
                  }}
                >
                  <Info className="h-5 w-5 text-white" />
                </button>
              </div>
              <div className="mt-4">
                <h2 className="text-base font-semibold text-white md:text-lg line-clamp-1">
                  {result.title || result.name}
                </h2>
                {result.vote_average && result.vote_average > 0 && (
                  <p className="mt-1 text-sm text-green-400 font-medium">
                    {Math.round(result.vote_average * 10)}% Match
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Search

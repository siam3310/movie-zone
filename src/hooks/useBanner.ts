import { useState, useEffect } from 'react'
import { Movie } from '../types/movie'

export type BannerType = 'movie' | 'tv' | 'trending' | 'all'

const API_KEY = import.meta.env.VITE_TMDB_API_KEY
const BASE_URL = 'https://api.themoviedb.org/3'

export function useBanner(type: BannerType = 'trending') {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        setError(null)

        let endpoint: string
        switch (type) {
          case 'movie':
            endpoint = `/movie/popular`
            break
          case 'tv':
            endpoint = `/tv/popular`
            break
          case 'all':
            endpoint = `/trending/all/week`
            break
          default:
            endpoint = `/trending/all/week`
        }

        const response = await fetch(
          `${BASE_URL}${endpoint}?api_key=${API_KEY}&language=en-US`
        )

        if (!response.ok) {
          throw new Error('Failed to fetch banner data')
        }

        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const randomIndex = Math.floor(Math.random() * data.results.length)
          setMovie(data.results[randomIndex])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
        console.error('Banner fetch error:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [type])

  return { movie, isLoading, error }
}

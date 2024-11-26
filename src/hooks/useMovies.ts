import { useState, useEffect } from 'react'
import axios from 'axios'
import { Movie } from '@/utils/requests'

export function useMovies(fetchUrl: string) {
  const [movies, setMovies] = useState<Movie[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(fetchUrl)
        setMovies(response.data.results)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchUrl])

  return { movies, isLoading, error }
}

export function useRandomMovie(fetchUrl: string) {
  const [movie, setMovie] = useState<Movie | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await axios.get(fetchUrl)
        const movies = response.data.results
        setMovie(movies[Math.floor(Math.random() * movies.length)])
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred'))
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [fetchUrl])

  return { movie, isLoading, error }
}

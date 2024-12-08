import axios from 'axios'
import { BASE_URL } from './requests'

const instance = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
    language: 'en-US',
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance

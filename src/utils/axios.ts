import axios from 'axios'
import { BASE_URL, API_KEY } from './requests'

const instance = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
    language: 'en-US',
  },
  headers: {
    'Content-Type': 'application/json',
  },
})

export default instance

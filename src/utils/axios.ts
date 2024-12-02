import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';
import { BASE_URL } from './requests';

// Constants
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Create axios instance with optimized settings
const instance: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: REQUEST_TIMEOUT,
  params: {
    api_key: import.meta.env.VITE_TMDB_API_KEY,
  },
  headers: {
    'Content-Type': 'application/json',
  },
});

// Response interceptor for error handling
instance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error('Server Error:', error.response.status, error.response.data);
      } else if (error.request) {
        console.error('Network Error:', error.message);
      } else {
        console.error('Request Error:', error.message);
      }
    }
    return Promise.reject(error);
  }
);

export default instance;

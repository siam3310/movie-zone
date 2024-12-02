/**
 * Generates search queries for a movie title
 */
export const getSearchQueries = (title: string, year?: number): string[] => {
  const queries = [title];
  
  if (year) {
    queries.push(`${title} ${year}`);
  }

  // Remove special characters and try that as well
  const cleanTitle = title.replace(/[^a-zA-Z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
  if (cleanTitle !== title) {
    queries.push(cleanTitle);
    if (year) {
      queries.push(`${cleanTitle} ${year}`);
    }
  }

  return [...new Set(queries)]; // Remove duplicates
};

/**
 * Checks if two strings are similar (case-insensitive)
 */
export const isSimilarString = (str1: string, str2: string): boolean => {
  const normalize = (s: string) => 
    s.toLowerCase()
     .replace(/[^a-z0-9]/g, '')
     .trim();

  return normalize(str1) === normalize(str2);
};

// Cache implementation
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get data from cache if not expired
 */
export const getCachedData = <T>(key: string): T | null => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data as T;
  }
  return null;
};

/**
 * Set data in cache with timestamp
 */
export const setCachedData = (key: string, data: any): void => {
  cache.set(key, { data, timestamp: Date.now() });
};

/**
 * Makes a fetch request with retries
 */
export const fetchWithRetry = async <T>(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 1000
): Promise<T | null> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout

  try {
    console.log(`Fetching: ${url}`);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://torrentio.strem.fun',
        'Referer': 'https://torrentio.strem.fun/',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    // Handle different response statuses
    if (response.status === 404) {
      console.log(`Resource not found (404): ${url}`);
      return null;
    }

    if (response.status === 429) {
      console.log(`Rate limited (429): ${url}`);
      if (retries > 0) {
        const nextDelay = delay * 2; // Exponential backoff for rate limits
        console.log(`Retrying after ${nextDelay}ms due to rate limit`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return fetchWithRetry(url, options, retries - 1, nextDelay);
      }
      return null;
    }

    if (response.status === 500) {
      console.log(`Server error (500): ${url}`);
      if (retries > 0) {
        const nextDelay = delay * 1.5;
        console.log(`Retrying after ${nextDelay}ms due to server error`);
        await new Promise(resolve => setTimeout(resolve, nextDelay));
        return fetchWithRetry(url, options, retries - 1, nextDelay);
      }
      return null;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.log(`Warning: Response is not JSON (${contentType}): ${url}`);
      // Try to parse it anyway, some servers might not set content-type correctly
      try {
        const data = await response.json();
        if (data && typeof data === 'object') {
          return data as T;
        }
      } catch {
        return null;
      }
      return null;
    }

    const data = await response.json();
    if (data && Object.keys(data).length > 0) {
      return data as T;
    }

    console.log(`Empty response from: ${url}`);
    return null;

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      console.log(`Request timeout for: ${url}`);
      if (retries > 0) {
        const nextDelay = delay * 1.5;
        console.log(`Retrying after ${nextDelay}ms due to timeout`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, nextDelay);
      }
    }

    if (retries > 0) {
      const nextDelay = delay * 1.5;
      console.log(`Retrying ${url} (${retries} attempts left) after ${nextDelay}ms`);
      await new Promise(resolve => setTimeout(resolve, nextDelay));
      return fetchWithRetry(url, options, retries - 1, nextDelay);
    }

    console.error(`Failed to fetch ${url} after all retries:`, error);
    return null;
  }
};

/**
 * Batch API requests with concurrency limit
 */
export const batchRequests = async <T>(
  urls: string[],
  options: RequestInit = {},
  concurrentLimit = 3,
  timeout = 15000
): Promise<(T | null)[]> => {
  try {
    console.log(`Starting batch request for ${urls.length} URLs`);
    
    const results: (T | null)[] = [];
    for (let i = 0; i < urls.length; i += concurrentLimit) {
      const batch = urls.slice(i, i + concurrentLimit);
      console.log(`Processing batch ${Math.floor(i/concurrentLimit) + 1} of ${Math.ceil(urls.length/concurrentLimit)}`);
      
      const promises = batch.map(url => {
        const timeoutPromise = new Promise<T | null>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), timeout);
        });

        const fetchPromise = fetchWithRetry<T>(url, {
          ...options,
          headers: {
            ...options.headers,
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Origin': 'https://torrentio.strem.fun',
            'Referer': 'https://torrentio.strem.fun/'
          }
        });

        return Promise.race([fetchPromise, timeoutPromise]);
      });

      // Wait for current batch to complete
      const batchResults = await Promise.all(
        promises.map(p => p.catch(error => {
          console.error('Batch request error:', error);
          return null;
        }))
      );

      const validResults = batchResults.filter(result => {
        if (!result) return false;
        if (result.streams && Array.isArray(result.streams)) {
          return result.streams.length > 0;
        }
        return true;
      });

      results.push(...validResults);

      // If we have enough results, we can stop
      if (results.length >= 2) {
        console.log('Found enough results, stopping batch requests');
        break;
      }

      // Add delay between batches to avoid rate limiting
      if (i + concurrentLimit < urls.length) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // 2s delay between batches
      }
    }

    console.log(`Batch requests completed. Found ${results.length} valid results`);
    return results;
  } catch (error) {
    console.error('Batch request error:', error);
    return [];
  }
};

/**
 * Format bytes to human readable string
 */
export const formatBytes = (bytes: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/**
 * Extract quality from title
 */
export const getQualityFromTitle = (title: string, stream?: { quality?: string }): string => {
  // Check stream quality first
  if (stream?.quality) {
    return stream.quality.toUpperCase();
  }

  // Common quality patterns
  const qualityPatterns = [
    /\b(4K|2160p)\b/i,
    /\b(1080p)\b/i,
    /\b(720p)\b/i,
    /\b(480p)\b/i
  ];

  for (const pattern of qualityPatterns) {
    const match = title.match(pattern);
    if (match) {
      return match[1].toUpperCase();
    }
  }

  // Default quality if none found
  return '720P';
};

/**
 * Extract size from title
 */
export const getSizeFromTitle = (title: string): string | null => {
  // Common size patterns like "1.5 GB" or "800 MB"
  const sizePattern = /(\d+(?:\.\d+)?\s*[KMGT]B)/i;
  const match = title.match(sizePattern);
  return match ? match[1].toUpperCase() : null;
};

/**
 * Extract season and episode numbers from title
 */
export const extractEpisodeInfo = (title: string) => {
  const result = {
    season: null as number | null,
    episode: null as number | null
  };

  // Common patterns for season/episode numbers
  const patterns = [
    // S01E01, s1e1, etc.
    /\bS(\d{1,2})[\s._-]*E(\d{1,2})\b/i,
    // 1x01, 01x01, etc.
    /\b(\d{1,2})x(\d{1,2})\b/i,
    // Season 1 Episode 1
    /\bSeason\s*(\d{1,2})\s*Episode\s*(\d{1,2})\b/i,
    // E01, EP01 (assumes season 1 if no season specified)
    /\b(?:E|EP)(\d{1,2})\b/i
  ];

  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) {
      if (match.length === 2) {
        // Pattern with only episode number
        result.season = 1;
        result.episode = parseInt(match[1]);
      } else if (match.length === 3) {
        // Pattern with both season and episode
        result.season = parseInt(match[1]);
        result.episode = parseInt(match[2]);
      }
      break;
    }
  }

  return result;
};

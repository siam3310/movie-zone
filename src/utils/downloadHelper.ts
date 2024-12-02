import { TorrentInfo } from '../types/torrent';

// Types
interface DownloadOptions {
  title: string;
  quality?: string;
  year?: number;
  season?: number;
  episode?: number;
  type?: 'movie' | 'tv';
  url: string;
  isTorrentFile?: boolean;
}

// Constants
const INVALID_FILENAME_CHARS = /[<>:"/\\|?*]/g;
const MULTIPLE_SPACES = /\s+/g;
const DEFAULT_SOURCE = 'YTS.MX';
const CLEANUP_DELAY = 100; // milliseconds

// Error messages
const ERROR_MESSAGES = {
  TITLE_REQUIRED: 'Title is required',
  INVALID_SEASON: 'Invalid season number',
  INVALID_EPISODE: 'Invalid episode number',
  URL_REQUIRED: 'URL is required for download',
  DOWNLOAD_FAILED: 'Download failed',
  NON_MAGNET: 'Non-magnet URL detected for magnet link download'
} as const;

/**
 * Format movie title with consistent naming convention
 * @throws {Error} If title is empty
 */
export const formatMovieTitle = (
  title: string, 
  year?: number | string, 
  quality?: string, 
  source: string = DEFAULT_SOURCE
): string => {
  if (!title?.trim()) {
    throw new Error(ERROR_MESSAGES.TITLE_REQUIRED);
  }
  
  const parts = [title.trim()];
  
  if (year) {
    const yearStr = typeof year === 'string' ? year : year.toString();
    parts.push(`(${yearStr})`);
  }
  
  if (quality?.trim()) {
    parts.push(`[${quality.toUpperCase()}]`);
  }
  
  parts.push(`[${source.toUpperCase()}]`);
  return parts.join(' ');
};

/**
 * Format TV show title with consistent naming convention
 * @throws {Error} If title is empty or season/episode numbers are invalid
 */
export const formatTVTitle = (
  title: string,
  season: number,
  episode: number,
  quality?: string,
  source: string = DEFAULT_SOURCE
): string => {
  if (!title?.trim()) {
    throw new Error(ERROR_MESSAGES.TITLE_REQUIRED);
  }
  if (!Number.isInteger(season) || season < 0) {
    throw new Error(ERROR_MESSAGES.INVALID_SEASON);
  }
  if (!Number.isInteger(episode) || episode < 0) {
    throw new Error(ERROR_MESSAGES.INVALID_EPISODE);
  }

  const parts = [
    title.trim(),
    `S${season.toString().padStart(2, '0')}E${episode.toString().padStart(2, '0')}`
  ];
  
  if (quality?.trim()) {
    parts.push(`[${quality.toUpperCase()}]`);
  }
  
  parts.push(`[${source.toUpperCase()}]`);
  return parts.join(' ');
};

/**
 * Sanitize filename by removing invalid characters
 * @throws {Error} If filename is empty
 */
export const sanitizeFileName = (fileName: string): string => {
  if (!fileName?.trim()) {
    throw new Error(ERROR_MESSAGES.TITLE_REQUIRED);
  }
  return fileName
    .replace(INVALID_FILENAME_CHARS, '')
    .replace(MULTIPLE_SPACES, ' ')
    .trim();
};

/**
 * Create and trigger download for torrent or magnet link
 * @throws {Error} If download fails or required parameters are missing
 */
export const downloadContent = async (options: DownloadOptions): Promise<void> => {
  if (!options?.url) {
    throw new Error(ERROR_MESSAGES.URL_REQUIRED);
  }
  if (!options?.title) {
    throw new Error(ERROR_MESSAGES.TITLE_REQUIRED);
  }

  try {
    const { url, isTorrentFile, type, title, quality, year, season, episode } = options;

    if (isTorrentFile) {
      const formattedTitle = type === 'tv' && season !== undefined && episode !== undefined
        ? formatTVTitle(title, season, episode, quality)
        : formatMovieTitle(title, year, quality);

      const torrent: TorrentInfo = {
        title: formattedTitle,
        url: url,
        hash: '',
        quality: quality || '',
        size: '',
        seeds: 0,
        peers: 0,
      };

      // Create and click download link
      const link = document.createElement('a');
      link.href = url;
      link.download = `${sanitizeFileName(formattedTitle)}.torrent`;
      link.style.display = 'none';
      
      // Use try-finally to ensure cleanup
      try {
        document.body.appendChild(link);
        link.click();
      } finally {
        // Cleanup after small delay to ensure download starts
        setTimeout(() => {
          if (link.parentNode) {
            document.body.removeChild(link);
          }
        }, CLEANUP_DELAY);
      }
    } else {
      // Handle magnet links
      if (!url.startsWith('magnet:')) {
        console.warn(ERROR_MESSAGES.NON_MAGNET);
      }
      window.location.href = url;
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.DOWNLOAD_FAILED;
    console.error('Error during download:', error);
    throw new Error(`${ERROR_MESSAGES.DOWNLOAD_FAILED}: ${errorMessage}`);
  }
};

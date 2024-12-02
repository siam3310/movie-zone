type QualityType = '2160p' | '4k' | '1080p' | '720p' | '480p';

interface QualityStyle {
  background: string;
  text: string;
}

const QUALITY_STYLES: Record<QualityType, QualityStyle> = {
  '2160p': {
    background: 'bg-purple-500/20',
    text: 'text-purple-400'
  },
  '4k': {
    background: 'bg-purple-500/20',
    text: 'text-purple-400'
  },
  '1080p': {
    background: 'bg-green-500/20',
    text: 'text-green-400'
  },
  '720p': {
    background: 'bg-blue-500/20',
    text: 'text-blue-400'
  },
  '480p': {
    background: 'bg-yellow-500/20',
    text: 'text-yellow-400'
  }
};

const DEFAULT_STYLE: QualityStyle = {
  background: 'bg-gray-700/20',
  text: 'text-gray-400'
};

/**
 * Get Tailwind CSS classes for quality badge styling
 * @param quality Video quality string
 * @returns Combined Tailwind CSS classes for background and text color
 */
export const getQualityColor = (quality: string): string => {
  if (!quality) return `${DEFAULT_STYLE.background} ${DEFAULT_STYLE.text}`;

  const normalizedQuality = quality.toLowerCase() as QualityType;
  const style = QUALITY_STYLES[normalizedQuality] || DEFAULT_STYLE;
  
  return `${style.background} ${style.text}`;
};

/**
 * Check if a quality string is valid
 * @param quality Video quality string
 * @returns boolean indicating if quality is valid
 */
export const isValidQuality = (quality: string): boolean => {
  if (!quality) return false;
  return quality.toLowerCase() in QUALITY_STYLES;
};

/**
 * Get normalized quality string
 * @param quality Video quality string
 * @returns Normalized quality string or null if invalid
 */
export const normalizeQuality = (quality: string): QualityType | null => {
  if (!quality) return null;
  
  const normalized = quality.toLowerCase() as QualityType;
  return isValidQuality(normalized) ? normalized : null;
};

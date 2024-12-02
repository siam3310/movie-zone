export const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes) return "0 B";
  
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  
  // Find appropriate unit
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  // Adjust decimals based on size
  let finalDecimals;
  if (i >= 3) { // GB or TB
    finalDecimals = 2;
  } else if (i === 2) { // MB
    finalDecimals = 1;
  } else {
    finalDecimals = 0;
  }
  
  // Calculate size with appropriate decimals
  const size = parseFloat((bytes / Math.pow(k, i)).toFixed(finalDecimals));
  
  // Format with appropriate unit
  return `${size} ${sizes[i]}`;
};

export const getQualityFromTitle = (title: string, stream: any): string => {
  const resolutionMatch = title.match(/\b(480p|720p|1080p|2160p|4K|UHD)\b/i);
  if (resolutionMatch) {
    const quality = resolutionMatch[0].toUpperCase();
    if (quality === "UHD" || quality === "2160P") return "4K";
    return quality;
  }

  if (typeof stream?.size === 'number') {
    const sizeGB = stream.size / (1024 * 1024 * 1024);
    if (sizeGB > 20) return "4K";
    if (sizeGB > 4) return "1080P";
    if (sizeGB > 1) return "720P";
    return "480P";
  }

  return "720P";
};

export const getReleaseTypeFromTitle = (title: string): string => {
  const webMatch = title.match(/\b(WEB-DL|WEB-RIP|WEBRip|WEB)\b/i);
  if (webMatch) return webMatch[0].toUpperCase();

  const hdtvMatch = title.match(/\b(HDTV|HD-TV)\b/i);
  if (hdtvMatch) return "HDTV";

  const blurayMatch = title.match(/\b(BluRay|BRRip|BDRip)\b/i);
  if (blurayMatch) return "BluRay";

  return "Unknown";
};

export const getEncodingFromTitle = (title: string): string => {
  const encodingMatch = title.match(/\b(x264|x265|HEVC|H264|H265)\b/i);
  return encodingMatch ? encodingMatch[0].toUpperCase() : '';
};

export const getSizeFromTitle = (title: string): number | null => {
  const sizeMatch = title.match(/(\d+(?:\.\d+)?)\s*(GB|MB|KB)/i);
  if (!sizeMatch) return null;

  const [, size, unit] = sizeMatch;
  const numSize = parseFloat(size);

  switch (unit.toUpperCase()) {
    case 'GB': return numSize * 1024 * 1024 * 1024;
    case 'MB': return numSize * 1024 * 1024;
    case 'KB': return numSize * 1024;
    default: return null;
  }
};

export const getYearFromTitle = (title: string): number | null => {
  const yearMatch = title.match(/(?:\(|\.|^|\s)(\d{4})(?:\)|\.|$|\s)/);
  if (!yearMatch) return null;

  const year = parseInt(yearMatch[1]);
  return year >= 1900 && year <= 2030 ? year : null;
};

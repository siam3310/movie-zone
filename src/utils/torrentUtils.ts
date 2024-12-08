import { TorrentInfo } from "../types/torrent";

export const normalizeTitle = (title: string): string => {
  return title.toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
};

export const getTitleVariations = (title: string): string[] => {
  const variations = [title];
  
  // Remove common prefixes
  const withoutPrefix = title.replace(/^(the|a|an)\s+/i, '');
  if (withoutPrefix !== title) variations.push(withoutPrefix);

  // Handle special cases like "Harry Potter"
  if (title.toLowerCase().includes('harry potter')) {
    variations.push('Harry Potter');
    variations.push(title.replace(/Harry Potter and /i, 'Harry Potter '));
    variations.push(title.replace(/Harry Potter and the /i, 'Harry Potter '));
    variations.push(title.replace(/Harry Potter & /i, 'Harry Potter '));
    variations.push(title.replace(/Harry Potter & the /i, 'Harry Potter '));
  }

  variations.push(title.split(':')[0]);
  variations.push(title.split(' - ')[0]);
  variations.push(title.split(' (')[0]);

  return [...new Set(variations)].filter(Boolean);
};

export const calculateTrustScore = (torrent: TorrentInfo): number => {
  let score = 0;
  const maxScore = 100;

  // Quality score (25%)
  if (torrent.quality) {
    switch (torrent.quality.toLowerCase()) {
      case "2160p":
      case "4k":
        score += 25;
        break;
      case "1080p":
        score += 20;
        break;
      case "720p":
        score += 15;
        break;
      default:
        score += 10;
    }
  }

  // Source reputation (25%)
  score += 25;

  // Seeders score (25%)
  if (torrent.seeds) {
    if (torrent.seeds > 1000) score += 25;
    else if (torrent.seeds > 500) score += 20;
    else if (torrent.seeds > 100) score += 15;
    else if (torrent.seeds > 50) score += 10;
    else score += 5;
  }

  // Additional metadata (25%)
  if (torrent.size) score += 10;
  if (torrent.date_uploaded) score += 5;
  if (torrent.type) score += 5;
  if (torrent.peers && torrent.peers > 0) score += 5;

  return Math.min(score, maxScore);
};

export const sortTorrents = (torrents: TorrentInfo[]): TorrentInfo[] => {
  return [...torrents].sort((a, b) => {
    // First by main movie status
    if (a.is_main_movie && !b.is_main_movie) return -1;
    if (!a.is_main_movie && b.is_main_movie) return 1;

    // Then by quality
    const qualityOrder = {
      '2160p': 4,
      '1080p': 3,
      '720p': 2,
      '480p': 1
    };
    const qualityDiff = (qualityOrder[b.resolution as keyof typeof qualityOrder] || 0) -
                       (qualityOrder[a.resolution as keyof typeof qualityOrder] || 0);
    if (qualityDiff !== 0) return qualityDiff;

    // Then by seeds
    const seedsDiff = (b.seeds || 0) - (a.seeds || 0);
    if (seedsDiff !== 0) return seedsDiff;

    return (b.trustScore || 0) - (a.trustScore || 0);
  });
};

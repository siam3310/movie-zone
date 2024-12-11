import axios from 'axios';

const TORRENTIO_BASE_URL = 'https://torrentio.strem.fun';

export interface TorrentioResult {
  name: string;
  title: string;
  infoHash: string;
  quality: string;
  size: string;
  seeds: number;
  peers: number;
  magnetLink: string;
}

export interface TorrentioResponse {
  streams: {
    name: string;
    title: string;
    infoHash: string;
    fileIdx: number | null;
    behaviorHints: {
      bingeGroup: string;
    };
  }[];
}

export const getTVShowTorrents = async (
  imdbId: string,
  season: number,
  episode: number
): Promise<TorrentioResult[]> => {
  try {
    const response = await axios.get<TorrentioResponse>(
      `${TORRENTIO_BASE_URL}/stream/${imdbId}:${season}:${episode}.json`
    );

    return response.data.streams
      .filter(stream => stream.infoHash) // Filter out invalid streams
      .map(stream => {
        // Parse quality and size from the stream name
        const qualityMatch = stream.name.match(/\[(.*?)\]/);
        const sizeMatch = stream.name.match(/\{(.*?)\}/);
        const seedsMatch = stream.name.match(/Seeds: (\d+)/);
        const peersMatch = stream.name.match(/Peers: (\d+)/);

        const quality = qualityMatch ? qualityMatch[1] : 'Unknown';
        const size = sizeMatch ? sizeMatch[1] : 'Unknown';
        const seeds = seedsMatch ? parseInt(seedsMatch[1]) : 0;
        const peers = peersMatch ? parseInt(peersMatch[1]) : 0;

        // Generate magnet link
        const magnetLink = `magnet:?xt=urn:btih:${stream.infoHash}&tr=http://tracker.opentrackr.org:1337/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://9.rarbg.com:2810/announce&tr=udp://tracker.openbittorrent.com:6969/announce&tr=http://tracker.openbittorrent.com:80/announce`;

        return {
          name: stream.name,
          title: stream.title,
          infoHash: stream.infoHash,
          quality,
          size,
          seeds,
          peers,
          magnetLink,
        };
      })
      .sort((a, b) => b.seeds - a.seeds); // Sort by seeds count
  } catch (error) {
    console.error('Error fetching torrents from Torrentio:', error);
    return [];
  }
};

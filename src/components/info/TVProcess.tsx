import { useEffect, useState } from "react";
import { fetchTVSeriesSeasons, fetchSeasonEpisodes, TMDBTVSeries, TMDBEpisode } from "../../utils/imdbApi";
import { Movie } from "../../utils/requests";
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from "../common/LoadingIndicator";
import EpisodeList from "./EpisodeList";
import axios from 'axios';
import { TorrentInfo } from "../../types/torrent";

interface TVProcessProps {
  content: Movie | null;
}

const TORRENTIO_BASE_URL = 'https://torrentio.strem.fun';

export const TVProcess = ({ content }: TVProcessProps) => {
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [seasons, setSeasons] = useState<TMDBTVSeries[]>([]);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [torrents, setTorrents] = useState<{ [key: string]: TorrentInfo[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch torrents for a specific episode
  const fetchTorrents = async (imdbId: string, season: number, episode: number) => {
    try {
      const response = await axios.get(
        `${TORRENTIO_BASE_URL}/stream/${imdbId}:${season}:${episode}.json`
      );

      return response.data.streams.map((stream: any) => {
        // Parse quality and size from stream name
        const qualityMatch = stream.name.match(/\[(.*?)\]/);
        const sizeMatch = stream.name.match(/\{(.*?)\}/);
        const seedsMatch = stream.name.match(/Seeds: (\d+)/);
        const peersMatch = stream.name.match(/Peers: (\d+)/);

        return {
          infoHash: stream.infoHash,
          quality: qualityMatch ? qualityMatch[1] : 'Unknown',
          size: sizeMatch ? sizeMatch[1] : 'Unknown',
          seeds: seedsMatch ? parseInt(seedsMatch[1]) : 0,
          peers: peersMatch ? parseInt(peersMatch[1]) : 0,
          provider: stream.name.split('\n')[0],
          magnetLink: `magnet:?xt=urn:btih:${stream.infoHash}&tr=http://tracker.opentrackr.org:1337/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://9.rarbg.com:2810/announce&tr=udp://tracker.openbittorrent.com:6969/announce`
        };
      }).sort((a: TorrentInfo, b: TorrentInfo) => b.seeds - a.seeds);
    } catch (error) {
      console.error('Error fetching torrents:', error);
      return [];
    }
  };

  // Fetch TV series seasons
  useEffect(() => {
    const fetchSeasons = async () => {
      if (!content?.id) return;

      setIsLoading(true);
      setError(null);

      try {
        const tvDetails = await fetchTVSeriesSeasons(content.id.toString());
        // Filter out season 0 and sort seasons by number
        const filteredSeasons = tvDetails.seasons
          .filter(season => season.season_number > 0)
          .sort((a, b) => a.season_number - b.season_number);
        
        setSeasons(filteredSeasons);
        
        // Set initial season to 1 or the first available season
        if (filteredSeasons.length > 0) {
          setSelectedSeason(filteredSeasons[0].season_number);
        }
      } catch (err) {
        console.error("Error fetching seasons:", err);
        setError("Failed to fetch season information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, [content]);

  // Fetch episodes and torrents for selected season
  useEffect(() => {
    const fetchEpisodesAndTorrents = async () => {
      if (!content?.id || !selectedSeason) return;

      setIsLoading(true);
      setError(null);

      try {
        const seasonData = seasons.find(s => s.season_number === selectedSeason);
        if (!seasonData || !seasonData.episodes) {
          setError("No episodes found for this season");
          return;
        }

        // Add IMDB ID to each episode
        const episodesWithImdbId = seasonData.episodes.map(episode => ({
          ...episode,
          imdb_id: content?.imdb_id || null
        }));

        setEpisodes(episodesWithImdbId);

        // Fetch torrents for all episodes in parallel
        const torrentPromises = episodesWithImdbId.map(episode =>
          fetchTorrents(
            episode.imdb_id,
            selectedSeason,
            episode.episode_number
          ).then(torrentList => ({
            episodeNumber: episode.episode_number,
            torrents: torrentList
          }))
        );

        const torrentResults = await Promise.all(torrentPromises);
        const newTorrents: { [key: string]: TorrentInfo[] } = {};
        
        torrentResults.forEach(({ episodeNumber, torrents }) => {
          newTorrents[`${selectedSeason}:${episodeNumber}`] = torrents;
        });

        setTorrents(newTorrents);
      } catch (err) {
        console.error("Error fetching episodes and torrents:", err);
        setError("Failed to fetch episode information");
      } finally {
        setIsLoading(false);
      }
    };

    if (seasons.length > 0) {
      fetchEpisodesAndTorrents();
    }
  }, [content, selectedSeason, seasons]);

  const handleTorrentDownload = (torrent: TorrentInfo) => {
    window.open(torrent.magnetLink);
  };

  if (isLoading) {
    return <LoadingIndicator />;
  }

  if (error) {
    return <ErrorMessage message={error} />;
  }

  return (
    <div className="space-y-8">
      {/* Season Selector */}
      <div className="flex flex-wrap gap-2">
        {seasons.map((season) => (
          <button
            key={season.season_number}
            onClick={() => setSelectedSeason(season.season_number)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors duration-200 ${
              selectedSeason === season.season_number
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800/60 text-gray-300 hover:bg-gray-800'
            }`}
          >
            Season {season.season_number}
          </button>
        ))}
      </div>

      {/* Episodes List */}
      {selectedSeason && episodes && (
        <EpisodeList
          episodes={episodes}
          seasonNumber={selectedSeason}
          imdbId={content.imdb_id}
        />
      )}
    </div>
  );
};

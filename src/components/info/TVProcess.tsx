import { useEffect, useState } from "react";
import { Movie } from "../../utils/requests";
import ErrorMessage from './ErrorMessage';
import LoadingIndicator from "../common/LoadingIndicator";
import EpisodeList from "./EpisodeList";
import axios from 'axios';
import { TorrentInfo, TMDBEpisode, TMDBSeason } from "../../types";

interface TVProcessProps {
  content: Movie;
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  selectedQuality: string;
  setSelectedQuality: (quality: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

const TORRENTIO_BASE_URL = 'https://torrentio.strem.fun';

export const TVProcess = ({ 
  content,
  selectedSeason,
  setSelectedSeason,
  selectedQuality,
  setSelectedQuality,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: TVProcessProps) => {
  const [seasons, setSeasons] = useState<TMDBSeason[]>([]);
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([]);
  const [torrents, setTorrents] = useState<{ [key: string]: TorrentInfo[] }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch seasons and episodes
  useEffect(() => {
    const fetchSeasons = async () => {
      if (!content?.id) return;
      
      setIsLoading(true);
      try {
        const response = await axios.get(
          `https://api.themoviedb.org/3/tv/${content.id}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
        );
        setSeasons(response.data.seasons || []);
        
        // Fetch episodes for the selected season
        if (selectedSeason) {
          const episodesResponse = await axios.get(
            `https://api.themoviedb.org/3/tv/${content.id}/season/${selectedSeason}?api_key=${import.meta.env.VITE_TMDB_API_KEY}`
          );
          setEpisodes(episodesResponse.data.episodes || []);

          // Fetch torrents for each episode
          if (content.imdb_id) {
            const newTorrents: { [key: string]: TorrentInfo[] } = {};
            for (const episode of episodesResponse.data.episodes) {
              try {
                const torrentResponse = await axios.get(
                  `${TORRENTIO_BASE_URL}/stream/${content.imdb_id}:${selectedSeason}:${episode.episode_number}.json`
                );
                
                const episodeTorrents = torrentResponse.data.streams.map((stream: any) => {
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

                newTorrents[episode.episode_number] = episodeTorrents;
              } catch (error) {
                console.error(`Error fetching torrents for episode ${episode.episode_number}:`, error);
              }
            }
            setTorrents(newTorrents);
          }
        }
      } catch (error) {
        console.error('Error fetching TV series data:', error);
        setError('Failed to load TV series data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeasons();
  }, [content?.id, content?.imdb_id, selectedSeason]);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <ErrorMessage message={error} />;

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
      {selectedSeason && episodes.length > 0 && (
        <EpisodeList
          episodes={episodes}
          selectedSeason={selectedSeason}
          onWatch={(episode) => {
            // Handle episode watch action
            console.log('Watch episode:', episode);
          }}
          torrents={torrents}
          selectedQuality={selectedQuality}
          setSelectedQuality={setSelectedQuality}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          itemsPerPage={itemsPerPage}
          imdbId={content?.imdb_id}
          tmdbId={content?.id?.toString()}
        />
      )}
    </div>
  );
};

export default TVProcess;

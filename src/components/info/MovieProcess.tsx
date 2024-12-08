import { useEffect, useState } from "react";
import { Movie } from "../../utils/requests";
import { MovieDetails, TorrentInfo } from "../../types/torrent";
import { TorrentList } from "../common/TorrentList";
import { normalizeTitle, getTitleVariations, calculateTrustScore, sortTorrents } from "../../utils/torrentUtils";

interface MovieProcessProps {
  content: Movie | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
}

export const MovieProcess = ({
  content,
  currentPage,
  setCurrentPage,
  itemsPerPage,
}: MovieProcessProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ytsMovie, setYtsMovie] = useState<MovieDetails | null>(null);
  const [torrents, setTorrents] = useState<TorrentInfo[]>([]);

  const handleTorrentDownload = async (torrent: TorrentInfo) => {
    if (!torrent.download_url) {
      console.error("Invalid torrent URL");
      return;
    }

    try {
      // Fetch the torrent file
      const response = await fetch(torrent.download_url);
      const blob = await response.blob();

      // Create a download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${ytsMovie?.title_long || 'movie'}-${torrent.quality}.torrent`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error("Error downloading torrent file:", error);
    }
  };

  const handleMagnetDownload = (torrent: TorrentInfo) => {
    if (!torrent.hash) {
      console.error("Invalid torrent hash");
      return;
    }

    const trackers = [
      "udp://open.demonii.com:1337/announce",
      "udp://tracker.openbittorrent.com:80",
      "udp://tracker.coppersurfer.tk:6969",
      "udp://glotorrents.pw:6969/announce",
      "udp://tracker.opentrackr.org:1337/announce",
      "udp://torrent.gresille.org:80/announce",
      "udp://p4p.arenabg.com:1337",
      "udp://tracker.leechers-paradise.org:6969",
    ];

    const magnetLink = `magnet:?xt=urn:btih:${
      torrent.hash
    }&dn=${encodeURIComponent(ytsMovie?.title_long || "")}&${trackers
      .map((t) => `tr=${encodeURIComponent(t)}`)
      .join("&")}`;

    window.open(magnetLink, '_blank');
  };

  useEffect(() => {
    const fetchYTSMovie = async () => {
      if (!content?.title) return;

      setIsLoading(true);
      setError(null);

      try {
        const imdbId = content.imdb_id || '';
        const year = content.release_date ? new Date(content.release_date).getFullYear() : '';
        
        // Create search queries for each variation
        const titleVariations = getTitleVariations(content.title);
        const searchQueries = titleVariations.flatMap(title => [
          `query_term=${encodeURIComponent(title)}`,
          year ? `query_term=${encodeURIComponent(title)}&year=${year}` : null,
          `query_term=${encodeURIComponent(title.split(' ').slice(0, 2).join(' '))}`
        ]).filter(Boolean);

        if (imdbId) {
          searchQueries.unshift(`imdb_id=${imdbId}`);
        }

        let allMovies: MovieDetails[] = [];
        let mainMovie: MovieDetails | null = null;

        // Fetch from all search queries
        for (const query of searchQueries) {
          if (mainMovie) break;

          const searchUrl = `${import.meta.env.VITE_YTS_API_URL}/list_movies.json?${query}&limit=50&sort_by=seeds`;
          const response = await fetch(searchUrl);
          const data = await response.json();

          if (data.status === "ok" && data.data.movies) {
            const movies = data.data.movies.filter((m: MovieDetails) => {
              const movieNormalizedTitle = normalizeTitle(m.title);
              const titleMatch = titleVariations.some(variation => 
                normalizeTitle(variation) === movieNormalizedTitle ||
                movieNormalizedTitle.includes(normalizeTitle(variation)) ||
                normalizeTitle(variation).includes(movieNormalizedTitle)
              );
              const yearMatch = !year || Math.abs(m.year - year) <= 1;
              return titleMatch && yearMatch;
            });

            if (!mainMovie) {
              mainMovie = movies.find((m: MovieDetails) => {
                const exactTitleMatch = titleVariations.some(variation => 
                  normalizeTitle(variation) === normalizeTitle(m.title)
                );
                return exactTitleMatch && (!year || m.year === year);
              });
            }

            movies.forEach((movie: MovieDetails) => {
              if (!allMovies.some(m => m.id === movie.id)) {
                allMovies.push(movie);
              }
            });
          }
        }

        if (!mainMovie && allMovies.length > 0) {
          allMovies.sort((a, b) => {
            const aTitleMatch = titleVariations.some(v => 
              normalizeTitle(v) === normalizeTitle(a.title)
            );
            const bTitleMatch = titleVariations.some(v => 
              normalizeTitle(v) === normalizeTitle(b.title)
            );
            
            if (aTitleMatch && !bTitleMatch) return -1;
            if (!aTitleMatch && bTitleMatch) return 1;
            
            if (year) {
              return Math.abs(a.year - year) - Math.abs(b.year - year);
            }
            return 0;
          });
          
          mainMovie = allMovies[0];
        }

        if (mainMovie) {
          setYtsMovie(mainMovie);
          const allTorrents: TorrentInfo[] = [];

          for (const movie of allMovies) {
            try {
              const detailsUrl = `${import.meta.env.VITE_YTS_API_URL}/movie_details.json?movie_id=${movie.id}&with_images=true&with_cast=true`;
              const detailsResponse = await fetch(detailsUrl);
              const detailsData = await detailsResponse.json();

              if (detailsData.status === "ok" && detailsData.data.movie) {
                const movieDetails = detailsData.data.movie;

                if (movieDetails.torrents) {
                  const processedTorrents = movieDetails.torrents.map(torrent => ({
                    ...torrent,
                    title: `${movieDetails.title} ${movieDetails.year ? `(${movieDetails.year})` : ''} - ${torrent.quality} ${torrent.type}`,
                    source: 'YTS',
                    trustScore: calculateTrustScore(torrent),
                    date_uploaded: torrent.date_uploaded,
                    size: torrent.size,
                    download_count: movieDetails.download_count || (torrent.seeds + torrent.peers),
                    uploader: 'YTS.MX',
                    language: movieDetails.language || 'English',
                    description: movieDetails.description_full,
                    rating: movieDetails.rating,
                    runtime: movieDetails.runtime,
                    genres: movieDetails.genres,
                    is_main_movie: movieDetails.id === mainMovie?.id,
                    imdb_code: movieDetails.imdb_code,
                    yt_trailer_code: movieDetails.yt_trailer_code,
                    cast: movieDetails.cast,
                    download_url: torrent.url,
                    quality_details: `${torrent.quality} ${torrent.type}`,
                    resolution: torrent.quality,
                    encoding: torrent.type,
                    hash: torrent.hash
                  }));

                  allTorrents.push(...processedTorrents);
                }
              }
            } catch (err) {
              console.error(`Error fetching details for movie ${movie.id}:`, err);
            }
          }

          const uniqueTorrents = allTorrents.filter((torrent, index, self) =>
            index === self.findIndex(t => t.hash === torrent.hash)
          );

          setTorrents(sortTorrents(uniqueTorrents));

          if (allTorrents.length === 0) {
            setError("No download options available");
          }
        } else {
          setError("Movie not found");
        }
      } catch (err) {
        console.error("Error fetching YTS movies:", err);
        setError("Failed to fetch download options");
      } finally {
        setIsLoading(false);
      }
    };

    fetchYTSMovie();
  }, [content?.title, content?.release_date, content?.imdb_id]);

  if (isLoading) {
    return <div className="p-4">Loading download options...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <TorrentList
      torrents={torrents}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      onPageChange={setCurrentPage}
      onDownload={handleTorrentDownload}
      onMagnetDownload={handleMagnetDownload}
    />
  );
};

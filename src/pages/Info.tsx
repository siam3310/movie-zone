import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { Movie, baseUrl } from "../utils/requests";
import {
  FaDownload,
  FaPlay,
  FaPlus,
  FaShareAlt,
  FaThumbsUp,
} from "react-icons/fa";
import { Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled components for custom skeletons
const ContentSkeleton = styled("div")({
  width: "100%",
  minHeight: "100vh",
  position: "relative",
  backgroundColor: "#141414",
});

const ImageSkeleton = styled(Skeleton)({
  transform: "scale(1, 1)",
  backgroundColor: "#2b2b2b",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)",
  },
});

interface TorrentInfo {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
}

interface MovieDetails {
  id: number;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  language: string;
  torrents: TorrentInfo[];
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
}

interface TVEpisode {
  title: string;
  episode: number;
  season: number;
  magnet_link: string;
  size: string;
  seeds: number;
  peers: number;
  quality: string;
}

interface TVSeriesDetails {
  episodes: TVEpisode[];
  seasons: number[];
}

function Info() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ytsMovie, setYtsMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ytsError, setYtsError] = useState<string | null>(null);
  const [tvSeries, setTVSeries] = useState<TVSeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isTVLoading, setIsTVLoading] = useState(false);
  const [tvError, setTVError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  useEffect(() => {
    async function fetchContent() {
      if (!id || !type) {
        console.error("Missing id or type");
        setError("Invalid content parameters");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      if (type !== "movie" && type !== "tv") {
        console.error("Invalid type:", type);
        setError("Invalid content type");
        setTimeout(() => navigate("/"), 2000);
        return;
      }

      setLoading(true);
      setError(null);

      const fetchData = async () => {
        try {
          const contentRes = await axios.get(`/${type}/${id}`);
          const contentData = contentRes.data;

          setContent({
            ...contentData,
            title: type === "tv" ? contentData.name : contentData.title,
            release_date:
              type === "tv"
                ? contentData.first_air_date
                : contentData.release_date,
            media_type: type,
            backdrop_path: contentData.backdrop_path,
            cast: [],
            crew: [],
          });

          try {
            const [videosRes, creditsRes] = await Promise.all([
              axios.get(`/${type}/${id}/videos`),
              axios.get(`/${type}/${id}/credits`),
            ]);

            setContent((prev) => ({
              ...prev!,
              cast: creditsRes.data.cast || [],
              crew: creditsRes.data.crew || [],
            }));

            const trailer = videosRes.data.results?.find(
              (video: any) => video.type === "Trailer"
            );
            setTrailer(
              trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : ""
            );
          } catch (error) {
            console.error("Error fetching additional data:", error);
          }
        } catch (error: any) {
          console.error("Error fetching main content:", error);
          setError(
            error.response?.status === 404
              ? "Content not found"
              : "Error loading content"
          );
          setTimeout(() => navigate("/"), 2000);
        }
      };

      fetchData().finally(() => setLoading(false));
    }

    fetchContent();
  }, [id, type, navigate]);

  useEffect(() => {
    const fetchYTSMovie = async () => {
      if (!content) return;

      setIsLoading(true);
      setYtsError(null);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_YTS_API_URL}/list_movies.json?query_term=${encodeURIComponent(
            content.title
          )}`
        );
        const data = await response.json();

        if (
          data.status === "ok" &&
          data.data.movies &&
          data.data.movies.length > 0
        ) {
          const matchedMovie =
            data.data.movies.find(
              (m: MovieDetails) =>
                m.title.toLowerCase() === content.title.toLowerCase() &&
                m.year === new Date(content.release_date).getFullYear()
            ) || data.data.movies[0];

          setYtsMovie(matchedMovie);
        }
      } catch (err) {
        setYtsError("Failed to fetch movie download information");
        console.error("Error fetching YTS movie:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchYTSMovie();
  }, [content]);

  useEffect(() => {
    const fetchTVSeriesData = async () => {
      if (!content || type !== "tv") return;

      // console.log('Fetching TV series data for:', content.title);
      setIsTVLoading(true);
      setTVError(null);

      try {
        const imdbResponse = await fetch(
          `https://api.themoviedb.org/3/tv/${content.id}/external_ids?api_key=${
            import.meta.env.VITE_TMDB_API_KEY
          }`
        );
        const imdbData = await imdbResponse.json();
        const imdbId = imdbData.imdb_id;

        if (!imdbId) {
          setTVError("Could not find TV series information");
          return;
        }

        const response = await fetch(
          `https://torrentio.strem.fun/stream/movie/${imdbId}.json`
        );
        const data = await response.json();

        // console.log('Torrent data:', data);

        if (data && data.streams && data.streams.length > 0) {
          const processedEpisodes: TVEpisode[] = [];
          const seasonsSet = new Set<number>();

          data.streams.forEach((stream: any) => {
            const title = stream.title;
            const seasonMatch = title.match(/S(\d{1,2})/i);
            const episodeMatch = title.match(/E(\d{1,2})/i);
            const qualityMatch = title.match(/\b(720p|1080p|2160p|4K)\b/i);

            if (seasonMatch && episodeMatch) {
              const season = parseInt(seasonMatch[1]);
              const episode = parseInt(episodeMatch[1]);
              seasonsSet.add(season);

              const size = stream.size ? formatBytes(stream.size) : "Unknown";

              processedEpisodes.push({
                title: stream.title,
                season,
                episode,
                magnet_link: stream.url,
                size,
                seeds: stream.seeds || 0,
                peers: stream.peers || 0,
                quality: qualityMatch ? qualityMatch[0] : "Unknown",
              });
            }
          });

          const seasons = Array.from(seasonsSet).sort((a, b) => a - b);
          if (seasons.length > 0) {
            setSelectedSeason(seasons[0]);
          }

          setTVSeries({
            episodes: processedEpisodes,
            seasons,
          });
        } else {
          setTVError("No episodes found for this TV series");
        }
      } catch (err) {
        console.error("Error fetching TV series:", err);
        setTVError("Failed to fetch TV series download information");
      } finally {
        setIsTVLoading(false);
      }
    };

    fetchTVSeriesData();
  }, [content, type]);

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!bytes) return "0 Bytes";

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const handleDownload = (torrent: TorrentInfo) => {
    const magnetLink = `magnet:?xt=urn:btih:${
      torrent.hash
    }&dn=${encodeURIComponent(
      content?.title || ""
    )}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://tracker.coppersurfer.tk:6969&tr=udp://glotorrents.pw:6969/announce&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://torrent.gresille.org:80/announce&tr=udp://p4p.arenabg.com:1337&tr=udp://tracker.leechers-paradise.org:6969`;

    const a = document.createElement("a");
    a.href = magnetLink;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleTVDownload = (episode: TVEpisode) => {
    // console.log('Downloading episode:', episode);
    window.location.href = episode.magnet_link;
  };

  const LoadingSkeleton = () => (
    <ContentSkeleton>
      {/* Hero Section Skeleton */}
      <div className="relative h-[90vh]">
        <ImageSkeleton
          variant="rectangular"
          width="100%"
          height="100%"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

        {/* Content Skeleton */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto space-y-6">
            <Skeleton
              variant="text"
              width="70%"
              height={80}
              sx={{ bgcolor: "#2b2b2b" }}
            />

            <div className="flex flex-wrap items-center gap-4">
              {[...Array(4)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  width={80}
                  height={24}
                  sx={{ bgcolor: "#2b2b2b" }}
                />
              ))}
            </div>

            <div className="space-y-3 max-w-3xl">
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  variant="text"
                  width={`${90 - i * 15}%`}
                  height={24}
                  sx={{ bgcolor: "#2b2b2b" }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Skeleton
                variant="rectangular"
                width={150}
                height={48}
                sx={{ bgcolor: "#2b2b2b", borderRadius: 1 }}
              />
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                sx={{ bgcolor: "#2b2b2b" }}
              />
              <Skeleton
                variant="circular"
                width={48}
                height={48}
                sx={{ bgcolor: "#2b2b2b" }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section Skeleton */}
      <div className="px-4 py-12 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <Skeleton
            variant="text"
            width={200}
            height={40}
            sx={{ bgcolor: "#2b2b2b", marginBottom: 4 }}
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-2">
                <ImageSkeleton
                  variant="rectangular"
                  width="100%"
                  height={0}
                  sx={{
                    paddingTop: "150%", // 2:3 Aspect Ratio
                    borderRadius: 1,
                  }}
                />
                <Skeleton
                  variant="text"
                  width="80%"
                  height={24}
                  sx={{ bgcolor: "#2b2b2b" }}
                />
                <Skeleton
                  variant="text"
                  width="60%"
                  height={20}
                  sx={{ bgcolor: "#2b2b2b" }}
                />
              </div>
            ))}
          </div>

          {/* Additional Info Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="space-y-2">
                    <Skeleton
                      variant="text"
                      width={100}
                      height={20}
                      sx={{ bgcolor: "#2b2b2b" }}
                    />
                    <Skeleton
                      variant="text"
                      width="100%"
                      height={24}
                      sx={{ bgcolor: "#2b2b2b" }}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </ContentSkeleton>
  );

  const Pagination = ({
    totalItems,
    currentPage,
    setCurrentPage,
    itemsPerPage,
  }: {
    totalItems: number;
    currentPage: number;
    setCurrentPage: (page: number) => void;
    itemsPerPage: number;
  }) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    return (
      <div className="flex justify-center items-center mt-8 mb-4">
        <nav
          className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
          aria-label="Pagination"
        >
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-4 py-2 rounded-l-md border ${
              currentPage === 1
                ? "bg-gray-700 border-gray-600 cursor-not-allowed"
                : "bg-[#2F2F2F] border-gray-600 hover:bg-[#3F3F3F]"
            } text-sm font-medium text-white transition duration-300`}
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((page) => {
              const shouldShow =
                page === 1 ||
                page === totalPages ||
                Math.abs(page - currentPage) <= 1;
              return shouldShow;
            })
            .map((page, index, array) => {
              if (index > 0 && page - array[index - 1] > 1) {
                return (
                  <span
                    key={`ellipsis-${page}`}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-600 bg-[#2F2F2F] text-sm font-medium text-gray-400"
                  >
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-600 text-sm font-medium ${
                    currentPage === page
                      ? "z-10 bg-[#E50914] text-white border-[#E50914]"
                      : "bg-[#2F2F2F] text-white hover:bg-[#3F3F3F]"
                  } transition duration-300`}
                >
                  {page}
                </button>
              );
            })}

          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-4 py-2 rounded-r-md border ${
              currentPage === totalPages
                ? "bg-gray-700 border-gray-600 cursor-not-allowed"
                : "bg-[#2F2F2F] border-gray-600 hover:bg-[#3F3F3F]"
            } text-sm font-medium text-white transition duration-300`}
          >
            Next
          </button>
        </nav>
      </div>
    );
  };

  const getCurrentItems = <T extends unknown>(items: T[]): T[] => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return items.slice(indexOfFirstItem, indexOfLastItem);
  };

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen text-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error}</h1>
          <p>Redirecting to home...</p>
        </div>
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="relative min-h-screen bg-[#141414]">
      {/* Hero Section with Background Image */}
      <div className="relative h-[90vh] w-full">
        {/* Background Image */}
        <div className="absolute top-0 left-0 h-full w-full">
          <img
            src={`https://image.tmdb.org/t/p/original${content.backdrop_path}`}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-[#141414]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            {/* Logo or Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
              {content.title}
            </h1>

            {/* Metadata Row */}
            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6 text-sm md:text-base">
              <span className="text-green-500 font-semibold text-lg">
                {Math.round(content.vote_average * 10)}% Match
              </span>
              <span className="font-medium">
                {new Date(content.release_date).getFullYear()}
              </span>
              <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
                HD
              </span>
              <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
                {content.media_type === "movie" ? "Movie" : "TV Series"}
              </span>
              {content.runtime && (
                <span className="font-medium">
                  {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                </span>
              )}
            </div>

            {/* Overview */}
            <p className="text-white/90 text-lg max-w-3xl mb-8 leading-relaxed line-clamp-3 md:line-clamp-none">
              {content.overview}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 px-8 py-3 bg-gray-500/30 hover:bg-gray-500/40 text-white rounded transition duration-300 group"
              >
                <FaPlay className="text-2xl group-hover:scale-110 transition duration-300" />
                <span className="font-semibold text-lg">Watch Trailer</span>
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500/30 hover:bg-gray-500/40 transition duration-300 group"
                  title="Add to My List"
                >
                  <FaPlus className="text-white text-xl group-hover:scale-110 transition duration-300" />
                </button>
                <button
                  className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500/30 hover:bg-gray-500/40 transition duration-300 group"
                  title="Rate this title"
                >
                  <FaThumbsUp className="text-white text-xl group-hover:scale-110 transition duration-300" />
                </button>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/90">
              {/* Cast */}
              {content.cast && content.cast.length > 0 && (
                <div>
                  <span className="text-white/60 text-sm">Starring: </span>
                  <span className="font-medium">
                    {content.cast
                      .slice(0, 3)
                      .map((c) => c.name)
                      .join(", ")}
                  </span>
                </div>
              )}
              {/* Genres */}
              {content.genres && content.genres.length > 0 && (
                <div>
                  <span className="text-white/60 text-sm">Genres: </span>
                  <span className="font-medium">
                    {content.genres.map((g: any) => g.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Section */}
      <div className="px-4 py-12 md:px-8 lg:px-16 bg-[#141414]">
        <div className="max-w-6xl mx-auto">
          {/* Download Section */}
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <FaDownload className="mr-2" />
              Download {type === "tv" ? "Episodes" : "Movie"}
            </h2>
            <div className="bg-[#181818] rounded-lg shadow-xl p-6">
              {type === "movie" ? (
                isLoading ? (
                  <div className="text-center text-white py-4">
                    Loading download options...
                  </div>
                ) : ytsError ? (
                  <div className="text-center text-red-500 py-4">
                    {ytsError}
                  </div>
                ) : !ytsMovie ? (
                  <div className="text-center text-white py-4">
                    No download options available
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {getCurrentItems(ytsMovie.torrents).map(
                        (torrent, index) => (
                          <div
                            key={index}
                            className="bg-[#2F2F2F] rounded-lg p-4 hover:bg-[#3F3F3F] transition duration-300"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="text-lg font-medium text-white">
                                {torrent.quality}
                              </span>
                              <span className="text-sm text-gray-400">
                                {torrent.type}
                              </span>
                            </div>
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">Size</span>
                                <span className="text-white">
                                  {torrent.size}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-400">
                                  Seeds/Peers
                                </span>
                                <div>
                                  <span className="text-green-500">
                                    {torrent.seeds}
                                  </span>
                                  <span className="text-gray-400">/</span>
                                  <span className="text-red-500">
                                    {torrent.peers}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDownload(torrent)}
                              className="w-full py-2 bg-[#E50914] hover:bg-[#F6121D] text-white rounded-md transition duration-300 flex items-center justify-center space-x-2"
                            >
                              <FaDownload />
                              <span>Download</span>
                            </button>
                          </div>
                        )
                      )}
                    </div>
                    {ytsMovie.torrents.length > itemsPerPage && (
                      <Pagination
                        totalItems={ytsMovie.torrents.length}
                        currentPage={currentPage}
                        setCurrentPage={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                      />
                    )}
                  </div>
                )
              ) : (
                <div>
                  {isTVLoading && (
                    <div className="text-center text-white py-4">
                      Loading TV series download options...
                    </div>
                  )}

                  {tvError && (
                    <div className="text-center text-red-500 py-4">
                      {tvError}
                    </div>
                  )}

                  {!isTVLoading && !tvError && !tvSeries && (
                    <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                      <div className="w-16 h-16 mb-4 text-yellow-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">
                        No Download Options Available
                      </h3>
                      <p className="text-gray-400 max-w-md">
                        Sorry, we couldn't find any download options for this TV
                        series at the moment. This could be due to:
                      </p>
                      <ul className="text-gray-400 mt-4 space-y-2 text-left">
                        <li className="flex items-center">
                          <span className="mr-2">•</span>
                          The series being too new or exclusive
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">•</span>
                          Temporary unavailability of download sources
                        </li>
                        <li className="flex items-center">
                          <span className="mr-2">•</span>
                          Regional restrictions
                        </li>
                      </ul>
                      <p className="text-gray-400 mt-4">
                        Please try again later or check other TV series.
                      </p>
                    </div>
                  )}

                  {!isTVLoading &&
                    !tvError &&
                    tvSeries &&
                    tvSeries.episodes.length > 0 && (
                      <div>
                        {/* Season selector */}
                        <div className="mb-6">
                          <label className="text-white text-lg font-medium mb-2 block">
                            Select Season
                          </label>
                          <select
                            value={selectedSeason}
                            onChange={(e) => {
                              setSelectedSeason(Number(e.target.value));
                              setCurrentPage(1);
                            }}
                            className="bg-[#2F2F2F] text-white px-4 py-2 rounded-md w-full md:w-auto focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                          >
                            {tvSeries.seasons.map((season) => (
                              <option key={season} value={season}>
                                Season {season}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {getCurrentItems(
                            tvSeries.episodes
                              .filter((ep) => ep.season === selectedSeason)
                              .sort((a, b) => a.episode - b.episode)
                          ).map((episode, index) => (
                            <div
                              key={index}
                              className="bg-[#2F2F2F] rounded-lg p-4 hover:bg-[#3F3F3F] transition duration-300"
                            >
                              <div className="flex justify-between items-center mb-3">
                                <span className="text-lg font-medium text-white">
                                  Episode {episode.episode}
                                </span>
                                <span className="text-sm text-gray-400">
                                  {episode.quality}
                                </span>
                              </div>
                              <div className="space-y-2 mb-4">
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">Size</span>
                                  <span className="text-white">
                                    {episode.size}
                                  </span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span className="text-gray-400">
                                    Seeds/Peers
                                  </span>
                                  <div>
                                    <span className="text-green-500">
                                      {episode.seeds}
                                    </span>
                                    <span className="text-gray-400">/</span>
                                    <span className="text-red-500">
                                      {episode.peers}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <button
                                onClick={() => handleTVDownload(episode)}
                                className="w-full py-2 bg-[#E50914] hover:bg-[#F6121D] text-white rounded-md transition duration-300 flex items-center justify-center space-x-2"
                              >
                                <FaDownload />
                                <span>Download</span>
                              </button>
                            </div>
                          ))}
                        </div>

                        {tvSeries.episodes.filter(
                          (ep) => ep.season === selectedSeason
                        ).length > itemsPerPage && (
                          <Pagination
                            totalItems={
                              tvSeries.episodes.filter(
                                (ep) => ep.season === selectedSeason
                              ).length
                            }
                            currentPage={currentPage}
                            setCurrentPage={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                          />
                        )}
                      </div>
                    )}
                </div>
              )}
            </div>
          </div>

          {/* Cast Section with Images */}
          {content.cast && content.cast.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Top Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {content.cast.slice(0, 6).map((person: any) => (
                  <div key={person.id} className="group">
                    <div className="aspect-[2/3] relative overflow-hidden rounded-md mb-2">
                      {person.profile_path ? (
                        <img
                          src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                          alt={person.name}
                          className="w-full h-full object-cover object-center transform group-hover:scale-105 transition duration-300"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src =
                              "https://via.placeholder.com/300x450?text=No+Image";
                          }}
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                          <span className="text-sm">No Image</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                    </div>
                    <div>
                      <h3 className="text-white font-medium text-sm truncate">
                        {person.name}
                      </h3>
                      <p className="text-gray-400 text-sm truncate">
                        {person.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Details */}
            <div className="text-white space-y-4">
              <div>
                <span className="text-gray-400 text-sm">Release Date: </span>
                <span className="font-medium">
                  {new Date(content.release_date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {content.runtime && (
                <div>
                  <span className="text-gray-400 text-sm">Runtime: </span>
                  <span className="font-medium">
                    {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                  </span>
                </div>
              )}
              {content.genres && content.genres.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm">Genres: </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {content.genres.map((genre: any) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm font-medium"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {content.vote_average && (
                <div>
                  <span className="text-gray-400 text-sm">Rating: </span>
                  <span className="font-medium">
                    {Math.round(content.vote_average * 10)}%
                    <span className="text-gray-400 text-sm ml-1">
                      ({content.vote_count.toLocaleString()} votes)
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Production Companies */}
            {content.production_companies &&
              content.production_companies.length > 0 && (
                <div className="text-white">
                  <h3 className="text-lg font-semibold mb-3">Production</h3>
                  <div className="space-y-4">
                    {content.production_companies.map((company: any) => (
                      <div key={company.id} className="flex items-center gap-3">
                        {company.logo_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${company.logo_path}`}
                            alt={company.name}
                            className="h-8 object-contain"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-sm">{company.name}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Trailer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-[90%] max-w-5xl aspect-video bg-black">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-lg"
            >
              Close
            </button>
            <iframe
              className="w-full h-full"
              src={trailer?.replace("watch?v=", "embed/")}
              title="Trailer"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}

export default Info;

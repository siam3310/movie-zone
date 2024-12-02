import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Movie } from "../types/movie";
import { TVSeriesDetails, MovieDetails } from "../types/torrent";
import { fetchMovieData, fetchTVSeriesData } from '../utils/mediaHelpers';
import { FaPlay, FaPlus, FaThumbsUp } from "react-icons/fa";
import LoadingSkeleton from "../components/LoadingSkeleton";
import DownloadSection from "../components/DownloadSection";
import axios from "../utils/axios";
import Warning from "@/components/warning";

const View = () => {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [tvSeries, setTVSeries] = useState<TVSeriesDetails | null>(null);
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      // Validate URL parameters
      if (!type || !id || !['movie', 'tv'].includes(type)) {
        setError("Invalid URL parameters");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch content data
        const contentResponse = await axios.get(`/${type}/${id}`);
        const contentData = contentResponse.data;

        if (!contentData || !contentData.id) {
          throw new Error("Content not found");
        }

        // Process content data
        const processedContent = {
          ...contentData,
          id: contentData.id,
          title: type === "tv" ? contentData.name : contentData.title,
          release_date: type === "tv" ? contentData.first_air_date : contentData.release_date,
          media_type: type,
          backdrop_path: contentData.backdrop_path,
          cast: [],
          crew: [],
        };

        setContent(processedContent);

        // Fetch videos and credits in parallel
        const [videosRes, creditsRes] = await Promise.all([
          axios.get(`/${type}/${id}/videos`),
          axios.get(`/${type}/${id}/credits`),
        ]);

        // Set trailer
        const trailerVideo = videosRes.data.results?.find(
          (video: any) => video.type === "Trailer" && video.site === "YouTube"
        );
        setTrailer(trailerVideo ? `https://www.youtube.com/watch?v=${trailerVideo.key}` : "");

        // Update content with credits
        setContent(prev => ({
          ...prev!,
          cast: creditsRes.data.cast || [],
          crew: creditsRes.data.crew || [],
        }));

        // Get release year from valid date or default to current year
        const getYear = (dateStr: string) => {
          const date = new Date(dateStr);
          return !isNaN(date.getTime()) ? date.getFullYear() : new Date().getFullYear();
        };

        const year = type === 'movie'
          ? getYear(contentData.release_date)
          : getYear(contentData.first_air_date);

        // Fetch torrent data
        if (type === 'movie' && contentData.title) {
          const movieData = await fetchMovieData(contentData.id, contentData.title);
          if (movieData) {
            setMovieDetails(movieData);
          }
        } else if (type === 'tv' && contentData.name) {
          const tvData = await fetchTVSeriesData(contentData.id, contentData.name);
          if (tvData) {
            setTVSeries(tvData);
          } else {
            console.warn('No TV series data found:', contentData.name);
          }
        }
      } catch (error: any) {
        console.error('Error fetching data:', error);
        setError(error.response?.status === 404 ? "Content not found" : "Error loading content");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, type]);

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#141414] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl text-white mb-4">{error}</h1>
          <button
            onClick={() => navigate("/")}
            className="mt-4 bg-white text-black px-6 py-2 rounded hover:bg-gray-200 transition-colors"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (!content) {
    return null;
  }

  // Create a merged content object with movie details
  const mergedContent = type === "movie" && movieDetails
    ? { ...content, torrents: movieDetails.torrents }
    : content;

  return (
    <div className="relative min-h-screen bg-[#141414]">
      {/* Hero Section */}
      <div className="relative h-[90vh] w-full">
        <div className="absolute top-0 left-0 h-full w-full">
          <img
            src={`https://image.tmdb.org/t/p/original${content.backdrop_path}`}
            alt={content.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-[#141414]" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-16 md:px-8 lg:px-16">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg tracking-tight">
              {content.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6 text-sm md:text-base">
              <span className="text-green-500 font-semibold text-lg">
                {content.vote_average ? `${Math.round(content.vote_average * 10)}%` : 'N/A'}
                {content.vote_count && (
                  <span className="text-white/60 ml-1">
                    ({content.vote_count.toLocaleString()} votes)
                  </span>
                )}
              </span>
              <span className="font-medium">
                {new Date(content.release_date || '').getFullYear()}
              </span>
              <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
                HD
              </span>
              <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
                {content.media_type === "movie" ? "Movie" : "TV Series"}
              </span>
              {content.runtime && content.runtime > 0 && (
                <span className="font-medium">
                  {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                </span>
              )}
            </div>

            <p className="text-white/90 text-lg max-w-3xl mb-8 leading-relaxed line-clamp-3 md:line-clamp-5">
              {content.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {trailer && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-500/30 hover:bg-gray-500/40 text-white rounded transition duration-300 group"
                >
                  <FaPlay className="text-2xl group-hover:scale-110 transition duration-300" />
                  <span className="font-semibold text-lg">Watch Trailer</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500/30 hover:bg-gray-500/40 transition duration-300 group">
                  <FaPlus className="text-white text-xl group-hover:scale-110 transition duration-300" />
                </button>
                <button className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-500/30 hover:bg-gray-500/40 transition duration-300 group">
                  <FaThumbsUp className="text-white text-xl group-hover:scale-110 transition duration-300" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white/90">
              {content.cast && content.cast.length > 0 && (
                <div>
                  <span className="text-white/60 text-sm">Starring: </span>
                  <span className="font-medium">
                    {content.cast.slice(0, 3).map((c) => c.name).join(", ")}
                  </span>
                </div>
              )}
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

      <div className="px-4 py-8 md:px-8 lg:px-16 bg-[#141414] mt-12">
        <div className="max-w-6xl mx-auto">
          {/* Download Section */}
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8">Downloads</h2>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : error ? (
              <div className="bg-[#2D1B1B] border border-red-500/30 rounded-lg p-6 backdrop-blur-sm">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 bg-red-500/10 rounded-full p-2">
                    <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-red-500">Error Loading Content</h3>
                    <p className="mt-1 text-gray-300/80">{error}</p>
                  </div>
                </div>
              </div>
            ) : (type === 'movie' && movieDetails) || (type === 'tv' && tvSeries) ? (
              <DownloadSection
                type={type as 'movie' | 'tv'}
                content={type === 'movie' ? movieDetails : tvSeries}
              />
            ) : (
              <Warning />
            )}
          </div>
          {/* Additional Sections */}
          {!loading && !error && content && (
            <>
              {/* Cast Section */}
              {content.cast && content.cast.length > 0 && (
                <div className="mt-16">
                  <h2 className="text-3xl font-semibold text-white mb-8">Top Cast</h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {content.cast.slice(0, 6).map((person: any) => (
                      <div key={person.id} className="group">
                        <div className="aspect-[3/4] relative overflow-hidden rounded-lg mb-3">
                          {person.profile_path ? (
                            <img
                              src={`https://image.tmdb.org/t/p/w300${person.profile_path}`}
                              alt={person.name}
                              className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                              loading="lazy"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "https://via.placeholder.com/300x450?text=No+Image";
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-[#1f1f1f] flex items-center justify-center">
                              <span className="text-white/60 text-sm">No Image</span>
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />
                        </div>
                        <h3 className="text-white font-medium text-base truncate">
                          {person.name}
                        </h3>
                        <p className="text-white/60 text-sm truncate">
                          {person.character}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Details Section */}
              <div className="mt-16">
                <h2 className="text-3xl font-semibold text-white mb-8">Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Release Info */}
                  <div className="bg-[#1a1a1a] rounded-lg p-6">
                    <h3 className="text-lg font-medium text-white mb-4">Release Info</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-white/60">Release Date: </span>
                        <span className="text-white">
                          {new Date(content.release_date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-white/60">Rating: </span>
                        <span className="text-white">
                          {content.vote_average ? `${Math.round(content.vote_average * 10)}%` : 'N/A'}
                          {content.vote_count && (
                            <span className="text-white/60 ml-1">
                              ({content.vote_count.toLocaleString()} votes)
                            </span>
                          )}
                        </span>
                      </div>
                      {content.status && (
                        <div>
                          <span className="text-white/60">Status: </span>
                          <span className="text-white">{content.status}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Genres */}
                  {content.genres && content.genres.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {content.genres.map((genre: any) => (
                          <span
                            key={genre.id}
                            className="px-4 py-1.5 bg-[#2a2a2a] text-white/90 rounded-full text-sm"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Production Companies */}
                  {content.production_companies && content.production_companies.length > 0 && (
                    <div className="bg-[#1a1a1a] rounded-lg p-6">
                      <h3 className="text-lg font-medium text-white mb-4">Production</h3>
                      <div className="space-y-4">
                        {content.production_companies.map((company: any) => (
                          <div key={company.id} className="flex items-center gap-3">
                            {company.logo_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                alt={company.name}
                                className="h-8 object-contain"
                                loading="lazy"
                              />
                            ) : (
                              <span className="text-white/90">
                                {company.name}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal */}
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
};

export default View;

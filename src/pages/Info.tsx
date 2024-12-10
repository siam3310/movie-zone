import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Movie } from "../utils/requests";
import {
  FaPlay,
  FaPlus,
  FaThumbsUp,
} from "react-icons/fa";
import { LoadingSkeleton } from "../components/info/skeleton";
import { MovieProcess } from "../components/info/MovieProcess";
import { TVProcess } from "../components/info/TVProcess";

function Info() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("All");

  useEffect(() => {
    const fetchContent = async () => {
      if (!id || !type) {
        navigate("/");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${type}/${id}?api_key=${import.meta.env.VITE_TMDB_API_KEY
          }&append_to_response=videos,credits`
        );

        if (!response.ok) {
          throw new Error("Content not found");
        }

        const data = await response.json();

        // Transform the data to match the Movie type
        setContent({
          ...data,
          title: type === "tv" ? data.name : data.title,
          media_type: type,
          release_date: type === "tv" ? data.first_air_date : data.release_date,
        });

        // Set trailer
        const trailer = data.videos?.results?.find(
          (video: any) =>
            video.type === "Trailer" &&
            (video.site === "YouTube" || video.site === "Vimeo")
        );
        setTrailer(trailer ? trailer.key : null);
      } catch (error) {
        console.error("Error fetching content:", error);
        setError("Failed to load content");
        setTimeout(() => navigate("/"), 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [id, type, navigate]);

  if (loading) {
    return <LoadingSkeleton />;
  }

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
                {type === "movie" ? "Movie" : "TV Series"}
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
              {trailer && (
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-500/30 hover:bg-gray-500/40 text-white rounded transition duration-300 group"
                >
                  <FaPlay className="text-2xl group-hover:scale-110 transition duration-300" />
                  <span className="font-semibold text-lg">Watch Trailer</span>
                </button>
              )}
              {content?.media_type === 'movie' && (
                <button
                  onClick={() => window.open(`https://vidsrc.to/embed/movie/${content.imdb_id}`, '_blank')}
                  className="flex items-center gap-2 px-8 py-3 bg-gray-500/30 hover:bg-gray-500/40 text-white rounded transition duration-300 group"
                >
                  <FaPlay className="text-2xl group-hover:scale-110 transition duration-300" />
                  <span className="font-semibold text-lg">Watch Movie</span>
                </button>
              )}
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
              {content.credits?.cast && content.credits.cast.length > 0 && (
                <div>
                  <span className="text-white/60 text-sm">Starring: </span>
                  <span className="font-medium">
                    {content.credits.cast
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
          <div className="mt-12 mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">
              Download Options
            </h2>
            <div className="bg-[#181818] rounded-lg shadow-xl p-6">
              {type === "movie" ? (
                <MovieProcess
                  content={content}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />
              ) : (
                <TVProcess
                  content={content}
                  selectedSeason={selectedSeason}
                  setSelectedSeason={setSelectedSeason}
                  selectedQuality={selectedQuality}
                  setSelectedQuality={setSelectedQuality}
                  currentPage={currentPage}
                  setCurrentPage={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                />
              )}
            </div>
          </div>

          {/* Cast Section with Images */}
          {content.credits?.cast && content.credits.cast.length > 0 && (
            <div className="mb-12">
              <h2 className="text-2xl font-semibold text-white mb-6">
                Top Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {content.credits.cast.slice(0, 6).map((person: any) => (
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
      {isModalOpen && trailer && (
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
              src={`https://www.youtube.com/embed/${trailer}`}
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
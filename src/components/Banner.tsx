import { useEffect, useState } from "react";
import axios from "../utils/axios";
import { Movie } from "../types/movie";
import { baseUrl } from "../utils/requests";
import { FaPlay } from "react-icons/fa";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@mui/material";

interface Props {
  fetchUrl: string;
}

function Banner({ fetchUrl }: Props) {
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trailerUrl, setTrailerUrl] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        // Fetch both movies and TV shows with more details
        const [moviesResponse, tvResponse] = await Promise.all([
          axios.get('/trending/movie/week?append_to_response=videos'),
          axios.get('/trending/tv/week?append_to_response=videos')
        ]);

        // Process and combine the results
        const allMedia = [
          ...moviesResponse.data.results.map((item: any) => ({
            ...item,
            media_type: 'movie',
            videos: item.videos?.results || []
          })),
          ...tvResponse.data.results.map((item: any) => ({
            ...item,
            media_type: 'tv',
            videos: item.videos?.results || []
          }))
        ].filter((item: any) => item.backdrop_path);

        // Get a random item from the combined results
        const randomItem = allMedia[Math.floor(Math.random() * allMedia.length)];

        // Fetch additional details including videos
        const { data: mediaDetails } = await axios.get(
          `/${randomItem.media_type}/${randomItem.id}?append_to_response=videos,similar,recommendations`
        );

        // Find trailer
        if (mediaDetails.videos?.results?.length > 0) {
          const trailer = mediaDetails.videos.results.find(
            (video: any) => video.type === "Trailer"
          ) || mediaDetails.videos.results[0];

          if (trailer) {
            setTrailerUrl(`https://www.youtube.com/watch?v=${trailer.key}`);
          }
        }

        setMovie({
          ...mediaDetails,
          media_type: randomItem.media_type // Ensure media_type is preserved
        });
      } catch (error) {
        console.error("Error fetching banner data:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchUrl]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleMore = () => {
    if (movie) {
      navigate(`/info/${movie.media_type}/${movie.id}`, {
        state: {
          movie: {
            ...movie,
            media_type: movie.media_type // Ensure media_type is passed
          },
          trailerUrl,
          from: 'banner'
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="relative h-[75vh] md:h-[95vh] lg:h-[115vh] bg-[#141414]">
        {/* Main banner skeleton with shimmer effect */}
        <div className="absolute inset-0">
          <Skeleton
            variant="rectangular"
            width="100%"
            height="100%"
            sx={{
              bgcolor: '#2b2b2b',
              transform: 'scale(1)',
              '&::after': {
                background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)'
              }
            }}
          />
        </div>

        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/60 to-[#141414]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

        {/* Content skeleton */}
        <div className="absolute bottom-[35%] left-8 space-y-6 md:left-12 lg:left-16">
          {/* Title skeleton */}
          <Skeleton
            variant="rectangular"
            width={400}
            height={100}
            sx={{
              bgcolor: '#2b2b2b',
              marginBottom: '1.5rem',
              borderRadius: '4px'
            }}
          />

          {/* Description skeleton */}
          <div className="max-w-xs space-y-3 md:max-w-lg lg:max-w-2xl">
            <Skeleton
              variant="text"
              width="100%"
              height={24}
              sx={{ bgcolor: '#2b2b2b' }}
            />
            <Skeleton
              variant="text"
              width="90%"
              height={24}
              sx={{ bgcolor: '#2b2b2b' }}
            />
            <Skeleton
              variant="text"
              width="75%"
              height={24}
              sx={{ bgcolor: '#2b2b2b' }}
            />
          </div>

          {/* Buttons skeleton */}
          <div className="flex space-x-4">
            <Skeleton
              variant="rectangular"
              width={150}
              height={45}
              sx={{
                bgcolor: '#2b2b2b',
                borderRadius: '4px'
              }}
            />
            <Skeleton
              variant="rectangular"
              width={150}
              height={45}
              sx={{
                bgcolor: '#2b2b2b',
                borderRadius: '4px'
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div className="relative h-[75vh] md:h-[95vh] lg:h-[115vh]">
      <div className="absolute inset-0">
        <img
          src={`${baseUrl}${movie.backdrop_path}`}
          alt={movie.title || movie.name}
          className="h-full w-full object-cover"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#141414]/60 to-[#141414]" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-transparent to-transparent" />

      <div className="absolute bottom-[22%] left-4 space-y-6 md:left-12 lg:left-16">
        <h1 className="text-2xl font-bold text-white md:text-4xl lg:text-6xl">
          {movie.title || movie.name}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-white/90 mb-6 text-sm md:text-base">
          {movie.vote_average && (
            <span className="text-green-500 font-semibold text-lg">
              {Math.round(movie.vote_average * 10)}% Match
            </span>
          )}
          {(movie.release_date || movie.first_air_date) && (
            <span className="font-medium">
              {new Date(movie.release_date || movie.first_air_date || Date.now()).getFullYear()}
            </span>
          )}
          <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
            HD
          </span>
          <span className="px-2 py-0.5 border border-white/40 rounded text-sm font-medium">
            {movie.media_type === 'movie' ? 'Movie' : 'TV Series'}
          </span>
          {movie.runtime && movie.runtime > 0 && (
            <span className="font-medium">
              {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
            </span>
          )}
        </div>

        <h1 className="text-1xl md:text-2xl lg:text-2xl max-w-xs text-shadow-md text-white md:max-w-lg lg:max-w-2xl opacity-80 line-clamp-5">
          {movie.overview}
        </h1>

        <div className="flex space-x-4">
          <button
            onClick={openModal}
            className="flex items-center gap-x-2 rounded bg-white px-8 py-2.5 text-black transition hover:bg-white/80"
          >
            <FaPlay className="h-4 w-4 text-black" /> Play
          </button>

          <button
            onClick={handleMore}
            className="flex items-center gap-x-2 rounded bg-[#6d6d6eb3] px-8 py-2.5 text-white transition hover:bg-[#6d6d6e]"
          >
            <IoMdInformationCircleOutline className="h-5 w-5" /> More Info
          </button>
        </div>
      </div>
      {/* Trailer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="relative w-[90%] max-w-5xl aspect-video bg-black">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 text-lg"
            >
              Close
            </button>
            {trailerUrl ? (
              <iframe
                className="w-full h-full"
                src={trailerUrl.replace("watch?v=", "embed/")}
                title="Trailer"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                No trailer available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Banner;

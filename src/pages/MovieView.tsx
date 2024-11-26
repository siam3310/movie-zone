import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaPlay, FaPlus, FaTimes, FaVolumeOff, FaVolumeUp } from "react-icons/fa";
import ReactPlayer from "react-player";
import axios from "../utils/axios";
import { Movie } from "../utils/requests";
import { Genre } from "../types/movie";
import { baseUrl } from "../utils/requests";

function MovieView() {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState("");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [muted, setMuted] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovie() {
      try {
        // First, fetch basic movie details
        const movieResponse = await axios.get(`/movie/${movieId}`);
        setMovie(movieResponse.data);

        // Then fetch videos and other details
        const videosResponse = await axios.get(`/movie/${movieId}?append_to_response=videos`);
        if (videosResponse.data?.videos) {
          const trailerVideo = videosResponse.data.videos.results.find(
            (video: { type: string }) => video.type === "Trailer"
          );
          setTrailer(trailerVideo?.key || "");
        }
        if (videosResponse.data?.genres) {
          setGenres(videosResponse.data.genres);
        }
      } catch (error) {
        console.error("Error fetching movie details:", error);
        navigate("/new"); // Redirect to New page if there's an error
      } finally {
        setLoading(false);
      }
    }

    if (movieId) {
      fetchMovie();
    }
  }, [movieId, navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-32 w-32 animate-spin rounded-full border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (!movie) {
    return null;
  }

  return (
    <div className="relative min-h-screen bg-[#141414]">
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-4 z-50 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 hover:bg-black/90"
      >
        <FaTimes className="h-5 w-5" />
      </button>

      <div className="relative aspect-video w-full">
        {trailer ? (
          <ReactPlayer
            url={`https://www.youtube.com/watch?v=${trailer}`}
            width="100%"
            height="100%"
            style={{ position: "absolute", top: "0", left: "0" }}
            playing
            muted={muted}
          />
        ) : (
          <img
            src={`${baseUrl}${movie.backdrop_path || movie.poster_path}`}
            alt={movie.title || movie.name}
            className="h-full w-full object-cover"
          />
        )}

        <div className="absolute bottom-10 flex w-full items-center justify-between px-10">
          <div className="flex space-x-2">
            <button className="flex items-center gap-x-2 rounded bg-white px-8 py-2 text-xl font-bold text-black transition hover:bg-[#e6e6e6]">
              <FaPlay className="h-7 w-7 text-black" />
              Play
            </button>

            <button className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[gray] bg-black/30 transition hover:border-white">
              <FaPlus className="h-6 w-6" />
            </button>
          </div>

          <button
            className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[gray] bg-black/30 transition hover:border-white"
            onClick={() => setMuted(!muted)}
          >
            {muted ? (
              <FaVolumeOff className="h-6 w-6" />
            ) : (
              <FaVolumeUp className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold">{movie.title || movie.name}</h1>

          <div className="flex items-center space-x-2 text-sm">
            <p className="font-semibold text-green-400">
              {movie.vote_average ? Math.round(movie.vote_average * 10) : "N/A"}% Match
            </p>
            <p className="font-light">
              {movie.release_date || movie.first_air_date}
            </p>
            <div className="flex h-4 items-center justify-center rounded border border-white/40 px-1.5 text-xs">
              HD
            </div>
          </div>

          <div className="flex flex-col gap-x-10 gap-y-4 font-light md:flex-row">
            <p className="w-full text-lg md:w-4/5">{movie.overview}</p>
            <div className="flex flex-col space-y-3 text-sm">
              <div>
                <span className="text-[gray]">Genres: </span>
                {genres.map((genre) => genre.name).join(", ")}
              </div>

              <div>
                <span className="text-[gray]">Original language: </span>
                {movie.original_language?.toUpperCase()}
              </div>

              <div>
                <span className="text-[gray]">Total votes: </span>
                {movie.vote_count}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MovieView;

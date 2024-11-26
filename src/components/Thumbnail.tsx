import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../utils/requests";
import { FaPlay } from "react-icons/fa";
import { Movie } from "../utils/requests";

interface Props {
  movie: Movie;
}

function Thumbnail({ movie }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    window.scrollTo(0, 0);
    const mediaType = movie.media_type || 'movie';
    navigate(`/info/${mediaType}/${movie.id}`);
  };

  const imageUrl = `${baseUrl}${movie.poster_path || movie.backdrop_path}`;

  return (
    <div
      className="relative h-[230px] min-w-[160px] md:h-[420px] md:min-w-[280px] cursor-pointer transition duration-200 ease-out overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        className={`rounded-sm object-cover md:rounded transition-transform duration-300 ${
          isHovered ? "scale-105" : "scale-100"
        }`}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Gradient and Info */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
      
      <div className="absolute bottom-2 left-2 right-2">
        <h2 className="text-sm font-semibold text-white md:text-base truncate">
          {movie.title || movie.name}
        </h2>
        {movie.vote_average > 0 && (
          <p className="text-xs text-green-400 font-medium">
            {Math.round(movie.vote_average * 10)}% Match
          </p>
        )}
      </div>

      {/* Play Button Overlay */}
      {isHovered && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 transition duration-200">
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 transition hover:bg-white"
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            <FaPlay className="h-5 w-5 text-black pl-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default Thumbnail;

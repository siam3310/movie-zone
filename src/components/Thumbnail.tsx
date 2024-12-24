import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseUrl } from "../utils/requests";
import { FaPlay } from "react-icons/fa";
import { Movie } from "../types/movie";

const FALLBACK_IMAGE = 'https://via.placeholder.com/400x600/1e1e1e/ffffff?text=No+Image+Available';

interface Props {
  movie: Movie;
}

function Thumbnail({ movie }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    window.scrollTo(0, 0);
    const mediaType = movie.media_type || 'movie';
    navigate(`/info/${mediaType}/${movie.id}`);
  };

  const imageUrl = imgError ? FALLBACK_IMAGE : 
    movie.poster_path || movie.backdrop_path ? 
    `${baseUrl}${movie.poster_path || movie.backdrop_path}` : 
    FALLBACK_IMAGE;

  return (
    <div
      className="relative min-w-[160px] md:h-[420px] md:min-w-[280px] cursor-pointer 
                 transition-all duration-300 ease-in-out group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{ willChange: 'transform' }}
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        loading="lazy"
        decoding="async"
        onError={() => setImgError(true)}
        onLoad={() => setIsLoaded(true)}
        className={`rounded-sm object-cover md:rounded w-full h-full
                   transition-all duration-300 ${isHovered ? 'scale-105 brightness-75' : ''}
                   ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{
          willChange: 'transform',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          backfaceVisibility: 'hidden',
        }}
      />

      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-900 animate-pulse rounded-sm" />
      )}

      <div className={`absolute inset-0 flex flex-col justify-end p-4 
                      transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              className="flex items-center justify-center w-10 h-10 rounded-full 
                       bg-white/90 hover:bg-white transition group-hover:scale-110"
              onClick={(e) => {
                e.stopPropagation();
                handleClick();
              }}
            >
              <FaPlay className="h-5 w-5 text-black pl-0.5" />
            </button>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white md:text-base line-clamp-1">
              {movie.title || movie.name}
            </h3>
            {movie.vote_average > 0 && (
              <p className="text-xs text-green-400 font-medium">
                {Math.round(movie.vote_average * 10)}% Match
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Thumbnail;

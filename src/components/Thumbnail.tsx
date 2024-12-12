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
      className="relative h-[230px] min-w-[160px] md:h-[420px] md:min-w-[280px] cursor-pointer 
                 transition-all duration-300 ease-in-out group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <img
        src={imageUrl}
        alt={movie.title || movie.name}
        className={`rounded-sm object-cover md:rounded w-full h-full
                   transition-all duration-300 ${isHovered ? 'scale-105 brightness-75' : ''}`}
      />

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

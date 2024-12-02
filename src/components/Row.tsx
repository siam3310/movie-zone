import { useEffect, useRef, useState } from 'react'
import axios from "../utils/axios";
import Thumbnail from "./Thumbnail";
import { Skeleton } from '@mui/material'
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Movie } from '@/types/movie';

interface Props {
  title: string;
  fetchUrl: string;
  mediaType?: string;
}

function Row({ title, fetchUrl, mediaType = 'movie' }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isMoved, setIsMoved] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setIsLoading(true);
      try {
        const request = await axios.get(fetchUrl);
        if (request.data?.results) {
          // Determine media type based on the fetchUrl
          let mediaType = 'movie';
          if (fetchUrl.includes('/tv/') || fetchUrl.includes('with_networks=213')) {
            mediaType = 'tv';
          } else if (fetchUrl.includes('/trending/all/')) {
            mediaType = 'mixed'; // Will use item's own media_type
          }

          const results = request.data.results.map((item: Movie) => {
            const processedItem = {
              ...item,
              media_type: mediaType === 'mixed' ? item.media_type || 'movie' : mediaType,
              backdrop_path: item.backdrop_path,
              poster_path: item.poster_path
            };
            // console.log('Processed item:', processedItem);
            return processedItem;
          });

          setMovies(results);
        }
      } catch (error) {
        console.error('Error fetching row data:', error);
        setMovies([]); // Set empty array on error
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [fetchUrl, mediaType]);

  const handleClick = (direction: string) => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-0.5 md:space-y-2">
        <Skeleton
          variant="text"
          width={200}
          height={40}
          sx={{ bgcolor: '#2b2b2b', marginBottom: '8px' }}
        />
        <div className="relative">
          <div className="flex items-center space-x-4 overflow-x-hidden scrollbar-hide">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="relative h-[230px] min-w-[160px] md:h-[420px] md:min-w-[280px]">
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height="100%"
                  sx={{
                    bgcolor: '#2b2b2b',
                    borderRadius: '0.125rem',
                    transform: 'scale(1)',
                    '&::after': {
                      background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)'
                    }
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5 md:space-y-2">
      <h2 className="w-56 ml-4 md:ml-8 lg:ml-16 cursor-pointer text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
        {title}
      </h2>

      <div className="group relative md:-ml-2">
        <ChevronLeftIcon
          className={`absolute h-full top-0 bottom-0 left-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100 ${!isMoved && 'hidden'
            }`}
          onClick={() => handleClick('left')}
        />

        <div
          ref={rowRef}
          className="flex items-center space-x-4 overflow-x-hidden scrollbar-hide"
        >
          {movies.map((movie) => (
            <Thumbnail key={movie.id} movie={movie} />
          ))}
        </div>

        <ChevronRightIcon
          className="absolute h-full top-0 bottom-0 right-2 z-40 m-auto h-9 w-9 cursor-pointer opacity-0 transition hover:scale-125 group-hover:opacity-100"
          onClick={() => handleClick('right')}
        />
      </div>
    </div>
  );
}

export default Row;

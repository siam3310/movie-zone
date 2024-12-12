import React, { useEffect, useRef, useState, useCallback } from 'react';
import axios from "../utils/axios";
import Thumbnail from "./Thumbnail";
import { Movie } from "../utils/requests";
import { Skeleton } from '@mui/material';
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useMediaQuery } from 'react-responsive';

interface Props {
  title: string;
  fetchUrl: string;
  mediaType?: string;
}

function Row({ title, fetchUrl, mediaType = 'movie' }: Props) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useMediaQuery({ maxWidth: 768 });

  const handleNavigation = useCallback((direction: 'left' | 'right') => {
    if (!rowRef.current) return;
    
    const scrollAmount = rowRef.current.offsetWidth;
    const newScrollPosition = direction === 'left' 
      ? rowRef.current.scrollLeft - scrollAmount
      : rowRef.current.scrollLeft + scrollAmount;
    
    rowRef.current.scrollTo({
      left: newScrollPosition,
      behavior: 'smooth'
    });
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true);
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
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [fetchUrl, mediaType]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <h2 className="w-56 ml-4 md:ml-8 lg:ml-16 text-sm font-semibold text-[#e5e5e5] md:text-2xl">
          {title}
        </h2>
        <div className="relative">
          <div className="flex items-center space-x-4 overflow-x-hidden px-4 md:px-8 lg:px-16">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="relative h-[230px] min-w-[160px] md:h-[420px] md:min-w-[280px]">
                <Skeleton variant="rectangular" width="100%" height="100%" sx={{ bgcolor: '#2b2b2b' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center px-4 md:px-8 lg:px-16 mb-4">
        <h2 className="text-sm font-semibold text-[#e5e5e5] transition duration-200 hover:text-white md:text-2xl">
          {title}
        </h2>
        {!isMobile && (
          <div className="flex gap-4">
            <button
              onClick={() => handleNavigation('left')}
              className="p-3 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-300"
            >
              <ChevronLeftIcon className="h-6 w-6 text-white" />
            </button>
            <button
              onClick={() => handleNavigation('right')}
              className="p-3 rounded-full bg-black/60 hover:bg-black/80 transition-colors duration-300"
            >
              <ChevronRightIcon className="h-6 w-6 text-white" />
            </button>
          </div>
        )}
      </div>

      <div className="relative overflow-hidden">
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth py-4 px-4 md:px-8 lg:px-16"
        >
          {movies.map((movie) => (
            <div key={movie.id} className="flex-none">
              <Thumbnail movie={movie} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(Row);

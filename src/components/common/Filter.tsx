import { useState, useRef, useEffect } from "react";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { MdOutlineCategory, MdLocalFireDepartment } from "react-icons/md";
import { BsCalendar3, BsStarFill } from "react-icons/bs";
import { TbArrowsSort } from "react-icons/tb";

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
  onClose?: () => void;  // Add this line
}

interface FilterOptions {
  genre: string;
  year: string;
  duration: string;
  sort: string;
  tag?: string;
}

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 50 }, (_, i) => CURRENT_YEAR - i);

const GENRES = [
  "Action",
  "Adventure",
  "Animation",
  "Comedy",
  "Crime",
  "Documentary",
  "Drama",
  "Family",
  "Fantasy",
  "Horror",
  "Mystery",
  "Romance",
  "Sci-Fi",
  "Thriller",
];

const POPULAR_TAGS = [
  "New Releases",
  "Trending Now",
  "Netflix Originals",
  "Action Movies",
  "Popular Series",
  "Award Winners",
];

const GENRE_CATEGORIES = {
  Popular: ["Action", "Comedy", "Drama", "Horror"],
  Story: ["Adventure", "Romance", "Mystery", "Crime"],
  Style: ["Animation", "Documentary", "Fantasy", "Sci-Fi"],
  Family: ["Family", "Thriller"],
};

const FilterSection = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [contentHeight, setContentHeight] = useState<number>();
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <div className="filter-section">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-800/30 
                   transition-all duration-300 rounded-lg group"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-red-500" />
          <span className="font-medium text-gray-200 group-hover:text-white transition-colors">
            {title}
          </span>
        </div>
        <FiChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ease-in-out
                     group-hover:text-white ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? contentHeight : 0 }}
      >
        <div ref={contentRef} className="p-4 pt-4">
          {children}
        </div>
      </div>

      <style>{`
        .filter-section {
          @apply relative;
        }
        .filter-section::after {
          @apply content-[''] absolute bottom-0 left-4 right-4 h-px
                 bg-gray-800/50 transform scale-x-0 transition-transform duration-300;
        }
        .filter-section:not(:last-child)::after {
          @apply scale-x-100;
        }
      `}</style>
    </div>
  );
};

export default function Filter({ onFilterChange, onClose }: FilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    genre: "",
    year: "",
    duration: "",
    sort: "popularity.desc",
  });

  const [activeTag, setActiveTag] = useState<string>("");

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    // Toggle logic for tags
    if (key === 'tag') {
      const newValue = activeTag === value ? "" : value;
      setActiveTag(newValue);
      const newFilters = { ...filters, [key]: newValue };
      setFilters(newFilters);
      onFilterChange(newFilters);
      return;
    }

    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Add this new function to handle range input
  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const year = e.target.value;
    const currentYear = new Date().getFullYear();
    
    // If the year is the current year or empty, reset the filter
    const newYear = year === currentYear.toString() ? "" : year;
    
    // Update both local state and parent component
    setFilters(prev => ({ ...prev, year: newYear }));
    onFilterChange({ ...filters, year: newYear });
  };

  return (
    <div className="w-full h-full flex flex-col bg-[#1a1a1a]/90 backdrop-blur-lg rounded-xl border border-gray-800/50">
      {/* Header */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-red-500" />
            <span>Filters</span>
          </h3>
          {/* Mobile Close Button */}
          <button
            className="md:hidden text-gray-400 hover:text-white"
            onClick={onClose}
            aria-label="Close filters"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-800/50">
          {/* Genres Section */}
          <FilterSection title="Genres" icon={MdOutlineCategory}>
            <div className="space-y-4">
              <button
                onClick={() => handleFilterChange("genre", "")}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                           transition-all duration-200 border
                           ${
                             !filters.genre
                               ? "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/20"
                               : "bg-gray-800/30 text-gray-300 border-gray-700/50 hover:bg-gray-700/50 hover:text-white"
                           }`}
              >
                <span className="font-medium">All Genres</span>
                <span className="text-sm px-2 py-0.5 rounded-md bg-black/20">
                  {GENRES.length}
                </span>
              </button>

              {Object.entries(GENRE_CATEGORIES).map(([category, genres]) => (
                <div key={category} className="space-y-2">
                  <div className="text-xs font-medium text-gray-500 px-1">
                    {category}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {genres.map((genre) => (
                      <div key={`genre-${genre}`}>
                        <button
                          onClick={() =>
                            handleFilterChange("genre", genre.toLowerCase())
                          }
                          className={`genre-button ${
                            filters.genre === genre.toLowerCase()
                              ? "active"
                              : ""
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {genre}
                            {/* Add genre-specific icon based on type */}
                            {genre === "Action" && (
                              <MdLocalFireDepartment className="w-4 h-4" />
                            )}
                            {genre === "Horror" && (
                              <BsStarFill className="w-4 h-4" />
                            )}
                          </div>
                          {/* Add more genre-specific icons as needed */}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Year Range Section */}
          <FilterSection title="Release Year" icon={BsCalendar3}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>{YEARS[YEARS.length - 1]}</span>
                <span className={`font-medium px-3 py-1 rounded-full ${
                  filters.year ? 'text-red-500 bg-red-500/10' : 'text-gray-400'
                }`}>
                  {filters.year || "All Years"}
                </span>
                <span>{CURRENT_YEAR}</span>
              </div>
              <input
                type="range"
                min={YEARS[YEARS.length - 1]}
                max={CURRENT_YEAR}
                value={filters.year || CURRENT_YEAR}
                onChange={handleYearChange}
                className="slider-input w-full"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterChange("year", "");
                  }}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-200 ${
                    !filters.year
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                  }`}
                >
                  All Years
                </button>
                <span className="text-sm text-gray-400">
                  {filters.year ? `Year: ${filters.year}` : 'Select a year'}
                </span>
              </div>
            </div>
          </FilterSection>

          {/* Sort Section */}
          <FilterSection title="Sort By" icon={TbArrowsSort}>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  value: "popularity.desc",
                  label: "Popular",
                  icon: MdLocalFireDepartment,
                  color: "red",
                },
                {
                  value: "vote_average.desc",
                  label: "Top Rated",
                  icon: BsStarFill,
                  color: "yellow",
                },
                {
                  value: "release_date.desc",
                  label: "Newest",
                  icon: BsCalendar3,
                  color: "green",
                },
                {
                  value: "release_date.asc",
                  label: "Oldest",
                  icon: BsCalendar3,
                  color: "blue",
                },
              ].map(({ value, label, icon: ItemIcon, color }) => (
                <div key={`sort-${value}`}>
                  <button
                    onClick={() => handleFilterChange("sort", value)}
                    className={`sort-card ${filters.sort === value ? `active active-${color}` : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <ItemIcon className={`w-5 h-5 ${filters.sort === value ? `text-${color}-500` : ''}`} />
                      <span>{label}</span>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </FilterSection>

          {/* Quick Filters Section */}
          <FilterSection title="Quick Filters" icon={MdLocalFireDepartment}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <div key={`tag-${tag}`}>
                    <button
                      onClick={() => handleFilterChange("tag", tag)}
                      className={`quick-filter-btn ${filters.tag === tag ? 'active' : ''}`}
                    >
                      <div className="flex gap-2 items-center">
                        <MdLocalFireDepartment 
                          className={`w-4 h-4 ${filters.tag === tag ? 'text-red-500' : ''}`} 
                        />
                        <span className={filters.tag === tag ? 'text-red-500' : ''}>{tag}</span>
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </FilterSection>
        </div>
      </div>

      <style>{`
        .genre-button {
          @apply flex items-center justify-between px-3 py-2 text-sm rounded-xl
                 bg-gray-800/30 text-gray-300 transition-all duration-200
                 border border-gray-700/50 hover:bg-gray-700/50 hover:text-white
                 hover:shadow-md hover:scale-[1.02] hover:border-gray-600;
        }
        .genre-button.active {
          @apply bg-red-500/10 text-red-500 border-red-500/30
                 shadow-lg shadow-red-500/10 scale-[1.02];
        }
        .genre-pill {
          @apply px-3 py-1.5 text-sm rounded-full bg-gray-800/50 text-gray-300
                 hover:bg-gray-700/50 hover:text-white transition-all duration-200
                 border border-gray-700/50;
        }
        .genre-pill.active {
          @apply bg-red-500 text-white border-red-500 shadow-lg shadow-red-500/20;
        }
        .slider-input {
          @apply w-full h-1.5 rounded-lg appearance-none cursor-pointer
                 bg-gray-700 accent-red-500;
        }
        .sort-card {
          @apply flex items-center justify-center px-3 py-2.5 rounded-xl text-sm
                 bg-gray-800/30 text-gray-300 transition-all duration-200
                 border border-gray-700/50 hover:bg-gray-700/50 hover:text-white
                 hover:shadow-md hover:scale-[1.02];
        }
        .sort-card.active {
          @apply border-opacity-50 shadow-lg scale-[1.02];
        }
        .sort-card.active-red {
          @apply bg-red-500/10 text-red-500 border-red-500/30;
        }
        .sort-card.active-yellow {
          @apply bg-yellow-500/10 text-yellow-500 border-yellow-500/30;
        }
        .sort-card.active-green {
          @apply bg-green-500/10 text-green-500 border-green-500/30;
        }
        .sort-card.active-blue {
          @apply bg-blue-500/10 text-blue-500 border-blue-500/30;
        }
        .quick-filter-btn {
          @apply w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300
                 bg-gray-800/30 hover:bg-gray-700/50 transition-all duration-200
                 border border-gray-700/50 text-sm font-medium
                 hover:text-white hover:border-gray-600;
        }
        .quick-filter-btn.active {
          @apply bg-red-500/10 text-red-500 border-red-500/30
                 shadow-lg shadow-red-500/10 scale-[1.02];
        }
        
        /* Mobile Scrollbar Styles */
        @media (max-width: 768px) {
          .filter-section {
            @apply overflow-visible;
          }
          
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 4px;
          }
          
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 4px;
          }
        }

        /* Mobile optimization */
        @media (max-width: 768px) {
          .filter-section {
            @apply border-b border-gray-800/50;
          }
          
          .filter-section:last-child {
            @apply border-b-0;
          }

          /* Improved mobile scrolling */
          .overflow-y-auto {
            -webkit-overflow-scrolling: touch;
          }

          /* Mobile filter positioning */
          .sticky {
            position: relative;
            top: 0;
          }
        }

        @media (max-width: 768px) {
          .overflow-y-auto {
            height: calc(100vh - 60px);
            -webkit-overflow-scrolling: touch;
          }
        }
      `}</style>
    </div>
  );
}

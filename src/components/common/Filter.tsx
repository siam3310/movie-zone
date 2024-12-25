import { useState, useRef, useEffect } from "react";
import { FiFilter, FiChevronDown } from "react-icons/fi";
import { MdOutlineCategory, MdLocalFireDepartment } from "react-icons/md";
import { BsCalendar3, BsStarFill } from "react-icons/bs";
import { TbArrowsSort } from "react-icons/tb";

interface FilterProps {
  onFilterChange: (filters: FilterOptions) => void;
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

export default function Filter({ onFilterChange }: FilterProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    genre: "",
    year: "",
    duration: "",
    sort: "popularity.desc",
  });

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <div className="w-80 shrink-0">
      <div className="bg-[#1a1a1a]/90 backdrop-blur-lg rounded-2xl overflow-hidden shadow-xl border border-gray-800/50">
        <div className="bg-gradient-to-r from-red-600/10 to-gray-800/50 px-6 py-4 border-b border-gray-700/50">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <FiFilter className="w-5 h-5 text-red-500" />
            <span>Filters</span>
          </h3>
        </div>

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
                      <div>
                        <button
                          key={genre}
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
                <span className="text-red-500 font-medium px-3 py-1 rounded-full bg-red-500/10">
                  {filters.year || "All Years"}
                </span>
                <span>{CURRENT_YEAR}</span>
              </div>
              <input
                type="range"
                min={YEARS[YEARS.length - 1]}
                max={CURRENT_YEAR}
                value={filters.year || CURRENT_YEAR}
                onChange={(e) => handleFilterChange("year", e.target.value)}
                className="slider-input"
              />
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
                },
                {
                  value: "vote_average.desc",
                  label: "Top Rated",
                  icon: BsStarFill,
                },
                {
                  value: "release_date.desc",
                  label: "Newest",
                  icon: BsCalendar3,
                },
                {
                  value: "release_date.asc",
                  label: "Oldest",
                  icon: BsCalendar3,
                },
              ].map(({ value, label, icon: ItemIcon }) => (
                <div>
                  <button
                    key={value}
                    onClick={() => handleFilterChange("sort", value)}
                    className={`sort-card ${
                      filters.sort === value ? "active" : ""
                    }`}
                  >
                    <div className="flex gap-2">
                      <ItemIcon className="w-5 h-5" />
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
                  <div>
                    <button
                      key={tag}
                      onClick={() => handleFilterChange("tag", tag)}
                      className="quick-filter-btn"
                    >
                      <div className="flex gap-2 items-center">
                        <MdLocalFireDepartment className="w-4 h-4" />
                        <span>{tag}</span>
                      </div>{" "}
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
          @apply flex flex-col items-center gap-2 p-3 rounded-xl text-gray-400
                 bg-gray-800/30 border border-gray-700/50 transition-all duration-200
                 hover:bg-gray-700/50 hover:text-white text-sm font-medium;
        }
        .sort-card.active {
          @apply bg-red-500/10 text-red-500 border-red-500/30;
        }
        .quick-filter-btn {
          @apply w-full flex items-center gap-2 px-4 py-2.5 rounded-xl text-gray-300
                 bg-gray-800/30 hover:bg-gray-700/50 transition-all duration-200
                 border border-gray-700/50 text-sm font-medium
                 hover:text-white hover:border-gray-600;
        }
      `}</style>
    </div>
  );
}

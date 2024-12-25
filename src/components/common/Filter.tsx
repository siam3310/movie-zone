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

  const [selectedYear, setSelectedYear] = useState<string>("");
  const [activeGenre, setActiveGenre] = useState<string>("");

  const handleFilterChange = (key: keyof FilterOptions, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    handleFilterChange("year", year);
  };

  const handleQuickFilterClick = (tag: string) => {
    // Toggle tag if it's already selected
    const newTag = filters.tag === tag ? "" : tag;
    handleFilterChange("tag", newTag);
  };

  const handleGenreClick = (genre: string) => {
    const newGenre = genre.toLowerCase();
    // Toggle genre if it's already selected
    if (activeGenre === newGenre) {
      setActiveGenre("");
      handleFilterChange("genre", "");
    } else {
      setActiveGenre(newGenre);
      handleFilterChange("genre", newGenre);
    }
  };

  const sortOptions = [
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
  ];

  const SortSection = () => (
    <FilterSection title="Sort By" icon={TbArrowsSort}>
      <div className="grid grid-cols-2 gap-2">
        {sortOptions.map(({ value, label, icon: ItemIcon, color }) => (
          <button
            key={value}
            onClick={() => handleFilterChange("sort", value)}
            className={`sort-card ${filters.sort === value ? `active active-${color}` : ""}`}
          >
            <div className="flex items-center gap-2">
              <ItemIcon className={`w-5 h-5 ${filters.sort === value ? `text-${color}-500` : ''}`} />
              <span>{label}</span>
            </div>
          </button>
        ))}
      </div>
    </FilterSection>
  );

  const GenresSection = () => (
    <FilterSection title="Genres" icon={MdOutlineCategory}>
      <div className="space-y-4">
        <button
          onClick={() => {
            setActiveGenre("");
            handleFilterChange("genre", "");
          }}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl
                     transition-all duration-200 border
                     ${!activeGenre
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
                <button
                  key={genre}
                  onClick={() => handleGenreClick(genre)}
                  className={`genre-button ${
                    activeGenre === genre.toLowerCase() ? "active" : ""
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`${
                      activeGenre === genre.toLowerCase() ? "text-red-500" : ""
                    }`}>
                      {genre}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </FilterSection>
  );

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
          <GenresSection />
          <FilterSection title="Release Year" icon={BsCalendar3}>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-2">
                <span>{YEARS[YEARS.length - 1]}</span>
                <span className={`text-red-500 font-medium px-3 py-1 rounded-full 
                  ${selectedYear ? 'bg-red-500/10' : 'text-gray-400'}`}>
                  {selectedYear || "All Years"}
                </span>
                <span>{CURRENT_YEAR}</span>
              </div>
              <input
                type="range"
                min={YEARS[YEARS.length - 1]}
                max={CURRENT_YEAR}
                value={selectedYear || CURRENT_YEAR}
                onChange={(e) => handleYearChange(e.target.value)}
                className="slider-input w-full"
              />
              <div className="flex justify-between mt-2">
                <button
                  onClick={() => handleYearChange("")}
                  className={`px-3 py-1 text-sm rounded-full transition-all duration-200
                    ${!selectedYear 
                      ? 'bg-red-500 text-white' 
                      : 'bg-gray-800/30 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                    }`}
                >
                  All Years
                </button>
                <span className="text-sm text-gray-400">
                  {selectedYear ? `Year: ${selectedYear}` : 'Select a year'}
                </span>
              </div>
            </div>
          </FilterSection>
          <SortSection />
          <FilterSection title="Quick Filters" icon={MdLocalFireDepartment}>
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleQuickFilterClick(tag)}
                    className={`quick-filter-btn ${
                      filters.tag === tag ? 'active' : ''
                    }`}
                  >
                    <div className="flex gap-2 items-center">
                      <MdLocalFireDepartment className={`w-4 h-4 ${
                        filters.tag === tag ? 'text-red-500' : ''
                      }`} />
                      <span>{tag}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </FilterSection>
        </div>
      </div>

      <style>{`
        .genre-button {
          @apply flex items-center px-3 py-2 text-sm rounded-xl
                 bg-gray-800/30 text-gray-300 transition-all duration-200
                 border border-gray-700/50 hover:bg-gray-700/50 hover:text-white
                 hover:shadow-md hover:scale-[1.02] hover:border-gray-600;
        }
        .genre-button.active {
          @apply bg-red-500/10 border-red-500/30
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
      `}</style>
    </div>
  );
}

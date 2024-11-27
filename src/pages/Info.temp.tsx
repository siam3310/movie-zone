import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../utils/axios";
import { Movie } from "../utils/requests";
import {
  FaDownload,
  FaPlay,
  FaPlus,
  FaThumbsUp,
} from "react-icons/fa";
import { Skeleton } from "@mui/material";
import { styled } from "@mui/material/styles";

// Styled components for custom skeletons
const ContentSkeleton = styled("div")({
  width: "100%",
  minHeight: "100vh",
  position: "relative",
  backgroundColor: "#141414",
});

const ImageSkeleton = styled(Skeleton)({
  transform: "scale(1, 1)",
  backgroundColor: "#2b2b2b",
  "&::after": {
    background:
      "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.04), transparent)",
  },
});

interface TorrentInfo {
  url: string;
  hash: string;
  quality: string;
  type: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
}

interface MovieDetails {
  id: number;
  title: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  language: string;
  torrents: TorrentInfo[];
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
}

interface TVEpisode {
  title: string;
  episode: number;
  season: number;
  magnet_link: string;
  size: string;
  seeds: number;
  peers: number;
  quality: string;
}

interface TVSeriesDetails {
  episodes: TVEpisode[];
  seasons: number[];
}

function Info() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState<Movie | null>(null);
  const [trailer, setTrailer] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ytsMovie, setYtsMovie] = useState<MovieDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ytsError, setYtsError] = useState<string | null>(null);
  const [tvSeries, setTVSeries] = useState<TVSeriesDetails | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedQuality, setSelectedQuality] = useState<string>("all");
  const [isTVLoading, setIsTVLoading] = useState<boolean>(false);
  const [tvError, setTVError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(6);

  // ... rest of your existing code until the season selector ...

                        {/* Season and Quality selectors */}
                        <div className="mb-6 flex flex-col md:flex-row gap-4">
                          <div className="flex-1">
                            <label className="text-white text-lg font-medium mb-2 block">
                              Select Season
                            </label>
                            <select
                              value={selectedSeason}
                              onChange={(e) => {
                                setSelectedSeason(Number(e.target.value));
                                setCurrentPage(1);
                              }}
                              className="bg-[#2F2F2F] text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                            >
                              {tvSeries.seasons.map((season) => (
                                <option key={season} value={season}>
                                  Season {season}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex-1">
                            <label className="text-white text-lg font-medium mb-2 block">
                              Select Quality
                            </label>
                            <select
                              value={selectedQuality}
                              onChange={(e) => {
                                setSelectedQuality(e.target.value);
                                setCurrentPage(1);
                              }}
                              className="bg-[#2F2F2F] text-white px-4 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-[#E50914]"
                            >
                              <option value="all">All Qualities</option>
                              <option value="4K">4K</option>
                              <option value="1080P">1080p</option>
                              <option value="720P">720p</option>
                              <option value="WEB-DL">WEB-DL</option>
                            </select>
                          </div>
                        </div>

                        {/* Episodes Grid */}
                        <div className="grid grid-cols-1 gap-4">
                          {getCurrentItems(
                            tvSeries.episodes
                              .filter(
                                (episode) =>
                                  episode.season === selectedSeason &&
                                  (selectedQuality === "all" ||
                                    episode.quality.toUpperCase() === selectedQuality)
                              )
                          ).map((episode, index) => (
                            // ... rest of your existing episode rendering code ...

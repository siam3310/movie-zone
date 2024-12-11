import axios from 'axios';

const STREAMING_BASE_URL = 'https://v2.sg.media-imdb.com';

export interface StreamingSource {
  name: string;
  quality: string;
  url: string;
  type: string;
}

export const getStreamingSources = async (
  imdbId: string,
  season: number,
  episode: number
): Promise<StreamingSource[]> => {
  try {
    // Multiple streaming sources for better availability
    return [
      {
        name: "VidSrc.xyz",
        quality: "HD",
        url: `https://vidsrc.xyz/embed/tv?tmdb=${imdbId}&season=${season}&episode=${episode}`,
        type: "iframe"
      },
      {
        name: "VidSrc.me",
        quality: "HD",
        url: `https://vidsrc.me/embed/tv?tmdb=${imdbId}&season=${season}&episode=${episode}`,
        type: "iframe"
      },
      {
        name: "2embed",
        quality: "HD",
        url: `https://2embed.org/embed/series?tmdb=${imdbId}&s=${season}&e=${episode}`,
        type: "iframe"
      },
      {
        name: "SuperEmbed",
        quality: "HD",
        url: `https://multiembed.mov/directstream.php?video_id=${imdbId}&s=${season}&e=${episode}`,
        type: "iframe"
      }
    ];
  } catch (error) {
    console.error('Error creating streaming URL:', error);
    throw error;
  }
};

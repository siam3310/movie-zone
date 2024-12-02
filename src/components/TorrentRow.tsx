import React from 'react';
import { TorrentInfo } from '../types/torrent';
import { FaDownload, FaMagnet, FaSeedling, FaUsers } from 'react-icons/fa';
import { getQualityColor } from '../utils/qualityHelper';

interface TorrentRowProps {
  torrent: TorrentInfo;
  type: 'movie' | 'tv';
  showEpisode?: boolean;
}

const TorrentRow: React.FC<TorrentRowProps> = ({ torrent, type, showEpisode = false }) => {
  const handleDownload = async () => {
    try {
      // Create YTS style filename
      const cleanTitle = torrent.title.split('[')[0].trim(); // Get just the title part
      const quality = torrent.quality || '2160P';

      // Different handling for movies and TV series
      if (type === 'tv') {
        // TV Series - Create URL shortcut
        const filename = `${cleanTitle} [${quality}] [YTS.MX]_S${String(torrent.season).padStart(2, '0')}E${String(torrent.episode).padStart(2, '0')}.url`;

        // Get magnet URL
        let magnetUrl = null;
        const trackers = [
          'udp://open.demonii.com:1337/announce',
          'udp://tracker.openbittorrent.com:80',
          'udp://tracker.coppersurfer.tk:6969',
          'udp://glotorrents.pw:6969/announce',
          'udp://tracker.opentrackr.org:1337/announce',
          'udp://torrent.gresille.org:80/announce',
          'udp://p4p.arenabg.com:1337',
          'udp://tracker.leechers-paradise.org:6969',
          'udp://tracker.internetwarriors.net:1337/announce',
          'udp://tracker.cyberia.is:6969/announce'
        ].map(t => `&tr=${encodeURIComponent(t)}`).join('');

        if (torrent.magnet_link && torrent.magnet_link.startsWith('magnet:')) {
          magnetUrl = torrent.magnet_link;
        } else if (torrent.magnet && torrent.magnet.startsWith('magnet:')) {
          magnetUrl = torrent.magnet;
        } else if (torrent.url && torrent.url.startsWith('magnet:')) {
          magnetUrl = torrent.url;
        } else if (torrent.hash) {
          magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(filename)}${trackers}`;
        }

        if (!magnetUrl) {
          throw new Error('No valid magnet link found');
        }

        // Create Windows URL shortcut content
        const content = `[InternetShortcut]
URL=${magnetUrl}
IDList=
HotKey=0
IconFile=
IconIndex=0
[{000214A0-0000-0000-C000-000000000046}]
Prop3=19,0`;

        // Create and download the URL shortcut file
        const blob = new Blob([content], { type: 'application/x-url' });
        const url = window.URL.createObjectURL(blob);
        const element = document.createElement('a');
        element.setAttribute('href', url);
        element.setAttribute('download', filename);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        window.URL.revokeObjectURL(url);

      } else {
        // Movies - Download YTS torrent file
        const filename = `${cleanTitle} [${quality}] [YTS.MX].torrent`;

        if (!torrent.url) {
          throw new Error('No torrent URL found');
        }

        try {
          // Fetch the torrent file
          const response = await fetch(torrent.url);
          if (!response.ok) {
            throw new Error('Failed to fetch torrent file');
          }

          // Get the torrent file content
          const torrentBlob = await response.blob();

          // Create and download the torrent file
          const url = window.URL.createObjectURL(torrentBlob);
          const element = document.createElement('a');
          element.setAttribute('href', url);
          element.setAttribute('download', filename);
          element.style.display = 'none';
          document.body.appendChild(element);
          element.click();
          document.body.removeChild(element);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          console.error('Failed to download torrent file:', error);

          // Fallback to magnet link if torrent download fails
          const magnetUrl = torrent.magnet_link || torrent.magnet || (torrent.hash ?
            `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(filename)}&tr=udp://tracker.opentrackr.org:1337/announce&tr=udp://tracker.leechers-paradise.org:6969/announce&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80&tr=udp://exodus.desync.com:6969/announce`
            : null);

          if (magnetUrl) {
            const content = `[InternetShortcut]\nURL=${magnetUrl}`;
            const blob = new Blob([content], { type: 'application/x-url' });
            const url = window.URL.createObjectURL(blob);
            const element = document.createElement('a');
            element.setAttribute('href', url);
            element.setAttribute('download', filename.replace('.torrent', '.url'));
            element.style.display = 'none';
            document.body.appendChild(element);
            element.click();
            document.body.removeChild(element);
            window.URL.revokeObjectURL(url);
          }
        }
      }
    } catch (error) {
      console.error('Error downloading torrent:', error);
    }
  };

  const handleMagnet = () => {
    try {
      console.log('Torrent data:', torrent); // Debug log

      const trackers = [
        'udp://open.demonii.com:1337/announce',
        'udp://tracker.openbittorrent.com:80',
        'udp://tracker.coppersurfer.tk:6969',
        'udp://glotorrents.pw:6969/announce',
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://torrent.gresille.org:80/announce',
        'udp://p4p.arenabg.com:1337',
        'udp://tracker.leechers-paradise.org:6969',
        'udp://tracker.internetwarriors.net:1337/announce',
        'udp://tracker.cyberia.is:6969/announce'
      ].map(t => `&tr=${encodeURIComponent(t)}`).join('');

      // Handle different magnet link formats
      let magnetUrl = null;

      if (torrent.magnet_link && torrent.magnet_link.startsWith('magnet:')) {
        magnetUrl = torrent.magnet_link;
      } else if (torrent.magnet && torrent.magnet.startsWith('magnet:')) {
        magnetUrl = torrent.magnet;
      } else if (torrent.url && torrent.url.startsWith('magnet:')) {
        magnetUrl = torrent.url;
      } else if (torrent.hash) {
        magnetUrl = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(torrent.title)}${trackers}`;
      }

      console.log('Final magnet URL:', magnetUrl); // Debug log

      if (magnetUrl) {
        window.location.href = magnetUrl;
      } else {
        console.error('No valid magnet link found');
      }
    } catch (error) {
      console.error('Error handling magnet link:', error);
    }
  };

  return (
    <div className="p-4 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className={`px-2 py-0.5 rounded text-sm ${getQualityColor(torrent.quality)}`}>
          {torrent.quality}
        </span>
        {showEpisode && torrent.season && torrent.episode && (
          <span className="text-sm text-gray-400">
            S{String(torrent.season).padStart(2, '0')}E{String(torrent.episode).padStart(2, '0')}
          </span>
        )}
        <span className="text-sm text-gray-400">{torrent.size}</span>
        <span>•</span>
        <span className="flex items-center gap-1 text-sm text-green-500">
          <span>{torrent.seeds}</span>
          <FaSeedling className="w-3.5 h-3.5" />
        </span>
        <span>•</span>
        <span className="flex items-center gap-1 text-sm text-red-500">
          <span>{torrent.peers}</span>
          <FaUsers className="w-3.5 h-3.5" />
        </span>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleDownload}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-sm transition-colors"
          type="button"
        >
          <FaDownload size={12} />
          Torrent
        </button>
        <button
          onClick={handleMagnet}
          className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded flex items-center gap-1.5 text-sm transition-colors"
          type="button"
        >
          <FaMagnet size={12} />
          Magnet
        </button>
      </div>
    </div>
  );
};

export default TorrentRow;

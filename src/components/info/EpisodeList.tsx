import React from 'react';
import EpisodeItem from './EpisodeItem';
import { Episode } from '../../types/torrent';

interface EpisodeListProps {
  episodes: Episode[];
  onDownload: (episode: Episode) => void;
  onMagnetDownload: (episode: Episode) => void;
}

const EpisodeList: React.FC<EpisodeListProps> = ({ episodes, onDownload, onMagnetDownload }) => {
  return (
    <div>
      {episodes.map((episode) => (
        <EpisodeItem
          key={`${episode.season}-${episode.episode}-${episode.title}`}
          episode={episode}
          onDownload={onDownload}
          onMagnetDownload={onMagnetDownload}
        />
      ))}
    </div>
  );
};

export default EpisodeList;

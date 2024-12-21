import { createContext, useContext, useState, ReactNode } from 'react';

interface VideoModalContextType {
  isOpen: boolean;
  embedUrl: string;
  openModal: (url: string) => void;
  closeModal: () => void;
}

const VideoModalContext = createContext<VideoModalContextType | undefined>(undefined);

export function VideoModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [embedUrl, setEmbedUrl] = useState('');

  const openModal = (url: string) => {
    setEmbedUrl(url);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    // Don't clear the embedUrl to prevent video reload
  };

  return (
    <VideoModalContext.Provider value={{ isOpen, embedUrl, openModal, closeModal }}>
      {children}
    </VideoModalContext.Provider>
  );
}

export function useVideoModal() {
  const context = useContext(VideoModalContext);
  if (context === undefined) {
    throw new Error('useVideoModal must be used within a VideoModalProvider');
  }
  return context;
}

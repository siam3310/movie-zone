import React, { useState, useRef, useEffect } from 'react';
import { FaTimes, FaExpand, FaWindowMinimize, FaWindowRestore } from 'react-icons/fa';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, embedUrl }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

  useEffect(() => {
    if (!isMinimized) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isMinimized]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized || !modalRef.current) return;
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: position.x,
      initialY: position.y
    };
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !modalRef.current) return;
    
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    
    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;

    const modalRect = modalRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    newX = Math.min(Math.max(newX, -modalRect.left), viewportWidth - modalRect.right + modalRect.left);
    newY = Math.min(Math.max(newY, -modalRect.top), viewportHeight - modalRect.bottom + modalRect.top);
    
    setPosition({
      x: newX,
      y: newY
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    document.body.style.userSelect = '';
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.userSelect = '';
    };
  }, [isDragging]);

  if (!isOpen) return null;

  const handleMinimizeToggle = () => {
    setIsMinimized(!isMinimized);
  };

  const openTab = () => {
    window.open(embedUrl, '_blank');
    onClose();
  };

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 ${
        isMinimized
          ? 'w-80 h-48'
          : 'inset-0 flex items-center justify-center bg-black/80'
      }`}
      style={isMinimized ? {
        transform: `translate(${position.x}px, ${position.y}px)`,
        right: '1rem',
        bottom: '1rem',
        transition: isDragging ? 'none' : 'transform 0.1s ease-out'
      } : undefined}
    >
      <div
        className={`relative bg-gray-900 rounded-lg overflow-hidden ${
          isMinimized ? 'w-full h-full' : 'w-full max-w-5xl aspect-video'
        }`}
      >
        {/* Control Bar */}
        <div 
          className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between 
                    p-2 bg-gradient-to-b from-black/80 to-transparent"
          onMouseDown={handleMouseDown}
          style={{ cursor: isMinimized ? 'move' : 'default' }}
        >
          {/* Title or Controls on the left if needed */}
          <div className="text-white text-sm truncate">
            {/* You can add a title here if needed */}
          </div>

          {/* Controls on the right */}
          <div className="flex items-center gap-2">
            <button
              onClick={openTab}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
              title="Open in New Tab"
            >
              <FaWindowRestore className="w-4 h-4" />
            </button>
            <button
              onClick={handleMinimizeToggle}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
              title={isMinimized ? 'Maximize' : 'Minimize'}
            >
              {isMinimized ? (
                <FaExpand className="w-4 h-4" />
              ) : (
                <FaWindowMinimize className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
              title="Close"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player */}
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* Drag Handle Overlay */}
        {isMinimized && (
          <div
            className="absolute inset-0 bg-transparent pointer-events-none"
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
          />
        )}
      </div>
    </div>
  );
};

export default VideoModal;

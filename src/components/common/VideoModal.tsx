import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
}

interface Position { x: number; y: number; }
interface DragPosition {
  right: number;
  bottom: number;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, embedUrl }) => {
  const [state, setState] = useState({
    isMinimized: false,
    isDragging: false,
    iframeLoaded: false,
    position: { right: 24, bottom: 24 } as DragPosition
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    startX: 0,
    startY: 0,
    startRight: 0,
    startBottom: 0
  });

  const EDGE_PADDING = 24;

  // Add constants for mobile sizes
  const MOBILE_WIDTH = 320;
  const MOBILE_HEIGHT = 180;
  const DESKTOP_MIN_PADDING = 24;
  const MOBILE_MIN_PADDING = 12;

  // Get dynamic padding based on screen size
  const getPadding = useCallback(() => {
    return window.innerWidth < 640 ? MOBILE_MIN_PADDING : DESKTOP_MIN_PADDING;
  }, []);

  const handleMinimize = useCallback(() => {
    setState(s => ({ 
      ...s, 
      isMinimized: !s.isMinimized,
      position: !s.isMinimized ? { right: EDGE_PADDING, bottom: EDGE_PADDING } : s.position
    }));
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!state.isMinimized) return;
    e.preventDefault();
    
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: window.innerWidth - rect.right,
      startBottom: window.innerHeight - rect.bottom
    };

    setState(s => ({ ...s, isDragging: true }));
    document.body.style.cursor = 'grabbing';
  }, [state.isMinimized]);

  // Add function to handle scroll lock
  const preventScroll = useCallback((e: TouchEvent) => {
    e.preventDefault();
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (!state.isMinimized) return;
    
    // Prevent all touch events while dragging
    document.body.style.overflow = 'hidden';
    document.addEventListener('touchmove', preventScroll, { passive: false });
    
    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    const touch = e.touches[0];
    dragRef.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startRight: window.innerWidth - rect.right,
      startBottom: window.innerHeight - rect.bottom
    };

    setState(s => ({ ...s, isDragging: true }));
  }, [state.isMinimized, preventScroll]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!state.isDragging) return;

    // Calculate the difference from start position
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    // Calculate new positions (moving in opposite direction of mouse movement)
    const newRight = Math.max(EDGE_PADDING, 
      Math.min(
        window.innerWidth - 320 - EDGE_PADDING,
        dragRef.current.startRight - deltaX
      )
    );
    
    const newBottom = Math.max(EDGE_PADDING,
      Math.min(
        window.innerHeight - 192 - EDGE_PADDING,
        dragRef.current.startBottom - deltaY
      )
    );

    setState(s => ({
      ...s,
      position: { right: newRight, bottom: newBottom }
    }));
  }, [state.isDragging]);

  // Update the touch move handler
  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!state.isDragging) return;
    e.preventDefault();
    e.stopPropagation();

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragRef.current.startX;
    const deltaY = touch.clientY - dragRef.current.startY;
    
    const padding = getPadding();
    const maxRight = window.innerWidth - MOBILE_WIDTH - padding;
    const maxBottom = window.innerHeight - MOBILE_HEIGHT - padding;
    
    const newRight = Math.max(padding,
      Math.min(maxRight, dragRef.current.startRight - deltaX)
    );
    
    const newBottom = Math.max(padding,
      Math.min(maxBottom, dragRef.current.startBottom - deltaY)
    );

    setState(s => ({
      ...s,
      position: { right: newRight, bottom: newBottom }
    }));
  }, [state.isDragging, getPadding]);

  const handleMouseUp = useCallback(() => {
    setState(s => ({ ...s, isDragging: false }));
    document.body.style.cursor = '';
    document.body.style.overflow = '';
    document.removeEventListener('touchmove', preventScroll);
  }, [preventScroll]);

  const handleTouchEnd = handleMouseUp;

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
        document.body.style.overflow = '';
        document.removeEventListener('touchmove', preventScroll);
      };
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp, handleTouchMove, preventScroll]);

  const openNewTab = () => {
    window.open(embedUrl, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 ${
        state.isMinimized 
          ? 'w-80 h-[180px] sm:h-48' 
          : 'w-[95vw] sm:w-[90vw] h-[60vh] sm:h-[80vh] max-w-6xl max-h-[800px]'
      }`}
      onTouchStart={handleTouchStart}
      onTouchMove={(e) => e.preventDefault()}
      style={{
        position: 'fixed',
        touchAction: state.isMinimized ? 'none' : undefined,
        ...(state.isMinimized 
          ? {
              right: `${state.position.right}px`,
              bottom: `${state.position.bottom}px`,
            }
          : {
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }
        )
      }}
    >
      <div 
        className={`relative w-full h-full bg-black rounded-lg overflow-hidden shadow-lg
          ${!state.isMinimized ? 'border border-gray-800' : ''}`}
        onTouchStart={handleTouchStart}
        onMouseDown={handleMouseDown}
      >
        <Suspense fallback={<div className="w-full h-full bg-gray-900 animate-pulse" />}>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={() => setState(s => ({ ...s, iframeLoaded: true }))}
          />
        </Suspense>

        <div
          className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-end gap-2 
            p-2 bg-gradient-to-b from-black/80 to-transparent
            ${state.isMinimized ? 'cursor-grab active:cursor-grabbing' : ''}`}
        >
          <button onClick={openNewTab} className="p-1 hover:bg-white/20 rounded">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={handleMinimize}
            className="p-1 hover:bg-white/20 rounded"
          >
            {state.isMinimized ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </button>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(VideoModal);

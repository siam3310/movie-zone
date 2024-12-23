import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
}

interface Position { x: number; y: number; }

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, embedUrl }) => {
  const [state, setState] = useState({
    isMinimized: false,
    isDragging: false,
    isAnimating: false,
    iframeLoaded: false,
    position: { x: 0, y: 0 } as Position,
    smoothPosition: { x: 0, y: 0 } as Position
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });

  const EDGE_PADDING = 24;
  const ANIMATION_DURATION = 300;
  const springTransition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`;

  // Handle minimize/maximize transitions
  useEffect(() => {
    if (!state.isMinimized) {
      setState(s => ({ ...s, position: { x: 0, y: 0 }, smoothPosition: { x: 0, y: 0 }, isAnimating: true }));
    } else {
      const x = window.innerWidth - 349;
      const y = window.innerHeight - 192 - EDGE_PADDING;
      setState(s => ({ ...s, position: { x, y }, smoothPosition: { x, y }, isAnimating: true }));
    }

    const timer = setTimeout(() => {
      setState(s => ({ ...s, isAnimating: false }));
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [state.isMinimized]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!state.isMinimized) return;
    e.preventDefault();

    const rect = modalRef.current?.getBoundingClientRect();
    if (!rect) return;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: rect.left,
      posY: rect.top
    };

    setState(s => ({ ...s, isDragging: true }));
    document.body.style.cursor = 'grabbing';
  }, [state.isMinimized]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!state.isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    
    const maxX = window.innerWidth - 320 - EDGE_PADDING;
    const maxY = window.innerHeight - 192 - EDGE_PADDING;
    
    const x = Math.min(Math.max(dragStartRef.current.posX + dx, EDGE_PADDING), maxX);
    const y = Math.min(Math.max(dragStartRef.current.posY + dy, EDGE_PADDING), maxY);

    setState(s => ({ ...s, position: { x, y }, smoothPosition: { x, y } }));
  }, [state.isDragging]);

  const handleMouseUp = useCallback(() => {
    setState(s => ({ ...s, isDragging: false }));
    document.body.style.cursor = '';
  }, []);

  useEffect(() => {
    if (state.isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [state.isDragging, handleMouseMove, handleMouseUp]);

  const openNewTab = () => {
    window.open(embedUrl, '_blank');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 ${state.isMinimized ? 'w-80 h-48' : 'w-[90vw] h-[80vh] max-w-6xl max-h-[800px]'}`}
      style={{
        transition: !state.isDragging ? springTransition : undefined,
        transform: state.isMinimized
          ? `translate3d(${state.smoothPosition.x}px, ${state.smoothPosition.y}px, 0)`
          : `translate3d(-50%, -50%, 0)`,
        position: 'fixed',
        ...(state.isMinimized ? { left: 0, top: 0 } : { left: '50%', top: '50%' })
      }}
    >
      <div className={`relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl
        ${!state.isMinimized ? 'border border-gray-800 hover:border-gray-700' : ''}`}>
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
          onMouseDown={handleMouseDown}
        >
          <button onClick={openNewTab} className="p-1 hover:bg-white/20 rounded">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <button
            onClick={() => setState(s => ({ ...s, isMinimized: !s.isMinimized }))}
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

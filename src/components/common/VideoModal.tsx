import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  embedUrl: string;
}

interface Position {
  x: number;
  y: number;
}

const VideoModal: React.FC<VideoModalProps> = ({ isOpen, onClose, embedUrl }) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const [position, setPosition] = useState<Position>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [velocity, setVelocity] = useState<Position>({ x: 0, y: 0 });
  const [lastMousePos, setLastMousePos] = useState<Position>({ x: 0, y: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(0);
  const [smoothPosition, setSmoothPosition] = useState<Position>({ x: 0, y: 0 });
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });
  const smoothingFrameRef = useRef<number>();
  const animationFrameRef = useRef<number>();
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });

  // Constants
  const VELOCITY_MULTIPLIER = 12;
  const EDGE_SNAP_THRESHOLD = 30;
  const EDGE_PADDING = 24;
  const SMOOTHING_FACTOR = 0.15;
  const ANIMATION_DURATION = 300; // Reduced for better performance
  const springTransition = `transform ${ANIMATION_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity ${ANIMATION_DURATION}ms ease`;

  useEffect(() => {
    const updateBounds = () => {
      if (modalRef.current && isMinimized) {
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        const modalWidth = 320; // w-80 = 320px
        const modalHeight = 192; // h-48 = 192px

        setBounds({
          left: EDGE_PADDING,
          top: EDGE_PADDING,
          right: windowWidth - modalWidth - EDGE_PADDING,
          bottom: windowHeight - modalHeight - EDGE_PADDING
        });
      }
    };

    if (isMinimized) {
      updateBounds();
      window.addEventListener('resize', updateBounds);
      return () => window.removeEventListener('resize', updateBounds);
    }
  }, [isMinimized]);

  useEffect(() => {
    if (!isMinimized) {
      setIsAnimating(true);
      
      requestAnimationFrame(() => {
        setPosition({ x: 0, y: 0 });
        setVelocity({ x: 0, y: 0 });
        setSmoothPosition({ x: 0, y: 0 });
      });

      const animTimeout = setTimeout(() => {
        setIsAnimating(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(animTimeout);
    } else {
      setIsAnimating(true);

      // Calculate target position - centered horizontally, bottom of screen
      const x = (window.innerWidth - 349); // Center horizontally
      const y = window.innerHeight - 192 - EDGE_PADDING; // Bottom position

      requestAnimationFrame(() => {
        setPosition({ x, y });
        setTimeout(() => {
          setSmoothPosition({ x, y });
        }, 16);
      });

      const timeout = setTimeout(() => {
        setIsAnimating(false);
      }, ANIMATION_DURATION);

      return () => clearTimeout(timeout);
    }
  }, [isMinimized]);

  const smoothPositionUpdate = useCallback(() => {
    if (!isDragging) return;

    setSmoothPosition(prev => ({
      x: prev.x + (position.x - prev.x) * SMOOTHING_FACTOR,
      y: prev.y + (position.y - prev.y) * SMOOTHING_FACTOR
    }));

    animationFrameRef.current = requestAnimationFrame(smoothPositionUpdate);
  }, [position, isDragging]);

  useEffect(() => {
    smoothPositionUpdate();
    return () => {
      if (smoothingFrameRef.current) {
        cancelAnimationFrame(smoothingFrameRef.current);
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [smoothPositionUpdate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMinimized || !modalRef.current) return;

    e.preventDefault();
    setIsDragging(true);
    setVelocity({ x: 0, y: 0 });

    const rect = modalRef.current.getBoundingClientRect();
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: rect.left,
      initialY: rect.top
    };

    setLastMousePos({ x: e.clientX, y: e.clientY });
    setLastUpdateTime(performance.now());

    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !modalRef.current) return;

    const currentTime = performance.now();
    const deltaTime = Math.min(currentTime - lastUpdateTime, 32);

    if (deltaTime > 0) {
      const velocityX = (e.clientX - lastMousePos.x) / deltaTime;
      const velocityY = (e.clientY - lastMousePos.y) / deltaTime;

      setVelocity(prev => ({
        x: prev.x * 0.5 + velocityX * VELOCITY_MULTIPLIER * 0.5,
        y: prev.y * 0.5 + velocityY * VELOCITY_MULTIPLIER * 0.5
      }));
    }

    setLastUpdateTime(currentTime);
    setLastMousePos({ x: e.clientX, y: e.clientY });

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    let newX = dragRef.current.initialX + dx;
    let newY = dragRef.current.initialY + dy;

    newX = Math.min(Math.max(newX, bounds.left), bounds.right);
    newY = Math.min(Math.max(newY, bounds.top), bounds.bottom);

    const snapToEdge = (value: number, edges: number[]) => {
      let snappedValue = value;
      let minDistance = EDGE_SNAP_THRESHOLD;

      edges.forEach(edge => {
        const distance = Math.abs(value - edge);
        if (distance < minDistance) {
          minDistance = distance;
          const t = distance / EDGE_SNAP_THRESHOLD;
          const ease = t * t * (3 - 2 * t);
          snappedValue = edge + (value - edge) * ease;
        }
      });

      return snappedValue;
    };

    const windowEdges = {
      x: [bounds.left, bounds.right],
      y: [bounds.top, bounds.bottom]
    };

    newX = snapToEdge(newX, windowEdges.x);
    newY = snapToEdge(newY, windowEdges.y);

    setPosition({ x: newX, y: newY });
  }, [isDragging, lastUpdateTime, lastMousePos.x, lastMousePos.y, bounds, velocity]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setVelocity({ x: 0, y: 0 });

    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const openNewTab = () => {
    window.open(embedUrl, '_blank');
    onClose();
  };
  const handleIframeLoad = useCallback(() => {
    setIframeLoaded(true);
    setIsAnimating(false);
  }, []);
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`fixed z-50 ${isMinimized ? 'w-80 h-48' : 'w-[90vw] h-[80vh] max-w-6xl max-h-[800px]'}`}
      style={{
        ...(!isDragging && {
          transition: `${springTransition}, transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)`,
        }),
        transform: isMinimized
          ? `translate3d(${smoothPosition.x}px, ${smoothPosition.y}px, 0) scale3d(${isAnimating ? '0.96' : '1'}, ${isAnimating ? '0.96' : '1'}, 1)`
          : `translate3d(-50%, -50%, 0) scale3d(${isAnimating ? '0.96' : '1'}, ${isAnimating ? '0.96' : '1'}, 1)`,
        position: 'fixed',
        ...(isMinimized ? {
          right: 'auto',
          bottom: 'auto',
          left: '0',
          top: '0',
        } : {
          left: '50%',
          top: '50%',
        }),
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        WebkitFontSmoothing: 'antialiased',
        filter: 'blur(0)',
      }}
    >
      <div
        className={`relative w-full h-full bg-black rounded-lg overflow-hidden shadow-2xl transform-gpu
                    ${!isMinimized ? 'border border-gray-800 hover:border-gray-700' : ''} 
                    ${!iframeLoaded ? 'animate-pulse' : ''}`}
        style={{
          transition: `${springTransition}, transform 0.2s ease-out, box-shadow 0.3s ease-in-out`,
          transform: `translateZ(0) scale(${isAnimating ? '0.98' : '1'})`,
          opacity: iframeLoaded ? 1 : 0.7,
          willChange: 'transform, opacity, box-shadow',
          boxShadow: isMinimized 
            ? '0 10px 30px -5px rgba(0, 0, 0, 0.3)' 
            : '0 20px 40px -5px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Suspense fallback={
          <div className="w-full h-full bg-gray-900 animate-pulse" />
        }>
          <iframe
            src={embedUrl}
            className={`w-full h-full transition-opacity duration-300 ${iframeLoaded ? 'opacity-100' : 'opacity-0'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            onLoad={handleIframeLoad}
            style={{
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          />
        </Suspense>

        {/* Control Bar */}
        <div
          className={`control-bar absolute top-0 left-0 right-0 z-10 flex items-center justify-end gap-2 
                    p-2 bg-gradient-to-b from-black/80 to-transparent transform-gpu backdrop-blur-[2px]
                    ${isMinimized ? 'cursor-grab active:cursor-grabbing' : ''}`}
          style={{
            transition: `${springTransition}, opacity 0.3s ease-in-out, backdrop-filter 0.3s ease`,
            opacity: isAnimating ? 0.9 : 1,
            transform: 'translate3d(0,0,0)',
            WebkitBackfaceVisibility: 'hidden',
          }}
          onMouseDown={handleMouseDown}
        >
          <button
            onClick={openNewTab}
            className="p-1 hover:bg-white/20 rounded transition-all duration-200 ease-out hover:scale-105"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-all duration-200 ease-out hover:scale-105"
            >
              {isMinimized ? (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded transition-all duration-200 ease-out hover:scale-105"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

// Memoize the component for better performance
export default React.memo(VideoModal);

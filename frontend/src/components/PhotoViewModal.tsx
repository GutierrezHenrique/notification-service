import { useState, useEffect, useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Photo } from '../types/photo';
import { Button } from './ui';

interface PhotoViewModalProps {
  photo: Photo;
  onClose: () => void;
  onDelete?: () => void;
}

const PhotoViewModal = ({ photo, onClose, onDelete }: PhotoViewModalProps) => {
  const [showInfo, setShowInfo] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // Reset zoom when photo changes
  useEffect(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, [photo.id]);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.5, 5));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => {
      const newZoom = Math.max(prev - 0.5, 1);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleResetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!imageContainerRef.current) return;
    
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom((prev) => {
      const newZoom = Math.max(1, Math.min(prev + delta, 5));
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  }, [zoom, position]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || zoom <= 1) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Calculate bounds to prevent dragging too far
    if (imageRef.current && imageContainerRef.current) {
      const imgRect = imageRef.current.getBoundingClientRect();
      const containerRect = imageContainerRef.current.getBoundingClientRect();
      
      const maxX = Math.max(0, (imgRect.width * zoom - containerRect.width) / 2);
      const maxY = Math.max(0, (imgRect.height * zoom - containerRect.height) / 2);
      
      setPosition({
        x: Math.max(-maxX, Math.min(maxX, newX)),
        y: Math.max(-maxY, Math.min(maxY, newY)),
      });
    }
  }, [isDragging, zoom, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Touch handlers for mobile
  const touchStartRef = useRef<{ distance: number; center: { x: number; y: number } } | null>(null);

  const getTouchDistance = (touches: React.TouchList): number => {
    if (touches.length < 2) return 0;
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const getTouchCenter = (touches: React.TouchList): { x: number; y: number } => {
    if (touches.length === 0) return { x: 0, y: 0 };
    if (touches.length === 1) {
      return { x: touches[0].clientX, y: touches[0].clientY };
    }
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2,
    };
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      touchStartRef.current = {
        distance: getTouchDistance(e.touches),
        center: getTouchCenter(e.touches),
      };
    } else if (e.touches.length === 1 && zoom > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      });
    }
  }, [zoom, position]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    
    if (e.touches.length === 2 && touchStartRef.current) {
      const currentDistance = getTouchDistance(e.touches);
      const startDistance = touchStartRef.current.distance;
      const scale = currentDistance / startDistance;
      
      setZoom((prev) => {
        const newZoom = Math.max(1, Math.min(prev * scale, 5));
        if (newZoom === 1) {
          setPosition({ x: 0, y: 0 });
        }
        return newZoom;
      });
      
      touchStartRef.current.distance = currentDistance;
    } else if (e.touches.length === 1 && isDragging && zoom > 1) {
      const newX = e.touches[0].clientX - dragStart.x;
      const newY = e.touches[0].clientY - dragStart.y;
      
      if (imageRef.current && imageContainerRef.current) {
        const imgRect = imageRef.current.getBoundingClientRect();
        const containerRect = imageContainerRef.current.getBoundingClientRect();
        
        const maxX = Math.max(0, (imgRect.width * zoom - containerRect.width) / 2);
        const maxY = Math.max(0, (imgRect.height * zoom - containerRect.height) / 2);
        
        setPosition({
          x: Math.max(-maxX, Math.min(maxX, newX)),
          y: Math.max(-maxY, Math.min(maxY, newY)),
        });
      }
    }
  }, [isDragging, zoom, dragStart]);

  const handleTouchEnd = useCallback(() => {
    touchStartRef.current = null;
    setIsDragging(false);
  }, []);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatDate = (dateString: string | null | undefined | Date): string => {
    if (!dateString || dateString === 'null' || dateString === 'undefined') {
      return 'Data não disponível';
    }
    try {
      const date = dateString instanceof Date ? dateString : new Date(dateString);
      if (isNaN(date.getTime()) || date.getTime() === 0) {
        return 'Data não disponível';
      }
      return format(date, "d 'de' MMMM 'de' yyyy 'às' HH:mm", {
        locale: ptBR,
      });
    } catch {
      return 'Data não disponível';
    }
  };

  const imageUrl = photo.url || `http://localhost:3000/uploads/${photo.filename}`;

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate__animated animate__fadeIn">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
        <Button
          variant="glass"
          size="icon"
          onClick={onClose}
          className="rounded-full"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </Button>

        <div className="flex items-center gap-2">
          {/* Zoom Controls */}
          <div className="flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
            <Button
              variant="glass"
              size="icon"
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="rounded-full h-8 w-8"
              title="Diminuir zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </Button>
            <span className="text-white text-xs font-medium min-w-[3rem] text-center">
              {Math.round(zoom * 100)}%
            </span>
            <Button
              variant="glass"
              size="icon"
              onClick={handleZoomIn}
              disabled={zoom >= 5}
              className="rounded-full h-8 w-8"
              title="Aumentar zoom"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </Button>
            {zoom > 1 && (
              <Button
                variant="glass"
                size="icon"
                onClick={handleResetZoom}
                className="rounded-full h-8 w-8 ml-1"
                title="Resetar zoom"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </Button>
            )}
          </div>
          
          <Button
            variant="glass"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className={`rounded-full ${showInfo ? 'bg-white/30 ring-2 ring-white/50' : ''}`}
            title="Informações"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </Button>
          {onDelete && (
            <Button
              variant="glass"
              size="icon"
              onClick={onDelete}
              className="rounded-full hover:bg-red-500/50 hover:text-white"
              title="Excluir"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Image Area */}
        <div
          ref={imageContainerRef}
          className="flex-1 relative flex items-center justify-center bg-black overflow-hidden"
          onClick={() => {
            if (zoom === 1) {
              setShowInfo(false);
            }
          }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          style={{
            cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default',
          }}
        >
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center text-white/50 z-10">
              <svg className="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}
          <div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              transformOrigin: 'center center',
            }}
          >
            <img
              ref={imageRef}
              src={imageUrl}
              alt={photo.title}
              className="max-h-[90vh] max-w-[90vw] object-contain transition-opacity duration-300 select-none"
              style={{ opacity: imageLoaded ? 1 : 0 }}
              onLoad={() => setImageLoaded(true)}
              draggable={false}
            />
          </div>
        </div>

        {/* Sidebar / Info Panel */}
        {showInfo && (
          <div className="w-80 bg-white border-l border-gray-200 shadow-xl overflow-y-auto animate__animated animate__slideInRight z-20">
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{photo.title}</h2>
                <p className="text-gray-600 text-sm leading-relaxed">{photo.description || 'Adicione uma descrição'}</p>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Detalhes
                </h3>

                <dl className="space-y-4">
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Data</dt>
                    <dd className="text-sm text-gray-900 mt-1">{formatDate(photo.acquisitionDate)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Tamanho</dt>
                    <dd className="text-sm text-gray-900 mt-1">{formatFileSize(photo.size)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-gray-500 uppercase tracking-wide">Arquivo</dt>
                    <dd className="text-sm text-gray-900 mt-1 truncate" title={photo.filename}>{photo.filename}</dd>
                  </div>
                </dl>
              </div>

              {photo.dominantColor && (
                <div className="border-t border-gray-100 pt-6">
                  <h3 className="text-sm font-medium text-gray-900 mb-4">Paleta</h3>
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-lg shadow-sm border border-gray-100"
                      style={{ backgroundColor: photo.dominantColor }}
                    />
                    <div>
                      <p className="text-xs text-gray-500 uppercase">Dominante</p>
                      <p className="text-sm font-mono text-gray-900">{photo.dominantColor}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhotoViewModal;

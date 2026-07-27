import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  FileText,
  Box,
  Stethoscope,
  ImageIcon,
  Download,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/format';
import { isPreviewable } from '@/lib/storage';
import type { RadiologyImage } from '@/types';

interface ImageViewerProps {
  images: RadiologyImage[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function ImageViewer({ images, index, onClose, onNavigate }: ImageViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const isOpen = index !== null;
  const current = isOpen ? images[index] : null;

  useEffect(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }, [index]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && index! > 0) onNavigate(index! - 1);
      if (e.key === 'ArrowRight' && index! < images.length - 1) onNavigate(index! + 1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, index, images.length, onClose, onNavigate]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
  };

  const handleMouseUp = () => setIsDragging(false);

  if (!current) return null;

 const ext = current.image_name.split('.').pop()?.toLowerCase() ?? '';

const previewable = isPreviewable(ext);

const isPdf = ext === 'pdf';
const is3d = ext === 'stl';
const isDicom = ext === 'dcm' || ext === 'dicom';
  const zoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const zoomOut = () => {
    setZoom((z) => Math.max(z - 0.25, 1));
    if (zoom <= 1.25) setPan({ x: 0, y: 0 });
  };
  const resetZoom = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-black/90 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between p-4 text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{current.image_name}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-white/70">
                <Badge variant="secondary">{current.image_type}</Badge>
                <span>{formatDate(current.created_at)}</span>
                {current.tooth_number && <span>· Tooth {current.tooth_number}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <a href={current.image_url} download={current.image_name}>
                <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
                  <Download className="h-4 w-4" />
                </Button>
              </a>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/10" onClick={onClose}>
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Viewer area */}
          <div
            className="relative flex flex-1 items-center justify-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ cursor: zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default' }}
          >
            {/* Navigation arrows */}
            {index! > 0 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 z-10 text-white hover:bg-white/10"
                onClick={() => onNavigate(index! - 1)}
              >
                <ChevronLeft className="h-6 w-6" />
              </Button>
            )}
            {index! < images.length - 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 z-10 text-white hover:bg-white/10"
                onClick={() => onNavigate(index! + 1)}
              >
                <ChevronRight className="h-6 w-6" />
              </Button>
            )}

            {/* Content */}
            {previewable ? (
              <motion.img
                key={current.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                src={current.image_url}
                alt={current.image_name}
                className="max-h-full max-w-full object-contain select-none"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
                  transition: isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                draggable={false}
              />
            ) : isPdf ? (
              <iframe
                src={current.image_url}
                className="h-[80vh] w-full max-w-4xl rounded-lg bg-white"
                title={current.image_name}
              />
            ) : (
              <div className="flex flex-col items-center gap-4 text-white/80">
                <div className="rounded-2xl bg-white/10 p-8">
                  {is3d ? <Box className="h-16 w-16" /> : isDicom ? <Stethoscope className="h-16 w-16" /> : <ImageIcon className="h-16 w-16" />}
                </div>
                <div className="text-center">
                  <p className="text-lg font-medium">{current.image_name}</p>
                  <p className="mt-1 text-sm text-white/60">
                    {is3d ? '3D model file (STL)' : isDicom ? 'DICOM image' : 'File preview'} — download to view in a dedicated application.
                  </p>
                </div>
                <a href={current.image_url} download={current.image_name}>
                  <Button variant="secondary">
                    <Download className="mr-2 h-4 w-4" /> Download File
                  </Button>
                </a>
              </div>
            )}

            {/* Zoom controls (only for previewable images) */}
            {previewable && (
              <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-lg bg-black/60 px-2 py-1 backdrop-blur-sm">
                <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-white/10" onClick={zoomOut} disabled={zoom <= 1}>
                  <span className="text-lg">−</span>
                </Button>
                <span className="w-12 text-center text-xs font-medium text-white">{Math.round(zoom * 100)}%</span>
                <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-white/10" onClick={zoomIn} disabled={zoom >= 3}>
                  <span className="text-lg">+</span>
                </Button>
                <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-white/10" onClick={resetZoom}>
                  Reset
                </Button>
              </div>
            )}
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div
              className="flex justify-center gap-2 p-3"
              onClick={(e) => e.stopPropagation()}
            >
              {images.slice(Math.max(0, index! - 4), index! + 5).map((img, i) => {
                const realIndex = Math.max(0, index! - 4) + i;
                const thumbPreviewable = isPreviewable(img.file_ext);
                return (
                  <button
                    key={img.id}
                    onClick={() => onNavigate(realIndex)}
                    className={`h-14 w-14 overflow-hidden rounded-md border-2 transition-all ${
                      realIndex === index ? 'border-primary scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    {thumbPreviewable ? (
                      <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-muted text-muted-foreground">
                        <FileText className="h-4 w-4" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

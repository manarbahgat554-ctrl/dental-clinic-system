import { motion } from 'framer-motion';
import {
  FileText,
  Box,
  Stethoscope,
  Trash2,
  Maximize2,
  ImageIcon,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDate } from '@/lib/format';
import { isPreviewable } from '@/lib/storage';
import { cn } from '@/lib/utils';
import type { RadiologyImage } from '@/types';

interface ImageCardProps {
  image: RadiologyImage;
  index: number;
  onOpen: (image: RadiologyImage) => void;
  onDelete: (image: RadiologyImage) => void;
}

export function ImageCard({ image, index, onOpen, onDelete }: ImageCardProps) {
  const previewable = isPreviewable(image.fileExt || '');
  const isPdf = image.fileExt === 'pdf';
  const is3d = image.fileExt === 'stl';
  const isDicom = image.fileExt === 'dcm' || image.fileExt === 'dicom';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.3) }}
      layout
    >
      <Card className="group overflow-hidden p-0 transition-all hover:shadow-md">
        {/* Preview area */}
        <button
          onClick={() => onOpen(image)}
          className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-muted/30"
        >
          {previewable ? (
            <img
              src={image.imageUrl}
              alt={image.imageName}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              {isPdf ? (
                <FileText className="h-10 w-10" />
              ) : is3d ? (
                <Box className="h-10 w-10" />
              ) : isDicom ? (
                <Stethoscope className="h-10 w-10" />
              ) : (
                <ImageIcon className="h-10 w-10" />
              )}
              <span className="text-xs font-medium uppercase">{image.fileExt}</span>
            </div>
          )}

          {/* Hover overlay */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/40 group-hover:opacity-100">
            <span className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-black">
              <Maximize2 className="h-3.5 w-3.5" /> View
            </span>
          </div>

          {/* Type badge */}
          <Badge
            className="absolute left-2 top-2 bg-black/60 text-white backdrop-blur-sm"
            variant="secondary"
          >
            {image.imageType}
          </Badge>
        </button>

        {/* Info */}
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium" title={image.imageName}>
                {image.imageName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatDate(image.createdAt)}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image);
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
          {image.toothNumber && (
            <Badge variant="outline" className="mt-2 text-[10px]">
              Tooth {image.toothNumber}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

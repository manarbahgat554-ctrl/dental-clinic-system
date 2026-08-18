import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  ScanLine,
  Plus,
  Loader2,
  ImageIcon,
  Filter,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { queries, queryKeys } from '@/lib/api';
import { deleteRadiologyFile, IMAGE_TYPES } from '@/lib/storage';
import { ImageUpload } from '@/components/radiology/image-upload';
import { ImageCard } from '@/components/radiology/image-card';
import { ImageViewer } from '@/components/radiology/image-viewer';
import { cn } from '@/lib/utils';
import type { RadiologyImage } from '@/types';

interface ImageGalleryProps {
  patientId: string;
  patientName: string;
}

export function ImageGallery({ patientId, patientName }: ImageGalleryProps) {
  const queryClient = useQueryClient();
  const [uploadOpen, setUploadOpen] = useState(false);
  const [filter, setFilter] = useState<string>('all');
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RadiologyImage | null>(null);

  const { data: images = [], isLoading } = useQuery({
    queryKey: queryKeys.radiology(patientId),
    queryFn: () => queries.radiology.listByPatient(patientId),
    enabled: !!patientId,
  });

  const deleteMutation = useMutation({
    mutationFn: async (image: RadiologyImage) => {
      // Delete from Storage first, then from DB
      await deleteRadiologyFile(image.storagePath);
      await queries.radiology.remove(image.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.radiology(patientId) });
      toast.success('Image deleted');
      setDeleteTarget(null);
    },
    onError: (err: Error) => {
      toast.error(`Failed to delete: ${err.message}`);
    },
  });

  const filtered = filter === 'all' ? images : images.filter((img) => img.imageType === filter);

  const categoryCounts = IMAGE_TYPES.reduce((acc, type) => {
    acc[type] = images.filter((img) => img.imageType === type).length;
    return acc;
  }, {} as Record<string, number>);

  const handleDelete = () => {
    if (deleteTarget) deleteMutation.mutate(deleteTarget);
  };

  const handleNavigate = (newIndex: number) => {
    setViewerIndex(newIndex);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Radiology Images — {patientName}</CardTitle>
            <Button size="sm" onClick={() => setUploadOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Upload Image
            </Button>
          </CardHeader>
          <CardContent>
            {/* Filter pills */}
            {images.length > 0 && (
              <div className="mb-4 flex flex-wrap items-center gap-1.5">
                <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Filter className="h-3 w-3" /> Filter:
                </span>
                <button
                  onClick={() => setFilter('all')}
                  className={cn(
                    'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                    filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                  )}
                >
                  All ({images.length})
                </button>
                {IMAGE_TYPES.filter((t) => categoryCounts[t] > 0).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={cn(
                      'rounded-full px-2.5 py-1 text-xs font-medium transition-colors',
                      filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80',
                    )}
                  >
                    {type} ({categoryCounts[type]})
                  </button>
                ))}
              </div>
            )}

            {isLoading ? (
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : filtered.length === 0 ? (
              <EmptyState
                icon={ScanLine}
                title={images.length === 0 ? 'No images uploaded' : 'No images in this category'}
                description={
                  images.length === 0
                    ? 'Upload X-rays, OPGs, CBCT scans, and intraoral photos to build the patient radiology record.'
                    : 'Try a different filter or upload a new image.'
                }
                action={
                  images.length === 0 && (
                    <Button onClick={() => setUploadOpen(true)}>
                      <Plus className="mr-2 h-4 w-4" /> Upload Image
                    </Button>
                  )
                }
              />
            ) : (
              <motion.div layout className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AnimatePresence>
                  {filtered.map((image, i) => (
                    <ImageCard
                      key={image.id}
                      image={image}
                      index={i}
                      onOpen={() => setViewerIndex(i)}
                      onDelete={(img) => setDeleteTarget(img)}
                    />
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Categories sidebar */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ImageIcon className="h-5 w-5 text-primary" /> Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {IMAGE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(filter === type ? 'all' : type)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border p-2.5 text-left text-sm transition-colors',
                filter === type ? 'border-primary bg-primary/5' : 'hover:bg-muted/50',
              )}
            >
              <span className="font-medium">{type}</span>
              <Badge variant="secondary" className="text-[10px]">{categoryCounts[type]}</Badge>
            </button>
          ))}
        </CardContent>
      </Card>

      {/* Upload dialog */}
      <ImageUpload patientId={patientId} open={uploadOpen} onOpenChange={setUploadOpen} />

      {/* Full-screen viewer */}
      <ImageViewer
        images={filtered}
        index={viewerIndex}
        onClose={() => setViewerIndex(null)}
        onNavigate={handleNavigate}
      />

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete radiology image?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove "{deleteTarget?.imageName}" from both storage and the database. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

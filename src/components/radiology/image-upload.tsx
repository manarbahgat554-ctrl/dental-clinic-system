import { useRef, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Loader2, X, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { queries, queryKeys } from '@/lib/api';
import {
  uploadRadiologyFile,
  isAcceptedFile,
  getFileExtension,
  ACCEPTED_EXTENSIONS,
  IMAGE_TYPES,
} from '@/lib/storage';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  patientId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface PendingFile {
  file: File;
  progress: number;
  error: string | null;
}

export function ImageUpload({ patientId, open, onOpenChange }: ImageUploadProps) {
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, setPending] = useState<PendingFile[]>([]);
  const [imageType, setImageType] = useState<string>('Periapical');
  const [toothNumber, setToothNumber] = useState('');
  const [notes, setNotes] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async (item: PendingFile) => {
      const { path, publicUrl } = await uploadRadiologyFile(item.file, {
        patientId,
        imageType,
        toothNumber: toothNumber ? Number(toothNumber) : undefined,
        notes: notes || undefined,
      }, (percent) => {
        setPending((prev) =>
          prev.map((p) => (p.file === item.file ? { ...p, progress: percent } : p)),
        );
      });
      return { path, publicUrl };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.radiology(patientId) });
      toast.success('Image uploaded successfully');
    },
    onError: (err: Error) => {
      toast.error(`Upload failed: ${err.message}`);
    },
    onSettled: () => {
      // removed in handleFiles after each completes
    },
  });

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const accepted: PendingFile[] = [];
    Array.from(files).forEach((file) => {
      if (!isAcceptedFile(file.name)) {
        toast.error(`Unsupported file type: ${file.name}`);
        return;
      }
      accepted.push({ file, progress: 0, error: null });
    });
    if (accepted.length === 0) return;
    setPending((prev) => [...prev, ...accepted]);

    // Upload sequentially
    accepted.reduce(async (chain, item) => {
      await chain;
      try {
        await uploadMutation.mutateAsync(item);
      } catch {
        // error already toasted
      }
      setPending((prev) => prev.filter((p) => p.file !== item.file));
    }, Promise.resolve());
  };

  const handleClose = () => {
    if (uploadMutation.isPending) {
      toast.message('Upload in progress, please wait...');
      return;
    }
    setPending([]);
    setNotes('');
    setToothNumber('');
    onOpenChange(false);
  };

  const removePending = (file: File) => {
    setPending((prev) => prev.filter((p) => p.file !== file));
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Radiology Image</DialogTitle>
          <DialogDescription>
            Supports {ACCEPTED_EXTENSIONS.map((e) => e.toUpperCase()).join(', ')} files.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Metadata fields */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">Image Type</Label>
              <Select value={imageType} onValueChange={setImageType}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMAGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Tooth Number (optional)</Label>
              <Input
                type="number"
                placeholder="e.g. 16"
                value={toothNumber}
                onChange={(e) => setToothNumber(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">Notes (optional)</Label>
            <Textarea
              rows={2}
              placeholder="Clinical observations..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Drop zone */}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/20 p-6 transition-colors hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="rounded-xl bg-primary/10 p-3">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="text-sm font-medium">Click to select files</p>
            <p className="text-xs text-muted-foreground">
              {ACCEPTED_EXTENSIONS.map((e) => e.toUpperCase()).join(', ')}
            </p>
          </button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept={ACCEPTED_EXTENSIONS.map((e) => `.${e}`).join(',')}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          {/* Pending uploads */}
          <AnimatePresence>
            {pending.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-2"
              >
                {pending.map((item) => (
                  <div key={item.file.name} className="rounded-lg border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-medium">{item.file.name}</span>
                      <button
                        onClick={() => removePending(item.file)}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            'h-full rounded-full transition-all',
                            item.error ? 'bg-destructive' : 'bg-primary',
                          )}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">
                        {item.error ? (
                          <span className="flex items-center gap-1 text-destructive"><FileWarning className="h-3 w-3" /> Failed</span>
                        ) : (
                          `${item.progress}%`
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={uploadMutation.isPending}>
            Close
          </Button>
          <Button
            onClick={() => inputRef.current?.click()}
            disabled={uploadMutation.isPending}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Upload className="mr-2 h-4 w-4" />
            )}
            Select Files
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

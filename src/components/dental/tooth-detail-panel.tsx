import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { queries, queryKeys } from '@/lib/api';
import { TOOTH_STATUSES, TOOTH_SURFACES } from '@/lib/dental-data';
import { toothStatusMeta, getToothColor } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { ToothStatus, ToothSurface, ToothRecord } from '@/types';

interface ToothDetailPanelProps {
  patientId: string;
  toothNumber: number | null;
  onClose: () => void;
}

export function ToothDetailPanel({ patientId, toothNumber, onClose }: ToothDetailPanelProps) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ToothStatus>('healthy');
  const [surfaces, setSurfaces] = useState<Partial<Record<ToothSurface, ToothStatus>>>({});
  const [diagnosis, setDiagnosis] = useState('');
  const [treatment, setTreatment] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  const { data: teeth = [] } = useQuery({
    queryKey: queryKeys.teeth(patientId),
    queryFn: () => queries.teeth.listByPatient(patientId),
  });

  const currentRecord = toothNumber ? teeth.find((t) => t.tooth_number === toothNumber) : undefined;

  useEffect(() => {
    if (currentRecord) {
      setStatus(currentRecord.status);
      setSurfaces(currentRecord.surfaces || {});
      setDiagnosis(currentRecord.diagnosis || '');
      setTreatment(currentRecord.treatment || '');
      setClinicalNotes(currentRecord.clinical_notes || '');
    } else {
      setStatus('healthy');
      setSurfaces({});
      setDiagnosis('');
      setTreatment('');
      setClinicalNotes('');
    }
  }, [currentRecord, toothNumber]);

  const saveMutation = useMutation({
    mutationFn: (input: Partial<ToothRecord> & { patient_id: string; tooth_number: number }) =>
      queries.teeth.upsert(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.teeth(patientId) });
      toast.success(`Tooth ${toothNumber} updated`);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleSave = () => {
    if (!toothNumber) return;
    saveMutation.mutate({
      patient_id: patientId,
      tooth_number: toothNumber,
      status,
      surfaces,
      diagnosis: diagnosis || null,
      treatment: treatment || null,
      clinical_notes: clinicalNotes || null,
    });
  };

  const toggleSurface = (surface: ToothSurface, s: ToothStatus) => {
    setSurfaces((prev) => {
      const next = { ...prev };
      if (next[surface] === s) {
        delete next[surface];
      } else {
        next[surface] = s;
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      {toothNumber && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.25 }}
        >
          <Card className="sticky top-20">
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardTitle className="flex items-center gap-2 text-base">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white"
                  style={{ background: getToothColor(status) }}
                >
                  {toothNumber}
                </span>
                Tooth {toothNumber}
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Status</Label>
                <div className="grid grid-cols-2 gap-1.5">
                  {TOOTH_STATUSES.slice(0, 8).map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStatus(opt.value)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-left text-xs transition-all',
                        status === opt.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:border-primary/40',
                      )}
                    >
                      <span className="h-2.5 w-2.5 rounded-sm" style={{ background: getToothColor(opt.value) }} />
                      <span className="truncate">{opt.label}</span>
                    </button>
                  ))}
                </div>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ToothStatus)}
                  className="mt-1 flex h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  {TOOTH_STATUSES.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Surfaces */}
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Surfaces</Label>
                <div className="space-y-1.5">
                  {TOOTH_SURFACES.map((surf) => (
                    <div key={surf.key} className="flex items-center justify-between gap-2">
                      <span className="text-xs font-medium">{surf.label}</span>
                      <select
                        value={surfaces[surf.key] ?? ''}
                        onChange={(e) => {
                          const val = e.target.value as ToothStatus;
                          if (val) toggleSurface(surf.key, val);
                          else
                            setSurfaces((prev) => {
                              const next = { ...prev };
                              delete next[surf.key];
                              return next;
                            });
                        }}
                        className="h-7 rounded-md border border-input bg-background px-2 text-xs"
                      >
                        <option value="">—</option>
                        {TOOTH_STATUSES.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Diagnosis & Treatment */}
              <div className="space-y-2">
                <Label htmlFor="diagnosis" className="text-xs uppercase tracking-wider text-muted-foreground">Diagnosis</Label>
                <Input id="diagnosis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Deep caries" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="treatment" className="text-xs uppercase tracking-wider text-muted-foreground">Treatment</Label>
                <Input id="treatment" value={treatment} onChange={(e) => setTreatment(e.target.value)} placeholder="e.g. Composite filling" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-xs uppercase tracking-wider text-muted-foreground">Clinical Notes</Label>
                <Textarea id="notes" value={clinicalNotes} onChange={(e) => setClinicalNotes(e.target.value)} placeholder="Observations..." rows={3} />
              </div>

              {currentRecord && (
                <div className="flex flex-wrap gap-1.5">
                  <Badge variant="outline" className={cn('text-[10px]', toothStatusMeta(currentRecord.status).color)}>
                    {toothStatusMeta(currentRecord.status).label}
                  </Badge>
                  {currentRecord.bleeding && <Badge variant="outline" className="text-[10px] text-destructive">Bleeding</Badge>}
                </div>
              )}

              <Button onClick={handleSave} className="w-full" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save Tooth Record
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

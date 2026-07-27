import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Box, Grid3x3, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { queries, queryKeys } from '@/lib/api';
import { DentalChart } from '@/components/dental/dental-chart';
import { JawModel3D } from '@/components/dental/jaw-model-3d';
import { ToothDetailPanel } from '@/components/dental/tooth-detail-panel';
import { cn } from '@/lib/utils';

interface PatientDentalChartProps {
  patientId: string;
}

export function PatientDentalChart({ patientId }: PatientDentalChartProps) {
  const [view, setView] = useState<'2d' | '3d'>('2d');
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);

  const { data: teeth = [], isLoading } = useQuery({
    queryKey: queryKeys.teeth(patientId),
    queryFn: () => queries.teeth.listByPatient(patientId),
  });

  const affectedCount = teeth.filter((t) => t.status !== 'healthy').length;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Dental Chart</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{affectedCount} affected</Badge>
              <div className="flex rounded-lg border p-0.5">
                <Button
                  variant={view === '2d' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setView('2d')}
                >
                  <Grid3x3 className="mr-1 h-3.5 w-3.5" /> 2D
                </Button>
                <Button
                  variant={view === '3d' ? 'default' : 'ghost'}
                  size="sm"
                  className="h-7"
                  onClick={() => setView('3d')}
                >
                  <Box className="mr-1 h-3.5 w-3.5" /> 3D
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                Loading chart...
              </div>
            ) : view === '2d' ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <DentalChart
                  teethRecords={teeth}
                  selectedTooth={selectedTooth}
                  onSelectTooth={setSelectedTooth}
                />
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <JawModel3D
                  teethRecords={teeth}
                  selectedTooth={selectedTooth}
                  onSelectTooth={setSelectedTooth}
                />
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Drag to rotate · Scroll to zoom · Click a tooth to select
                </p>
              </motion.div>
            )}
          </CardContent>
        </Card>

        {/* Legend */}
        <Card>
          <CardContent className="flex flex-wrap gap-3 p-4">
            {[
              { label: 'Healthy', color: '#10b981' },
              { label: 'Caries', color: '#f59e0b' },
              { label: 'Filling', color: '#14b8a6' },
              { label: 'Crown', color: '#22c55e' },
              { label: 'Root Canal', color: '#f97316' },
              { label: 'Implant', color: '#a855f7' },
              { label: 'Missing', color: '#64748b' },
              { label: 'Fracture', color: '#dc2626' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm" style={{ background: item.color }} />
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div>
        {selectedTooth ? (
          <ToothDetailPanel
            patientId={patientId}
            toothNumber={selectedTooth}
            onClose={() => setSelectedTooth(null)}
          />
        ) : (
          <Card className={cn('sticky top-20 border-dashed')}>
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-2xl bg-muted p-4">
                <Info className="h-6 w-6 text-muted-foreground" />
              </div>
              <p className="text-sm font-medium">Select a tooth</p>
              <p className="max-w-[200px] text-xs text-muted-foreground">
                Click any tooth on the chart or 3D model to view and edit its clinical details.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getToothColor } from '@/lib/format';
import { PERMANENT_TEETH } from '@/lib/dental-data';
import type { ToothRecord, ToothStatus, ToothSurface } from '@/types';

interface DentalChartProps {
  teethRecords: ToothRecord[];
  selectedTooth: number | null;
  onSelectTooth: (num: number) => void;
  showPrimary?: boolean;
}

export function DentalChart({ teethRecords, selectedTooth, onSelectTooth }: DentalChartProps) {
  const recordMap = new Map(teethRecords.map((t) => [t.tooth_number, t]));

  const renderTooth = (num: number) => {
    const record = recordMap.get(num);
    const status: ToothStatus = record?.status ?? 'healthy';
    const color = getToothColor(status);
    const isSelected = selectedTooth === num;
    const isMissing = status === 'missing';

    return (
      <motion.button
        key={num}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onSelectTooth(num)}
        className={cn(
          'group relative flex flex-col items-center gap-1 rounded-lg p-1.5 transition-all',
          isSelected && 'ring-2 ring-primary ring-offset-2 ring-offset-background',
        )}
        title={record ? record.diagnosis || status : 'Healthy'}
      >
        {/* Tooth visual */}
        <div className="relative h-12 w-9">
          {/* Number label */}
          <span className="absolute -top-4 left-1/2 -translate-x-1/2 text-[9px] font-semibold text-muted-foreground">
            {num}
          </span>

          {/* Tooth body with surfaces */}
          <svg viewBox="0 0 36 48" className="h-full w-full">
            {/* Outer tooth shape */}
            <path
              d="M6 6 Q6 2 10 2 L26 2 Q30 2 30 6 L30 30 Q30 44 18 46 Q6 44 6 30 Z"
              fill={isMissing ? 'transparent' : color}
              fillOpacity={isMissing ? 0 : status === 'healthy' ? 0.15 : 0.7}
              stroke={isSelected ? 'hsl(var(--primary))' : color}
              strokeWidth={isSelected ? 2.5 : 1.5}
              strokeDasharray={isMissing ? '3 2' : 'none'}
            />
            {/* Surface dividers (when there's a record with surfaces) */}
            {record && Object.keys(record.surfaces || {}).length > 0 && !isMissing && (
              <>
                <line x1="18" y1="2" x2="18" y2="46" stroke="white" strokeWidth="0.6" opacity="0.5" />
                <line x1="6" y1="24" x2="30" y2="24" stroke="white" strokeWidth="0.6" opacity="0.5" />
                {renderSurfaceMarks(record.surfaces)}
              </>
            )}
            {/* X mark for missing */}
            {isMissing && (
              <>
                <line x1="8" y1="8" x2="28" y2="40" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
                <line x1="28" y1="8" x2="8" y2="40" stroke="hsl(var(--muted-foreground))" strokeWidth="2" />
              </>
            )}
          </svg>
        </div>
      </motion.button>
    );
  };

  const renderSurfaceMarks = (surfaces: Partial<Record<ToothSurface, ToothStatus>>) => {
    const marks: React.ReactElement[] = [];
    const surfacePositions: Record<ToothSurface, { cx: number; cy: number }> = {
      occlusal: { cx: 18, cy: 24 },
      buccal: { cx: 18, cy: 6 },
      lingual: { cx: 18, cy: 42 },
      mesial: { cx: 8, cy: 24 },
      distal: { cx: 28, cy: 24 },
    };
    Object.entries(surfaces).forEach(([surface, status]) => {
      if (!status || status === 'healthy') return;
      const pos = surfacePositions[surface as ToothSurface];
      if (pos) {
        marks.push(
          <circle
            key={surface}
            cx={pos.cx}
            cy={pos.cy}
            r="2.5"
            fill={getToothColor(status)}
            stroke="white"
            strokeWidth="0.5"
          />,
        );
      }
    });
    return <>{marks}</>;
  };

  return (
    <div className="space-y-6">
      {/* Upper jaw */}
      <div className="space-y-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Upper Jaw (Maxillary)
        </p>
        <div className="flex flex-wrap justify-center gap-1 rounded-xl border bg-muted/20 p-4">
          <div className="flex gap-0.5">{PERMANENT_TEETH.upperRight.map(renderTooth)}</div>
          <div className="mx-2 w-px self-stretch bg-border" />
          <div className="flex gap-0.5">{PERMANENT_TEETH.upperLeft.map(renderTooth)}</div>
        </div>
      </div>

      {/* Lower jaw */}
      <div className="space-y-2">
        <p className="text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Lower Jaw (Mandibular)
        </p>
        <div className="flex flex-wrap justify-center gap-1 rounded-xl border bg-muted/20 p-4">
          <div className="flex gap-0.5">{PERMANENT_TEETH.lowerRight.map(renderTooth)}</div>
          <div className="mx-2 w-px self-stretch bg-border" />
          <div className="flex gap-0.5">{PERMANENT_TEETH.lowerLeft.map(renderTooth)}</div>
        </div>
      </div>
    </div>
  );
}

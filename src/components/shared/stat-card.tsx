import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  accent?: string;
  index?: number;
}

export function StatCard({ label, value, icon: Icon, trend, accent, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06, ease: 'easeOut' }}
    >
      <Card className="group relative overflow-hidden p-5 transition-all hover:shadow-md">
        <div
          className={cn(
            'absolute inset-x-0 top-0 h-1 opacity-80',
            accent ?? 'bg-primary',
          )}
        />
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="font-display text-2xl font-bold tracking-tight">{value}</p>
          </div>
          <div className={cn('rounded-xl p-2.5', accent ? `${accent}/15` : 'bg-primary/15')}>
            <Icon className={cn('h-5 w-5', accent ? accent.replace('bg-', 'text-') : 'text-primary')} />
          </div>
        </div>
        {trend && (
          <div className="mt-3 flex items-center gap-1.5 text-xs">
            {trend.positive ? (
              <TrendingUp className="h-3.5 w-3.5 text-success" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-destructive" />
            )}
            <span className={trend.positive ? 'text-success' : 'text-destructive'}>
              {trend.positive ? '+' : ''}
              {trend.value}%
            </span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
}

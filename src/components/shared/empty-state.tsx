import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={cn('flex flex-col items-center justify-center px-6 py-16 text-center', className)}
    >
      <div className="relative mb-5">
        <div className="absolute inset-0 animate-pulse-glow rounded-2xl bg-primary/20 blur-xl" />
        <div className="relative rounded-2xl bg-primary/10 p-4">
          <Icon className="h-8 w-8 text-primary" />
        </div>
      </div>
      <h3 className="font-display text-lg font-semibold">{title}</h3>
      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  );
}

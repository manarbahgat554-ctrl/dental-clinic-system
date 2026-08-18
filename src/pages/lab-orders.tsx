import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FlaskConical, Plus, Loader2, Clock, Package } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
// Badge removed — not used in this file
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { queries, queryKeys } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { LabOrder, LabOrderStatus } from '@/types';

const STATUS_META: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: {
    label: 'Pending',
    color: 'text-warning',
    bg: 'bg-warning/15',
  },
  IN_PROGRESS: {
    label: 'In Progress',
    color: 'text-accent',
    bg: 'bg-accent/15',
  },
  COMPLETED: {
    label: 'Completed',
    color: 'text-primary',
    bg: 'bg-primary/15',
  },
  DELIVERED: {
    label: 'Delivered',
    color: 'text-success',
    bg: 'bg-success/15',
  },
  CANCELLED: {
    label: 'Cancelled',
    color: 'text-muted-foreground',
    bg: 'bg-muted',
  },
};

export function LabOrdersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: orders = [], isLoading } = useQuery({
    queryKey: queryKeys.labOrders,
    queryFn: () => queries.labOrders.list(),
  });
  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  const createMutation = useMutation({
    mutationFn: (input: Partial<LabOrder>) => queries.labOrders.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labOrders });
      toast.success(t('labOrders.orderCreated'));
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LabOrderStatus }) =>
      queries.labOrders.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labOrders });
      toast.success(t('common.updated'));
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('labOrders.title')}
        description={t('labOrders.description')}
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> {t('labOrders.newOrder')}</Button>}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={FlaskConical}
            title={t('labOrders.noOrders')}
            description={t('labOrders.addOrderDesc')}
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> {t('labOrders.newOrder')}</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order, i) => {
            const meta = STATUS_META[String(order.status).toUpperCase()] ?? STATUS_META.PENDING;
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2"><Package className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-semibold">{order.workType}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.patient ? `${order.patient.firstName} ${order.patient.lastName}` : '—'}
                        </p>
                      </div>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>{meta.label}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                   {order.labName && <p>Lab: {order.labName}</p>}

                   {order.dueDate && (
                     <p className="flex items-center gap-1">
                       <Clock className="h-3 w-3" />
                       Due: {formatDate(order.dueDate)}
                     </p>
                   )}
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <select
  value={order.status}
  onChange={(e) =>
    statusMutation.mutate({
      id: order.id,
      status: e.target.value as LabOrderStatus,
    })
  }
  className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
>
  <option value="PENDING">Pending</option>
  <option value="IN_PROGRESS">In Progress</option>
  <option value="COMPLETED">Completed</option>
  <option value="DELIVERED">Delivered</option>
  <option value="CANCELLED">Cancelled</option>
</select>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <NewOrderDialog open={dialogOpen} onOpenChange={setDialogOpen} patients={patients} onCreate={createMutation.mutate} pending={createMutation.isPending} />
    </div>
  );
}

function NewOrderDialog({
  open,
  onOpenChange,
  patients,
  onCreate,
  pending,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patients: import('@/types').Patient[];
  onCreate: (input: Partial<LabOrder>) => void;
  pending: boolean;
}) {
  const { t } = useTranslation();
const [form, setForm] = useState({
  patientId: '',
  workType: '',
  labName: '',
  dueDate: '',
  notes: '',
});
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('labOrders.newOrderTitle')}</DialogTitle>
          <DialogDescription>{t('labOrders.newOrderDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>{t('labOrders.selectPatient')} *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}>
              <option value="">{t('labOrders.selectPatient')}</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>{t('labOrders.workType')} *</Label>
            <Input placeholder={t('labOrders.workTypePlaceholder')} value={form.workType} onChange={(e) => setForm({ ...form, workType: e.target.value })} />
          </div>
          <div className="space-y-2">
  <Label>{t('labOrders.labName')}</Label>
  <Input
    value={form.labName}
    onChange={(e) =>
      setForm({ ...form, labName: e.target.value })
    }
  />
</div>

        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => onCreate({ ...form, dueDate: form.dueDate || null })} disabled={pending || !form.patientId || !form.workType}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('labOrders.createOrder')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

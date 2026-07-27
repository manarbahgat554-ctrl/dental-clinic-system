import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { FlaskConical, Plus, Loader2, Clock, CheckCircle2, Package } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

const STATUS_META: Record<LabOrderStatus, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/15' },
  in_progress: { label: 'In Progress', color: 'text-accent', bg: 'bg-accent/15' },
  ready: { label: 'Ready', color: 'text-primary', bg: 'bg-primary/15' },
  delivered: { label: 'Delivered', color: 'text-success', bg: 'bg-success/15' },
  cancelled: { label: 'Cancelled', color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function LabOrdersPage() {
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
      toast.success('Lab order created');
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: LabOrderStatus }) =>
      queries.labOrders.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.labOrders });
      toast.success('Status updated');
    },
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lab Orders"
        description="Track dental laboratory work orders"
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Order</Button>}
      />

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : orders.length === 0 ? (
        <Card>
          <EmptyState
            icon={FlaskConical}
            title="No lab orders"
            description="Create a lab order to send work to your dental laboratory."
            action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> New Order</Button>}
          />
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {orders.map((order, i) => {
            const meta = STATUS_META[order.status];
            return (
              <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.3) }}>
                <Card className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-primary/10 p-2"><Package className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-semibold">{order.work_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.patient ? `${order.patient.first_name} ${order.patient.last_name}` : '—'}
                        </p>
                      </div>
                    </div>
                    <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>{meta.label}</span>
                  </div>
                  <div className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {order.lab_name && <p>Lab: {order.lab_name}</p>}
                    {order.tooth_numbers && <p>Teeth: {order.tooth_numbers}</p>}
                    {order.shade && <p>Shade: {order.shade}</p>}
                    {order.due_date && <p className="flex items-center gap-1"><Clock className="h-3 w-3" /> Due: {formatDate(order.due_date)}</p>}
                  </div>
                  <div className="mt-3 flex gap-1.5">
                    <select
                      value={order.status}
                      onChange={(e) => statusMutation.mutate({ id: order.id, status: e.target.value as LabOrderStatus })}
                      className="h-8 flex-1 rounded-md border border-input bg-background px-2 text-xs"
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="ready">Ready</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
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
  const [form, setForm] = useState({ patient_id: '', work_type: '', lab_name: '', tooth_numbers: '', shade: '', due_date: '', notes: '' });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Lab Order</DialogTitle>
          <DialogDescription>Send a work order to a dental lab.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Patient *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm" value={form.patient_id} onChange={(e) => setForm({ ...form, patient_id: e.target.value })}>
              <option value="">Select patient...</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>Work Type *</Label>
            <Input placeholder="e.g. Crown, Bridge, Denture" value={form.work_type} onChange={(e) => setForm({ ...form, work_type: e.target.value })} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Lab Name</Label><Input value={form.lab_name} onChange={(e) => setForm({ ...form, lab_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>Shade</Label><Input placeholder="e.g. A2" value={form.shade} onChange={(e) => setForm({ ...form, shade: e.target.value })} /></div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2"><Label>Teeth</Label><Input placeholder="e.g. 16, 26" value={form.tooth_numbers} onChange={(e) => setForm({ ...form, tooth_numbers: e.target.value })} /></div>
            <div className="space-y-2"><Label>Due Date</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>Notes</Label><Textarea rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onCreate({ ...form, due_date: form.due_date || null })} disabled={pending || !form.patient_id || !form.work_type}>
            {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

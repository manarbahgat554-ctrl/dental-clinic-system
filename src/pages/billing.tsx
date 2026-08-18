import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Receipt,
  Plus,
  Clock,
  CheckCircle2,
  Loader2,
  FileDown,
  CreditCard,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { queries, queryKeys } from '@/lib/api';
import { formatCurrency, formatDate, invoiceStatusMeta } from '@/lib/format';
import { cn } from '@/lib/utils';
import { generateInvoicePDF } from '@/lib/pdf';
import type { Invoice, InvoiceItem } from '@/types';

export function BillingPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState<Invoice | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  const { data: invoices = [], isLoading } = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => queries.invoices.list(),
  });
  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  const stats = {
    total: invoices.reduce((s, i) => s + i.total, 0),
    paid: invoices.reduce((s, i) => s + i.paidAmount, 0),
    pending: invoices.reduce((s, i) => s + (i.total - i.paidAmount), 0),
    count: invoices.length,
  };

  const paymentMutation = useMutation({
  mutationFn: async ({
    invoice,
    amount,
  }: {
    invoice: Invoice;
    amount: number;
  }) => {
    return queries.payments.create({
      invoiceId: invoice.id,
      patientId: invoice.patientId,
      amount,
      method: 'cash',
    });
  },

  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.invoices,
    });

    queryClient.invalidateQueries({
      queryKey: queryKeys.payments,
    });

    toast.success(t('billing.paymentRecorded'));

    setPaymentDialog(null);
    setPaymentAmount('');
  },

  onError: (err: Error) => {
    toast.error(err.message);
  },
});
  const handleDownload = (invoice: Invoice) => {
    const patient = patients.find((p) => p.id === invoice.patientId);
    generateInvoicePDF(invoice, patient);
    toast.success(t('billing.invoiceDownloaded'));
  };

  const recordPayment = (invoice: Invoice) => {
    setPaymentDialog(invoice);
    setPaymentAmount(String(Number(invoice.total) - Number(invoice.paidAmount)));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Billing"
        description="Manage invoices, payments, and revenue"
        actions={
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard index={0} label={t('billing.totalBilled')} value={formatCurrency(stats.total)} icon={Receipt} accent="bg-primary" />
        <StatCard index={1} label={t('billing.collected')} value={formatCurrency(stats.paid)} icon={CheckCircle2} accent="bg-success" />
        <StatCard index={2} label={t('billing.outstanding')} value={formatCurrency(stats.pending)} icon={Clock} accent="bg-warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t('billing.invoices')}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : invoices.length === 0 ? (
            <EmptyState
              icon={Receipt}
              title={t('billing.noInvoices')}
              description={t('billing.addInvoiceDesc')}
              action={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> {t('billing.newInvoice')}</Button>}
            />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('billing.invoiceNumber')}</TableHead>
                    <TableHead>{t('billing.patient')}</TableHead>
                    <TableHead>{t('common.date')}</TableHead>
                    <TableHead className="text-right">{t('common.total')}</TableHead>
                    <TableHead className="text-right">{t('common.paid')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                    <TableHead className="text-right">{t('common.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice, i) => {
                    const meta = invoiceStatusMeta(invoice.status);
                    return (
                      <motion.tr
                        key={invoice.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: Math.min(i * 0.03, 0.2) }}
                        className="border-b transition-colors hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs font-medium">{invoice.invoiceNumber}</TableCell>
                        <TableCell className="font-medium">
                          {invoice.patient ? `${invoice.patient.firstName} ${invoice.patient.lastName}` : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(invoice.createdAt)}</TableCell>
                        <TableCell className="text-right font-semibold">{formatCurrency(Number(invoice.total))}</TableCell>
                        <TableCell className="text-right text-success">{formatCurrency(invoice.paidAmount)}</TableCell>
                        <TableCell>
                          <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', meta.bg, meta.color)}>
                            {meta.label}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {invoice.status !== 'paid' && (
                              <Button size="sm" variant="outline" className="h-7" onClick={() => recordPayment(invoice)}>
                                <CreditCard className="mr-1 h-3 w-3" /> {t('billing.recordPayment')}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" className="h-7" onClick={() => handleDownload(invoice)}>
                              <FileDown className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment dialog */}
      <Dialog open={!!paymentDialog} onOpenChange={(o) => !o && setPaymentDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('billing.recordPayment')}</DialogTitle>
            <DialogDescription>
              Invoice {paymentDialog?.invoiceNumber} — Balance: {paymentDialog ? formatCurrency(paymentDialog.total - paymentDialog.paidAmount) : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('billing.amount')}</Label>
              <Input id="amount" type="number" step="0.01" value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialog(null)}>{t('common.cancel')}</Button>
            <Button
              onClick={() => paymentDialog && paymentMutation.mutate({ invoice: paymentDialog, amount: Number(paymentAmount) })}
              disabled={paymentMutation.isPending}
            >
              {paymentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t('billing.recordPaymentBtn')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewInvoiceDialog open={dialogOpen} onOpenChange={setDialogOpen} patients={patients} />
    </div>
  );
}

function NewInvoiceDialog({
  open,
  onOpenChange,
  patients,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  patients: import('@/types').Patient[];
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [patientId, setPatientId] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
  const [taxRate, setTaxRate] = useState('0');

  const subtotal = items.reduce((s, i) => s + i.total, 0);
  const taxAmount = (subtotal * Number(taxRate)) / 100;
  const total = subtotal + taxAmount;

  const createMutation = useMutation({
    mutationFn: () =>
  queries.invoices.create({
    patientId: patientId,
    invoiceNumber: `INV-${Date.now().toString().slice(-6)}`,
    items,
    subtotal,
    taxRate: Number(taxRate),
    taxAmount: taxAmount,
    total,
    paidAmount: 0,
  }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success(t('billing.invoiceCreated'));
      onOpenChange(false);
      setPatientId('');
      setItems([{ description: '', quantity: 1, unitPrice: 0, total: 0 }]);
      setTaxRate('0');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'quantity' || field === 'unitPrice') {
          updated.total = updated.quantity * updated.unitPrice;
        }
        return updated;
      }),
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('billing.createInvoice')}</DialogTitle>
          <DialogDescription>{t('billing.createInvoiceDesc')}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{t('billing.patient')} *</Label>
            <select
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">{t('billing.selectPatient')}</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>{p.firstName} {p.lastName}</option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label>{t('billing.items')}</Label>
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_60px_90px_90px] gap-2">
                <Input placeholder={t('billing.itemDescription')} value={item.description} onChange={(e) => updateItem(i, 'description', e.target.value)} />
                <Input type="number" placeholder={t('billing.quantity')} value={item.quantity} onChange={(e) => updateItem(i, 'quantity', Number(e.target.value))} />
                <Input type="number" placeholder={t('billing.unitPrice')} value={item.unitPrice} onChange={(e) => updateItem(i, 'unitPrice', Number(e.target.value))} />
                <Input readOnly value={item.total.toFixed(2)} className="bg-muted text-right" />
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setItems([...items, { description: '', quantity: 1, unitPrice: 0, total: 0 }])}
            >
              <Plus className="mr-1 h-3.5 w-3.5" /> {t('billing.addItem')}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{t('billing.tax')}</Label>
              <Input type="number" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>{t('common.total')}</Label>
              <Input readOnly value={formatCurrency(total)} className="bg-muted font-semibold" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>{t('common.cancel')}</Button>
          <Button onClick={() => createMutation.mutate()} disabled={createMutation.isPending || !patientId}>
            {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('billing.createInvoice')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

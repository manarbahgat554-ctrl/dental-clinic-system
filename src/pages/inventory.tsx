import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Boxes, Plus, Loader2, AlertTriangle, Package } from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { InventoryItem } from '@/types';

export function InventoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => queries.inventory.list(),
  });

  const lowStock = items.filter((i) => i.quantity <= i.minQuantity);

  const createMutation = useMutation({
    mutationFn: (input: Partial<InventoryItem>) => queries.inventory.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success(t('inventory.itemAdded'));
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [form, setForm] = useState({ name: '', category: '', sku: '', quantity: '0', minQuantity: '5', unit: 'unit', unitPrice: '0', supplier: '', expiryDate: '' });

  return (
    <div className="space-y-6">
      <PageHeader
        title={t('inventory.title')}
        description={t('inventory.description', { count: items.length, lowCount: lowStock.length })}
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> {t('inventory.addItem')}</Button>}
      />

      {lowStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm font-medium">
              {t('inventory.lowStockWarning', { count: lowStock.length, items: lowStock.map((i) => i.name).join(', ') })}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <EmptyState icon={Boxes} title={t('inventory.noItems')} description={t('inventory.addInventoryDesc')} />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('inventory.item')}</TableHead>
                    <TableHead>{t('inventory.category')}</TableHead>
                    <TableHead className="text-right">{t('inventory.stock')}</TableHead>
                    <TableHead className="text-right">{t('inventory.minStock')}</TableHead>
                    <TableHead>{t('inventory.supplier')}</TableHead>
                    <TableHead>{t('inventory.expiryDate')}</TableHead>
                    <TableHead>{t('common.status')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item, i) => (
                    <motion.tr
                      key={item.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.03, 0.2) }}
                      className="border-b transition-colors hover:bg-muted/50"
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="rounded-lg bg-muted p-1.5"><Package className="h-3.5 w-3.5 text-muted-foreground" /></div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            {item.sku && <p className="text-xs text-muted-foreground">{item.sku}</p>}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.category || '—'}</TableCell>
                      <TableCell className="text-right font-medium">{item.quantity} {item.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.minQuantity}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.supplier || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.expiryDate ? formatDate(item.expiryDate) : '—'}</TableCell>
                      <TableCell>
                        {item.quantity <= item.minQuantity ? (
                          <Badge variant="outline" className="border-warning/40 text-warning">{t('inventory.lowStock')}</Badge>
                        ) : (
                          <Badge variant="outline" className="border-success/40 text-success">{t('inventory.inStock')}</Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t('inventory.addItemTitle')}</DialogTitle>
            <DialogDescription>{t('inventory.addItemDesc')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>{t('inventory.item')} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('inventory.category')}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('inventory.sku')}</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2"><Label>{t('inventory.stock')}</Label><Input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('inventory.minStock')}</Label><Input type="number" value={form.minQuantity} onChange={(e) => setForm({ ...form, minQuantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('inventory.unit')}</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>{t('inventory.costPerUnit')}</Label><Input type="number" step="0.01" value={form.unitPrice} onChange={(e) => setForm({ ...form, unitPrice: e.target.value })} /></div>
              <div className="space-y-2"><Label>{t('inventory.expiryDate')}</Label><Input type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{t('inventory.supplier')}</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{t('common.cancel')}</Button>
            <Button onClick={() => createMutation.mutate({ ...form, quantity: Number(form.quantity), minQuantity: Number(form.minQuantity), unitPrice: Number(form.unitPrice), expiryDate: form.expiryDate || null })} disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} {t('inventory.addItem')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

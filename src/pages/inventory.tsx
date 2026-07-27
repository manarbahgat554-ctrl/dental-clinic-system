import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: items = [], isLoading } = useQuery({
    queryKey: queryKeys.inventory,
    queryFn: () => queries.inventory.list(),
  });

  const lowStock = items.filter((i) => i.stock_quantity <= i.min_stock);

  const createMutation = useMutation({
    mutationFn: (input: Partial<InventoryItem>) => queries.inventory.create(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory });
      toast.success('Item added');
      setDialogOpen(false);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const [form, setForm] = useState({ name: '', category: '', sku: '', stock_quantity: '0', min_stock: '5', unit: 'unit', cost_per_unit: '0', supplier: '', expiry_date: '' });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description={`${items.length} items · ${lowStock.length} low stock`}
        actions={<Button onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Add Item</Button>}
      />

      {lowStock.length > 0 && (
        <Card className="border-warning/40 bg-warning/5">
          <CardContent className="flex items-center gap-3 p-4">
            <AlertTriangle className="h-5 w-5 text-warning" />
            <p className="text-sm font-medium">
              {lowStock.length} item{lowStock.length > 1 ? 's' : ''} running low: {lowStock.map((i) => i.name).join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : items.length === 0 ? (
            <EmptyState icon={Boxes} title="No inventory items" description="Add materials and supplies to track stock levels." />
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Stock</TableHead>
                    <TableHead className="text-right">Min</TableHead>
                    <TableHead>Supplier</TableHead>
                    <TableHead>Expiry</TableHead>
                    <TableHead>Status</TableHead>
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
                      <TableCell className="text-right font-medium">{item.stock_quantity} {item.unit}</TableCell>
                      <TableCell className="text-right text-muted-foreground">{item.min_stock}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.supplier || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{item.expiry_date ? formatDate(item.expiry_date) : '—'}</TableCell>
                      <TableCell>
                        {item.stock_quantity <= item.min_stock ? (
                          <Badge variant="outline" className="border-warning/40 text-warning">Low Stock</Badge>
                        ) : (
                          <Badge variant="outline" className="border-success/40 text-success">In Stock</Badge>
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
            <DialogTitle>Add Inventory Item</DialogTitle>
            <DialogDescription>Track materials, supplies, and stock levels.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-2"><Label>Name *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>SKU</Label><Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-2"><Label>Stock</Label><Input type="number" value={form.stock_quantity} onChange={(e) => setForm({ ...form, stock_quantity: e.target.value })} /></div>
              <div className="space-y-2"><Label>Min Stock</Label><Input type="number" value={form.min_stock} onChange={(e) => setForm({ ...form, min_stock: e.target.value })} /></div>
              <div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2"><Label>Cost / Unit</Label><Input type="number" step="0.01" value={form.cost_per_unit} onChange={(e) => setForm({ ...form, cost_per_unit: e.target.value })} /></div>
              <div className="space-y-2"><Label>Expiry Date</Label><Input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Supplier</Label><Input value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={() => createMutation.mutate({ ...form, stock_quantity: Number(form.stock_quantity), min_stock: Number(form.min_stock), cost_per_unit: Number(form.cost_per_unit), expiry_date: form.expiry_date || null })} disabled={createMutation.isPending || !form.name}>
              {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

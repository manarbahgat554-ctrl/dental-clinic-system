import { api } from './axios';
import type { InventoryItem } from '@/types';

export const inventoryApi = {
  list: () =>
    api.get<InventoryItem[]>('/inventory').then((r) => r.data),

  create: (data: Partial<InventoryItem>) =>
    api.post<InventoryItem>('/inventory', data).then((r) => r.data),

  update: (id: string, data: Partial<InventoryItem>) =>
    api.put<InventoryItem>(`/inventory/${id}`, data).then((r) => r.data),
};

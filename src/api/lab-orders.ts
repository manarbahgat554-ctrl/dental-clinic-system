import { api } from './axios';
import type { LabOrder } from '@/types';

export const labOrdersApi = {
  list: (params?: { patientId?: string }) =>
    api.get<LabOrder[]>('/lab-orders', { params }).then((r) => r.data),

  create: (data: Partial<LabOrder>) =>
    api.post<LabOrder>('/lab-orders', data).then((r) => r.data),

  update: (id: string, data: Partial<LabOrder>) =>
    api.put<LabOrder>(`/lab-orders/${id}`, data).then((r) => r.data),
};

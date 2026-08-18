import { api } from './axios';
import type { Treatment } from '@/types';

export const treatmentsApi = {
  list: (params?: { patientId?: string }) =>
    api.get<Treatment[]>('/treatments', { params }).then((r) => r.data),

  create: (data: Partial<Treatment>) =>
    api.post<Treatment>('/treatments', data).then((r) => r.data),

  update: (id: string, data: Partial<Treatment>) =>
    api.put<Treatment>(`/treatments/${id}`, data).then((r) => r.data),
};

import { api } from './axios';
import type { Patient } from '@/types';

export const patientsApi = {
  list: (params?: { page?: number; limit?: number; search?: string; status?: string }) =>
    api.get<{ data: Patient[]; pagination: { page: number; limit: number; total: number; totalPages: number } }>('/patients', { params }).then((r) => r.data),

  get: (id: string) =>
    api.get<Patient>(`/patients/${id}`).then((r) => r.data),

  create: (data: Partial<Patient>) =>
    api.post<Patient>('/patients', data).then((r) => r.data),

  update: (id: string, data: Partial<Patient>) =>
    api.put<Patient>(`/patients/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/patients/${id}`).then((r) => r.data),
};

import { api } from './axios';
import type { Appointment } from '@/types';

export const appointmentsApi = {
  list: (params?: { patientId?: string; startDate?: string; endDate?: string }) =>
  api
    .get<{
      data: Appointment[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>('/appointments', { params })
    .then((r) => r.data.data),

  get: (id: string) =>
    api.get<Appointment>(`/appointments/${id}`).then((r) => r.data),

  create: (data: Partial<Appointment>) =>
    api.post<Appointment>('/appointments', data).then((r) => r.data),

  update: (id: string, data: Partial<Appointment>) =>
    api.put<Appointment>(`/appointments/${id}`, data).then((r) => r.data),

  delete: (id: string) =>
    api.delete(`/appointments/${id}`).then((r) => r.data),
};

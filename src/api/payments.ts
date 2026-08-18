import { api } from './axios';
import type { Invoice, Payment } from '@/types';

export const invoicesApi = {
  list: (params?: { patientId?: string }) =>
    api.get<Invoice[]>('/invoices', { params }).then((r) => r.data),

  create: (data: Partial<Invoice>) =>
    api.post<Invoice>('/invoices', data).then((r) => r.data),

  update: (id: string, data: Partial<Invoice>) =>
    api.put<Invoice>(`/invoices/${id}`, data).then((r) => r.data),
};

export const paymentsApi = {
  list: (params?: { invoiceId?: string }) =>
    api.get<Payment[]>('/payments', { params }).then((r) => r.data),

  create: (data: Partial<Payment>) =>
    api.post<Payment>('/payments', data).then((r) => r.data),
};

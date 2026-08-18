import { api } from './axios';
import type { Clinic, Country, User } from '@/types';

export const clinicApi = {
  get: () =>
    api.get<Clinic>('/clinic').then((r) => r.data),

  update: (data: Partial<Clinic>) =>
    api.put<Clinic>('/clinic', data).then((r) => r.data),

  uploadLogo: (input: File | FormData) => {
    // Accept either a File or a pre-built FormData
    const formData = input instanceof FormData ? input : new FormData();
    if (!(input instanceof FormData)) formData.append('logo', input as File);

    return api
      .post<Clinic>('/clinic/logo', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((r) => r.data);
  },

  listStaff: () =>
    api.get<User[]>('/clinic/staff').then((r) => r.data),

  dashboardStats: () =>
    api.get('/clinic/dashboard-stats').then((r) => r.data),
};

export const countriesApi = {
  list: () =>
    api.get<Country[]>('/countries').then((r) => r.data),

  listCurrencies: () =>
    api.get('/countries/currencies').then((r) => r.data),
};
import { api } from './axios';
import type { UserRole } from '@/types';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  clinicId: string;
  countryId: number | null;
  phone: string | null;
  avatarUrl: string | null;
  specialization: string | null;
  licenseNumber: string | null;
  bio: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
  refreshToken: string;
}

export const authApi = {
  register: (data: { email: string; password: string; fullName: string; role: string; countryId?: number }) =>
    api.post<AuthResponse>('/auth/register', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    api.post<AuthResponse>('/auth/login', data).then((r) => r.data),

  refresh: (refreshToken: string) =>
    api.post<{ token: string }>('/auth/refresh', { refreshToken }).then((r) => r.data),

  getProfile: () =>
    api.get<{ user: AuthUser }>('/auth/profile').then((r) => r.data.user),

  updateProfile: (data: Partial<AuthUser>) =>
    api.put<{ user: AuthUser }>('/auth/profile', data).then((r) => r.data.user),

  logout: () =>
    api.post('/auth/logout').then((r) => r.data),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }).then((r) => r.data),
};

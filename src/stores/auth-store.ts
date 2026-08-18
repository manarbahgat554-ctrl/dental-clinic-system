import { create } from 'zustand';
import { authApi, type AuthUser } from '@/api/auth';
import type { UserRole } from '@/types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    role: UserRole,
    countryId?: number
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<AuthUser>) => Promise<void>;
  getClinicId: () => string | null;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      set({ initialized: true });
      return;
    }

    try {
      const profile = await authApi.getProfile();

      set({
        user: {
          id: profile.id,
          email: profile.email,
        },
        profile: {
          ...profile,
          role: profile.role.toLowerCase() as UserRole,
        },
        initialized: true,
      });
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      set({
        user: null,
        profile: null,
        initialized: true,
      });
    }
  },

  signIn: async (email, password) => {
    set({ loading: true });

    try {
      const { user, token, refreshToken } = await authApi.login({
        email,
        password,
      });

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user: {
          id: user.id,
          email: user.email,
        },
        profile: {
          ...user,
          role: user.role.toLowerCase() as UserRole,
        },
        loading: false,
      });

      return { error: null };
    } catch (err) {
      set({ loading: false });

      const msg =
        err instanceof Error ? err.message : 'Login failed';

      return { error: msg };
    }
  },

  signUp: async (
    email,
    password,
    fullName,
    role,
    countryId
  ) => {
    set({ loading: true });

    try {
      const { user, token, refreshToken } =
        await authApi.register({
          email,
          password,
          fullName,
          role,
          countryId,
        });

      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      set({
        user: {
          id: user.id,
          email: user.email,
        },
        profile: {
          ...user,
          role: user.role.toLowerCase() as UserRole,
        },
        loading: false,
      });

      return { error: null };
    } catch (err) {
      set({ loading: false });

      const msg =
        err instanceof Error ? err.message : 'Registration failed';

      return { error: msg };
    }
  },

  signOut: async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }

    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');

    set({
      user: null,
      profile: null,
    });
  },

  updateProfile: async (data) => {
    const updated = await authApi.updateProfile(data);

    set({
      profile: {
        ...updated,
        role: updated.role.toLowerCase() as UserRole,
      },
    });
  },

  getClinicId: () => get().profile?.clinicId ?? null,
}));
import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import type { Profile, UserRole } from '@/types';

interface AuthState {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
  initialized: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session) {
      set({ user: { id: session.user.id, email: session.user.email ?? '' } });
      await get().refreshProfile();
    }
    set({ initialized: true });

    supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (event === 'SIGNED_OUT' || !session) {
          set({ user: null, profile: null });
          return;
        }
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          set({ user: { id: session.user.id, email: session.user.email ?? '' } });
          await get().refreshProfile();
        }
      })();
    });
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      set({ loading: false });
      return { error: error.message };
    }
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      set({ user: { id: user.id, email: user.email ?? '' } });
      await get().refreshProfile();
    }
    set({ loading: false });
    return { error: null };
  },

  signUp: async (email, password, fullName, role) => {
    set({ loading: true });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) {
      set({ loading: false });
      return { error: error.message };
    }
    if (data.user) {
      // Create a clinic for the first admin, otherwise just a profile.
      const isFirstUser = role === 'admin';
      let clinicId: string | null = null;

      if (isFirstUser) {
        const { data: clinic, error: clinicError } = await supabase
  .from('clinics')
  .insert({
    name: `${fullName}'s Clinic`,
  })
  .select()
  .single();

console.log("CLINIC:", clinic);
console.log("CLINIC ERROR:", clinicError);
      } else {
        const { data: existingClinic } = await supabase
          .from('clinics')
          .select('id')
          .limit(1)
          .maybeSingle();
        clinicId = existingClinic?.id ?? null;
      }

      const { data: profileData, error: profileError } = await supabase
  .from('profiles')
  .insert({
    id: data.user.id,
    clinic_id: clinicId,
    full_name: fullName,
    role,
  })
  .select();

console.log("PROFILE DATA:", profileData);
console.log("PROFILE ERROR:", profileError);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      set({ user: { id: data.user.id, email: data.user.email ?? '' }, profile });
    }
    set({ loading: false });
    return { error: null };
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  refreshProfile: async () => {
    const { user } = get();
    if (!user) {
      set({ profile: null });
      return;
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();
    set({ profile });
  },
}));

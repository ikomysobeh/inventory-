import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'manager' | 'employee';
  is_active: boolean;
  created_at?: string;
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  me: () => Promise<void>;
  initAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,   // true until initAuth() finishes — prevents routing on stale store
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          const { data } = response.data;

          if (!data.token || !data.user) {
            throw new Error('Missing token or user in response');
          }

          localStorage.setItem('auth_token', data.token);
          api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
          set({ token: data.token, user: data.user, isAuthenticated: true, isLoading: false });
        } catch (err: any) {
          const message = err.response?.data?.message || 'Login failed';
          set({ error: message, isLoading: false, isAuthenticated: false });
          throw err;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await api.post('/auth/logout');
        } catch {
          // ignore logout errors
        } finally {
          localStorage.removeItem('auth_token');
          delete api.defaults.headers.common['Authorization'];
          set({
            token: null,
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      setUser: (user: User | null) => {
        set({ user });
      },

      setToken: (token: string | null) => {
        if (token) {
          localStorage.setItem('auth_token', token);
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          localStorage.removeItem('auth_token');
          delete api.defaults.headers.common['Authorization'];
        }
        set({ token, isAuthenticated: !!token });
      },

      me: async () => {
        try {
          const response = await api.get('/auth/me');
          set({ user: response.data.data });
        } catch {
          set({ user: null, token: null, isAuthenticated: false });
          localStorage.removeItem('auth_token');
        }
      },

      initAuth: async () => {
        console.log('[initAuth] start');
        const token = localStorage.getItem('auth_token');

        if (!token) {
          console.log('[initAuth] no token → isLoading=false');
          set({ isLoading: false });
          return;
        }

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        try {
          const response = await api.get('/auth/me');
          console.log('[initAuth] /auth/me OK →', response.data.data?.role, '→ isLoading=false');
          set({ token, user: response.data.data, isAuthenticated: true, isLoading: false });
        } catch (err) {
          console.error('[initAuth] /auth/me FAILED →', err);
          localStorage.removeItem('auth_token');
          delete api.defaults.headers.common['Authorization'];
          set({ token: null, user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-store',
      partialize: (state) => ({ token: state.token, user: state.user, isAuthenticated: state.isAuthenticated }),
    }
  )
);

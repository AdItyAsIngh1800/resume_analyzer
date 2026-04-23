import { create } from 'zustand';
import { api, getToken, setToken, apiErrorMessage } from '@/utils/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchMe: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  async login(email, password) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/login', { email, password });
      setToken(data.token);
      set({ user: data.user, loading: false, initialized: true });
    } catch (err) {
      set({ error: apiErrorMessage(err), loading: false });
      throw err;
    }
  },

  async register(name, email, password) {
    set({ loading: true, error: null });
    try {
      const { data } = await api.post('/auth/register', { name, email, password });
      setToken(data.token);
      set({ user: data.user, loading: false, initialized: true });
    } catch (err) {
      set({ error: apiErrorMessage(err), loading: false });
      throw err;
    }
  },

  logout() {
    setToken(null);
    set({ user: null });
  },

  async fetchMe() {
    if (!getToken()) {
      set({ initialized: true });
      return;
    }
    set({ loading: true });
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.user, loading: false, initialized: true });
    } catch {
      setToken(null);
      set({ user: null, loading: false, initialized: true });
    }
  },
}));

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/axios.js';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,

      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),

      login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        set({ user: data.user, accessToken: data.accessToken });
        return data;
      },

      register: async (username, email, password) => {
        const { data } = await api.post('/auth/register', { username, email, password });
        set({ user: data.user, accessToken: data.accessToken });
        return data;
      },

      logout: async () => {
        await api.post('/auth/logout').catch(() => {});
        set({ user: null, accessToken: null });
      },

      refreshToken: async () => {
        try {
          const { data } = await api.post('/auth/refresh');
          set({ accessToken: data.accessToken });
          return data.accessToken;
        } catch {
          set({ user: null, accessToken: null });
          return null;
        }
      },

      updateUser: (updated) => set((state) => ({
        user: state.user ? { ...state.user, ...updated } : null,
      })),
    }),
    { name: 'itube-auth', partialize: (state) => ({ user: state.user, accessToken: state.accessToken }) }
  )
);

export default useAuthStore;

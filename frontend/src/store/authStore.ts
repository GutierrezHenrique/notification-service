import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../services/api';

interface User {
  id: string;
  email: string;
  name: string;
  provider?: string | null;
  profilePicture?: string | null;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
}

interface AuthStatePartial {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
        delete api.defaults.headers.common['Authorization'];
      },
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state): AuthStatePartial => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state: AuthStatePartial | undefined) => {
        if (state?.token) {
          api.defaults.headers.common['Authorization'] =
            `Bearer ${state.token}`;
        }
      },
    },
  ),
);

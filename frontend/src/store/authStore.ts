import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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
  _hasHydrated: boolean;
  logout: () => void;
  setAuth: (user: User, token: string) => void;
  setHasHydrated: (state: boolean) => void;
}

interface AuthStatePartial {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist<AuthState, [], [], AuthStatePartial>(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      _hasHydrated: false,
      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
      setAuth: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },
      setHasHydrated: (state: boolean) => {
        set({
          _hasHydrated: state,
        });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Marcar como hidratado após reidratação
        if (state) {
          state.setHasHydrated(true);
        }
      },
    },
  ),
);

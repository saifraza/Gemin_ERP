import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  company?: {
    id: string;
    name: string;
    code: string;
  };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  companyName: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      companyName: null,

      login: async (username: string, password: string) => {
        const { api } = await import('@/lib/api');
        const response = await api.login(username, password);
        
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          companyName: response.user.company?.name || null,
        });

        // Save token to localStorage and cookie for API calls
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          // Set cookie for middleware
          document.cookie = `auth_token=${response.token}; path=/; max-age=86400`; // 24 hours
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          companyName: null,
        });
        
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
          // Remove cookie
          document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
        }
      },

      setUser: (user: User, token: string) => {
        set({
          user,
          token,
          isAuthenticated: true,
          companyName: user.company?.name || null,
        });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        companyName: state.companyName,
      }),
    }
  )
);
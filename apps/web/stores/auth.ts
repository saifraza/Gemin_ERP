import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Factory {
  id: string;
  name: string;
  code: string;
}

interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'OPERATOR' | 'VIEWER';
  accessLevel: 'HQ' | 'FACTORY' | 'DIVISION';
  company?: {
    id: string;
    name: string;
    code: string;
  };
  allowedFactories: Factory[];
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  companyName: string | null;
  currentFactory: string | 'all';
  allowedFactories: Factory[];
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
  switchFactory: (factoryId: string | 'all') => void;
  canAccessAllFactories: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      companyName: null,
      currentFactory: 'all',
      allowedFactories: [],

      login: async (username: string, password: string) => {
        const { api } = await import('@/lib/api');
        const response = await api.login(username, password);
        
        set({
          user: response.user,
          token: response.token,
          isAuthenticated: true,
          companyName: response.user.company?.name || null,
          allowedFactories: response.user.allowedFactories || [],
          currentFactory: (response.user.accessLevel === 'HQ' || response.user.role === 'SUPER_ADMIN') ? 'all' : 
                         (response.user.allowedFactories?.[0]?.id || 'all'),
        });

        // Save token to localStorage and cookie for API calls
        if (typeof window !== 'undefined') {
          localStorage.setItem('auth_token', response.token);
          // Set cookie for middleware with strict security
          const isProduction = window.location.protocol === 'https:';
          const cookieOptions = [
            `auth_token=${response.token}`,
            'path=/',
            'max-age=86400', // 24 hours
            'SameSite=Strict', // Prevent CSRF and cookie sharing
            isProduction ? 'Secure' : '', // Only send over HTTPS in production
          ].filter(Boolean).join('; ');
          
          document.cookie = cookieOptions;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          companyName: null,
          currentFactory: 'all',
          allowedFactories: [],
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
          allowedFactories: user.allowedFactories || [],
          currentFactory: (user.accessLevel === 'HQ' || user.role === 'SUPER_ADMIN') ? 'all' : 
                         (user.allowedFactories?.[0]?.id || 'all'),
        });
      },

      switchFactory: (factoryId: string | 'all') => {
        const state = get();
        if (state.user?.accessLevel === 'HQ' || 
            state.user?.role === 'SUPER_ADMIN' ||
            factoryId === 'all' ||
            state.allowedFactories.some(f => f.id === factoryId)) {
          set({ currentFactory: factoryId });
        }
      },

      canAccessAllFactories: () => {
        const state = get();
        return state.user?.accessLevel === 'HQ' || state.user?.role === 'SUPER_ADMIN';
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
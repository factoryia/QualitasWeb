import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload } from '../types';

interface User {
  id: string;
  email: string;
  name: string;
  fullName: string;
  role: string;
  tenant: string;
  imageUrl?: string;
}

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  user: User | null;
  permissions: string[];
  isAuthenticated: boolean;
  isLoadingPermissions: boolean;
  permissionError: string | null;
  isLoggingIn: boolean;
  isRefreshingToken: boolean;

  // Actions
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setPermissions: (permissions: string[]) => void;
  setLoadingPermissions: (loading: boolean) => void;
  setPermissionError: (error: string | null) => void;
  setLoggingIn: (loading: boolean) => void;
  setRefreshingToken: (loading: boolean) => void;
}

// Helper para verificar si el token ha expirado
const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = jwtDecode<JWTPayload>(token);
    if (!decoded.exp) return true; // Sin expiration = inválido

    const expirationTime = decoded.exp * 1000; // Convertir a milisegundos
    const isExpired = Date.now() >= expirationTime;

    if (isExpired) {
      console.warn('[AUTH] Token has expired');
    }

    return isExpired;
  } catch (error) {
    console.error('[AUTH] Error checking token expiration:', error);
    return true; // En caso de error, asumir expirado
  }
};

// Helper para decodificar el token y extraer usuario
const decodeUser = (token: string): User | null => {
  // Primero verificar que el token no haya expirado
  if (isTokenExpired(token)) {
    return null;
  }

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    return {
      id: decoded.jti || '',
      email: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] || '',
      name: decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'] || '',
      fullName: decoded.fullName || '',
      role: decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || '',
      tenant: decoded.tenant || 'root',
      imageUrl: decoded.image_url
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      permissions: [],
      isAuthenticated: false,
      isLoadingPermissions: false,
      permissionError: null,
      isLoggingIn: false,
      isRefreshingToken: false,

      login: (accessToken: string, refreshToken: string) => {
        const user = decodeUser(accessToken);

        set({
          accessToken,
          refreshToken,
          user,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          accessToken: null,
          refreshToken: null,
          user: null,
          permissions: [],
          isAuthenticated: false,
          isLoadingPermissions: false,
          permissionError: null,
          isLoggingIn: false,
          isRefreshingToken: false
        });
      },

      setPermissions: (permissions: string[]) => {
        set({ permissions });
      },

      setLoadingPermissions: (loading: boolean) => {
        set({ isLoadingPermissions: loading });
      },

      setPermissionError: (error: string | null) => {
        set({ permissionError: error });
      },

      setLoggingIn: (loading: boolean) => {
        set({ isLoggingIn: loading });
      },

      setRefreshingToken: (loading: boolean) => {
        set({ isRefreshingToken: loading });
      },
    }),
    {
      name: 'auth-storage',
      // Use sessionStorage instead of localStorage for security
      // sessionStorage clears when browser tab closes
      storage: typeof window !== 'undefined'
        ? {
            getItem: (key) => {
              const item = window.sessionStorage.getItem(key);
              return item ? JSON.parse(item) : null;
            },
            setItem: (key, value) => {
              window.sessionStorage.setItem(key, JSON.stringify(value));
            },
            removeItem: (key) => {
              window.sessionStorage.removeItem(key);
            },
          }
        : undefined,
      partialize: (state: AuthState) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        permissions: state.permissions,
        isAuthenticated: state.isAuthenticated,
      } as Partial<AuthState>),
    }
  )
);

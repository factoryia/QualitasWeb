'use client';

import { useCallback } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../store/auth.store';
import { LoginRequest } from '../types';

/**
 * Hook para manejar login con actualización de estado
 * Abstrae la lógica de actualización de Zustand del servicio
 */
export function useLogin() {
  const { login: setAuth, setPermissions, setLoadingPermissions, setPermissionError, setLoggingIn } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest, tenant: string) => {
      setLoggingIn(true);
      try {
        // 1. Get tokens from backend
        const { accessToken, refreshToken } = await authService.login(credentials, tenant);

        // 2. Update auth state with tokens
        setAuth(accessToken, refreshToken);

        // 3. Fetch and set permissions
        try {
          setLoadingPermissions(true);
          setPermissionError(null); // Clear previous errors
          const permissions = await authService.fetchPermissions();
          setPermissions(permissions);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to load permissions';
          console.error('[AUTH] Failed to fetch permissions after login:', error);
          // Store error but continue with empty permissions
          setPermissionError(errorMessage);
          setPermissions([]);
        } finally {
          setLoadingPermissions(false);
        }

        return { success: true };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Login failed';
        console.error('[AUTH] Login error:', message);
        return { success: false, error: message };
      } finally {
        setLoggingIn(false);
      }
    },
    [setAuth, setPermissions, setLoadingPermissions, setPermissionError, setLoggingIn]
  );

  return { login };
}

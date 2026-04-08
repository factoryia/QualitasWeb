'use client';

import { useCallback } from 'react';
import { authApi } from '../api/auth';
import { useAuthStore } from '../store/auth.store';
import { LoginRequest } from '../types';

/**
 * Hook para manejar login con actualización de estado.
 * Abstrae la lógica de actualización de Zustand del cliente de API.
 */
export function useLogin() {
  const {
    login: setAuth,
    setPermissions,
    setLoadingPermissions,
    setPermissionError,
    setLoggingIn,
  } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest, tenant: string) => {
      setLoggingIn(true);
      try {
        // 1. Obtener tokens desde el backend
        const { accessToken, refreshToken } = await authApi.login(
          credentials,
          tenant,
        );

        // 2. Actualizar estado de auth con los tokens
        setAuth(accessToken, refreshToken);

        // 3. Cargar y guardar permisos
        try {
          setLoadingPermissions(true);
          setPermissionError(null); // Limpiar errores previos
          const permissions = await authApi.fetchPermissions();
          setPermissions(permissions);
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to load permissions";
          console.error(
            "[AUTH] Failed to fetch permissions after login:",
            error,
          );
          // Guardar error pero continuar con permisos vacíos
          setPermissionError(errorMessage);
          setPermissions([]);
        } finally {
          setLoadingPermissions(false);
        }

        return { success: true };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Login failed";
        console.error("[AUTH] Login error:", message);
        return { success: false, error: message };
      } finally {
        setLoggingIn(false);
      }
    },
    [
      setAuth,
      setPermissions,
      setLoadingPermissions,
      setPermissionError,
      setLoggingIn,
    ],
  );

  return { login };
}


import { useAuthStore } from "../store/auth.store";

/**
 * Utilidades de sesión/autenticación del lado del cliente.
 * Se encarga de limpiar stores, cachés y estado local al cerrar sesión.
 */
export const authSession = {
  /**
   * Logout completo.
   * Limpia stores, cachés y sessionStorage.
   */
  logout: async (): Promise<void> => {
    try {
      // 1. Limpiar store de auth
      useAuthStore.getState().logout();

      // 2. Limpiar otros stores en el futuro si es necesario
      // Ejemplo:
      // useFormStore.getState().reset?.();
      // useApiCacheStore.getState().clear?.();

      // 3. Limpiar session storage
      if (typeof window !== "undefined") {
        sessionStorage.clear();
      }

      console.log("[AUTH] Sesión cerrada y cleanup completo realizado");
    } catch (error) {
      console.error("[AUTH] Error durante el logout:", error);
      throw error;
    }
  },

  /**
   * Logout automático en caso de error de autenticación (401/403).
   * Pensado para ser llamado desde interceptores de axios.
   */
  logoutOnAuthError: async (status: number): Promise<void> => {
    try {
      await authSession.logout();

      // Guardar mensaje de error para que el UI pueda mostrarlo
      if (typeof window !== "undefined") {
        const message = status === 401 ? "Session expired" : "Access denied";
        sessionStorage.setItem(
          "auth-error",
          JSON.stringify({
            status,
            timestamp: Date.now(),
            message,
          }),
        );
      }

      console.log("[AUTH] Logout tras error de autenticación completado");
    } catch (error) {
      console.error(
        "[AUTH] Error durante logout tras error de autenticación:",
        error,
      );
      throw error;
    }
  },
};


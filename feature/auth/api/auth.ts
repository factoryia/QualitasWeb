import { api } from "@/lib/axios";
import { LoginRequest, LoginResponse } from "../types";
import { permissionsApi } from "./permissions";
import { useAuthStore } from "../store/auth.store";

/**
 * Cliente de API para autenticación.
 * Solo se encarga de hablar con el backend.
 */
export const authApi = {
  /**
   * Login y obtención de tokens desde el backend.
   * @param credentials Credenciales del usuario
   * @param tenant Identificador del tenant
   * @returns Respuesta de login con tokens
   */
  login: async (
    credentials: LoginRequest,
    tenant: string,
  ): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>(
      "/api/v1/identity/token/issue",
      credentials,
      {
        headers: {
          tenant,
        },
      },
    );

    return data;
  },

  /**
   * Obtiene los permisos del usuario desde el backend.
   * @returns Array de permisos
   */
  fetchPermissions: async (): Promise<string[]> => {
    return permissionsApi.getUserPermissions();
  },

  /**
   * Refresca el access token usando el refresh token.
   * POST /api/v1/identity/token/refresh
   * Body: { refreshToken, accessToken }
   * Headers: tenant, Authorization: Bearer <access_token>
   * @returns Nueva respuesta de login con tokens actualizados, o null si falla
   */
  refreshToken: async (): Promise<LoginResponse | null> => {
    try {
      const { accessToken, refreshToken, user } = useAuthStore.getState();

      if (!refreshToken || !accessToken) {
        return null;
      }

      const tenant = user?.tenant ?? "root";

      const { data } = await api.post<LoginResponse>(
        "/api/v1/identity/token/refresh",
        { refreshToken, accessToken },
        {
          headers: {
            tenant,
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      return data;
    } catch (error) {
      console.error("[AUTH] Token refresh failed:", error);
      return null;
    }
  },
};


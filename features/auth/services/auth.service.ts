import { api } from "@/services/axios";
import { LoginRequest, LoginResponse } from "../types";
import { permissionsService } from "./permissions.service";
import { useAuthStore } from "../store/auth.store";

/**
 * Auth service - handles only API calls
 * State management is handled by components/hooks via useAuthStore
 */
export const authService = {
  /**
   * Login and get tokens from backend
   * @param credentials User credentials
   * @param tenant Tenant identifier
   * @returns Login response with tokens
   */
  login: async (credentials: LoginRequest, tenant: string): Promise<LoginResponse> => {
    const { data } = await api.post<LoginResponse>(
      "/api/v1/identity/token/issue",
      credentials,
      {
        headers: {
          tenant,
        },
      }
    );

    return data;
  },

  /**
   * Fetch user permissions from backend
   * @returns Array of permission strings
   */
  fetchPermissions: async (): Promise<string[]> => {
    return permissionsService.getUserPermissions();
  },

  /**
   * Refresh access token using refresh token
   * @returns New login response with updated tokens, or null if refresh fails
   */
  refreshToken: async (): Promise<LoginResponse | null> => {
    try {
      const { refreshToken } = useAuthStore.getState();

      if (!refreshToken) {
        return null;
      }

      const { data } = await api.post<LoginResponse>(
        "/api/v1/identity/token/refresh",
        { refreshToken },
        {
          // Don't include auth header for refresh endpoint
          headers: {
            Authorization: undefined,
          },
        }
      );

      return data;
    } catch (error) {
      console.error('[AUTH] Token refresh failed:', error);
      return null;
    }
  },
};

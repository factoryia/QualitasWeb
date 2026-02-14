import { api } from "@/services/axios";

/**
 * Fetches the current authenticated user's permissions from the backend
 * @returns Array of permission strings (e.g., "Permissions.QualitasCompliance.MarcosNormativos.View")
 */
export const permissionsService = {
  getUserPermissions: async (): Promise<string[]> => {
    try {
      console.log("[PERMISSIONS] Fetching user permissions from /api/v1/identity/permissions...");
      const { data } = await api.get<string[]>(
        "/api/v1/identity/permissions"
      );
      console.log("[PERMISSIONS] Successfully fetched permissions:", data?.length || 0, "permissions found");
      return data || [];
    } catch (error: any) {
      console.error("[PERMISSIONS] Failed to fetch user permissions:", error?.response?.status, error?.message);
      // Don't fail the login if permissions fail to load
      // User will have empty permissions but can still use the app
      return [];
    }
  },
};

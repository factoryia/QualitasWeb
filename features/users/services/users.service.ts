import { api } from "@/services/axios";

export interface UserImage {
  fileName: string;
  contentType: string;
  data: number[];
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  image?: UserImage;
}

export interface UpdateUserRequest {
  id: string;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  image?: UserImage;
  deleteCurrentImage: boolean;
}

export interface ToggleUserStatusRequest {
  activateUser: boolean;
  userId: string | null;
}

export const usersService = {
  /**
   * Obtener lista de todos los usuarios
   * GET /api/v1/identity/users
   */
  getUsers: async (): Promise<User[]> => {
    try {
      console.log("[USERS] Fetching users...");
      const { data } = await api.get<User[]>("/api/v1/identity/users");
      console.log("[USERS] Fetched", data?.length || 0, "users");
      return data || [];
    } catch (error: any) {
      console.error("[USERS] Failed to fetch users:", error?.response?.status, error?.message);
      throw error;
    }
  },

  /**
   * Obtener usuario por ID
   * GET /api/v1/identity/users/{id}
   */
  getUserById: async (userId: string): Promise<User> => {
    try {
      console.log("[USERS] Fetching user:", userId);
      const { data } = await api.get<User>(`/api/v1/identity/users/${userId}`);
      console.log("[USERS] Fetched user:", data?.email);
      return data;
    } catch (error: any) {
      console.error("[USERS] Failed to fetch user:", error?.response?.status, error?.message);
      throw error;
    }
  },

  /**
   * Actualizar usuario
   * PUT /api/v1/identity/users/{id}
   */
  updateUser: async (userId: string, userData: UpdateUserRequest): Promise<User> => {
    try {
      console.log("[USERS] Updating user:", userId);
      const { data } = await api.put<User>(
        `/api/v1/identity/users/${userId}`,
        userData
      );
      console.log("[USERS] User updated:", data?.email);
      return data;
    } catch (error: any) {
      console.error("[USERS] Failed to update user:", error?.response?.status, error?.message);
      throw error;
    }
  },

  /**
   * Cambiar estado del usuario (activar/desactivar)
   * PATCH /api/v1/identity/users/{id}
   */
  toggleUserStatus: async (userId: string, activate: boolean): Promise<void> => {
    try {
      console.log("[USERS] Toggling user status:", userId, activate ? "activate" : "deactivate");
      await api.patch(
        `/api/v1/identity/users/${userId}`,
        {
          activateUser: activate,
          userId: null,
        } as ToggleUserStatusRequest
      );
      console.log("[USERS] User status toggled successfully");
    } catch (error: any) {
      console.error(
        "[USERS] Failed to toggle user status:",
        error?.response?.status,
        error?.message
      );
      throw error;
    }
  },
};

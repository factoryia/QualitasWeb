import { api } from "@/lib/axios";
import type { UserRoleDto } from "../types";

export const userRolesApi = {
  listByUser: async (userId: string): Promise<UserRoleDto[]> => {
    const { data } = await api.get<UserRoleDto[]>(
      `/api/v1/identity/users/${userId}/roles`,
    );
    return data ?? [];
  },

  assignRoles: async (userId: string, roles: UserRoleDto[]): Promise<void> => {
    await api.post(`/api/v1/identity/users/${userId}/roles`, {
      userId,
      userRoles: roles,
    });
  },
};


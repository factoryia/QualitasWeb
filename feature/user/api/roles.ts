import { api } from "@/lib/axios";
import type { RoleDto } from "../types";

export const rolesApi = {
  list: async (): Promise<RoleDto[]> => {
    const { data } = await api.get<RoleDto[]>("/api/v1/identity/roles");
    return data ?? [];
  },

  upsert: async (payload: {
    id?: string;
    name: string;
    description?: string | null;
  }): Promise<RoleDto> => {
    const { data } = await api.post<RoleDto>(
      "/api/v1/identity/roles",
      {
        id: payload.id ?? "",
        name: payload.name,
        description: payload.description ?? null,
      },
    );
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/identity/roles/${id}`);
  },

  updatePermissions: async (id: string, permissions: string[]): Promise<void> => {
    await api.put(`/api/v1/identity/roles/${id}/permissions`, {
      roleId: id,
      permissions,
    });
  },
};



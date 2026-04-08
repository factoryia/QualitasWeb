import { api } from "@/lib/axios";
import type { RoleDto } from "../types";

export const rolesApi = {
  list: async (): Promise<RoleDto[]> => {
    const { data } = await api.get<RoleDto[]>("/api/v1/identity/roles");
    return data ?? [];
  },

  /** All permissions available for the current tenant. */
  listTenantPermissions: async (): Promise<string[]> => {
    const { data } = await api.get<string[]>(
      "/api/v1/identity/tenant/permissions",
    );
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

  /** GET /api/v1/identity/{id}/permissions — rol con lista real de permisos asignados. */
  getRolePermissions: async (id: string): Promise<RoleDto> => {
    const { data } = await api.get<RoleDto>(
      `/api/v1/identity/${id}/permissions`,
    );
    return data;
  },

  /** PUT /api/v1/identity/{id}/permissions — reemplaza permisos del rol (body: roleId + permissions). */
  updatePermissions: async (id: string, permissions: string[]): Promise<void> => {
    await api.put(`/api/v1/identity/${id}/permissions`, {
      roleId: id,
      permissions,
    });
  },
};



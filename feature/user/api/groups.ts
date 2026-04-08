import { api } from "@/lib/axios";
import type { GroupDto } from "../types";

export const groupsApi = {
  list: async (search?: string): Promise<GroupDto[]> => {
    const { data } = await api.get<GroupDto[]>("/api/v1/identity/groups", {
      params: search ? { search } : undefined,
    });
    return data ?? [];
  },

  create: async (payload: {
    name: string;
    description?: string | null;
    isDefault?: boolean;
    roleIds?: string[];
  }): Promise<GroupDto> => {
    const { data } = await api.post<GroupDto>("/api/v1/identity/groups", {
      name: payload.name,
      description: payload.description ?? null,
      isDefault: payload.isDefault ?? false,
      roleIds: payload.roleIds ?? null,
    });
    return data;
  },

  update: async (
    id: string,
    payload: {
      name: string;
      description?: string | null;
      isDefault?: boolean;
      roleIds?: string[];
    },
  ): Promise<GroupDto> => {
    const { data } = await api.put<GroupDto>(`/api/v1/identity/groups/${id}`, {
      id,
      name: payload.name,
      description: payload.description ?? null,
      isDefault: payload.isDefault ?? false,
      roleIds: payload.roleIds ?? null,
    });
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/v1/identity/groups/${id}`);
  },
};


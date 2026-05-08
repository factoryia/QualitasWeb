import { api } from "@/lib/axios";
import type { ProcessDto, CreateProcessRequest, UpdateProcessRequest } from "../types";

const BASE = "/api/v1/qualitas/operations/processes";

export const processesApi = {
  list: async (includeInactive = false): Promise<ProcessDto[]> => {
    const { data } = await api.get<ProcessDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ProcessDto | null> => {
    try {
      const { data } = await api.get<ProcessDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateProcessRequest): Promise<ProcessDto> => {
    const { data } = await api.post<ProcessDto>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProcessRequest): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  restore: async (id: string): Promise<void> => {
    await api.post(`${BASE}/${id}/restore`, {});
  },
};

import { api } from "@/lib/axios";
import type {
  ProcessActivityDto,
  CreateProcessActivityRequest,
  UpdateProcessActivityRequest,
} from "../types";

const BASE = "/api/v1/qualitas/operations/process-activities";

export const processActivitiesApi = {
  listByProcess: async (
    processId: string,
    includeInactive = false
  ): Promise<ProcessActivityDto[]> => {
    const { data } = await api.get<ProcessActivityDto[]>(BASE, {
      params: { processId, includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ProcessActivityDto | null> => {
    try {
      const { data } = await api.get<ProcessActivityDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateProcessActivityRequest): Promise<{ id: string }> => {
    const { data } = await api.post<{ id: string }>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProcessActivityRequest): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

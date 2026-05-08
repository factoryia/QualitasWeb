import { api } from "@/lib/axios";
import type {
  ProcessTypeDto,
  CreateProcessTypeRequest,
  UpdateProcessTypeRequest,
  ApplyProcessTypePresetRequest,
} from "../types";

const BASE = "/api/v1/qualitas/operations/process-types";

export const processTypesApi = {
  list: async (includeInactive = false): Promise<ProcessTypeDto[]> => {
    const { data } = await api.get<ProcessTypeDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ProcessTypeDto | null> => {
    try {
      const { data } = await api.get<ProcessTypeDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateProcessTypeRequest): Promise<ProcessTypeDto> => {
    const { data } = await api.post<ProcessTypeDto>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProcessTypeRequest): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },

  applyPreset: async (payload: ApplyProcessTypePresetRequest): Promise<ProcessTypeDto[]> => {
    const { data } = await api.post<ProcessTypeDto[]>(`${BASE}/apply-preset`, payload);
    return Array.isArray(data) ? data : [];
  },
};

import { api } from "@/lib/axios";
import type {
  ProcessIndicatorDto,
  CreateProcessIndicatorRequest,
  UpdateProcessIndicatorRequest,
} from "../types";

const BASE = "/api/v1/qualitas/operations/process-indicators";

export const processIndicatorsApi = {
  list: async (processId?: string, includeInactive = false): Promise<ProcessIndicatorDto[]> => {
    const { data } = await api.get<ProcessIndicatorDto[]>(BASE, {
      params: { processId, includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ProcessIndicatorDto | null> => {
    try {
      const { data } = await api.get<ProcessIndicatorDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateProcessIndicatorRequest): Promise<ProcessIndicatorDto> => {
    const { data } = await api.post<ProcessIndicatorDto>(BASE, payload);
    return data;
  },

  update: async (id: string, payload: UpdateProcessIndicatorRequest): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

import { api } from "@/lib/axios";
import type { ActionDto, ActionSummaryDto, CreateActionRequest } from "../types";

const BASE = "/api/v1/qualitas/actions/actions";

export type ListActionsParams = {
  processId?: string;
  source?: string;
  status?: string;
  priority?: string;
  responsibleId?: string;
};

export const actionsApi = {
  list: async (params?: ListActionsParams): Promise<ActionSummaryDto[]> => {
    const { data } = await api.get<ActionSummaryDto[]>(BASE, { params });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<ActionDto | null> => {
    try {
      const { data } = await api.get<ActionDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateActionRequest): Promise<ActionDto> => {
    const { data } = await api.post<ActionDto>(BASE, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

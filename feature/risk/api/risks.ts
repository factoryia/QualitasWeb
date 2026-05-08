import { api } from "@/lib/axios";
import type {
  CreateRiskControlRequest,
  CreateRiskRequest,
  RiskCategoryDto,
  RiskControlDto,
  RiskDto,
  UpdateRiskControlRequest,
  UpdateRiskRequest,
} from "../types";

const R = "/api/v1/qualitas/risk";

export const riskCategoriesApi = {
  list: async (): Promise<RiskCategoryDto[]> => {
    const { data } = await api.get<RiskCategoryDto[]>(`${R}/risk-categories`);
    return Array.isArray(data) ? data : [];
  },
};

export const risksApi = {
  list: async (processId?: string): Promise<RiskDto[]> => {
    const { data } = await api.get<RiskDto[]>(`${R}/risks`, {
      params: processId ? { processId } : {},
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<RiskDto | null> => {
    try {
      const { data } = await api.get<RiskDto>(`${R}/risks/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },

  create: async (payload: CreateRiskRequest): Promise<RiskDto> => {
    const { data } = await api.post<RiskDto>(`${R}/risks`, payload);
    return data;
  },

  update: async (id: string, payload: UpdateRiskRequest): Promise<RiskDto> => {
    const { data } = await api.put<RiskDto>(`${R}/risks/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${R}/risks/${id}`);
  },
};

export const riskControlsApi = {
  /** Sin riskId devuelve todos los controles del tenant (filtrar en cliente por proceso). */
  list: async (riskId?: string): Promise<RiskControlDto[]> => {
    const { data } = await api.get<RiskControlDto[]>(`${R}/risk-controls`, {
      params: riskId ? { riskId } : {},
    });
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateRiskControlRequest): Promise<RiskControlDto> => {
    const { data } = await api.post<RiskControlDto>(`${R}/risk-controls`, payload);
    return data;
  },

  update: async (id: string, payload: UpdateRiskControlRequest): Promise<RiskControlDto> => {
    const { data } = await api.put<RiskControlDto>(`${R}/risk-controls/${id}`, payload);
    return data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${R}/risk-controls/${id}`);
  },
};

import { api } from "@/lib/axios";
import type { ProcessDto } from "../types";

const BASE = "/api/v1/qualitas/operations/processes";

export const processesApi = {
  /** Lista todos los procesos (para el Mapa de Procesos). Agrupar en front por processType. */
  list: async (includeInactive = false): Promise<ProcessDto[]> => {
    const { data } = await api.get<ProcessDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  /** Obtiene un proceso por ID */
  getById: async (id: string): Promise<ProcessDto | null> => {
    try {
      const { data } = await api.get<ProcessDto>(`${BASE}/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },
};

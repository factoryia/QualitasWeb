import { api } from "@/lib/axios";
import type { ProcessActivityDto } from "../types";

const BASE = "/api/v1/qualitas/operations/process-activities";

export const processActivitiesApi = {
  /** Lista actividades de un proceso (para "Activo X proc."). includeInactive=false → solo activas. */
  listByProcess: async (
    processId: string,
    includeInactive = false
  ): Promise<ProcessActivityDto[]> => {
    const { data } = await api.get<ProcessActivityDto[]>(BASE, {
      params: { processId, includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },
};

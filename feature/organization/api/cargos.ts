import { api } from "@/lib/axios";
import type {
  CargoDto,
  CreateCargoPayload,
  UpdateCargoPayload,
} from "../types";

const BASE = "/api/v1/qualitas/foundation/positions";

export const cargosApi = {
  list: async (includeInactive = false): Promise<CargoDto[]> => {
    const { data } = await api.get<CargoDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateCargoPayload): Promise<string> => {
    const { data } = await api.post<string>(BASE, payload);
    return typeof data === "string" ? data : (data as { id?: string })?.id ?? "";
  },

  update: async (id: string, payload: UpdateCargoPayload): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${BASE}/${id}`);
  },
};

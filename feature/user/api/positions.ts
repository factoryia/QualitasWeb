import { api } from "@/lib/axios";
import type { PositionDto } from "../types";

export const positionsApi = {
  list: async (includeInactive = false): Promise<PositionDto[]> => {
    const { data } = await api.get<PositionDto[]>(
      "/api/v1/qualitas/foundation/positions",
      {
        params: { includeInactive },
      },
    );
    return data ?? [];
  },
};


import { api } from "@/lib/axios";
import type { ProcessStatusDto } from "../types";

const BASE = "/api/v1/qualitas/operations/process-statuses";

export const processStatusesApi = {
  list: async (): Promise<ProcessStatusDto[]> => {
    const { data } = await api.get<ProcessStatusDto[]>(BASE);
    return Array.isArray(data) ? data : [];
  },
};

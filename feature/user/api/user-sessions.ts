import { api } from "@/lib/axios";
import type { UserSessionDto } from "../types";

export const userSessionsApi = {
  listByUser: async (userId: string): Promise<UserSessionDto[]> => {
    const { data } = await api.get<UserSessionDto[]>(
      `/api/v1/identity/users/${userId}/sessions`,
    );
    return data ?? [];
  },
};


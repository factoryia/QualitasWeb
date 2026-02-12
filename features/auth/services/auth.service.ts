import { api } from "@/services/axios";
import { LoginRequest, LoginResponse } from "../types";

export const authService = {
  login: async (credentials: LoginRequest, tenant: string) => {
    const { data } = await api.post<LoginResponse>(
      "/api/v1/identity/token/issue",
      credentials,
      {
        headers: {
          tenant,
        },
      }
    );
    return data;
  },
};

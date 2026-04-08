import { api } from "@/lib/axios";
import type { OrganizationUnitDto } from "../types";

export const organizationUnitsApi = {
  list: async (includeInactive = false): Promise<OrganizationUnitDto[]> => {
    const { data } = await api.get<OrganizationUnitDto[]>(
      "/api/v1/qualitas/foundation/organization-units",
      {
        params: { includeInactive },
      },
    );
    return data ?? [];
  },
};


import { api } from "@/lib/axios";

export type OrganizationListItem = {
  id: string;
  name: string;
  code: string;
};

/**
 * Body del PUT según back: UpdateOrganizationRequest
 * PUT /api/v1/qualitas/foundation/organizations/{id}
 */
export type UpdateOrganizationPayload = {
  name: string;
  code: string;
  nit: string;
  sector: string;
  entityType: string;
  description?: string | null;
  website?: string | null;
  email?: string | null;
  phone?: string | null;
  logoUrl?: string | null;
  slogan?: string | null;
  legalRepId?: string | null;
};

const BASE = "/api/v1/qualitas/foundation/organizations";

export const organizationsApi = {
  list: async (): Promise<OrganizationListItem[]> => {
    const { data } = await api.get<OrganizationListItem[]>(BASE);
    return Array.isArray(data) ? data : [];
  },

  update: async (
    id: string,
    payload: UpdateOrganizationPayload
  ): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },
};

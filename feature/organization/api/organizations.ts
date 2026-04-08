import { api } from "@/lib/axios";

export type OrganizationListItem = {
  id: string;
  name: string;
  code: string;
};

/**
 * Body POST/PUT según API foundation organizations
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

export type CreateOrganizationPayload = UpdateOrganizationPayload;

function normalizeOrgListResponse(data: unknown): OrganizationListItem[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const o = data as Record<string, unknown>;
    if (Array.isArray(o.items)) return o.items as OrganizationListItem[];
    if (Array.isArray(o.data)) return o.data as OrganizationListItem[];
  }
  return [];
}

const BASE = "/api/v1/qualitas/foundation/organizations";

export const organizationsApi = {
  list: async (): Promise<OrganizationListItem[]> => {
    const { data } = await api.get(BASE);
    return normalizeOrgListResponse(data);
  },

  create: async (payload: CreateOrganizationPayload): Promise<void> => {
    await api.post(BASE, payload);
  },

  update: async (
    id: string,
    payload: UpdateOrganizationPayload
  ): Promise<void> => {
    await api.put(`${BASE}/${id}`, payload);
  },
};

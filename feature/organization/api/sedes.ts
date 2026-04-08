import { api } from "@/lib/axios";
import type {
  CreateSedePayload,
  SedeDto,
  UpdateSedePayload,
} from "../types";

const BASE = "/api/v1/qualitas/foundation/organization-units";

/** Body según doc del API: camelCase, organizationId/name/code requeridos */
function toCreateBody(p: CreateSedePayload) {
  return {
    organizationId: p.organizationId,
    name: p.name,
    code: p.code,
    parentId: p.parentId ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    city: p.city ?? null,
    managerId: p.managerId ?? null,
    isPrincipal: p.isPrincipal ?? false,
  };
}

function toUpdateBody(p: UpdateSedePayload) {
  return {
    name: p.name,
    code: p.code,
    parentId: p.parentId ?? null,
    isActive: p.isActive ?? null,
    description: p.description ?? null,
    address: p.address ?? null,
    city: p.city ?? null,
    managerId: p.managerId ?? null,
    isPrincipal: p.isPrincipal ?? null,
  };
}

export const sedesApi = {
  list: async (includeInactive = false): Promise<SedeDto[]> => {
    const { data } = await api.get<SedeDto[]>(BASE, {
      params: { includeInactive },
    });
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateSedePayload): Promise<string> => {
    try {
      const { data } = await api.post<string>(BASE, toCreateBody(payload));
      return data as string;
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      throw msg ? new Error(msg) : err;
    }
  },

  update: async (id: string, payload: UpdateSedePayload): Promise<void> => {
    try {
      await api.put(`${BASE}/${id}`, toUpdateBody(payload));
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      throw msg ? new Error(msg) : err;
    }
  },

  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`${BASE}/${id}`);
    } catch (err: unknown) {
      const msg = getApiErrorMessage(err);
      throw msg ? new Error(msg) : err;
    }
  },
};

function getApiErrorMessage(err: unknown): string | null {
  const ax = err as { response?: { data?: { detail?: string; title?: string; message?: string } } };
  const data = ax?.response?.data;
  if (!data) return null;
  return data.detail ?? data.message ?? data.title ?? null;
}

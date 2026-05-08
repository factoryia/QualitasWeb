import { api } from "@/lib/axios";
import type {
  CreateProcessDocumentRequest,
  DocumentDto,
  ProcessDocumentDto,
  ProcessDocumentRoleDto,
  UpdateProcessDocumentRequest,
} from "../types";

const OPS = "/api/v1/qualitas/operations";

export const documentsApi = {
  list: async (opts?: {
    pageNumber?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    documentTypeId?: string;
  }): Promise<DocumentDto[]> => {
    const { data } = await api.get<DocumentDto[]>(`${OPS}/documents`, {
      params: {
        pageNumber: opts?.pageNumber ?? 1,
        pageSize: opts?.pageSize ?? 200,
        search: opts?.search,
        isActive: opts?.isActive ?? true,
        documentTypeId: opts?.documentTypeId,
      },
    });
    return Array.isArray(data) ? data : [];
  },

  getById: async (id: string): Promise<DocumentDto | null> => {
    try {
      const { data } = await api.get<DocumentDto>(`${OPS}/documents/${id}`);
      return data ?? null;
    } catch {
      return null;
    }
  },
};

export const processDocumentRolesApi = {
  list: async (): Promise<ProcessDocumentRoleDto[]> => {
    const { data } = await api.get<ProcessDocumentRoleDto[]>(`${OPS}/process-document-roles`);
    return Array.isArray(data) ? data : [];
  },
};

export const processDocumentsApi = {
  listByProcess: async (processId: string, pageSize = 200): Promise<ProcessDocumentDto[]> => {
    const { data } = await api.get<ProcessDocumentDto[]>(`${OPS}/process-documents`, {
      params: { processId, pageNumber: 1, pageSize },
    });
    return Array.isArray(data) ? data : [];
  },

  create: async (payload: CreateProcessDocumentRequest): Promise<string> => {
    const { data, status } = await api.post<string | { id?: string }>(
      `${OPS}/process-documents`,
      payload,
    );
    if (status === 201 && typeof data === "string") return data;
    if (data && typeof data === "object" && "id" in data && typeof (data as { id: string }).id === "string") {
      return (data as { id: string }).id;
    }
    if (typeof data === "string") return data;
    return "";
  },

  update: async (id: string, payload: UpdateProcessDocumentRequest): Promise<void> => {
    await api.put(`${OPS}/process-documents/${id}`, payload);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`${OPS}/process-documents/${id}`);
  },
};

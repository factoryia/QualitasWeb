"use client";

import { useMutation, useQuery, useQueryClient, type QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { processesApi } from "../api/processes";
import { documentsApi, processDocumentRolesApi, processDocumentsApi } from "../api/documents-control";
import { processTypesApi } from "../api/process-types";
import { processActivitiesApi } from "../api/process-activities";
import { processIndicatorsApi } from "../api/process-indicators";
import { processStatusesApi } from "../api/process-statuses";
import type {
  ProcessDto,
  ProcessTypeDto,
  ProcessActivityDto,
  ProcessIndicatorDto,
  ProcessStatusDto,
  CreateProcessRequest,
  UpdateProcessRequest,
  CreateProcessTypeRequest,
  UpdateProcessTypeRequest,
  ApplyProcessTypePresetRequest,
  CreateProcessActivityRequest,
  UpdateProcessActivityRequest,
  CreateProcessIndicatorRequest,
  UpdateProcessIndicatorRequest,
  ProcessDocumentDto,
  ProcessDocumentRoleDto,
  DocumentDto,
  CreateProcessDocumentRequest,
  UpdateProcessDocumentRequest,
} from "../types";

// ===== Query keys =====
export const processQueryKeys = {
  all: ["processes"] as const,
  lists: (archived: boolean) => ["processes", "list", { archived }] as const,
  detail: (id: string) => ["processes", "detail", id] as const,
  types: (includeInactive: boolean) => ["process-types", { includeInactive }] as const,
  activities: (processId: string | undefined, includeInactive: boolean) =>
    ["process-activities", { processId, includeInactive }] as const,
  indicators: (processId: string | undefined, includeInactive: boolean) =>
    ["process-indicators", { processId, includeInactive }] as const,
  statuses: ["process-statuses"] as const,
  processDocuments: (processId: string) => ["process-documents", processId] as const,
  processDocumentRoles: ["process-document-roles"] as const,
  documentsCatalog: (search: string) => ["documents", "catalog", { search }] as const,
};

// ===== Processes =====
export function useProcesses(includeArchived = false) {
  return useQuery<ProcessDto[]>({
    queryKey: processQueryKeys.lists(includeArchived),
    queryFn: () => processesApi.list(includeArchived),
    staleTime: 30_000,
  });
}

export function useProcess(id: string | undefined) {
  return useQuery<ProcessDto | null>({
    queryKey: id ? processQueryKeys.detail(id) : ["processes", "detail", "none"],
    queryFn: () => (id ? processesApi.getById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 30_000,
  });
}

function invalidateProcesses(qc: QueryClient) {
  qc.invalidateQueries({ queryKey: ["processes"] });
}

function invalidateProcessDocuments(qc: QueryClient, processId: string) {
  qc.invalidateQueries({ queryKey: processQueryKeys.processDocuments(processId) });
}

export function useSaveProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      values: (CreateProcessRequest | UpdateProcessRequest) & { id?: string }
    ) => {
      const { id, ...payload } = values;
      if (id) {
        await processesApi.update(id, payload as UpdateProcessRequest);
        return { id };
      }
      const created = await processesApi.create(payload as CreateProcessRequest);
      return { id: created.id };
    },
    onSuccess: () => {
      invalidateProcesses(qc);
      toast.success("Proceso guardado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo guardar el proceso");
    },
  });
}

export function useDeleteProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processesApi.delete(id),
    onSuccess: () => {
      invalidateProcesses(qc);
      toast.success("Proceso archivado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo archivar el proceso");
    },
  });
}

/** Archivar (soft-delete) o restaurar según `archive`. */
export function useArchiveProcess() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, archive }: { id: string; archive: boolean }) => {
      if (archive) await processesApi.delete(id);
      else await processesApi.restore(id);
    },
    onSuccess: (_data, variables) => {
      invalidateProcesses(qc);
      toast.success(variables.archive ? "Proceso archivado" : "Proceso restaurado");
    },
    onError: (e: any, variables) => {
      const fallback = variables.archive
        ? "No se pudo archivar el proceso"
        : "No se pudo restaurar el proceso";
      const d = e?.response?.data;
      const serverMsg =
        (typeof d === "string" ? d : undefined) ??
        d?.detail ??
        d?.title ??
        (e?.response?.status ? `Error ${e.response.status}` : undefined);
      toast.error(serverMsg ?? fallback);
    },
  });
}

// ===== Process Types =====
export function useProcessTypes(includeInactive = false) {
  return useQuery<ProcessTypeDto[]>({
    queryKey: processQueryKeys.types(includeInactive),
    queryFn: () => processTypesApi.list(includeInactive),
    staleTime: 60_000,
  });
}

export function useSaveProcessType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      values: (CreateProcessTypeRequest | UpdateProcessTypeRequest) & { id?: string }
    ) => {
      const { id, ...payload } = values;
      if (id) {
        await processTypesApi.update(id, payload as UpdateProcessTypeRequest);
        return { id };
      }
      const created = await processTypesApi.create(payload as CreateProcessTypeRequest);
      return { id: created.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-types"] });
      toast.success("Tipo de proceso guardado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo guardar el tipo");
    },
  });
}

export function useDeleteProcessType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processTypesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-types"] });
      toast.success("Tipo de proceso eliminado");
    },
    onError: (e: any) => {
      toast.error(
        e?.response?.data?.detail ?? "No se pudo eliminar el tipo (puede tener procesos vinculados)"
      );
    },
  });
}

export function useApplyProcessTypePreset() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplyProcessTypePresetRequest) =>
      processTypesApi.applyPreset(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-types"] });
      qc.invalidateQueries({ queryKey: ["processes"] });
      toast.success("Preset aplicado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo aplicar el preset");
    },
  });
}

// ===== Process Activities =====
export function useProcessActivities(processId: string | undefined, includeInactive = false) {
  return useQuery<ProcessActivityDto[]>({
    queryKey: processQueryKeys.activities(processId, includeInactive),
    queryFn: () =>
      processId
        ? processActivitiesApi.listByProcess(processId, includeInactive)
        : Promise.resolve([]),
    enabled: !!processId,
    staleTime: 30_000,
  });
}

export function useSaveProcessActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      values: (CreateProcessActivityRequest | UpdateProcessActivityRequest) & {
        id?: string;
        processId: string;
      }
    ) => {
      const { id, ...payload } = values;
      if (id) {
        const { processId: _pid, ...updatePayload } = payload as UpdateProcessActivityRequest & {
          processId?: string;
        };
        await processActivitiesApi.update(id, updatePayload as UpdateProcessActivityRequest);
        return { id };
      }
      return processActivitiesApi.create(payload as CreateProcessActivityRequest);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-activities"] });
      toast.success("Actividad guardada");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo guardar la actividad");
    },
  });
}

export function useDeleteProcessActivity() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processActivitiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-activities"] });
      toast.success("Actividad eliminada");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo eliminar la actividad");
    },
  });
}

// ===== Process Indicators =====
export function useProcessIndicators(processId: string | undefined, includeInactive = false) {
  return useQuery<ProcessIndicatorDto[]>({
    queryKey: processQueryKeys.indicators(processId, includeInactive),
    queryFn: () => processIndicatorsApi.list(processId, includeInactive),
    staleTime: 30_000,
  });
}

export function useSaveProcessIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (
      values: (CreateProcessIndicatorRequest | UpdateProcessIndicatorRequest) & { id?: string }
    ) => {
      const { id, ...payload } = values;
      if (id) {
        const { processId: _pid, ...updatePayload } = payload as UpdateProcessIndicatorRequest & {
          processId?: string;
        };
        await processIndicatorsApi.update(id, updatePayload as UpdateProcessIndicatorRequest);
        return { id };
      }
      const created = await processIndicatorsApi.create(payload as CreateProcessIndicatorRequest);
      return { id: created.id };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-indicators"] });
      toast.success("Indicador guardado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo guardar el indicador");
    },
  });
}

export function useDeleteProcessIndicator() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processIndicatorsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["process-indicators"] });
      toast.success("Indicador eliminado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo eliminar el indicador");
    },
  });
}

// ===== Process documents (SGD links) =====
export function useProcessDocuments(processId: string | undefined) {
  return useQuery<ProcessDocumentDto[]>({
    queryKey: processId ? processQueryKeys.processDocuments(processId) : ["process-documents", "none"],
    queryFn: () => (processId ? processDocumentsApi.listByProcess(processId) : Promise.resolve([])),
    enabled: !!processId,
    staleTime: 15_000,
  });
}

export function useProcessDocumentRoles() {
  return useQuery<ProcessDocumentRoleDto[]>({
    queryKey: processQueryKeys.processDocumentRoles,
    queryFn: () => processDocumentRolesApi.list(),
    staleTime: 60_000,
  });
}

export function useDocumentsCatalog(search: string) {
  return useQuery<DocumentDto[]>({
    queryKey: processQueryKeys.documentsCatalog(search),
    queryFn: () =>
      documentsApi.list({
        pageNumber: 1,
        pageSize: 150,
        search: search.trim() || undefined,
        isActive: true,
      }),
    staleTime: 20_000,
  });
}

export function useCreateProcessDocument(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProcessDocumentRequest) => processDocumentsApi.create(payload),
    onSuccess: () => {
      invalidateProcessDocuments(qc, processId);
      toast.success("Documento vinculado al proceso");
    },
    onError: (e: any) => {
      const d = e?.response?.data;
      toast.error(
        (typeof d === "string" ? d : undefined) ??
          d?.detail ??
          d?.title ??
          "No se pudo vincular el documento",
      );
    },
  });
}

export function useUpdateProcessDocument(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateProcessDocumentRequest }) =>
      processDocumentsApi.update(id, payload),
    onSuccess: () => {
      invalidateProcessDocuments(qc, processId);
      toast.success("Vínculo actualizado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo actualizar el vínculo");
    },
  });
}

export function useDeleteProcessDocument(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => processDocumentsApi.delete(id),
    onSuccess: () => {
      invalidateProcessDocuments(qc, processId);
      toast.success("Vínculo eliminado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo eliminar el vínculo");
    },
  });
}

// ===== Process Statuses (catalog) =====
export function useProcessStatuses() {
  return useQuery<ProcessStatusDto[]>({
    queryKey: processQueryKeys.statuses,
    queryFn: () => processStatusesApi.list(),
    staleTime: 5 * 60_000,
  });
}

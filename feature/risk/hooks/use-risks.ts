"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { riskCategoriesApi, riskControlsApi, risksApi } from "../api/risks";
import type {
  CreateRiskControlRequest,
  CreateRiskRequest,
  RiskControlDto,
  RiskDto,
  UpdateRiskControlRequest,
  UpdateRiskRequest,
} from "../types";

export const riskQueryKeys = {
  categories: ["risk-categories"] as const,
  risks: (processId: string) => ["risks", processId] as const,
  /** Controles del tenant; se filtra por riesgos del proceso en el hook. */
  riskControlsAll: ["risk-controls", "all"] as const,
};

export function useRiskCategories() {
  return useQuery({
    queryKey: riskQueryKeys.categories,
    queryFn: () => riskCategoriesApi.list(),
    staleTime: 120_000,
  });
}

export function useRisks(processId: string | undefined) {
  return useQuery<RiskDto[]>({
    queryKey: processId ? riskQueryKeys.risks(processId) : ["risks", "none"],
    queryFn: () => (processId ? risksApi.list(processId) : Promise.resolve([])),
    enabled: !!processId,
    staleTime: 15_000,
  });
}

export function useRiskControlsForProcess(processId: string | undefined) {
  const { data: risks = [], isSuccess: risksReady } = useRisks(processId);
  return useQuery<RiskControlDto[]>({
    queryKey: [...riskQueryKeys.riskControlsAll, processId ?? "", risks.map((x) => x.id).join(",")],
    enabled: !!processId && risksReady,
    queryFn: async () => {
      if (!processId || risks.length === 0) return [];
      const all = await riskControlsApi.list();
      const ids = new Set(risks.map((r) => r.id));
      return all.filter((c) => ids.has(c.riskId));
    },
    staleTime: 15_000,
  });
}

function invalidateRiskBundle(qc: ReturnType<typeof useQueryClient>, processId: string) {
  qc.invalidateQueries({ queryKey: riskQueryKeys.risks(processId) });
  qc.invalidateQueries({ queryKey: riskQueryKeys.riskControlsAll });
}

export function useCreateRisk(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRiskRequest) => risksApi.create(payload),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Riesgo registrado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? e?.response?.data?.title ?? "No se pudo crear el riesgo");
    },
  });
}

export function useUpdateRisk(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRiskRequest }) =>
      risksApi.update(id, payload),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Riesgo actualizado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo actualizar el riesgo");
    },
  });
}

export function useDeleteRisk(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => risksApi.delete(id),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Riesgo eliminado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo eliminar el riesgo");
    },
  });
}

export function useCreateRiskControl(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRiskControlRequest) => riskControlsApi.create(payload),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Cambio / control registrado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo crear el registro");
    },
  });
}

export function useUpdateRiskControl(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateRiskControlRequest }) =>
      riskControlsApi.update(id, payload),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Registro actualizado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo actualizar");
    },
  });
}

export function useDeleteRiskControl(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => riskControlsApi.delete(id),
    onSuccess: () => {
      invalidateRiskBundle(qc, processId);
      toast.success("Registro eliminado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? "No se pudo eliminar");
    },
  });
}

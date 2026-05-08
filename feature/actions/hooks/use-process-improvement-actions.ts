"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { actionsApi } from "../api/actions";
import type { CreateActionRequest } from "../types";

export const improvementActionKeys = {
  byProcess: (processId: string) => ["actions", "improvement", processId] as const,
  detail: (id: string) => ["actions", "detail", id] as const,
};

const SOURCE = "ProcessImprovement";

export function useImprovementActions(processId: string | undefined) {
  return useQuery({
    queryKey: processId ? improvementActionKeys.byProcess(processId) : ["actions", "improvement", "none"],
    queryFn: () =>
      processId
        ? actionsApi.list({ processId, source: SOURCE })
        : Promise.resolve([]),
    enabled: !!processId,
    staleTime: 15_000,
  });
}

export function useActionDetail(id: string | undefined, open: boolean) {
  return useQuery({
    queryKey: id ? improvementActionKeys.detail(id) : ["actions", "detail", "none"],
    queryFn: () => (id ? actionsApi.getById(id) : Promise.resolve(null)),
    enabled: !!id && open,
  });
}

function defaultPlannedRange() {
  const start = new Date();
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  return { start: start.toISOString(), end: end.toISOString() };
}

export function useCreateImprovementAction(processId: string, processCode: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      title: string;
      description: string | null;
      category: "Improvement" | "Corrective";
      priority: "Low" | "Medium" | "High";
    }) => {
      const { start, end } = defaultPlannedRange();
      const payload: CreateActionRequest = {
        title: input.title,
        description: input.description,
        source: SOURCE,
        sourceId: processId,
        sourceReference: processCode ? `PROC-${processCode}` : null,
        dofaStrategyId: null,
        riskId: null,
        auditFindingId: null,
        complianceClauseId: null,
        processId,
        documentRequirementId: null,
        category: input.category,
        priority: input.priority,
        type: "Process",
        responsibleId: null,
        ownerId: null,
        plannedStartDate: start,
        plannedEndDate: end,
        budgetAmount: null,
        budgetCurrency: null,
        budgetCode: null,
        actionPlan: null,
        expectedOutcome: null,
      };
      return actionsApi.create(payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: improvementActionKeys.byProcess(processId) });
      toast.success("Hallazgo registrado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? e?.response?.data?.title ?? "No se pudo registrar");
    },
  });
}

export function useDeleteImprovementAction(processId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => actionsApi.delete(id),
    onSuccess: (_void, deletedId) => {
      qc.invalidateQueries({ queryKey: improvementActionKeys.byProcess(processId) });
      qc.invalidateQueries({ queryKey: improvementActionKeys.detail(deletedId) });
      toast.success("Eliminado");
    },
    onError: (e: any) => {
      toast.error(e?.response?.data?.detail ?? e?.response?.data?.title ?? "No se pudo eliminar");
    },
  });
}

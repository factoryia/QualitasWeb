"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDofaAnalysis,
  createDofaItem,
  deactivateDofaItem,
  deleteDofaAnalysis,
  getDofaAnalysisById,
  listDofaAnalyses,
  updateDofaItem,
  type CreateDofaAnalysisCommand,
  type CreateDofaItemCommand,
  type UpdateDofaItemCommand,
} from "../api/dofa";

export const dofaKeys = {
  all: ["strategic", "dofa"] as const,
  lists: () => [...dofaKeys.all, "list"] as const,
  list: () => [...dofaKeys.lists()] as const,
  details: () => [...dofaKeys.all, "detail"] as const,
  detail: (analysisId: string) => [...dofaKeys.details(), analysisId] as const,
};

export function useDofaAnalysesQuery() {
  return useQuery({
    queryKey: dofaKeys.list(),
    queryFn: listDofaAnalyses,
  });
}

export function useDofaAnalysisQuery(analysisId?: string) {
  return useQuery({
    queryKey: analysisId ? dofaKeys.detail(analysisId) : dofaKeys.detail("__none__"),
    queryFn: async () => {
      if (!analysisId) return null;
      return getDofaAnalysisById(analysisId);
    },
    enabled: !!analysisId,
  });
}

export function useDofaCreateAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDofaAnalysisCommand) => createDofaAnalysis(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dofaKeys.all });
    },
  });
}

export function useDofaDeleteAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (analysisId: string) => deleteDofaAnalysis(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dofaKeys.all });
    },
  });
}

export function useDofaCreateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      payload,
    }: {
      analysisId: string;
      payload: CreateDofaItemCommand;
    }) => createDofaItem(analysisId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

export function useDofaUpdateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      itemId,
      payload,
    }: {
      analysisId: string;
      itemId: string;
      payload: UpdateDofaItemCommand;
    }) => updateDofaItem(analysisId, itemId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

export function useDofaDeactivateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ analysisId, itemId }: { analysisId: string; itemId: string }) =>
      deactivateDofaItem(analysisId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

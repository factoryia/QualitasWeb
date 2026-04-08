"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMarcosNormativos,
  createMarcoNormativo,
  updateMarcoNormativoById,
  deleteMarcoNormativo,
  type MarcoNormativoDto,
  type CreateMarcoNormativoCommand,
  type UpdateMarcoNormativoCommand,
} from "@/feature/compliance/api/marcos-normativos";

const marcosKeys = {
  all: ["compliance", "marcos-normativos"] as const,
  list: (includeInactive: boolean) =>
    ["compliance", "marcos-normativos", "list", includeInactive] as const,
  detail: (id: string) => ["compliance", "marcos-normativos", id] as const,
};

/** Lista de marcos normativos */
export function useMarcosNormativosQuery(includeInactive = true) {
  return useQuery({
    queryKey: marcosKeys.list(includeInactive),
    queryFn: async (): Promise<MarcoNormativoDto[]> => {
      return await getAllMarcosNormativos(includeInactive);
    },
  });
}

export function useMarcosNormativosInvalidate() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: marcosKeys.all });
}

export function useMarcoNormativoCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarcoNormativoCommand) =>
      createMarcoNormativo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

export function useMarcoNormativoUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: { id: string; payload: UpdateMarcoNormativoCommand }) =>
      updateMarcoNormativoById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

export function useMarcoNormativoDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      deleteMarcoNormativo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

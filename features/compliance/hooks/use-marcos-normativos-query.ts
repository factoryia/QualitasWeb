"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  complianceService,
  type MarcoNormativoDto,
  type CreateMarcoNormativoCommand,
  type UpdateMarcoNormativoCommand,
} from "@/features/compliance/services/compliance.service";
import { MOCK_MARCOS_NORMATIVOS } from "@/features/compliance/constants/mock-marcos";

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const marcosKeys = {
  all: ["compliance", "marcos-normativos"] as const,
  list: (includeInactive: boolean) =>
    ["compliance", "marcos-normativos", "list", includeInactive] as const,
  detail: (id: string) => ["compliance", "marcos-normativos", id] as const,
};

/** Lista de marcos normativos: API o datos quemados si no hay datos/error */
export function useMarcosNormativosQuery(includeInactive = true) {
  const auth = useAuth();
  return useQuery({
    queryKey: marcosKeys.list(includeInactive),
    queryFn: async (): Promise<MarcoNormativoDto[]> => {
      try {
        const list = await complianceService.getAllMarcosNormativos(
          includeInactive,
          auth
        );
        if (list.length > 0) return list;
        return MOCK_MARCOS_NORMATIVOS;
      } catch {
        return MOCK_MARCOS_NORMATIVOS;
      }
    },
    placeholderData: MOCK_MARCOS_NORMATIVOS,
  });
}

export function useMarcosNormativosInvalidate() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: marcosKeys.all });
}

export function useMarcoNormativoCreateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMarcoNormativoCommand) =>
      complianceService.createMarcoNormativo(payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

export function useMarcoNormativoUpdateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: { id: string; payload: UpdateMarcoNormativoCommand }) =>
      complianceService.updateMarcoNormativoById(id, payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

export function useMarcoNormativoDeleteMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      complianceService.deleteMarcoNormativo(id, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marcosKeys.all });
    },
  });
}

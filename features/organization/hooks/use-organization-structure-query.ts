"use client";

import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { organizationService } from "../services/organization.service";
import type { Area, Sede } from "../types";

const structureKeys = {
  areas: (orgId: string) => ["organization", orgId, "areas"] as const,
  sedes: (orgId: string) => ["organization", orgId, "sedes"] as const,
  members: (orgId: string) => ["organization", orgId, "members"] as const,
  areaUserCount: (areaId: string) => ["organization", "area-user-count", areaId] as const,
};

export type OrgMember = { user_id: string; full_name: string | null };

export function useAreas(orgId: string | null) {
  return useQuery({
    queryKey: structureKeys.areas(orgId ?? ""),
    queryFn: () => organizationService.getAreas(orgId!),
    enabled: !!orgId,
  });
}

export function useSedes(orgId: string | null) {
  return useQuery({
    queryKey: structureKeys.sedes(orgId ?? ""),
    queryFn: () => organizationService.getSedes(orgId!),
    enabled: !!orgId,
  });
}

export function useMembers(orgId: string | null) {
  return useQuery({
    queryKey: structureKeys.members(orgId ?? ""),
    queryFn: () => organizationService.getMembers(orgId!),
    enabled: !!orgId,
  });
}

/** Conteo de usuarios por área; usa useQueries para cada areaId. */
export function useAreaUserCounts(areaIds: string[]) {
  const results = useQueries({
    queries: areaIds.map((areaId) => ({
      queryKey: structureKeys.areaUserCount(areaId),
      queryFn: () => organizationService.getUserCount(areaId),
      enabled: !!areaId,
    })),
  });
  const userCounts: Record<string, number> = {};
  results.forEach((r, i) => {
    if (r.data !== undefined && areaIds[i]) userCounts[areaIds[i]] = r.data;
  });
  const isLoading = results.some((r) => r.isLoading);
  return { userCounts, isLoading };
}

export function useCreateArea(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Area>) => organizationService.createArea(orgId!, data),
    onSuccess: () => {
      if (orgId) queryClient.invalidateQueries({ queryKey: structureKeys.areas(orgId) });
    },
  });
}

export function useUpdateArea(orgId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      areaId,
      data,
    }: {
      areaId: string;
      data: Partial<Area>;
    }) => organizationService.updateArea(orgId!, areaId, data),
    onSuccess: (_, { areaId }) => {
      if (orgId) {
        queryClient.invalidateQueries({ queryKey: structureKeys.areas(orgId) });
        queryClient.invalidateQueries({ queryKey: structureKeys.areaUserCount(areaId) });
      }
    },
  });
}

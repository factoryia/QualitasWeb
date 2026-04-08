"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllMipgDimensions,
  createMipgDimension,
  updateMipgDimension,
  deleteMipgDimension,
  type MipgDimensionDto,
  type CreateMipgDimensionCommand,
  type UpdateMipgDimensionCommand,
} from "@/feature/compliance/api/mipg-dimensiones";
import {
  getAllMipgPolicies,
  createMipgPolicy,
  updateMipgPolicy,
  deleteMipgPolicy,
  type MipgPolicyDto,
  type CreateMipgPolicyCommand,
  type UpdateMipgPolicyCommand,
} from "@/feature/compliance/api/mipg-politicas";
import {
  getAllMipgGuidelines,
  createMipgGuideline,
  updateMipgGuideline,
  deleteMipgGuideline,
  type MipgGuidelineDto,
  type CreateMipgGuidelineCommand,
  type UpdateMipgGuidelineCommand,
} from "@/feature/compliance/api/mipg-lineamientos";
import {
  getMipgGuidelineRequirements,
  createMipgGuidelineRequirement,
  updateMipgGuidelineRequirement,
  deleteMipgGuidelineRequirement,
  type MipgGuidelineRequirementClauseDto,
  type CreateMipgGuidelineRequirementClauseCommand,
  type UpdateMipgGuidelineRequirementClauseCommand,
} from "@/feature/compliance/api/mipg-alineacion";

const mipgKeys = {
  all: ["compliance", "mipg"] as const,
  dimensions: ["compliance", "mipg", "dimensions"] as const,
  policies: (dimensionId?: string) =>
    ["compliance", "mipg", "policies", dimensionId] as const,
  guidelines: (policyId?: string) =>
    ["compliance", "mipg", "guidelines", policyId] as const,
  alignment: (guidelineId?: string, requirementId?: string) =>
    ["compliance", "mipg", "alignment", guidelineId, requirementId] as const,
};

// --- Dimensiones ---

export function useMipgDimensionsQuery() {
  return useQuery({
    queryKey: mipgKeys.dimensions,
    queryFn: async (): Promise<MipgDimensionDto[]> => {
      return await getAllMipgDimensions();
    },
  });
}

export function useMipgDimensionCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMipgDimensionCommand) =>
      createMipgDimension(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mipgKeys.dimensions });
    },
  });
}

export function useMipgDimensionDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMipgDimension(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mipgKeys.dimensions });
    },
  });
}

// --- Políticas ---

export function useMipgPoliciesQuery(dimensionId?: string) {
  return useQuery({
    queryKey: mipgKeys.policies(dimensionId),
    queryFn: async (): Promise<MipgPolicyDto[]> => {
      return await getAllMipgPolicies(dimensionId);
    },
  });
}

export function useMipgPolicyCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMipgPolicyCommand) => createMipgPolicy(payload),
    onSuccess: () => {
      // Invalida todas las queries de políticas (con o sin dimensionId)
      queryClient.invalidateQueries({
        queryKey: ["compliance", "mipg", "policies"],
      });
    },
  });
}

// --- Lineamientos ---

export function useMipgGuidelinesQuery(policyId?: string, includeInactive: boolean = false) {
  return useQuery({
    queryKey: [...mipgKeys.guidelines(policyId), includeInactive],
    queryFn: async (): Promise<MipgGuidelineDto[]> => {
      if (!policyId) return [];
      return await getAllMipgGuidelines(policyId, includeInactive);
    },
    enabled: !!policyId,
  });
}

export function useMipgGuidelineCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMipgGuidelineCommand) =>
      createMipgGuideline(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mipgKeys.guidelines(variables.policyId),
      });
    },
  });
}

// --- Alineación ---

export function useMipgAlignmentQuery(
  guidelineId?: string,
  requirementId?: string
) {
  return useQuery({
    queryKey: mipgKeys.alignment(guidelineId, requirementId),
    queryFn: async (): Promise<MipgGuidelineRequirementClauseDto[]> => {
      return await getMipgGuidelineRequirements(guidelineId, requirementId);
    },
    enabled: !!guidelineId || !!requirementId,
  });
}

export function useMipgAlignmentCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateMipgGuidelineRequirementClauseCommand) =>
      createMipgGuidelineRequirement(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: mipgKeys.alignment(variables.mipgGuidelineId),
      });
    },
  });
}

export function useMipgAlignmentUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateMipgGuidelineRequirementClauseCommand;
    }) => updateMipgGuidelineRequirement(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["compliance", "mipg", "alignment"],
      });
    },
  });
}

export function useMipgAlignmentDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMipgGuidelineRequirement(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["compliance", "mipg", "alignment"],
      });
    },
  });
}

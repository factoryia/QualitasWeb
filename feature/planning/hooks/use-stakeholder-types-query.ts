"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStakeholderType,
  deleteStakeholderTypeById,
  getStakeholderTypes,
  updateStakeholderTypeById,
  type CreateStakeholderTypeRequest,
  type StakeholderTypeDto,
  type UpdateStakeholderTypeRequest,
} from "@/feature/planning/api/stakeholder-types";

const stakeholderTypeKeys = {
  all: ["strategic", "stakeholder-types"] as const,
  list: () => ["strategic", "stakeholder-types", "list"] as const,
};

export function useStakeholderTypesQuery() {
  return useQuery({
    queryKey: stakeholderTypeKeys.list(),
    queryFn: async (): Promise<StakeholderTypeDto[]> => {
      return await getStakeholderTypes();
    },
  });
}

export function useStakeholderTypesInvalidate() {
  const queryClient = useQueryClient();
  return () =>
    queryClient.invalidateQueries({ queryKey: stakeholderTypeKeys.all });
}

export function useStakeholderTypeCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStakeholderTypeRequest) =>
      createStakeholderType(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderTypeKeys.all });
    },
  });
}

export function useStakeholderTypeUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStakeholderTypeRequest;
    }) => updateStakeholderTypeById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderTypeKeys.all });
    },
  });
}

export function useStakeholderTypeDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStakeholderTypeById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderTypeKeys.all });
    },
  });
}


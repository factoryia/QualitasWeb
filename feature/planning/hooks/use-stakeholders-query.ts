"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createStakeholder,
  deleteStakeholderById,
  getStakeholders,
  updateStakeholderById,
  type CreateStakeholderRequest,
  type StakeholderDto,
  type UpdateStakeholderRequest,
} from "@/feature/planning/api/stakeholders";

const stakeholderKeys = {
  all: ["strategic", "stakeholders"] as const,
  list: () => ["strategic", "stakeholders", "list"] as const,
};

export function useStakeholdersQuery() {
  return useQuery({
    queryKey: stakeholderKeys.list(),
    queryFn: async (): Promise<StakeholderDto[]> => {
      return await getStakeholders();
    },
  });
}

export function useStakeholdersInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
}

export function useStakeholderCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStakeholderRequest) => createStakeholder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
    },
  });
}

export function useStakeholderUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateStakeholderRequest;
    }) => updateStakeholderById(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
    },
  });
}

export function useStakeholderDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteStakeholderById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderKeys.all });
    },
  });
}


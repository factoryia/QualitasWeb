"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  groupsService,
  type GroupDto,
  type CreateGroupCommand,
  type UpdateGroupCommand,
} from "@/services/identity/services/groups.service";

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const groupsKeys = {
  all: ["groups"] as const,
};

export function useGroups() {
  const auth = useAuth();
  return useQuery({
    queryKey: groupsKeys.all,
    queryFn: () => groupsService.getGroups(undefined, auth),
    enabled: !!auth,
  });
}

export function useGroupCreateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGroupCommand) =>
      groupsService.createGroup(payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.all });
    },
  });
}

export function useGroupUpdateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: { id: string; payload: UpdateGroupCommand }) =>
      groupsService.updateGroup(id, payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.all });
    },
  });
}

export function useGroupDeleteMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => groupsService.deleteGroup(id, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: groupsKeys.all });
    },
  });
}

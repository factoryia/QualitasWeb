"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  rolesService,
  type RoleDto,
  type UpsertRoleCommand,
} from "@/services/identity/services/roles.service";

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const rolesKeys = {
  all: ["roles"] as const,
  permissions: (roleId: string) => ["roles", roleId, "permissions"] as const,
};

export function useRoles() {
  const auth = useAuth();
  return useQuery({
    queryKey: rolesKeys.all,
    queryFn: () => rolesService.getRoles(auth),
    enabled: !!auth,
  });
}

export function useRoleCreateOrUpdateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpsertRoleCommand) =>
      rolesService.createOrUpdateRole(payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

export function useRoleDeleteMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => rolesService.deleteRole(id, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
    },
  });
}

export function useRolePermissions(roleId: string | null) {
  const auth = useAuth();
  return useQuery({
    queryKey: rolesKeys.permissions(roleId ?? ""),
    queryFn: () => rolesService.getRolePermissions(roleId!, auth),
    enabled: !!auth && !!roleId,
  });
}

export function useUpdateRolePermissionsMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      roleId,
      permissions,
    }: {
      roleId: string;
      permissions: string[];
    }) =>
      rolesService.updateRolePermissions(roleId, { permissions }, auth),
    onSuccess: (_, { roleId }) => {
      queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      queryClient.invalidateQueries({
        queryKey: rolesKeys.permissions(roleId),
      });
    },
  });
}

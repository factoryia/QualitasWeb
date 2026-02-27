// features/users/hooks/use-users-query.ts
"use client";

import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/store/auth.store";
import {
  usersService,
  type PagedResponseOfUserDto,
  type UserDto,
  type UserRoleDto,
  type RegisterUserCommand,
  type UpdateUserRequest,
  type AssignUserRolesCommand,
} from "@/features/users/services/users.service";

export type UsersSearchParams = {
  PageNumber?: number;
  PageSize?: number;
  Sort?: string;
  Search?: string;
  IsActive?: boolean;
  EmailConfirmed?: boolean;
  RoleId?: string;
};

function useAuth() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const tenant = useAuthStore((s) => s.user?.tenant ?? "root");
  return accessToken ? { accessToken, tenant } : undefined;
}

const usersKeys = {
  all: ["users"] as const,
  search: (params: UsersSearchParams & { tenant?: string }) =>
    ["users", "search", params] as const,
  detail: (id: string) => ["users", id] as const,
  roles: (userId: string) => ["users", userId, "roles"] as const,
};

export function useUsersSearch(params: UsersSearchParams) {
  const auth = useAuth();
  return useQuery({
    queryKey: usersKeys.search({ ...params, tenant: auth?.tenant }),
    queryFn: () =>
      usersService.searchUsers(
        {
          PageNumber: params.PageNumber ?? 1,
          PageSize: params.PageSize ?? 10,
          Search: params.Search,
          IsActive: params.IsActive,
          EmailConfirmed: params.EmailConfirmed,
          RoleId: params.RoleId,
          Sort: params.Sort,
        },
        auth
      ),
    enabled: !!auth,
  });
}

export function useUserRoles(userId: string | null) {
  const auth = useAuth();
  return useQuery({
    queryKey: usersKeys.roles(userId ?? ""),
    queryFn: () => usersService.getUserRoles(userId!, auth),
    enabled: !!auth && !!userId,
  });
}

/** Mapa de userId -> roles habilitados (para tabla de usuarios) */
export function useUserRolesMap(userIds: string[]) {
  const auth = useAuth();
  const results = useQueries({
    queries: userIds.map((userId) => ({
      queryKey: usersKeys.roles(userId),
      queryFn: () => usersService.getUserRoles(userId, auth!),
      enabled: !!auth && !!userId,
    })),
  });
  const map: Record<string, UserRoleDto[]> = {};
  results.forEach((r, i) => {
    if (r.data && userIds[i]) map[userIds[i]] = r.data;
  });
  return map;
}

export function useUsersInvalidate() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: usersKeys.all });
}

export function useUserUpdateMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, data }: { userId: string; data: UpdateUserRequest }) =>
      usersService.updateUser(userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUserToggleStatusMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, activate }: { userId: string; activate: boolean }) =>
      usersService.toggleUserStatus(userId, activate, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUserDeleteMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) => usersService.deleteUser(userId, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUserRegisterMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RegisterUserCommand) =>
      usersService.registerUser(payload, auth),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
  });
}

export function useUserAssignRolesMutation() {
  const auth = useAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      userId,
      payload,
    }: {
      userId: string;
      payload: AssignUserRolesCommand;
    }) => usersService.assignUserRoles(userId, payload, auth),
    onSuccess: (_, { userId }) => {
      queryClient.invalidateQueries({ queryKey: usersKeys.all });
      queryClient.invalidateQueries({ queryKey: usersKeys.roles(userId) });
    },
  });
}

export function useFullUserProfile() {
  const auth = useAuth();
  
  // 1. Obtener datos básicos (perfil con IDs)
  const userQuery = useQuery({
    queryKey: ['users', 'profile', auth?.tenant],
    queryFn: () => usersService.getProfile(auth),
    enabled: !!auth,
  });

  const user = userQuery.data;

  // 2. Resolver nombres en paralelo (Foundation)
  const results = useQueries({
    queries: [
      {
        queryKey: ['foundation', 'org', user?.organizationId],
        queryFn: () => usersService.getOrganization(user!.organizationId, auth),
        enabled: !!auth && !!user?.organizationId,
      },
      {
        queryKey: ['foundation', 'area', user?.organizationUnitId],
        queryFn: () => usersService.getArea(user!.organizationUnitId, auth),
        enabled: !!auth && !!user?.organizationUnitId,
      },
      {
        queryKey: ['foundation', 'position', user?.positionId],
        queryFn: () => usersService.getPosition(user!.positionId, auth),
        enabled: !!auth && !!user?.positionId,
      },
    ],
  });

  return {
    user,
    organization: results[0].data,
    area: results[1].data,
    position: results[2].data,
    // Estado de carga unificado
    isLoading: userQuery.isLoading || results.some(r => r.isLoading),
    isError: userQuery.isError || results.some(r => r.isError),
  };
}

'use client';

import { useAuthStore } from '../store/auth.store';

/**
 * Check if user has a specific permission
 * @param permission - Permission string (e.g., "Permissions.QualitasCompliance.MarcosNormativos.View")
 * @returns boolean
 */
export function useHasPermission(permission: string): boolean {
  const permissions = useAuthStore((state) => state.permissions);
  return permissions.includes(permission);
}

/**
 * Check if user has ANY of the provided permissions (OR logic)
 * @param permissions - Array of permission strings
 * @returns boolean
 */
export function useHasAnyPermission(...permissions: string[]): boolean {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.some((perm) => userPermissions.includes(perm));
}

/**
 * Check if user has ALL of the provided permissions (AND logic)
 * @param permissions - Array of permission strings
 * @returns boolean
 */
export function useHasAllPermissions(...permissions: string[]): boolean {
  const userPermissions = useAuthStore((state) => state.permissions);
  return permissions.every((perm) => userPermissions.includes(perm));
}

/**
 * Get all user permissions (for debugging or advanced use cases)
 * @returns Array of permission strings
 */
export function usePermissions(): string[] {
  return useAuthStore((state) => state.permissions);
}

/**
 * Check if permissions are still loading
 * @returns boolean
 */
export function useIsLoadingPermissions(): boolean {
  return useAuthStore((state) => state.isLoadingPermissions);
}

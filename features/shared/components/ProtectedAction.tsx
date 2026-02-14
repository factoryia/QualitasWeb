'use client';

import { ReactNode } from 'react';
import { useHasAnyPermission, useHasAllPermissions } from '@/features/auth/hooks/usePermission';

interface ProtectedActionProps {
  /**
   * Single permission string or array of permissions to check
   * @example "Permissions.QualitasCompliance.MarcosNormativos.Create"
   * @example ["Permissions.QualitasCompliance.MarcosNormativos.Create", "Permissions.QualitasCompliance.MarcosNormativos.View"]
   */
  permission: string | string[];

  /**
   * Content to render if user has permission
   */
  children: ReactNode;

  /**
   * Content to render if user doesn't have permission (optional)
   * @default null (renders nothing)
   */
  fallback?: ReactNode;

  /**
   * If true, user must have ALL permissions (AND logic)
   * If false, user must have ANY permission (OR logic)
   * @default false
   */
  requireAll?: boolean;
}

/**
 * Component to conditionally render content based on user permissions
 *
 * @example
 * // Single permission
 * <ProtectedAction permission="Permissions.QualitasCompliance.MarcosNormativos.Create">
 *   <button onClick={handleCreate}>Create Marco</button>
 * </ProtectedAction>
 *
 * @example
 * // Multiple permissions (OR logic - any)
 * <ProtectedAction permission={["Permissions.QualitasCompliance.MarcosNormativos.Create", "Permissions.QualitasCompliance.MarcosNormativos.Update"]}>
 *   <button>Create or Edit</button>
 * </ProtectedAction>
 *
 * @example
 * // Multiple permissions (AND logic - all)
 * <ProtectedAction permission={["Permissions.QualitasCompliance.MarcosNormativos.Create", "Permissions.QualitasCompliance.MarcosNormativos.View"]} requireAll={true}>
 *   <button>Create and View</button>
 * </ProtectedAction>
 */
export function ProtectedAction({
  permission,
  children,
  fallback = null,
  requireAll = false,
}: ProtectedActionProps): ReactNode {
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasPermission = requireAll
    ? useHasAllPermissions(...permissions)
    : useHasAnyPermission(...permissions);

  return hasPermission ? children : fallback;
}

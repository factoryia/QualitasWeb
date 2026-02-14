/**
 * Frontend Permission Constants - Mirror of Backend Permission System
 * These strings must match exactly with backend constants defined in:
 * - QualitasFoundationPermissionConstants.cs
 * - QualitasCompliancePermissionConstants.cs
 * - QualitasOperationsPermissionConstants.cs
 * etc.
 */

export const QualitasFoundationPermissions = {
  Organizations: {
    View: 'Permissions.QualitasFoundation.Organizations.View',
    Create: 'Permissions.QualitasFoundation.Organizations.Create',
    Update: 'Permissions.QualitasFoundation.Organizations.Update',
    Delete: 'Permissions.QualitasFoundation.Organizations.Delete',
  },
  OrganizationUnits: {
    View: 'Permissions.QualitasFoundation.OrganizationUnits.View',
    Create: 'Permissions.QualitasFoundation.OrganizationUnits.Create',
    Update: 'Permissions.QualitasFoundation.OrganizationUnits.Update',
    Delete: 'Permissions.QualitasFoundation.OrganizationUnits.Delete',
  },
} as const;

export const QualitasCompliancePermissions = {
  MarcosNormativos: {
    View: 'Permissions.QualitasCompliance.MarcosNormativos.View',
    Create: 'Permissions.QualitasCompliance.MarcosNormativos.Create',
    Update: 'Permissions.QualitasCompliance.MarcosNormativos.Update',
    Delete: 'Permissions.QualitasCompliance.MarcosNormativos.Delete',
  },
  ClausulasRequisitos: {
    View: 'Permissions.QualitasCompliance.ClausulasRequisitos.View',
    Create: 'Permissions.QualitasCompliance.ClausulasRequisitos.Create',
    Update: 'Permissions.QualitasCompliance.ClausulasRequisitos.Update',
    Delete: 'Permissions.QualitasCompliance.ClausulasRequisitos.Delete',
  },
  CriteriosCumplimiento: {
    View: 'Permissions.QualitasCompliance.CriteriosCumplimiento.View',
    Create: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Create',
    Update: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Update',
    Delete: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Delete',
  },
} as const;

export const QualitasOperationsPermissions = {
  Processes: {
    View: 'Permissions.QualitasOperations.Processes.View',
    Create: 'Permissions.QualitasOperations.Processes.Create',
    Update: 'Permissions.QualitasOperations.Processes.Update',
    Delete: 'Permissions.QualitasOperations.Processes.Delete',
  },
  ProcessActivities: {
    View: 'Permissions.QualitasOperations.ProcessActivities.View',
    Create: 'Permissions.QualitasOperations.ProcessActivities.Create',
    Update: 'Permissions.QualitasOperations.ProcessActivities.Update',
    Delete: 'Permissions.QualitasOperations.ProcessActivities.Delete',
  },
  ProcessIndicators: {
    View: 'Permissions.QualitasOperations.ProcessIndicators.View',
    Create: 'Permissions.QualitasOperations.ProcessIndicators.Create',
    Update: 'Permissions.QualitasOperations.ProcessIndicators.Update',
    Delete: 'Permissions.QualitasOperations.ProcessIndicators.Delete',
  },
} as const;

/**
 * All permissions combined for easier access
 * Usage: Object.values(ALL_PERMISSIONS).flat() to get all permissions
 */
export const ALL_PERMISSIONS = {
  Foundation: QualitasFoundationPermissions,
  Compliance: QualitasCompliancePermissions,
  Operations: QualitasOperationsPermissions,
} as const;

/**
 * Type helper for permission checking
 * Ensures permission strings are properly typed
 */
export type PermissionKey = string & {
  readonly __brand: 'PermissionKey';
};

/**
 * Helper function to validate a permission string is correctly formatted
 * @param permission - Permission string to validate
 * @returns boolean
 */
export function isValidPermission(permission: string): boolean {
  return permission.startsWith('Permissions.');
}

/**
 * Helper to get all permissions for a specific module
 * @example getModulePermissions('Foundation') // returns all Foundation permissions
 */
export function getModulePermissions(
  module: keyof typeof ALL_PERMISSIONS
): Record<string, Record<string, string>> {
  return ALL_PERMISSIONS[module];
}

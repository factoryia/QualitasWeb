/**
 * Permission Constants - Type-safe permission strings
 * Aligned with backend ClaimValue (e.g. Permissions.Users.View)
 */
export const PERMISSIONS = {
  Dashboard: {
    VIEW: 'Permissions.Dashboard.View',
  },
  Users: {
    VIEW: 'Permissions.Users.View',
    SEARCH: 'Permissions.Users.Search',
    CREATE: 'Permissions.Users.Create',
    UPDATE: 'Permissions.Users.Update',
    DELETE: 'Permissions.Users.Delete',
    EXPORT: 'Permissions.Users.Export',
  },
  Roles: {
    VIEW: 'Permissions.Roles.View',
    CREATE: 'Permissions.Roles.Create',
    UPDATE: 'Permissions.Roles.Update',
    DELETE: 'Permissions.Roles.Delete',
  },
  RoleClaims: {
    VIEW: 'Permissions.RoleClaims.View',
    UPDATE: 'Permissions.RoleClaims.Update',
  },
  UserRoles: {
    VIEW: 'Permissions.UserRoles.View',
    UPDATE: 'Permissions.UserRoles.Update',
  },
  Groups: {
    VIEW: 'Permissions.Groups.View',
    CREATE: 'Permissions.Groups.Create',
    UPDATE: 'Permissions.Groups.Update',
    DELETE: 'Permissions.Groups.Delete',
  },
  QUALITAS: {
    FOUNDATION: {
      ORGANIZATIONS: {
        VIEW: 'Permissions.QualitasFoundation.Organizations.View',
        CREATE: 'Permissions.QualitasFoundation.Organizations.Create',
        UPDATE: 'Permissions.QualitasFoundation.Organizations.Update',
        DELETE: 'Permissions.QualitasFoundation.Organizations.Delete',
      },
      ORGANIZATION_UNITS: {
        VIEW: 'Permissions.QualitasFoundation.OrganizationUnits.View',
        CREATE: 'Permissions.QualitasFoundation.OrganizationUnits.Create',
        UPDATE: 'Permissions.QualitasFoundation.OrganizationUnits.Update',
        DELETE: 'Permissions.QualitasFoundation.OrganizationUnits.Delete',
      },
    },
    COMPLIANCE: {
      MARCOS_NORMATIVOS: {
        VIEW: 'Permissions.QualitasCompliance.MarcosNormativos.View',
        CREATE: 'Permissions.QualitasCompliance.MarcosNormativos.Create',
        UPDATE: 'Permissions.QualitasCompliance.MarcosNormativos.Update',
        DELETE: 'Permissions.QualitasCompliance.MarcosNormativos.Delete',
      },
      CLAUSULAS_REQUISITOS: {
        VIEW: 'Permissions.QualitasCompliance.ClausulasRequisitos.View',
        CREATE: 'Permissions.QualitasCompliance.ClausulasRequisitos.Create',
        UPDATE: 'Permissions.QualitasCompliance.ClausulasRequisitos.Update',
        DELETE: 'Permissions.QualitasCompliance.ClausulasRequisitos.Delete',
      },
      CRITERIOS_CUMPLIMIENTO: {
        VIEW: 'Permissions.QualitasCompliance.CriteriosCumplimiento.View',
        CREATE: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Create',
        UPDATE: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Update',
        DELETE: 'Permissions.QualitasCompliance.CriteriosCumplimiento.Delete',
      },
    },
  },
} as const;

// Queries Keys

// Others
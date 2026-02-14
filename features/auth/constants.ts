/**
 * Permission Constants - Type-safe permission strings
 * Use these constants instead of hardcoded strings to prevent typos
 */
export const PERMISSIONS = {
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
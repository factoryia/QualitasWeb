/**
 * Estructura de permisos para el editor de roles.
 * Agrupa permisos por categoría (PT-XX + nombre) para mostrar en el panel de permisos del rol.
 * Los "code" deben coincidir con los que devuelve/acepta el backend (RoleDto.permissions, updateRolePermissions).
 */
import {
  QualitasFoundationPermissions,
  QualitasCompliancePermissions,
  QualitasOperationsPermissions,
} from "@/features/shared/constants/permissions";

export interface PermissionItem {
  code: string;
  name: string;
}

export interface PermissionGroup {
  moduleCode: string;
  moduleName: string;
  permissions: PermissionItem[];
}

function flattenPermissions(
  moduleCode: string,
  moduleName: string,
  obj: Record<string, Record<string, string>>,
  nameMap: Record<string, string>
): PermissionGroup {
  const permissions: PermissionItem[] = [];
  for (const [entity, perms] of Object.entries(obj)) {
    for (const [action, code] of Object.entries(perms)) {
      const key = `${entity}.${action}`;
      const label = nameMap[key] ?? `${entity} ${action}`;
      permissions.push({ code, name: label });
    }
  }
  return { moduleCode, moduleName, permissions };
}

const foundationLabels: Record<string, string> = {
  "Organizations.View": "Ver Organizaciones",
  "Organizations.Create": "Crear Organizaciones",
  "Organizations.Update": "Editar Organizaciones",
  "Organizations.Delete": "Eliminar Organizaciones",
  "OrganizationUnits.View": "Ver Unidades",
  "OrganizationUnits.Create": "Crear Unidades",
  "OrganizationUnits.Update": "Editar Unidades",
  "OrganizationUnits.Delete": "Eliminar Unidades",
};

const complianceLabels: Record<string, string> = {
  "MarcosNormativos.View": "Ver Marcos Normativos",
  "MarcosNormativos.Create": "Crear Marcos Normativos",
  "MarcosNormativos.Update": "Editar Marcos Normativos",
  "MarcosNormativos.Delete": "Eliminar Marcos Normativos",
  "ClausulasRequisitos.View": "Ver Cláusulas y Requisitos",
  "ClausulasRequisitos.Create": "Crear Cláusulas y Requisitos",
  "ClausulasRequisitos.Update": "Editar Cláusulas y Requisitos",
  "ClausulasRequisitos.Delete": "Eliminar Cláusulas y Requisitos",
  "CriteriosCumplimiento.View": "Ver Criterios de Cumplimiento",
  "CriteriosCumplimiento.Create": "Crear Criterios de Cumplimiento",
  "CriteriosCumplimiento.Update": "Editar Criterios de Cumplimiento",
  "CriteriosCumplimiento.Delete": "Eliminar Criterios de Cumplimiento",
};

const operationsLabels: Record<string, string> = {
  "Processes.View": "Ver Mapa de Procesos",
  "Processes.Create": "Crear Procesos",
  "Processes.Update": "Editar Procesos",
  "Processes.Delete": "Eliminar Procesos",
  "ProcessActivities.View": "Ver Actividades",
  "ProcessActivities.Create": "Crear Actividades",
  "ProcessActivities.Update": "Editar Actividades",
  "ProcessActivities.Delete": "Eliminar Actividades",
  "ProcessIndicators.View": "Ver Indicadores",
  "ProcessIndicators.Create": "Crear Indicadores",
  "ProcessIndicators.Update": "Editar Indicadores",
  "ProcessIndicators.Delete": "Eliminar Indicadores",
};

/** Grupos de permisos para el editor de roles (categorías PT-XX + ítems con nombre legible) */
export const ROLE_PERMISSION_GROUPS: PermissionGroup[] = [
  flattenPermissions(
    "PT-01",
    "Núcleo del Sistema",
    QualitasFoundationPermissions as unknown as Record<string, Record<string, string>>,
    foundationLabels
  ),
  flattenPermissions(
    "PT-02",
    "Cumplimiento",
    QualitasCompliancePermissions as unknown as Record<string, Record<string, string>>,
    complianceLabels
  ),
  flattenPermissions(
    "PT-03",
    "Gestión por Procesos",
    QualitasOperationsPermissions as unknown as Record<string, Record<string, string>>,
    operationsLabels
  ),
];

/** Todos los códigos de permiso conocidos (para mostrar permisos “otros” si el backend devuelve más) */
export const ALL_PERMISSION_CODES = ROLE_PERMISSION_GROUPS.flatMap((g) =>
  g.permissions.map((p) => p.code)
);

/** Proceso — coincide con ProcessDto del backend */
export type ProcessDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  processTypeId: string;
  processTypeName: string;
  owner: string | null;
  isActive: boolean;
  organizationUnitId: string | null;
  processLeaderId: string | null;
  processObjective: string | null;
  processScope: string | null;
  processStatusId: string | null;
  processStatusName: string | null;
  processVersion: string;
  riskLevel: string;
  requiresAudit: boolean;
  processStartDate: string | null;
  lastReviewDate: string | null;
  nextReviewDate: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Tipo de proceso — incluye style fields agregados en backend Iter 1 */
export type ProcessTypeDto = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  order: number;
  isActive: boolean;
  color: string | null;
  icon: string | null;
  layoutHint: string | null;
  processCount: number;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Actividad de proceso */
export type ProcessActivityDto = {
  id: string;
  processId: string;
  code: string;
  name: string;
  description: string | null;
  parentActivityId: string | null;
  level: number;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Indicador de proceso */
export type ProcessIndicatorDto = {
  id: string;
  processId: string;
  code: string;
  name: string;
  description: string | null;
  indicatorType: string;
  unit: string | null;
  targetGoal: number | null;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Estado de proceso (catálogo) */
export type ProcessStatusDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  colorHex: string;
  displayOrder: number;
  isActive: boolean;
};

/** Recurso de proceso */
export type ProcessResourceDto = {
  id: string;
  processId: string;
  resourceTypeId: string;
  resourceTypeName: string | null;
  resourceTypeIcon: string | null;
  name: string;
  quantity: number;
  description: string | null;
  specification: string | null;
  isActive: boolean;
};

/** Cláusula de requisito vinculada a proceso */
export type ProcessRequirementClauseDto = {
  id: string;
  processId: string;
  processName: string | null;
  processCode: string | null;
  requirementClauseId: string;
  complianceStatus: string;
  compliancePercentage: number;
  evidenceDescription: string | null;
  notes: string | null;
  isActive: boolean;
  createdOnUtc: string;
};

/** Versión vigente de documento (SGD) */
export type DocumentVersionDto = {
  id: string;
  documentId: string;
  versionNumber: number;
  versionLabel: string | null;
  changeDescription: string;
  documentStatusId: string;
  documentStatusCode: string | null;
  isCurrentVersion: boolean;
  storageUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
  fileMimeType: string | null;
  createdOnUtc: string;
};

/** Documento del SGD (metadatos; binario vía storage en otra iteración) */
export type DocumentDto = {
  id: string;
  documentTypeId: string;
  code: string;
  title: string;
  description: string | null;
  ownerProcessId: string | null;
  documentOwnerId: string | null;
  storagePath: string | null;
  isControlled: boolean;
  isExternal: boolean;
  isActive: boolean;
  currentVersion: DocumentVersionDto | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Rol del documento respecto al proceso (entrada/salida…) */
export type ProcessDocumentRoleDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Vínculo proceso ↔ documento */
export type ProcessDocumentDto = {
  id: string;
  processId: string;
  documentId: string;
  processDocumentRoleId: string;
  isMandatory: boolean;
  sequence: number | null;
  notes: string | null;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

// ===== Requests =====

export type CreateProcessRequest = {
  code: string;
  name: string;
  processTypeId: string;
  description?: string | null;
  owner?: string | null;
  organizationUnitId?: string | null;
  processLeaderId?: string | null;
  processObjective?: string | null;
  processScope?: string | null;
  processStatusId?: string | null;
  processVersion?: string | null;
  riskLevel?: string | null;
  requiresAudit?: boolean;
  processStartDate?: string | null;
};

export type UpdateProcessRequest = CreateProcessRequest & {
  lastReviewDate?: string | null;
  nextReviewDate?: string | null;
};

export type CreateProcessTypeRequest = {
  code: string;
  name: string;
  order: number;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  layoutHint?: string | null;
};

export type UpdateProcessTypeRequest = CreateProcessTypeRequest & {
  isActive?: boolean;
};

export type ApplyProcessTypePresetRequest = {
  preset: "iso_9001" | "mipg" | "custom";
};

export type CreateProcessActivityRequest = {
  processId: string;
  code: string;
  name: string;
  parentActivityId?: string | null;
  description?: string | null;
  phvaPhaseId?: string | null;
  input?: string | null;
};

export type UpdateProcessActivityRequest = {
  code: string;
  name: string;
  description?: string | null;
  parentActivityId?: string | null;
  phvaPhaseId?: string | null;
  input?: string | null;
};

export type CreateProcessIndicatorRequest = {
  processId: string;
  code: string;
  name: string;
  indicatorType: string;
  description?: string | null;
  unit?: string | null;
  targetGoal?: number | null;
};

export type UpdateProcessIndicatorRequest = {
  code: string;
  name: string;
  indicatorType: string;
  description?: string | null;
  unit?: string | null;
  targetGoal?: number | null;
};

export type CreateProcessDocumentRequest = {
  processId: string;
  documentId: string;
  processDocumentRoleId: string;
  isMandatory?: boolean;
  sequence?: number | null;
  notes?: string | null;
};

export type UpdateProcessDocumentRequest = {
  isMandatory: boolean;
  sequence?: number | null;
  notes?: string | null;
};

// ===== Visual styles (legacy fallback) =====

export const PROCESS_TYPE_STYLES: Record<
  string,
  { border: string; bg: string; title: string; badgeBg: string }
> = {
  EST: {
    border: "border-violet-300",
    bg: "bg-white dark:bg-card",
    title: "PROCESOS ESTRATÉGICOS",
    badgeBg: "bg-violet-100 text-violet-800 dark:bg-violet-900/30 dark:text-violet-300",
  },
  MIS: {
    border: "border-blue-300",
    bg: "bg-blue-50/80 dark:bg-blue-950/20",
    title: "PROCESOS MISIONALES",
    badgeBg: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  },
  SOP: {
    border: "border-amber-300",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    title: "PROCESOS DE SOPORTE",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  APO: {
    border: "border-amber-300",
    bg: "bg-amber-50/80 dark:bg-amber-950/20",
    title: "PROCESOS DE APOYO",
    badgeBg: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  },
  EVA: {
    border: "border-emerald-300",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/20",
    title: "PROCESOS DE EVALUACIÓN",
    badgeBg: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  },
  MEJ: {
    border: "border-sky-300",
    bg: "bg-sky-50/80 dark:bg-sky-950/20",
    title: "PROCESOS DE MEJORA",
    badgeBg: "bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300",
  },
};

export const DEFAULT_PROCESS_TYPE_STYLE = {
  border: "border-slate-300",
  bg: "bg-slate-50/80 dark:bg-slate-950/20",
  title: "OTROS PROCESOS",
  badgeBg: "bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300",
};

export function getProcessTypeStyle(code: string) {
  return PROCESS_TYPE_STYLES[code] ?? DEFAULT_PROCESS_TYPE_STYLE;
}

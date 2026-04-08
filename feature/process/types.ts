/** Proceso - coincide con ProcessDto del backend */
export type ProcessDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  processType: string;
  owner: string | null;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

/** Actividad de proceso - para "Activo X proc." */
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

/** Tipos de proceso para agrupar en el mapa */
export const PROCESS_TYPE_LABELS: Record<string, string> = {
  Estrategico: "Estratégico",
  Misional: "Misional",
  Apoyo: "Apoyo",
  Evaluacion: "Evaluación",
} as const;

export type ProcessTypeKey = keyof typeof PROCESS_TYPE_LABELS;

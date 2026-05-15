import type {
  CatalogStatusDto,
  GoalTrendDto,
} from "@/feature/planning/api/dofa";

// ---------------------------------------------------------------------------
// Status configs — mapping CODE → label español + color tone
// Uses the NEW PascalCase seed; ignores legacy UPPERCASE (PM-13)
// ---------------------------------------------------------------------------

export const OBJECTIVE_STATUS_CFG: Record<
  string,
  { label: string; tone: string; dotClass: string }
> = {
  Planned: { label: "Planificado", tone: "neutral", dotClass: "bg-slate-400" },
  Active: { label: "Activo", tone: "primary", dotClass: "bg-sky-500" },
  InProgress: { label: "En Progreso", tone: "medium", dotClass: "bg-amber-500" },
  Achieved: { label: "Logrado", tone: "low", dotClass: "bg-emerald-500" },
  OnHold: { label: "En Espera", tone: "primary", dotClass: "bg-violet-500" },
  Cancelled: { label: "Cancelado", tone: "high", dotClass: "bg-rose-500" },
};

export const GOAL_STATUS_CFG: Record<
  string,
  { label: string; tone: string; dotClass: string }
> = {
  Defined: { label: "Definida", tone: "neutral", dotClass: "bg-slate-400" },
  InProgress: { label: "En Progreso", tone: "medium", dotClass: "bg-amber-500" },
  Achieved: { label: "Lograda", tone: "low", dotClass: "bg-emerald-500" },
  NotAchieved: { label: "No Lograda", tone: "high", dotClass: "bg-rose-500" },
  OnHold: { label: "En Espera", tone: "primary", dotClass: "bg-violet-500" },
};

// ---------------------------------------------------------------------------
// Lookup helpers (PM-18: backend does NOT return *Name pre-calculated)
// ---------------------------------------------------------------------------

export function lookupCatalogName<T extends { id: string; name: string }>(
  id: string | null | undefined,
  catalog: T[],
  fallback = "—",
): string {
  if (!id) return fallback;
  return catalog.find((c) => c.id === id)?.name ?? fallback;
}

export function lookupStatusCode(
  statusId: string | null | undefined,
  catalog: CatalogStatusDto[],
  defaultCode = "Planned",
): string {
  if (!statusId) return defaultCode;
  return catalog.find((s) => s.id === statusId)?.code ?? defaultCode;
}

export function lookupTrendSymbol(
  trendId: string | null | undefined,
  trends: GoalTrendDto[],
): string | null {
  if (!trendId) return null;
  return trends.find((t) => t.id === trendId)?.symbol ?? null;
}

// ---------------------------------------------------------------------------
// Goal defaults (from Leandro's analysis)
// ---------------------------------------------------------------------------

export const GOAL_DEFAULTS = {
  weight: 50,
  currentValue: 0,
  baselineValue: 0,
} as const;

// ---------------------------------------------------------------------------
// Default status helpers — find UUID of the NEW PascalCase seed entry
// ---------------------------------------------------------------------------

export function findDefaultObjectiveStatusId(
  catalog: CatalogStatusDto[],
): string | null {
  return catalog.find((s) => s.code === "Planned")?.id ?? null;
}

export function findDefaultGoalStatusId(
  catalog: CatalogStatusDto[],
): string | null {
  return catalog.find((s) => s.code === "Defined")?.id ?? null;
}

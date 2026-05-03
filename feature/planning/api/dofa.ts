import { api } from "@/lib/axios";
import toast from "react-hot-toast";

// ---------------------------------------------------------------------------
// BSC Perspectives
// ---------------------------------------------------------------------------

export interface BscPerspectiveDto {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order: number;
}

export interface CreateBscPerspectiveCommand {
  code: string;
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

export interface UpdateBscPerspectiveCommand {
  name: string;
  description?: string | null;
  color?: string | null;
  icon?: string | null;
  order?: number;
}

// ---------------------------------------------------------------------------
// Strategy Types
// ---------------------------------------------------------------------------

export interface StrategyTypeDto {
  id: string;
  code: string;
  name: string;
}

/** Alias used by strategy-types-helpers.ts */
export type StrategyType = StrategyTypeDto;

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

export interface StrategyDto {
  id: string;
  title: string;
  description?: string | null;
  dofaAnalysisId: string;
  strategicTypeId: string;
  status: string;
  progressPercentage: number;
  responsibleId?: string | null;
  version?: number;
  createdOnUtc?: string | null;
  createdBy?: string | null;
  lastModifiedOnUtc?: string | null;
  lastModifiedBy?: string | null;
}

export interface CreateStrategyCommand {
  title: string;
  description?: string | null;
  dofaAnalysisId: string;
  strategicTypeId: string;
  responsibleId?: string | null;
  // NOTE: do NOT send `status` — backend ignores it (PM-05)
}

export interface UpdateStrategyCommand {
  id: string;
  title: string;
  description?: string | null;
  responsibleId?: string | null;
  // NOTE: do NOT send `status`, `dofaAnalysisId`, or `strategicTypeId` (PM-05)
}

export interface ListStrategiesFilters {
  dofaAnalysisId?: string;
  strategicType?: string;
  status?: string;
  responsibleId?: string;
}

export interface StrategyDofaItemLinkDto {
  id: string;
  strategyId: string;
  dofaItemId: string;
  contributionPercentage: number;
  category?: string | null;
  description?: string | null;
  perspectiveName?: string | null;
}

export interface LinkStrategyDofaItemCommand {
  dofaItemId: string;
  contributionPercentage: number;
}

export interface UpdateStrategyDofaItemLinkCommand {
  contributionPercentage: number;
}

export interface LinkStrategyObjectiveCommand {
  objectiveId: string;
  description?: string | null;
}

export interface UpdateStrategyObjectiveLinkCommand {
  description?: string | null;
}

// ---------------------------------------------------------------------------
// Catalogue types (shared shape for all status/frequency/type catalogues)
// ---------------------------------------------------------------------------

export interface CatalogStatusDto {
  id: string;
  code: string;
  name: string;
  colorHex?: string;
  displayOrder?: number;
  isActive: boolean;
}

export interface IndicatorTypeDto extends CatalogStatusDto {
  description?: string;
}

export interface GoalTrendDto extends CatalogStatusDto {
  /** Unicode symbol: ↑ → ↓ */
  symbol: string;
}

// ---------------------------------------------------------------------------
// Objective Statuses (catalogue)
// ---------------------------------------------------------------------------

/** @deprecated Use CatalogStatusDto — kept for backwards-compat with Sprint 2 */
export interface ObjectiveStatusDto {
  id: string;
  code: string;
  name: string;
}

/** Goal statuses catalogue (same dual-seed issue as objective-statuses — PM-13) */
export type GoalStatusDto = CatalogStatusDto;

// ---------------------------------------------------------------------------
// Objectives
// ---------------------------------------------------------------------------

export interface ObjectiveDto {
  id: string;
  name: string;
  description: string | null;
  analysisId: string | null;
  statusId: string;
  startDate: string;
  endDate: string;
  progressPercentage: number;
  responsibleId: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
}

export interface CreateObjectiveCommand {
  name: string;
  description: string | null;
  statusId: string;
  startDate: string;
  endDate: string;
  responsibleId: string | null;
  /** Optional link to a DOFA analysis (PM-15: client-side filter by analysisId) */
  analysisId: string | null;
}

/** Alias used by Sprint 3+ components */
export type CreateObjectivePayload = CreateObjectiveCommand;

export interface UpdateObjectivePayload {
  id: string;
  name: string;
  description: string | null;
  responsibleId: string | null;
}

export interface UpdateObjectiveCommand {
  id: string;
  name: string;
  description: string | null;
  responsibleId: string | null;
}

export interface ListObjectivesFilters {
  status?: string;
  responsibleId?: string;
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export interface GoalDto {
  id: string;
  description: string;
  objectiveId: string;
  targetValue: number;
  currentValue: number;
  baselineValue: number;
  unit: string | null;
  weight: number;
  deadline: string;
  statusId: string;
  responsibleId: string | null;
  progressPercentage: number;
  createdOnUtc: string;
  createdBy: string | null;
}

/** Alias used by Sprint 3+ components */
export type CreateGoalPayload = CreateGoalCommand;

export interface CreateGoalCommand {
  description: string;
  objectiveId: string;
  targetValue: number;
  currentValue: number;
  baselineValue: number;
  unit: string | null;
  weight: number;
  deadline: string;
  statusId: string;
  responsibleId: string | null;
}

export interface UpdateGoalCommand {
  id: string;
  description: string;
  targetValue: number;
  currentValue: number;
  baselineValue: number;
  unit: string | null;
  weight: number;
  deadline: string;
  statusId: string;
  responsibleId: string | null;
}

// ---------------------------------------------------------------------------
// Indicators (GoalIndicators)
// ---------------------------------------------------------------------------

export interface IndicatorDto {
  id: string;
  name: string;
  goalId: string;
  formula: string | null;
  frequencyId: string;
  trendId: string | null;
  indicatorTypeId: string;
  dataSource: string | null;
  responsibleId: string | null;
  /** null in LIST responses; populated array in single GET (PM-14) */
  measurements: MeasurementDto[] | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
}

export interface CreateIndicatorCommand {
  name: string;
  /** NOTE: do NOT include goalId here — it comes from the path param */
  frequencyId: string;
  indicatorTypeId: string;
  trendId: string | null;
  formula: string | null;
  dataSource: string | null;
  responsibleId: string | null;
}

/** Alias used by Sprint 3+ components */
export type CreateIndicatorPayload = CreateIndicatorCommand;

export interface UpdateIndicatorCommand {
  name: string;
  formula: string | null;
  frequencyId: string;
  trendId: string | null;
  indicatorTypeId: string;
  dataSource: string | null;
  responsibleId: string | null;
}

// ---------------------------------------------------------------------------
// Measurements
// ---------------------------------------------------------------------------

/** Backend has no GET list endpoint for measurements (PM-14). Read via getIndicatorDetail. */
export interface MeasurementDto {
  id: string;
  goalIndicatorId: string;
  measurementDate: string;
  value: number;
  observations: string | null;
  evidenceUrl: string | null;
  /** FK to user who recorded the measurement (PM-20: verify backend assigns from JWT) */
  measuredBy: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
}

export interface CreateMeasurementCommand {
  value: number;
  measurementDate: string;
  /** PM-19: redundant with path param indicatorId but required by backend */
  goalIndicatorId: string;
  observations: string | null;
  evidenceUrl: string | null;
}

/** Alias used by Sprint 3+ components */
export type CreateMeasurementPayload = CreateMeasurementCommand;

export interface UpdateMeasurementCommand {
  value: number;
  observations: string | null;
  evidenceUrl: string | null;
}

// ---------------------------------------------------------------------------
// Stakeholder–DOFA Links
// ---------------------------------------------------------------------------

export interface StakeholderDofaLinkDto {
  id: string;
  stakeholderId: string;
  dofaAnalysisId: string;
  influenceType: string;
  relevantDofaCategories?: string | null;
  expectationsMapping?: string | null;
  isActive: boolean;
}

export interface CreateStakeholderDofaLinkCommand {
  stakeholderId: string;
  dofaAnalysisId: string;
  influenceType: string;
  relevantDofaCategories?: string | null;
  expectationsMapping?: string | null;
}

export interface UpdateStakeholderDofaLinkCommand {
  influenceType: string;
  relevantDofaCategories?: string | null;
  expectationsMapping?: string | null;
}

// ---------------------------------------------------------------------------
// Update DOFA Analysis
// ---------------------------------------------------------------------------

export interface UpdateDofaAnalysisCommand {
  title: string;
  description?: string | null;
  period?: string | null;
  status?: string | null;
}

export const DEFAULT_DOFA_PERSPECTIVES = [
  "Financiero",
  "Cliente",
  "ProcesosInternos",
  "AprendizajeYCrecimiento",
  "CruceEstrategico",
] as const;

export const DEFAULT_DOFA_CATEGORIES = [
  "Fortaleza",
  "Debilidad",
  "Oportunidad",
  "Amenaza",
] as const;

export const DEFAULT_DOFA_PRIORITIES = ["Alta", "Media", "Baja"] as const;

export const DEFAULT_DOFA_IMPACT_LEVELS = ["Alto", "Medio", "Bajo"] as const;

export type DofaPerspective = string;
export type DofaCategory = string;
export type DofaPriority = string;
export type DofaImpactLevel = string;

export interface DofaAnalysisListDto {
  id: string;
  title: string;
  description?: string | null;
  analysisDate?: string | null;
  period?: string | null;
  version?: string | null;
  status?: string | null;
  entityType?: string | null;
  entityId?: string | null;
}

export interface DofaItemDto {
  id: string;
  bscPerspectiveId?: string;
  perspective: DofaPerspective;
  category: DofaCategory;
  description: string;
  priority: DofaPriority;
  impactLevel?: DofaImpactLevel | null;
  order: number;
  isActive: boolean;
  responsibleId?: string | null;
}

export interface DofaAnalysisDto {
  id: string;
  title: string;
  description?: string | null;
  analysisDate?: string | null;
  period?: string | null;
  version?: string | null;
  status?: string | null;
  entityType?: string | null;
  entityId?: string | null;
  items: DofaItemDto[];
}

export interface CreateDofaAnalysisCommand {
  title: string;
  entityType: string;
  entityId: string;
  description?: string | null;
  period?: string | null;
  responsibleId?: string | null;
}

export interface CreateDofaItemCommand {
  bscPerspectiveId: string;
  category: DofaCategory;
  description: string;
  order: number;
  responsibleId?: string | null;
}

export interface UpdateDofaItemCommand {
  bscPerspectiveId: string;
  category: DofaCategory;
  description: string;
  order: number;
  responsibleId?: string | null;
  isActive?: boolean;
}

const BASE = "/api/v1/qualitas/strategic/dofa";

function extractArray<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  if (data && typeof data === "object") {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) return items as T[];
  }
  return [];
}

export async function listDofaAnalyses(): Promise<DofaAnalysisListDto[]> {
  try {
    const { data } = await api.get<unknown>(BASE);
    return extractArray<DofaAnalysisListDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching DOFA analyses:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los análisis DOFA",
    );
    return [];
  }
}

export async function createDofaAnalysis(
  payload: CreateDofaAnalysisCommand,
): Promise<{ id: string } | null> {
  try {
    const { data } = await api.post<{ id: string }>(BASE, payload);
    toast.success("Análisis DOFA creado");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el análisis DOFA",
    );
    return null;
  }
}

export async function getDofaAnalysisById(
  analysisId: string,
): Promise<DofaAnalysisDto | null> {
  try {
    const { data } = await api.get<DofaAnalysisDto>(`${BASE}/${analysisId}`);
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error fetching DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar el análisis DOFA",
    );
    return null;
  }
}

export async function deleteDofaAnalysis(analysisId: string): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${analysisId}`);
    toast.success("Análisis DOFA eliminado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar el análisis DOFA",
    );
    return false;
  }
}

export async function createDofaItem(
  analysisId: string,
  payload: CreateDofaItemCommand,
): Promise<{ id: string } | null> {
  try {
    const { data } = await api.post<{ id: string }>(
      `${BASE}/${analysisId}/items`,
      payload,
    );
    toast.success("Ítem DOFA creado");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating DOFA item — payload sent:", payload, error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el ítem DOFA",
    );
    return null;
  }
}

export async function updateDofaItem(
  analysisId: string,
  itemId: string,
  payload: UpdateDofaItemCommand,
): Promise<boolean> {
  try {
    await api.put(`${BASE}/${analysisId}/items/${itemId}`, payload);
    toast.success("Ítem DOFA actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating DOFA item — payload sent:", payload, error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el ítem DOFA",
    );
    return false;
  }
}

export async function deactivateDofaItem(
  analysisId: string,
  itemId: string,
): Promise<boolean> {
  try {
    await api.delete(`${BASE}/${analysisId}/items/${itemId}`);
    toast.success("Ítem DOFA desactivado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deactivating DOFA item:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al desactivar el ítem DOFA",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Update DOFA Analysis
// ---------------------------------------------------------------------------

export async function updateDofaAnalysis(
  analysisId: string,
  payload: UpdateDofaAnalysisCommand,
): Promise<boolean> {
  try {
    await api.put(`${BASE}/${analysisId}`, payload);
    toast.success("Análisis DOFA actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating DOFA analysis:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el análisis DOFA",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// BSC Perspectives
// ---------------------------------------------------------------------------

const BSC_BASE = "/api/v1/qualitas/strategic/bsc-perspectives";

export async function listBscPerspectives(
  includeInactive = false,
): Promise<BscPerspectiveDto[]> {
  try {
    const { data } = await api.get<unknown>(BSC_BASE, {
      params: { includeInactive },
    });
    return extractArray<BscPerspectiveDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching BSC perspectives:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar las perspectivas BSC",
    );
    return [];
  }
}

export async function createBscPerspective(
  payload: CreateBscPerspectiveCommand,
): Promise<{ id: string } | null> {
  try {
    const { data } = await api.post<{ id: string }>(BSC_BASE, payload);
    toast.success("Perspectiva BSC creada");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating BSC perspective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear la perspectiva BSC",
    );
    return null;
  }
}

export async function updateBscPerspective(
  perspectiveId: string,
  payload: UpdateBscPerspectiveCommand,
): Promise<boolean> {
  try {
    await api.put(`${BSC_BASE}/${perspectiveId}`, payload);
    toast.success("Perspectiva BSC actualizada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating BSC perspective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar la perspectiva BSC",
    );
    return false;
  }
}

export async function deleteBscPerspective(perspectiveId: string): Promise<boolean> {
  try {
    await api.delete(`${BSC_BASE}/${perspectiveId}`);
    toast.success("Perspectiva BSC eliminada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting BSC perspective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar la perspectiva BSC",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Strategy Types (catalogue)
// ---------------------------------------------------------------------------

const STRATEGY_TYPES_BASE = "/api/v1/qualitas/strategic/strategy-types";

export async function listStrategyTypes(): Promise<StrategyTypeDto[]> {
  try {
    const { data } = await api.get<unknown>(STRATEGY_TYPES_BASE);
    return extractArray<StrategyTypeDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching strategy types:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los tipos de estrategia",
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Objective Statuses (catalogue)
// ---------------------------------------------------------------------------

const OBJECTIVE_STATUSES_BASE = "/api/v1/qualitas/strategic/objective-statuses";

export async function listObjectiveStatuses(): Promise<ObjectiveStatusDto[]> {
  try {
    const { data } = await api.get<unknown>(OBJECTIVE_STATUSES_BASE);
    return extractArray<ObjectiveStatusDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching objective statuses:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los estados de objetivos",
    );
    return [];
  }
}

const GOAL_STATUSES_BASE = "/api/v1/qualitas/strategic/goal-statuses";

/** PM-13: returns 9 values with dual seed — prefer PascalCase codes (Defined/InProgress/…) */
export async function listGoalStatuses(): Promise<GoalStatusDto[]> {
  try {
    const { data } = await api.get<unknown>(GOAL_STATUSES_BASE);
    return extractArray<GoalStatusDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching goal statuses:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los estados de metas",
    );
    return [];
  }
}

const GOAL_FREQUENCIES_BASE = "/api/v1/qualitas/strategic/goal-frequencies";

export async function listGoalFrequencies(): Promise<CatalogStatusDto[]> {
  try {
    const { data } = await api.get<unknown>(GOAL_FREQUENCIES_BASE);
    return extractArray<CatalogStatusDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching goal frequencies:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar las frecuencias",
    );
    return [];
  }
}

const GOAL_TRENDS_BASE = "/api/v1/qualitas/strategic/goal-trends";

export async function listGoalTrends(): Promise<GoalTrendDto[]> {
  try {
    const { data } = await api.get<unknown>(GOAL_TRENDS_BASE);
    return extractArray<GoalTrendDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching goal trends:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar las tendencias",
    );
    return [];
  }
}

const INDICATOR_TYPES_BASE = "/api/v1/qualitas/strategic/indicator-types";

export async function listIndicatorTypes(): Promise<IndicatorTypeDto[]> {
  try {
    const { data } = await api.get<unknown>(INDICATOR_TYPES_BASE);
    return extractArray<IndicatorTypeDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching indicator types:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los tipos de indicador",
    );
    return [];
  }
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

const STRATEGIES_BASE = "/api/v1/qualitas/strategic/strategies";

export async function listStrategies(
  filters?: ListStrategiesFilters,
): Promise<StrategyDto[]> {
  try {
    const { data } = await api.get<unknown>(STRATEGIES_BASE, {
      params: filters,
    });
    return extractArray<StrategyDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching strategies:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar las estrategias",
    );
    return [];
  }
}

export async function getStrategyById(
  strategyId: string,
): Promise<StrategyDto | null> {
  try {
    const { data } = await api.get<StrategyDto>(`${STRATEGIES_BASE}/${strategyId}`);
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error fetching strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar la estrategia",
    );
    return null;
  }
}

export async function createStrategy(
  payload: CreateStrategyCommand,
): Promise<StrategyDto | null> {
  try {
    const { data } = await api.post<StrategyDto>(STRATEGIES_BASE, payload);
    toast.success("Estrategia creada");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear la estrategia",
    );
    return null;
  }
}

export async function updateStrategy(
  strategyId: string,
  payload: UpdateStrategyCommand,
): Promise<boolean> {
  try {
    await api.put(`${STRATEGIES_BASE}/${strategyId}`, payload);
    toast.success("Estrategia actualizada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar la estrategia",
    );
    return false;
  }
}

export async function deleteStrategy(strategyId: string): Promise<boolean> {
  try {
    await api.delete(`${STRATEGIES_BASE}/${strategyId}`);
    toast.success("Estrategia eliminada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar la estrategia",
    );
    return false;
  }
}

export async function listStrategyDofaItems(
  strategyId: string,
): Promise<StrategyDofaItemLinkDto[]> {
  try {
    const { data } = await api.get<unknown>(
      `${STRATEGIES_BASE}/${strategyId}/dofa-items`,
    );
    return extractArray<StrategyDofaItemLinkDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching strategy DOFA items:", error);
    return [];
  }
}

export async function linkDofaItemToStrategy(
  strategyId: string,
  dofaItemId: string,
  payload?: LinkStrategyDofaItemCommand,
): Promise<boolean> {
  const body: LinkStrategyDofaItemCommand = payload ?? {
    dofaItemId,
    contributionPercentage: 100,
  };
  try {
    await api.post(`${STRATEGIES_BASE}/${strategyId}/dofa-items/${dofaItemId}`, body);
    toast.success("Factor DOFA vinculado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error linking DOFA item to strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al vincular el factor DOFA",
    );
    return false;
  }
}

export async function updateStrategyDofaItemLink(
  strategyId: string,
  linkId: string,
  payload: UpdateStrategyDofaItemLinkCommand,
): Promise<boolean> {
  try {
    await api.put(`${STRATEGIES_BASE}/${strategyId}/dofa-items/${linkId}`, payload);
    toast.success("Vínculo de factor actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating strategy DOFA item link:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el vínculo de factor DOFA",
    );
    return false;
  }
}

export async function unlinkDofaItemFromStrategy(
  strategyId: string,
  linkId: string,
): Promise<boolean> {
  try {
    await api.delete(`${STRATEGIES_BASE}/${strategyId}/dofa-items/${linkId}`);
    toast.success("Factor DOFA desvinculado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error unlinking DOFA item from strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al desvincular el factor DOFA",
    );
    return false;
  }
}

export async function listStrategyObjectives(strategyId: string): Promise<ObjectiveDto[]> {
  try {
    const { data } = await api.get<unknown>(
      `${STRATEGIES_BASE}/${strategyId}/objectives`,
    );
    return extractArray<ObjectiveDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching strategy objectives:", error);
    return [];
  }
}

export async function linkObjectiveToStrategy(
  strategyId: string,
  objectiveId: string,
  payload?: LinkStrategyObjectiveCommand,
): Promise<boolean> {
  const body: LinkStrategyObjectiveCommand = payload ?? {
    objectiveId,
    description: null,
  };
  try {
    await api.post(`${STRATEGIES_BASE}/${strategyId}/objectives/${objectiveId}`, body);
    toast.success("Objetivo vinculado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error linking objective to strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al vincular el objetivo",
    );
    return false;
  }
}

export async function updateStrategyObjectiveLink(
  strategyId: string,
  linkId: string,
  payload: UpdateStrategyObjectiveLinkCommand,
): Promise<boolean> {
  try {
    await api.put(`${STRATEGIES_BASE}/${strategyId}/objectives/${linkId}`, payload);
    toast.success("Vínculo de objetivo actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating strategy objective link:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el vínculo de objetivo",
    );
    return false;
  }
}

export async function unlinkObjectiveFromStrategy(
  strategyId: string,
  linkId: string,
): Promise<boolean> {
  try {
    await api.delete(`${STRATEGIES_BASE}/${strategyId}/objectives/${linkId}`);
    toast.success("Objetivo desvinculado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error unlinking objective from strategy:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al desvincular el objetivo",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Objectives
// ---------------------------------------------------------------------------

const OBJECTIVES_BASE = "/api/v1/qualitas/strategic/objectives";

export async function listObjectives(
  filters?: ListObjectivesFilters,
): Promise<ObjectiveDto[]> {
  try {
    const { data } = await api.get<unknown>(OBJECTIVES_BASE, {
      params: filters,
    });
    return extractArray<ObjectiveDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching objectives:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los objetivos",
    );
    return [];
  }
}

export async function createObjective(
  payload: CreateObjectiveCommand,
): Promise<ObjectiveDto | null> {
  try {
    const { data } = await api.post<ObjectiveDto>(OBJECTIVES_BASE, payload);
    toast.success("Objetivo creado");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating objective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el objetivo",
    );
    return null;
  }
}

export async function updateObjective(
  objectiveId: string,
  payload: UpdateObjectiveCommand,
): Promise<boolean> {
  try {
    await api.put(`${OBJECTIVES_BASE}/${objectiveId}`, payload);
    toast.success("Objetivo actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating objective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el objetivo",
    );
    return false;
  }
}

export async function deleteObjective(objectiveId: string): Promise<boolean> {
  try {
    await api.delete(`${OBJECTIVES_BASE}/${objectiveId}`);
    toast.success("Objetivo eliminado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting objective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar el objetivo",
    );
    return false;
  }
}

export async function getObjective(objectiveId: string): Promise<ObjectiveDto | null> {
  try {
    const { data } = await api.get<ObjectiveDto>(`${OBJECTIVES_BASE}/${objectiveId}`);
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error fetching objective:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar el objetivo",
    );
    return null;
  }
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

const GOALS_BASE = "/api/v1/qualitas/strategic/goals";

export async function listGoals(): Promise<GoalDto[]> {
  try {
    const { data } = await api.get<unknown>(GOALS_BASE);
    return extractArray<GoalDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching goals:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar las metas",
    );
    return [];
  }
}

export async function createGoal(payload: CreateGoalCommand): Promise<GoalDto | null> {
  try {
    const { data } = await api.post<GoalDto>(GOALS_BASE, payload);
    toast.success("Meta creada");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating goal:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear la meta",
    );
    return null;
  }
}

export async function updateGoal(
  goalId: string,
  payload: UpdateGoalCommand,
): Promise<boolean> {
  try {
    await api.put(`${GOALS_BASE}/${goalId}`, payload);
    toast.success("Meta actualizada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating goal:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar la meta",
    );
    return false;
  }
}

export async function getGoal(goalId: string): Promise<GoalDto | null> {
  try {
    const { data } = await api.get<GoalDto>(`${GOALS_BASE}/${goalId}`);
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error fetching goal:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar la meta",
    );
    return null;
  }
}

export async function deleteGoal(goalId: string): Promise<boolean> {
  try {
    await api.delete(`${GOALS_BASE}/${goalId}`);
    toast.success("Meta eliminada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting goal:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar la meta",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export async function listIndicators(goalId: string): Promise<IndicatorDto[]> {
  try {
    const { data } = await api.get<unknown>(
      `${GOALS_BASE}/${goalId}/indicators`,
    );
    return extractArray<IndicatorDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching indicators:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los indicadores",
    );
    return [];
  }
}

export async function getIndicatorDetail(
  goalId: string,
  indicatorId: string,
): Promise<IndicatorDto | null> {
  try {
    const { data } = await api.get<IndicatorDto>(
      `${GOALS_BASE}/${goalId}/indicators/${indicatorId}`,
    );
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error fetching indicator detail:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar el indicador",
    );
    return null;
  }
}

export async function createIndicator(
  goalId: string,
  payload: CreateIndicatorCommand,
): Promise<IndicatorDto | null> {
  try {
    // PM-17: POST returns UUID raw string, not an object
    const { data: rawId } = await api.post<string>(
      `${GOALS_BASE}/${goalId}/indicators`,
      payload,
    );
    const newId = String(rawId).replace(/^"|"$/g, "");
    // Fetch the full object (single GET includes measurements: [])
    const { data } = await api.get<IndicatorDto>(
      `${GOALS_BASE}/${goalId}/indicators/${newId}`,
    );
    toast.success("Indicador creado");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating indicator:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el indicador",
    );
    return null;
  }
}

export async function updateIndicator(
  goalId: string,
  indicatorId: string,
  payload: UpdateIndicatorCommand,
): Promise<boolean> {
  try {
    await api.put(`${GOALS_BASE}/${goalId}/indicators/${indicatorId}`, payload);
    toast.success("Indicador actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating indicator:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el indicador",
    );
    return false;
  }
}

export async function deleteIndicator(
  goalId: string,
  indicatorId: string,
): Promise<boolean> {
  try {
    await api.delete(`${GOALS_BASE}/${goalId}/indicators/${indicatorId}`);
    toast.success("Indicador eliminado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting indicator:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar el indicador",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Measurements  (no GET list — backend gap; create/update/delete only)
// ---------------------------------------------------------------------------

const INDICATORS_BASE = "/api/v1/qualitas/strategic/indicators";

export async function createMeasurement(
  indicatorId: string,
  payload: CreateMeasurementCommand,
): Promise<string | null> {
  try {
    // PM-17: POST returns UUID raw string, not a MeasurementDto
    const { data: rawId } = await api.post<string>(
      `${INDICATORS_BASE}/${indicatorId}/measurements`,
      payload,
    );
    const newId = String(rawId).replace(/^"|"$/g, "");
    toast.success("Medición registrada");
    return newId;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating measurement:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al registrar la medición",
    );
    return null;
  }
}

export async function updateMeasurement(
  indicatorId: string,
  measurementId: string,
  payload: UpdateMeasurementCommand,
): Promise<boolean> {
  try {
    await api.put(
      `${INDICATORS_BASE}/${indicatorId}/measurements/${measurementId}`,
      payload,
    );
    toast.success("Medición actualizada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating measurement:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar la medición",
    );
    return false;
  }
}

export async function deleteMeasurement(
  indicatorId: string,
  measurementId: string,
): Promise<boolean> {
  try {
    await api.delete(
      `${INDICATORS_BASE}/${indicatorId}/measurements/${measurementId}`,
    );
    toast.success("Medición eliminada");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting measurement:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar la medición",
    );
    return false;
  }
}

// ---------------------------------------------------------------------------
// Stakeholder–DOFA Links
// ---------------------------------------------------------------------------

const STAKEHOLDER_DOFA_BASE = "/api/v1/qualitas/strategic/stakeholder-dofa-links";

export async function listStakeholderDofaLinks(): Promise<StakeholderDofaLinkDto[]> {
  try {
    const { data } = await api.get<unknown>(STAKEHOLDER_DOFA_BASE);
    return extractArray<StakeholderDofaLinkDto>(data);
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return [];
    console.error("Error fetching stakeholder-dofa links:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al cargar los vínculos parte interesada-DOFA",
    );
    return [];
  }
}

export async function createStakeholderDofaLink(
  payload: CreateStakeholderDofaLinkCommand,
): Promise<StakeholderDofaLinkDto | null> {
  try {
    const { data } = await api.post<StakeholderDofaLinkDto>(
      STAKEHOLDER_DOFA_BASE,
      payload,
    );
    toast.success("Vínculo creado");
    return data ?? null;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return null;
    console.error("Error creating stakeholder-dofa link:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al crear el vínculo",
    );
    return null;
  }
}

export async function updateStakeholderDofaLink(
  linkId: string,
  payload: UpdateStakeholderDofaLinkCommand,
): Promise<boolean> {
  try {
    await api.put(`${STAKEHOLDER_DOFA_BASE}/${linkId}`, payload);
    toast.success("Vínculo actualizado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error updating stakeholder-dofa link:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al actualizar el vínculo",
    );
    return false;
  }
}

export async function deleteStakeholderDofaLink(linkId: string): Promise<boolean> {
  try {
    await api.delete(`${STAKEHOLDER_DOFA_BASE}/${linkId}`);
    toast.success("Vínculo eliminado");
    return true;
  } catch (error: unknown) {
    if ((error as { __sessionExpired?: boolean })?.__sessionExpired) return false;
    console.error("Error deleting stakeholder-dofa link:", error);
    toast.error(
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message || "Error al eliminar el vínculo",
    );
    return false;
  }
}

"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDofaAnalysis,
  createDofaItem,
  deactivateDofaItem,
  deleteDofaAnalysis,
  getDofaAnalysisById,
  listDofaAnalyses,
  updateDofaItem,
  updateDofaAnalysis,
  listBscPerspectives,
  createBscPerspective,
  updateBscPerspective,
  deleteBscPerspective,
  listStrategyTypes,
  listObjectiveStatuses,
  listGoalStatuses,
  listGoalFrequencies,
  listGoalTrends,
  listIndicatorTypes,
  listStrategies,
  getStrategyById,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  listStrategyDofaItems,
  linkDofaItemToStrategy,
  updateStrategyDofaItemLink,
  unlinkDofaItemFromStrategy,
  listStrategyObjectives,
  linkObjectiveToStrategy,
  updateStrategyObjectiveLink,
  unlinkObjectiveFromStrategy,
  listObjectives,
  getObjective,
  createObjective,
  updateObjective,
  deleteObjective,
  listGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
  listIndicators,
  getIndicatorDetail,
  createIndicator,
  updateIndicator,
  deleteIndicator,
  createMeasurement,
  updateMeasurement,
  deleteMeasurement,
  listStakeholderDofaLinks,
  createStakeholderDofaLink,
  updateStakeholderDofaLink,
  deleteStakeholderDofaLink,
  type CreateDofaAnalysisCommand,
  type CreateDofaItemCommand,
  type UpdateDofaItemCommand,
  type UpdateDofaAnalysisCommand,
  type CreateBscPerspectiveCommand,
  type UpdateBscPerspectiveCommand,
  type CreateStrategyCommand,
  type UpdateStrategyCommand,
  type LinkStrategyDofaItemCommand,
  type UpdateStrategyDofaItemLinkCommand,
  type LinkStrategyObjectiveCommand,
  type UpdateStrategyObjectiveLinkCommand,
  type CreateObjectiveCommand,
  type UpdateObjectiveCommand,
  type CreateGoalCommand,
  type UpdateGoalCommand,
  type CreateIndicatorCommand,
  type UpdateIndicatorCommand,
  type CreateMeasurementCommand,
  type UpdateMeasurementCommand,
  type CreateStakeholderDofaLinkCommand,
  type UpdateStakeholderDofaLinkCommand,
  type ListStrategiesFilters,
} from "../api/dofa";

// ---------------------------------------------------------------------------
// Query key factories
// ---------------------------------------------------------------------------

export const dofaKeys = {
  all: ["strategic", "dofa"] as const,
  lists: () => [...dofaKeys.all, "list"] as const,
  list: () => [...dofaKeys.lists()] as const,
  details: () => [...dofaKeys.all, "detail"] as const,
  detail: (analysisId: string) => [...dofaKeys.details(), analysisId] as const,
};

export const bscKeys = {
  all: ["strategic", "bsc-perspectives"] as const,
  lists: () => [...bscKeys.all, "list"] as const,
  list: () => [...bscKeys.lists()] as const,
};

export const strategyTypeKeys = {
  all: ["strategic", "strategy-types"] as const,
  list: () => [...strategyTypeKeys.all, "list"] as const,
};

export const strategyKeys = {
  all: ["strategic", "strategies"] as const,
  lists: () => [...strategyKeys.all, "list"] as const,
  /** Pass filters to distinguish cached queries per analysisId (or other filter). */
  list: (filters?: { analysisId?: string }) =>
    [...strategyKeys.lists(), filters ?? {}] as const,
  details: () => [...strategyKeys.all, "detail"] as const,
  detail: (id: string) => [...strategyKeys.details(), id] as const,
  dofaItems: (strategyId: string) =>
    [...strategyKeys.detail(strategyId), "dofa-items"] as const,
  objectives: (strategyId: string) =>
    [...strategyKeys.detail(strategyId), "objectives"] as const,
};

export const stakeholderDofaLinkKeys = {
  all: ["strategic", "stakeholder-dofa-links"] as const,
  lists: () => [...stakeholderDofaLinkKeys.all, "list"] as const,
  list: () => [...stakeholderDofaLinkKeys.lists()] as const,
};

/**
 * Unified hierarchical key factory for the Plan layer (Sprint 3).
 * Replaces the old objectiveKeys / goalKeys / indicatorKeys / measurementKeys /
 * objectiveStatusKeys which are now removed.
 */
export const planKeys = {
  // Objectives
  objectives: () => ["dofa", "objectives"] as const,
  objectivesByAnalysis: (analysisId: string) =>
    ["dofa", "objectives", { analysisId }] as const,
  objective: (id: string) => ["dofa", "objectives", id] as const,
  // Goals
  goals: () => ["dofa", "goals"] as const,
  goalsByObjective: (objectiveId: string) =>
    ["dofa", "goals", { objectiveId }] as const,
  goal: (id: string) => ["dofa", "goals", id] as const,
  // Indicators (nested under goals)
  indicators: (goalId: string) =>
    ["dofa", "goals", goalId, "indicators"] as const,
  indicatorDetail: (goalId: string, indicatorId: string) =>
    ["dofa", "goals", goalId, "indicators", indicatorId] as const,
  // Catalogues
  objectiveStatuses: () => ["dofa", "objective-statuses"] as const,
  goalStatuses: () => ["dofa", "goal-statuses"] as const,
  goalFrequencies: () => ["dofa", "goal-frequencies"] as const,
  goalTrends: () => ["dofa", "goal-trends"] as const,
  indicatorTypes: () => ["dofa", "indicator-types"] as const,
};

// ---------------------------------------------------------------------------
// DOFA Analyses
// ---------------------------------------------------------------------------

export function useDofaAnalysesQuery() {
  return useQuery({
    queryKey: dofaKeys.list(),
    queryFn: listDofaAnalyses,
  });
}

export function useDofaAnalysisQuery(analysisId?: string) {
  return useQuery({
    queryKey: analysisId ? dofaKeys.detail(analysisId) : dofaKeys.detail("__none__"),
    queryFn: async () => {
      if (!analysisId) return null;
      return getDofaAnalysisById(analysisId);
    },
    enabled: !!analysisId,
  });
}

export function useDofaCreateAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDofaAnalysisCommand) => createDofaAnalysis(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dofaKeys.all });
    },
  });
}

export function useDofaDeleteAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (analysisId: string) => deleteDofaAnalysis(analysisId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dofaKeys.all });
    },
  });
}

export function useDofaCreateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      payload,
    }: {
      analysisId: string;
      payload: CreateDofaItemCommand;
    }) => createDofaItem(analysisId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

export function useDofaUpdateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      itemId,
      payload,
    }: {
      analysisId: string;
      itemId: string;
      payload: UpdateDofaItemCommand;
    }) => updateDofaItem(analysisId, itemId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

export function useDofaDeactivateItemMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ analysisId, itemId }: { analysisId: string; itemId: string }) =>
      deactivateDofaItem(analysisId, itemId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: dofaKeys.detail(variables.analysisId),
      });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

export function useDofaUpdateAnalysisMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      analysisId,
      payload,
    }: {
      analysisId: string;
      payload: UpdateDofaAnalysisCommand;
    }) => updateDofaAnalysis(analysisId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: dofaKeys.detail(variables.analysisId) });
      queryClient.invalidateQueries({ queryKey: dofaKeys.list() });
    },
  });
}

// ---------------------------------------------------------------------------
// BSC Perspectives
// ---------------------------------------------------------------------------

export function useBscPerspectivesQuery(includeInactive = false) {
  return useQuery({
    queryKey: [...bscKeys.list(), { includeInactive }],
    queryFn: () => listBscPerspectives(includeInactive),
  });
}

export function useBscPerspectiveCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBscPerspectiveCommand) =>
      createBscPerspective(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bscKeys.all });
    },
  });
}

export function useBscPerspectiveUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      perspectiveId,
      payload,
    }: {
      perspectiveId: string;
      payload: UpdateBscPerspectiveCommand;
    }) => updateBscPerspective(perspectiveId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bscKeys.all });
    },
  });
}

export function useBscPerspectiveDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (perspectiveId: string) => deleteBscPerspective(perspectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bscKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Strategy Types (catalogue)
// ---------------------------------------------------------------------------

export function useStrategyTypesQuery() {
  return useQuery({ queryKey: strategyTypeKeys.list(), queryFn: listStrategyTypes });
}

// ---------------------------------------------------------------------------
// Objective Statuses (catalogue)
// ---------------------------------------------------------------------------

export function useObjectiveStatusesQuery() {
  return useQuery({
    queryKey: planKeys.objectiveStatuses(),
    queryFn: listObjectiveStatuses,
    staleTime: Infinity,
  });
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

/**
 * Fetch strategies, optionally scoped to an analysis.
 *
 * NOTE (PM-07): The backend ignores the `?dofaAnalysisId` query param as of
 * the 2026-04-29 smoke test. We pass it anyway so it works automatically when
 * Hernán fixes server-side filtering. In the meantime we filter client-side.
 */
export function useStrategiesQuery(analysisId?: string) {
  const filters: ListStrategiesFilters | undefined = analysisId
    ? { dofaAnalysisId: analysisId }
    : undefined;
  return useQuery({
    queryKey: strategyKeys.list(analysisId ? { analysisId } : undefined),
    queryFn: async () => {
      const all = await listStrategies(filters);
      // PM-07 workaround: filter client-side since backend ignores dofaAnalysisId
      if (!analysisId) return all;
      return all.filter((s) => s.dofaAnalysisId === analysisId);
    },
  });
}

export function useStrategyByIdQuery(strategyId?: string) {
  return useQuery({
    queryKey: strategyId
      ? strategyKeys.detail(strategyId)
      : strategyKeys.detail("__none__"),
    queryFn: async () => {
      if (!strategyId) return null;
      return getStrategyById(strategyId);
    },
    enabled: !!strategyId,
  });
}

export function useStrategyCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStrategyCommand) => createStrategy(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

export function useStrategyUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      payload,
    }: {
      strategyId: string;
      payload: UpdateStrategyCommand;
    }) => updateStrategy(strategyId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
      queryClient.invalidateQueries({
        queryKey: strategyKeys.detail(variables.strategyId),
      });
    },
  });
}

export function useStrategyDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (strategyId: string) => deleteStrategy(strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Strategy ↔ DOFA Item links
// ---------------------------------------------------------------------------

export function useStrategyDofaItemsQuery(strategyId: string) {
  return useQuery({
    queryKey: strategyKeys.dofaItems(strategyId),
    queryFn: () => listStrategyDofaItems(strategyId),
    enabled: !!strategyId,
  });
}

export function useLinkDofaItemToStrategyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      dofaItemId,
      payload,
    }: {
      strategyId: string;
      dofaItemId: string;
      payload?: LinkStrategyDofaItemCommand;
    }) => linkDofaItemToStrategy(strategyId, dofaItemId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.dofaItems(variables.strategyId),
      });
    },
  });
}

export function useUpdateStrategyDofaItemLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      linkId,
      payload,
    }: {
      strategyId: string;
      linkId: string;
      payload: UpdateStrategyDofaItemLinkCommand;
    }) => updateStrategyDofaItemLink(strategyId, linkId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.dofaItems(variables.strategyId),
      });
    },
  });
}

export function useUnlinkDofaItemFromStrategyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      linkId,
    }: {
      strategyId: string;
      linkId: string;
    }) => unlinkDofaItemFromStrategy(strategyId, linkId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.dofaItems(variables.strategyId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Strategy ↔ Objective links
// ---------------------------------------------------------------------------

export function useStrategyObjectivesQuery(strategyId: string) {
  return useQuery({
    queryKey: strategyKeys.objectives(strategyId),
    queryFn: () => listStrategyObjectives(strategyId),
    enabled: !!strategyId,
  });
}

export function useLinkObjectiveToStrategyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      objectiveId,
      payload,
    }: {
      strategyId: string;
      objectiveId: string;
      payload?: LinkStrategyObjectiveCommand;
    }) => linkObjectiveToStrategy(strategyId, objectiveId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.objectives(variables.strategyId),
      });
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
    },
  });
}

export function useUpdateStrategyObjectiveLinkMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      linkId,
      payload,
    }: {
      strategyId: string;
      linkId: string;
      payload: UpdateStrategyObjectiveLinkCommand;
    }) => updateStrategyObjectiveLink(strategyId, linkId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.objectives(variables.strategyId),
      });
    },
  });
}

export function useUnlinkObjectiveFromStrategyMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      linkId,
    }: {
      strategyId: string;
      linkId: string;
    }) => unlinkObjectiveFromStrategy(strategyId, linkId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: strategyKeys.objectives(variables.strategyId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Objectives
// ---------------------------------------------------------------------------

/**
 * Fetch all objectives, optionally filtered by analysisId client-side.
 * PM-15: backend ignores ?status and ?responsibleId query params.
 */
export function useObjectivesQuery(filters?: { analysisId?: string }) {
  return useQuery({
    queryKey: filters?.analysisId
      ? planKeys.objectivesByAnalysis(filters.analysisId)
      : planKeys.objectives(),
    queryFn: async () => {
      const all = await listObjectives();
      if (!filters?.analysisId) return all;
      // PM-15 workaround: filter client-side since backend ignores analysisId
      // PM-21 resolved: backend now sets analysisId correctly; orphan (null) objectives excluded.
      return all.filter((o) => o.analysisId === filters.analysisId);
    },
  });
}

export function useObjectiveQuery(objectiveId?: string) {
  return useQuery({
    queryKey: objectiveId
      ? planKeys.objective(objectiveId)
      : planKeys.objective("__none__"),
    queryFn: async () => {
      if (!objectiveId) return null;
      return getObjective(objectiveId);
    },
    enabled: !!objectiveId,
  });
}

export function useObjectiveCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObjectiveCommand) => createObjective(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useCreateObjectiveMutation = useObjectiveCreateMutation;

export function useObjectiveUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      objectiveId,
      payload,
    }: {
      objectiveId: string;
      payload: UpdateObjectiveCommand;
    }) => updateObjective(objectiveId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
      queryClient.invalidateQueries({
        queryKey: planKeys.objective(variables.objectiveId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useUpdateObjectiveMutation = useObjectiveUpdateMutation;

export function useObjectiveDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectiveId: string) => deleteObjective(objectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useDeleteObjectiveMutation = useObjectiveDeleteMutation;

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

/**
 * Fetch all goals, optionally filtered by objectiveId client-side.
 * PM-16: backend has no server-side filter for objectiveId.
 */
export function useGoalsQuery(filters?: { objectiveId?: string }) {
  return useQuery({
    queryKey: filters?.objectiveId
      ? planKeys.goalsByObjective(filters.objectiveId)
      : planKeys.goals(),
    queryFn: async () => {
      const all = await listGoals();
      if (!filters?.objectiveId) return all;
      // PM-16 workaround: filter client-side
      return all.filter((g) => g.objectiveId === filters.objectiveId);
    },
  });
}

export function useGoalQuery(goalId?: string) {
  return useQuery({
    queryKey: goalId ? planKeys.goal(goalId) : planKeys.goal("__none__"),
    queryFn: async () => {
      if (!goalId) return null;
      return getGoal(goalId);
    },
    enabled: !!goalId,
  });
}

export function useGoalCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalCommand) => createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.goals() });
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useCreateGoalMutation = useGoalCreateMutation;

export function useGoalUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: UpdateGoalCommand;
    }) => updateGoal(goalId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: planKeys.goals() });
      queryClient.invalidateQueries({ queryKey: planKeys.goal(variables.goalId) });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useUpdateGoalMutation = useGoalUpdateMutation;

export function useGoalDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (goalId: string) => deleteGoal(goalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: planKeys.goals() });
      queryClient.invalidateQueries({ queryKey: planKeys.objectives() });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useDeleteGoalMutation = useGoalDeleteMutation;

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export function useIndicatorsQuery(goalId: string) {
  return useQuery({
    queryKey: planKeys.indicators(goalId),
    queryFn: () => listIndicators(goalId),
    enabled: !!goalId,
  });
}

/**
 * Single indicator WITH nested measurements (PM-14: only way to read measurements).
 * Use `options.enabled = false` for lazy load.
 */
export function useIndicatorDetailQuery(
  goalId: string,
  indicatorId: string,
  options?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: planKeys.indicatorDetail(goalId, indicatorId),
    queryFn: () => getIndicatorDetail(goalId, indicatorId),
    enabled: options?.enabled !== undefined ? options.enabled : !!goalId && !!indicatorId,
  });
}

export function useIndicatorCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      payload,
    }: {
      goalId: string;
      payload: CreateIndicatorCommand;
    }) => createIndicator(goalId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.indicators(variables.goalId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useCreateIndicatorMutation = useIndicatorCreateMutation;

export function useIndicatorUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      goalId,
      indicatorId,
      payload,
    }: {
      goalId: string;
      indicatorId: string;
      payload: UpdateIndicatorCommand;
    }) => updateIndicator(goalId, indicatorId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.indicators(variables.goalId),
      });
      queryClient.invalidateQueries({
        queryKey: planKeys.indicatorDetail(variables.goalId, variables.indicatorId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useUpdateIndicatorMutation = useIndicatorUpdateMutation;

export function useIndicatorDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, indicatorId }: { goalId: string; indicatorId: string }) =>
      deleteIndicator(goalId, indicatorId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.indicators(variables.goalId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useDeleteIndicatorMutation = useIndicatorDeleteMutation;

// ---------------------------------------------------------------------------
// Measurements (no GET list — backend gap PM-14)
// Mutations must invalidate planKeys.indicatorDetail to refresh nested measurements.
// ---------------------------------------------------------------------------

export function useMeasurementCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      payload,
    }: {
      indicatorId: string;
      goalId: string;
      payload: CreateMeasurementCommand;
    }) => createMeasurement(indicatorId, payload),
    onSuccess: (_data, variables) => {
      // Invalidate the indicator detail so measurements array is refreshed
      queryClient.invalidateQueries({
        queryKey: planKeys.indicatorDetail(variables.goalId, variables.indicatorId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useCreateMeasurementMutation = useMeasurementCreateMutation;

export function useMeasurementUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      measurementId,
      payload,
    }: {
      indicatorId: string;
      goalId: string;
      measurementId: string;
      payload: UpdateMeasurementCommand;
    }) => updateMeasurement(indicatorId, measurementId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.indicatorDetail(variables.goalId, variables.indicatorId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useUpdateMeasurementMutation = useMeasurementUpdateMutation;

export function useMeasurementDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      measurementId,
    }: {
      indicatorId: string;
      goalId: string;
      measurementId: string;
    }) => deleteMeasurement(indicatorId, measurementId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: planKeys.indicatorDetail(variables.goalId, variables.indicatorId),
      });
    },
  });
}

/** Alias for Sprint 3+ components */
export const useDeleteMeasurementMutation = useMeasurementDeleteMutation;

// ---------------------------------------------------------------------------
// Catalogues (staleTime: Infinity — these change only after backend seed updates)
// ---------------------------------------------------------------------------

export function useGoalStatusesQuery() {
  return useQuery({
    queryKey: planKeys.goalStatuses(),
    queryFn: listGoalStatuses,
    staleTime: Infinity,
  });
}

export function useGoalFrequenciesQuery() {
  return useQuery({
    queryKey: planKeys.goalFrequencies(),
    queryFn: listGoalFrequencies,
    staleTime: Infinity,
  });
}

export function useGoalTrendsQuery() {
  return useQuery({
    queryKey: planKeys.goalTrends(),
    queryFn: listGoalTrends,
    staleTime: Infinity,
  });
}

export function useIndicatorTypesQuery() {
  return useQuery({
    queryKey: planKeys.indicatorTypes(),
    queryFn: listIndicatorTypes,
    staleTime: Infinity,
  });
}

// ---------------------------------------------------------------------------
// Stakeholder–DOFA Links
// ---------------------------------------------------------------------------

export function useStakeholderDofaLinksQuery() {
  return useQuery({
    queryKey: stakeholderDofaLinkKeys.list(),
    queryFn: listStakeholderDofaLinks,
  });
}

export function useStakeholderDofaLinkCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStakeholderDofaLinkCommand) =>
      createStakeholderDofaLink(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderDofaLinkKeys.all });
    },
  });
}

export function useStakeholderDofaLinkUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      linkId,
      payload,
    }: {
      linkId: string;
      payload: UpdateStakeholderDofaLinkCommand;
    }) => updateStakeholderDofaLink(linkId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderDofaLinkKeys.all });
    },
  });
}

export function useStakeholderDofaLinkDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (linkId: string) => deleteStakeholderDofaLink(linkId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stakeholderDofaLinkKeys.all });
    },
  });
}

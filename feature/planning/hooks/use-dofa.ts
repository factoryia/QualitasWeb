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
  listStrategies,
  createStrategy,
  updateStrategy,
  deleteStrategy,
  listStrategyDofaItems,
  linkDofaItemToStrategy,
  unlinkDofaItemFromStrategy,
  listStrategyObjectives,
  linkObjectiveToStrategy,
  unlinkObjectiveFromStrategy,
  listObjectives,
  createObjective,
  updateObjective,
  deleteObjective,
  listGoals,
  createGoal,
  updateGoal,
  listIndicators,
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
} from "../api/dofa";

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
  list: () => [...strategyKeys.lists()] as const,
  details: () => [...strategyKeys.all, "detail"] as const,
  detail: (id: string) => [...strategyKeys.details(), id] as const,
  dofaItems: (strategyId: string) =>
    [...strategyKeys.detail(strategyId), "dofa-items"] as const,
  objectives: (strategyId: string) =>
    [...strategyKeys.detail(strategyId), "objectives"] as const,
};

export const objectiveKeys = {
  all: ["strategic", "objectives"] as const,
  lists: () => [...objectiveKeys.all, "list"] as const,
  list: () => [...objectiveKeys.lists()] as const,
  details: () => [...objectiveKeys.all, "detail"] as const,
  detail: (id: string) => [...objectiveKeys.details(), id] as const,
};

export const goalKeys = {
  all: ["strategic", "goals"] as const,
  lists: () => [...goalKeys.all, "list"] as const,
  list: () => [...goalKeys.lists()] as const,
  details: () => [...goalKeys.all, "detail"] as const,
  detail: (id: string) => [...goalKeys.details(), id] as const,
};

export const indicatorKeys = {
  all: ["strategic", "indicators"] as const,
  byGoal: (goalId: string) => [...indicatorKeys.all, "goal", goalId] as const,
};

export const measurementKeys = {
  all: ["strategic", "measurements"] as const,
  byIndicator: (indicatorId: string) =>
    [...measurementKeys.all, "indicator", indicatorId] as const,
};

export const stakeholderDofaLinkKeys = {
  all: ["strategic", "stakeholder-dofa-links"] as const,
  lists: () => [...stakeholderDofaLinkKeys.all, "list"] as const,
  list: () => [...stakeholderDofaLinkKeys.lists()] as const,
};

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

export function useBscPerspectivesQuery() {
  return useQuery({ queryKey: bscKeys.list(), queryFn: listBscPerspectives });
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
// Strategy Types
// ---------------------------------------------------------------------------

export function useStrategyTypesQuery() {
  return useQuery({ queryKey: strategyTypeKeys.list(), queryFn: listStrategyTypes });
}

// ---------------------------------------------------------------------------
// Strategies
// ---------------------------------------------------------------------------

export function useStrategiesQuery() {
  return useQuery({ queryKey: strategyKeys.list(), queryFn: listStrategies });
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
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
    }: {
      strategyId: string;
      dofaItemId: string;
    }) => linkDofaItemToStrategy(strategyId, dofaItemId),
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
    }: {
      strategyId: string;
      objectiveId: string;
    }) => linkObjectiveToStrategy(strategyId, objectiveId),
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

export function useObjectivesQuery() {
  return useQuery({ queryKey: objectiveKeys.list(), queryFn: listObjectives });
}

export function useObjectiveCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObjectiveCommand) => createObjective(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.all });
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.all });
    },
  });
}

export function useObjectiveDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (objectiveId: string) => deleteObjective(objectiveId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: objectiveKeys.all });
      queryClient.invalidateQueries({ queryKey: strategyKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export function useGoalsQuery() {
  return useQuery({ queryKey: goalKeys.list(), queryFn: listGoals });
}

export function useGoalCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateGoalCommand) => createGoal(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
      queryClient.invalidateQueries({ queryKey: objectiveKeys.all });
    },
  });
}

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: goalKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Indicators
// ---------------------------------------------------------------------------

export function useIndicatorsQuery(goalId: string) {
  return useQuery({
    queryKey: indicatorKeys.byGoal(goalId),
    queryFn: () => listIndicators(goalId),
    enabled: !!goalId,
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
        queryKey: indicatorKeys.byGoal(variables.goalId),
      });
    },
  });
}

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
        queryKey: indicatorKeys.byGoal(variables.goalId),
      });
    },
  });
}

export function useIndicatorDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ goalId, indicatorId }: { goalId: string; indicatorId: string }) =>
      deleteIndicator(goalId, indicatorId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: indicatorKeys.byGoal(variables.goalId),
      });
    },
  });
}

// ---------------------------------------------------------------------------
// Measurements (no GET list — backend gap)
// ---------------------------------------------------------------------------

export function useMeasurementCreateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      payload,
    }: {
      indicatorId: string;
      payload: CreateMeasurementCommand;
    }) => createMeasurement(indicatorId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: measurementKeys.byIndicator(variables.indicatorId),
      });
    },
  });
}

export function useMeasurementUpdateMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      measurementId,
      payload,
    }: {
      indicatorId: string;
      measurementId: string;
      payload: UpdateMeasurementCommand;
    }) => updateMeasurement(indicatorId, measurementId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: measurementKeys.byIndicator(variables.indicatorId),
      });
    },
  });
}

export function useMeasurementDeleteMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      indicatorId,
      measurementId,
    }: {
      indicatorId: string;
      measurementId: string;
    }) => deleteMeasurement(indicatorId, measurementId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: measurementKeys.byIndicator(variables.indicatorId),
      });
    },
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

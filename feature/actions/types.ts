/** DTOs alineados con Actions.Contracts (JSON camelCase) */

export type ActionSummaryDto = {
  id: string;
  code: string;
  title: string;
  source: string;
  status: string;
  priority: string;
  responsibleId: string | null;
  plannedEndDate: string;
  progressPercentage: number;
  createdOnUtc: string;
};

export type ActionDto = {
  id: string;
  code: string;
  title: string;
  description: string | null;
  source: string;
  sourceId: string;
  sourceReference: string | null;
  dofaStrategyId: string | null;
  riskId: string | null;
  auditFindingId: string | null;
  complianceClauseId: string | null;
  processId: string | null;
  documentRequirementId: string | null;
  category: string;
  priority: string;
  type: string;
  status: string;
  responsibleId: string | null;
  ownerId: string | null;
  plannedStartDate: string;
  plannedEndDate: string;
  actualStartDate: string | null;
  actualEndDate: string | null;
  progressPercentage: number;
  budgetAmount: number;
  actualCost: number | null;
  budgetCurrency: string | null;
  budgetCode: string | null;
  actionPlan: string | null;
  expectedOutcome: string | null;
  evidence: string | null;
  conclusion: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

export type CreateActionRequest = {
  title: string;
  description?: string | null;
  source: string;
  sourceId: string;
  sourceReference?: string | null;
  dofaStrategyId?: string | null;
  riskId?: string | null;
  auditFindingId?: string | null;
  complianceClauseId?: string | null;
  processId?: string | null;
  documentRequirementId?: string | null;
  category: string;
  priority: string;
  type: string;
  responsibleId?: string | null;
  ownerId?: string | null;
  plannedStartDate: string;
  plannedEndDate: string;
  budgetAmount?: number | null;
  budgetCurrency?: string | null;
  budgetCode?: string | null;
  actionPlan?: string | null;
  expectedOutcome?: string | null;
};

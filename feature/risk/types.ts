/** DTO alineado con RiskDto del backend (JSON camelCase) */
export type RiskDto = {
  id: string;
  processId: string;
  riskCategoryId: string;
  responsibleId: string | null;
  riskCode: string;
  riskTitle: string;
  description: string | null;
  cause: string | null;
  potentialConsequence: string | null;
  triggeringEvents: string | null;
  probabilityInherent: number | null;
  impactInherent: number | null;
  levelInherent: string | null;
  scoreInherent: number | null;
  dateInherentEvaluated: string | null;
  probabilityResidual: number | null;
  impactResidual: number | null;
  levelResidual: string | null;
  scoreResidual: number | null;
  dateResidualEvaluated: string | null;
  controlEffectiveness: number;
  controlGapAnalysis: string | null;
  status: string;
  requiresImmediateAction: boolean;
  dateIdentified: string;
  dateNextReview: string | null;
  reviewFrequency: string | null;
  riskResponse: string | null;
  riskOwnerApproval: string | null;
  dateApproved: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

export type RiskCategoryDto = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  scope: string | null;
  color: string | null;
  displayOrder: number | null;
  isActive: boolean;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

export type CreateRiskRequest = {
  processId: string;
  riskCategoryId: string;
  responsibleId?: string | null;
  riskCode: string;
  riskTitle: string;
  description?: string | null;
  cause?: string | null;
  potentialConsequence?: string | null;
  triggeringEvents?: string | null;
  probabilityInherent?: number | null;
  impactInherent?: number | null;
  dateInherentEvaluated?: string | null;
  reviewFrequency?: string | null;
  riskResponse?: string | null;
};

export type UpdateRiskRequest = {
  riskCategoryId: string;
  responsibleId?: string | null;
  riskTitle: string;
  description?: string | null;
  cause?: string | null;
  potentialConsequence?: string | null;
  triggeringEvents?: string | null;
  probabilityResidual?: number | null;
  impactResidual?: number | null;
  dateResidualEvaluated?: string | null;
  controlGapAnalysis?: string | null;
  status: string;
  requiresImmediateAction: boolean;
  dateNextReview?: string | null;
  reviewFrequency?: string | null;
  riskResponse?: string | null;
  riskOwnerApproval?: string | null;
  dateApproved?: string | null;
};

export type RiskControlDto = {
  id: string;
  riskId: string;
  controlCode: string;
  controlName: string;
  description: string | null;
  controlType: string | null;
  controlCategory: string | null;
  ownerUserId: string | null;
  processName: string | null;
  frequency: string | null;
  designDocumentation: string | null;
  designEffectiveness: number | null;
  operationalEffectiveness: number | null;
  effectivenessEvidence: string | null;
  status: string;
  dateLastAssessed: string | null;
  lastAssessmentResult: string | null;
  assessmentComments: string | null;
  createdOnUtc: string;
  createdBy: string | null;
  lastModifiedOnUtc: string | null;
  lastModifiedBy: string | null;
};

export type CreateRiskControlRequest = {
  riskId: string;
  controlCode: string;
  controlName: string;
  description?: string | null;
  controlType?: string | null;
  controlCategory?: string | null;
  ownerUserId?: string | null;
  processName?: string | null;
  frequency?: string | null;
  designDocumentation?: string | null;
  designEffectiveness?: number | null;
};

export type UpdateRiskControlRequest = {
  controlName: string;
  description?: string | null;
  controlType?: string | null;
  controlCategory?: string | null;
  ownerUserId?: string | null;
  processName?: string | null;
  frequency?: string | null;
  designDocumentation?: string | null;
  designEffectiveness?: number | null;
  operationalEffectiveness?: number | null;
  effectivenessEvidence?: string | null;
  status: string;
  dateLastAssessed?: string | null;
  lastAssessmentResult?: string | null;
  assessmentComments?: string | null;
};

export interface DecisionMetricsRecord {
  id: string;
  title: string;
  type: string;
  status: string;
  priority: string | null;
  createdAt: Date;
  recommendation: RecommendationShape | null;
  approvals: { status: string }[];
  evidence: { id: string }[];
  objectives: { id: string }[];
  framework: FrameworkShape | null;
  decisionScenarios: { id: string }[];
  riskAnalyses: { id: string }[];
  risks: { level: string; description: string }[];
  outcome: OutcomeShape | null;
}

export interface RecommendationShape {
  humanReviewRequired: boolean;
  isClientVisible: boolean;
  publishedFromSnapshot: boolean;
}

export interface FrameworkShape {
  context: string;
  purpose: string;
  options: string;
  criteria: string;
  values: string;
  informationGaps: string;
  certainty: string;
  assumptions: string;
}

export interface OutcomeShape {
  outcomeStatus: string;
  actualOutcome: string | null;
  variance: number | null;
  reviewedAt: Date | null;
  updatedAt: Date;
}

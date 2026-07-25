export interface DecisionExportInput {
  decisionId: string;
  title: string;
  status: string;
  ownerName: string | null;
  organizationName: string | null;
  createdAt: Date;
  recommendation: {
    type: string;
    confidenceScore: number | null;
    reasoning: string | null;
    conditions: string | null;
    riskNotes: string | null;
  } | null;
  tenderProfile: {
    clientName: string;
    estimatedContractValue: number | null;
    estimatedCost: number | null;
    durationMonths: number | null;
    marginEstimate: number | null;
    riskLevel: string | null;
    requiredCapacity: string | null;
    internalAvailableCapacity: string | null;
    strategicFitScore: number | null;
  } | null;
  scenarios: {
    type: string;
    feasibilityScore: number | null;
    financialScore: number | null;
    capacityScore: number | null;
    riskScore: number | null;
    strategicFitScore: number | null;
    overallDecisionScore: number | null;
  }[];
  auditLogs: {
    action: string;
    userName: string | null;
    createdAt: Date;
  }[];
  exportedAt: Date;
  exportedById: string;
}

export interface DecisionExportResult {
  format: "pdf";
  filename: string;
  mimeType: string;
  content: Buffer;
}

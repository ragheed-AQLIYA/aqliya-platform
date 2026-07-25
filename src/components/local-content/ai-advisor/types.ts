export interface PendingFlag {
  id: string;
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  confidence: number;
  riskLevel: string;
  riskReason: string;
  status: string;
}

export interface PendingSuggestion {
  id: string;
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  reasoning: string;
  confidence: number;
  status: string;
}

export interface IndustryBenchmark {
  industry: string;
  workbookLineCode: string;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
  effectivenessPct: number;
}

export interface OrgMemory {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  manualOverride: boolean;
  overrideReason: string | null;
}

export interface AdvisorOverviewProps {
  pendingFlags: PendingFlag[];
  pendingSuggestions: PendingSuggestion[];
  industryBenchmarks: IndustryBenchmark[];
  orgMemory: OrgMemory[];
  onReviewFlag: (id: string, decision: "confirmed" | "rejected", notes: string) => Promise<unknown>;
  onReviewSuggestion: (id: string, decision: "approved" | "rejected", notes: string) => Promise<unknown>;
}

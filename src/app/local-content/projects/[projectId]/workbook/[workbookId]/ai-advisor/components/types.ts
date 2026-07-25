export interface LcWorkbookLine {
  id: string;
  code: string;
  name: string;
  section: string;
  autoFillable: boolean;
  autoFilled: boolean;
  autoFillValue: number | null;
  autoFillSource: string | null;
  manualValue: number | null;
  source: string;
  confidence: string;
  displayOrder: number;
}

export interface LcWorkbook {
  id: string;
  projectId: string;
  title: string;
  status: string;
  totalLines: number;
  autoFilledLines: number;
  completionPct: number;
  lines: LcWorkbookLine[];
}

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

export interface OrgMemory {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  manualOverride: boolean;
  overrideReason: string | null;
}

export interface IndustryBenchmark {
  industry: string;
  workbookLineCode: string;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
  effectivenessPct: number;
}

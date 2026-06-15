/** Lead Schedule Engine — types (AuditOS 2.0 Phase 3) */

export type LeadScheduleValidationCode =
  | "LS-001"
  | "LS-002"
  | "LS-003"
  | "LS-004";

export interface LeadScheduleValidationIssue {
  code: LeadScheduleValidationCode;
  severity: "error" | "warning";
  messageAr: string;
  messageEn: string;
  leadScheduleId?: string;
  accountCode?: string;
}

export interface LeadScheduleValidationResult {
  passed: boolean;
  issueCount: number;
  issues: LeadScheduleValidationIssue[];
  checkedAt: string;
}

export interface GeneratedLeadScheduleSummary {
  leadScheduleId: string;
  workingPaperIndexId: string;
  category: string;
  lineCount: number;
  totalClosingBalance: number;
  materialLineCount: number;
}

export interface LeadScheduleGenerationResult {
  engagementId: string;
  generatedCount: number;
  schedules: GeneratedLeadScheduleSummary[];
  generatedAt: string;
}

export interface LeadScheduleListItem {
  id: string;
  workingPaperIndexId: string;
  paperNumber: string;
  paperTitle: string;
  category: string;
  accountCode: string;
  accountName: string;
  priorYearBalance: number | null;
  currentYearBalance: number | null;
  finalBalance: number | null;
  lineCount: number;
  status: string;
}

export interface PriorYearRollforwardRow {
  category: string;
  paperNumber: string;
  priorYear: number;
  currentYear: number;
  variance: number;
  variancePct: number | null;
}

export interface PriorYearRollforwardReport {
  engagementId: string;
  rows: PriorYearRollforwardRow[];
  generatedAt: string;
}

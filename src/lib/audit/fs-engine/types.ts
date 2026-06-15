/**
 * FS Engine v2 — types (AuditOS 2.0 Phase 5)
 */

export type FinancialStatementStatus = "draft" | "reviewed" | "approved";

export type FsStatementType =
  | "income_statement"
  | "balance_sheet"
  | "equity"
  | "cash_flow";

export interface FsRebuildSummary {
  engagementId: string;
  statementTypes: FsStatementType[];
  rebuiltAt: string;
}

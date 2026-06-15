/**
 * Reconciliation Engine — types (AuditOS 2.0 Phase 4)
 */

export type ReconciliationCheckCode =
  | "RC-001"
  | "RC-002"
  | "RC-003"
  | "RC-004"
  | "RC-005"
  | "RC-006";

export type ReconciliationCheckType =
  | "tb_ls_tie"
  | "ls_fs_tie"
  | "balance_sheet_equation"
  | "is_equity_flow"
  | "reconciliation_coverage"
  | "cash_flow_tie";

export interface ReconciliationCheckResult {
  code: ReconciliationCheckCode;
  checkType: ReconciliationCheckType;
  passed: boolean;
  severity: "error" | "warning";
  messageAr: string;
  messageEn: string;
  expectedValue?: number;
  actualValue?: number;
  difference?: number;
}

export interface ReconciliationRunResult {
  engagementId: string;
  passed: boolean;
  checkCount: number;
  failedCount: number;
  checks: ReconciliationCheckResult[];
  runAt: string;
}

export const RECONCILIATION_CHECK_LABELS: Record<
  ReconciliationCheckCode,
  { ar: string; en: string; checkType: ReconciliationCheckType }
> = {
  "RC-001": {
    ar: "ربط ميزان المراجعة بقوائم الربط",
    en: "Trial Balance to Lead Schedule Tie",
    checkType: "tb_ls_tie",
  },
  "RC-002": {
    ar: "ربط قوائم الربط بالقوائم المالية",
    en: "Lead Schedule to FS Tie",
    checkType: "ls_fs_tie",
  },
  "RC-003": {
    ar: "معادلة الميزانية (أصول = خصوم + حقوق)",
    en: "Balance Sheet Equation (A = L + E)",
    checkType: "balance_sheet_equation",
  },
  "RC-004": {
    ar: "ربط قائمة الدخل بحقوق الملكية",
    en: "Income Statement to Equity Flow",
    checkType: "is_equity_flow",
  },
  "RC-005": {
    ar: "تغطية التعيينات في قوائم الربط",
    en: "Confirmed Mapping Coverage in Lead Schedules",
    checkType: "reconciliation_coverage",
  },
  "RC-006": {
    ar: "ربط النقدية نهاية الفترة بميزان المراجعة",
    en: "Cash at End vs Trial Balance Cash",
    checkType: "cash_flow_tie",
  },
};

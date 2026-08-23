import type { FinancialStatementLine } from "@/types/audit";

export interface IfrsEvaluationContext {
  engagementId: string;
  engagementStatus: string;
  reportingFramework: string;
  currencyCode: string;
  statementTypes: string[];
  statements: Array<{ statementType: string; lines: FinancialStatementLine[] }>;
  mappings: Array<{
    sourceAccountCode: string;
    sourceAccountName: string;
    status: string;
    statementClassification: string | null;
    canonicalName?: string | null;
    canonicalCategory?: string | null;
  }>;
  tbLines: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
  }>;
  disclosureNoteCount: number;
  performanceMateriality?: number;
  organizationId?: string;
  ragEnabled?: boolean;
}

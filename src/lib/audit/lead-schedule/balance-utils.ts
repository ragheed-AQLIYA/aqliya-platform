/** Mirror of FS display amount logic for lead schedule lines */

import {
  classifyIncomeStatementMapping,
  getIncomeStatementPeriodAmount,
} from "@/lib/audit/db/income-statement-amount";

export type MappingBalanceInput = {
  sourceAccountCode?: string;
  debitAmount: number;
  creditAmount: number;
  statementClassification?: string | null;
  canonicalAccount?: {
    code?: string;
    name?: string;
    category?: string;
    statementType?: string;
  } | null;
};

export function getMappingClosingBalance(mapping: MappingBalanceInput): number {
  const category =
    mapping.statementClassification ?? mapping.canonicalAccount?.category ?? "";
  const statementType = mapping.canonicalAccount?.statementType ?? "";

  if (statementType === "income_statement") {
    const kind = classifyIncomeStatementMapping({
      sourceAccountCode: mapping.sourceAccountCode ?? "",
      sourceAccountName: "",
      debitAmount: mapping.debitAmount,
      creditAmount: mapping.creditAmount,
      status: "confirmed",
      canonicalAccount: mapping.canonicalAccount
        ? {
            code: mapping.canonicalAccount.code ?? "",
            name: mapping.canonicalAccount.name ?? "",
            category: mapping.canonicalAccount.category ?? "",
            statementType: mapping.canonicalAccount.statementType ?? "",
          }
        : null,
    });
    if (kind) {
      return getIncomeStatementPeriodAmount(
        {
          sourceAccountCode: mapping.sourceAccountCode ?? "",
          sourceAccountName: "",
          debitAmount: mapping.debitAmount,
          creditAmount: mapping.creditAmount,
          status: "confirmed",
          canonicalAccount: mapping.canonicalAccount
            ? {
                code: mapping.canonicalAccount.code ?? "",
                name: mapping.canonicalAccount.name ?? "",
                category: mapping.canonicalAccount.category ?? "",
                statementType: mapping.canonicalAccount.statementType ?? "",
              }
            : null,
        },
        kind,
      );
    }
  }

  const isAssetCategory =
    category === "Current Assets" || category === "Non-Current Assets";
  if (isAssetCategory) {
    return mapping.debitAmount !== 0
      ? mapping.debitAmount
      : -mapping.creditAmount;
  }

  return mapping.creditAmount !== 0
    ? mapping.creditAmount
    : -mapping.debitAmount;
}

/** Cash tie uses canonical cash only — avoid bank loans / bank prepayments. */
export function isCashAccountMapping(mapping: {
  canonicalAccount?: { code?: string; name?: string } | null;
  sourceAccountName?: string | null;
}): boolean {
  return mapping.canonicalAccount?.code === "CA-1010";
}

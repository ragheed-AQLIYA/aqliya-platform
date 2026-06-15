/**
 * AuditOS canonical chart of accounts — single source for seed, mocks, and Phase 8.1 expansion.
 */

export type CanonicalCoaSeedRow = {
  id: string;
  code: string;
  name: string;
  category: string;
  statementType: "balance_sheet" | "income_statement";
  displayOrder: number;
  subcategory?: string;
};

/** Baseline COA (Phases 1–7) plus Phase 8.1 expansion accounts. */
export const CANONICAL_COA_ACCOUNTS: CanonicalCoaSeedRow[] = [
  {
    id: "ca-1",
    code: "CA-1010",
    name: "Cash and Cash Equivalents",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 100,
  },
  {
    id: "ca-2",
    code: "CA-1020",
    name: "Trade Receivables",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 110,
  },
  {
    id: "ca-3",
    code: "CA-1030",
    name: "Inventories",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 120,
  },
  {
    id: "ca-4",
    code: "CA-1040",
    name: "Prepayments",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 130,
  },
  {
    id: "ca-26",
    code: "CA-1080",
    name: "Contract Assets",
    category: "Current Assets",
    statementType: "balance_sheet",
    displayOrder: 135,
  },
  {
    id: "ca-5",
    code: "CA-1050",
    name: "Property, Plant and Equipment",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 200,
  },
  {
    id: "ca-6",
    code: "CA-1060",
    name: "Accumulated Depreciation",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 210,
  },
  {
    id: "ca-24",
    code: "CA-1070",
    name: "Right-of-Use Assets",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 215,
  },
  {
    id: "ca-25",
    code: "CA-1071",
    name: "ROU Accumulated Depreciation",
    category: "Non-Current Assets",
    statementType: "balance_sheet",
    displayOrder: 216,
  },
  {
    id: "ca-7",
    code: "CA-2010",
    name: "Trade Payables",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 300,
  },
  {
    id: "ca-8",
    code: "CA-2020",
    name: "Accrued Expenses",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 310,
  },
  {
    id: "ca-9",
    code: "CA-2030",
    name: "Tax and Zakat Payable",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 320,
  },
  {
    id: "ca-31",
    code: "CA-2035",
    name: "Zakat Provision",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 325,
  },
  {
    id: "ca-10",
    code: "CA-2040",
    name: "Short-term Borrowings",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 330,
  },
  {
    id: "ca-27",
    code: "CA-2110",
    name: "Lease Liabilities - Current",
    category: "Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 335,
  },
  {
    id: "ca-28",
    code: "CA-2120",
    name: "Lease Liabilities - Non-Current",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 350,
  },
  {
    id: "ca-29",
    code: "CA-2130",
    name: "Long-Term Debt",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 360,
  },
  {
    id: "ca-30",
    code: "CA-2140",
    name: "Deferred Tax",
    category: "Non-Current Liabilities",
    statementType: "balance_sheet",
    displayOrder: 370,
  },
  {
    id: "ca-11",
    code: "CA-3010",
    name: "Share Capital",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 400,
  },
  {
    id: "ca-12",
    code: "CA-3020",
    name: "Retained Earnings",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 410,
  },
  {
    id: "ca-32",
    code: "CA-3030",
    name: "Actuarial Reserve",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 415,
  },
  {
    id: "ca-33",
    code: "CA-3040",
    name: "OCI Reserve",
    category: "Equity",
    statementType: "balance_sheet",
    displayOrder: 420,
  },
  {
    id: "ca-13",
    code: "CA-4010",
    name: "Revenue - Sale of Goods",
    category: "Revenue",
    statementType: "income_statement",
    displayOrder: 500,
  },
  {
    id: "ca-14",
    code: "CA-4020",
    name: "Revenue - Services",
    category: "Revenue",
    statementType: "income_statement",
    displayOrder: 510,
  },
  {
    id: "ca-15",
    code: "CA-5010",
    name: "Cost of Sales",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 600,
  },
  {
    id: "ca-16",
    code: "CA-5020",
    name: "Employee Benefits",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 610,
  },
  {
    id: "ca-17",
    code: "CA-5030",
    name: "Occupancy Expenses",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 620,
  },
  {
    id: "ca-18",
    code: "CA-5040",
    name: "Utilities",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 630,
  },
  {
    id: "ca-19",
    code: "CA-5050",
    name: "Depreciation and Amortisation",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 640,
  },
  {
    id: "ca-20",
    code: "CA-5060",
    name: "Professional and Consulting Fees",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 650,
  },
  {
    id: "ca-21",
    code: "CA-5070",
    name: "General and Administrative Expenses",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 660,
  },
  {
    id: "ca-22",
    code: "CA-5100",
    name: "Other Income",
    category: "Revenue",
    statementType: "income_statement",
    displayOrder: 670,
  },
  {
    id: "ca-23",
    code: "CA-2050",
    name: "Finance Cost",
    category: "Expenses",
    statementType: "income_statement",
    displayOrder: 680,
  },
];

/** Phase 8.1 — accounts added for IFRS 16 / IAS 19 / tax / contract assets. */
export const PHASE_81_CANONICAL_CODES = new Set([
  "CA-1070",
  "CA-1071",
  "CA-1080",
  "CA-2035",
  "CA-2110",
  "CA-2120",
  "CA-2130",
  "CA-2140",
  "CA-3030",
  "CA-3040",
]);

export const CANONICAL_COA_BY_CODE = new Map(
  CANONICAL_COA_ACCOUNTS.map((row) => [row.code, row]),
);

export const LESS_ACCUMULATED_DEPRECIATION_NAMES = new Set([
  "Accumulated Depreciation",
  "ROU Accumulated Depreciation",
]);

export const CASH_AND_CASH_EQUIVALENTS_CANONICAL_ID = "ca-1";

/** True when mapping targets the canonical cash / bank bucket (CA-1010). */
export function isCashAndCashEquivalentsCanonical(mapping: {
  canonicalAccount?: { id: string; code?: string; name?: string } | null;
}): boolean {
  const ca = mapping.canonicalAccount;
  if (!ca) return false;
  if (
    ca.id === CASH_AND_CASH_EQUIVALENTS_CANONICAL_ID ||
    ca.code === "CA-1010"
  ) {
    return true;
  }
  return /^cash and cash equivalents$/i.test(ca.name ?? "");
}

export const CASH_AND_CASH_EQUIVALENTS_FS_LABEL = "Cash and cash equivalents";

export function getMockCanonicalAccounts(): Array<{
  id: string;
  code: string;
  name: string;
}> {
  return CANONICAL_COA_ACCOUNTS.map(({ id, code, name }) => ({
    id,
    code,
    name,
  }));
}

export function getStatementClassificationForCode(
  code: string,
): string | undefined {
  return CANONICAL_COA_BY_CODE.get(code)?.category;
}

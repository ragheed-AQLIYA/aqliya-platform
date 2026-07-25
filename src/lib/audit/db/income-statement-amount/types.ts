export type IncomeStatementMapping = {
  sourceAccountCode: string;
  sourceAccountName: string;
  debitAmount: number;
  creditAmount: number;
  status: string;
  canonicalAccount: {
    code: string;
    name: string;
    category: string;
    statementType: string;
  } | null;
};

export type IncomeStatementLineKind =
  | "revenue"
  | "cost_of_revenue"
  | "operating_expense"
  | "finance_cost"
  | "zakat"
  | "other_income";

import type { IncomeStatementMapping } from "@/lib/audit/db/income-statement-amount";
import type { PresentationProfile } from "@/lib/audit/presentation/presentation-profile";

export type { PresentationProfile };
export { resolvePresentationProfile } from "@/lib/audit/presentation/presentation-profile";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";
export type { PresentationPolicyRules };

/** Extended mapping input for presentation (Map1 label optional — no schema change). */
export type PresentationMapping = IncomeStatementMapping & {
  erpMap1Label?: string | null;
};

export type PresentationLineKind =
  | "revenue"
  | "revenue_affiliate"
  | "revenue_contract"
  | "revenue_other"
  | "cost_of_revenue"
  | "operating_expense"
  | "finance_cost"
  | "finance_deposit_gain"
  | "other_income"
  | "zakat";

export const EQUITY_BRIDGE_CURRENT_YEAR_LABEL =
  "Current Year Profit (IS period — unclosed to RE in TB export)";

export const EQUITY_BRIDGE_ACTUARIAL_LABEL = "Actuarial reserve movement (OCI)";

export type { IncomeStatementMapping, IncomeStatementLineKind } from "./types";
export {
  inferSourceErpStatementSide,
  isIncomeStatementSourceAccount,
  getSignedTrialBalanceNet,
} from "./common";
export { isCostOfRevenueMapping, isOperatingExpenseMapping } from "./predicates";
export { classifyIncomeStatementMapping } from "./classifier";
export {
  getIncomeStatementPeriodAmount,
  computeIncomeStatementNetProfit,
  sumIncomeStatementByKind,
} from "./amounts";

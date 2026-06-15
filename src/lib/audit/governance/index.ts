import "server-only";

export { isApprovalGatesEnabled } from "./governance-engine";
export {
  evaluateFactoryApprovalGatesForEngagement,
  appendFactoryApprovalGates,
  assertFactoryApprovalGatesPass,
  promoteFinancialStatementsOnApproval,
} from "./governance-engine";
export { evaluateFactoryApprovalGates } from "./approval-gates";
export { ApprovalGatesBlockedError } from "./types";
export type {
  ApprovalGateCheck,
  FactoryGateEvaluation,
  FactoryGateSnapshot,
} from "./types";

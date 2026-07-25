export { prisma } from "@/lib/prisma";
export type { DecisionStatus } from "@prisma/client";
export {
  evaluateIntake,
  evaluateFramework,
  evaluateScenarios,
  evaluateRisks,
} from "@/lib/decision";

export { isExpectedAccessDeniedError } from "@/lib/auth";
export { getCurrentUser } from "@/lib/auth";
export { enforce } from "@/lib/kernel";
export { logAudit } from "@/lib/decision/decision-audit";
export { invalidateDashboardCaches } from "@/lib/platform/cache-strategy";
export { createLogger } from "@/lib/observability/logger";

export const VALID_DECISION_TYPES = [
  "TENDER",
  "INVESTMENT",
  "EXPANSION",
  "PROCUREMENT",
  "HIRING",
  "PARTNERSHIP",
  "PRICING",
  "STRATEGIC",
  "OPERATIONS",
  "CUSTOM",
] as const;
export type ValidDecisionType = (typeof VALID_DECISION_TYPES)[number];

export function isValidDecisionType(type: string): type is ValidDecisionType {
  return (VALID_DECISION_TYPES as readonly string[]).includes(type);
}

export type ActionOk<T> = { success: true; data: T };
export type ActionErr = { success: false; error: string };
export type ActionResult<T> = ActionOk<T> | ActionErr;

export function ok<T>(data: T): ActionOk<T> {
  return { success: true, data };
}

export function fail(error: string): ActionErr {
  return { success: false, error };
}

import "server-only";

import {
  checkBudgetQuota,
  getBudgetConfig,
  getBudgetStatus,
  type BudgetQuotaResult,
  type BudgetStatus,
} from "@/lib/ai/budget-manager";

/** IC-P3-01 / Tier 2 — AI cost governance under Core AI gate. */
export async function checkOrgAIBudget(
  organizationId: string,
): Promise<BudgetQuotaResult> {
  return checkBudgetQuota(organizationId);
}

export async function getOrgAIBudgetStatus(
  organizationId: string,
): Promise<BudgetStatus> {
  return getBudgetStatus(organizationId);
}

export async function getOrgAIBudgetConfig(organizationId: string) {
  return getBudgetConfig(organizationId);
}

export const AICostGovernance = {
  checkBudget: checkOrgAIBudget,
  getStatus: getOrgAIBudgetStatus,
  getConfig: getOrgAIBudgetConfig,
};

export type { BudgetQuotaResult, BudgetStatus };

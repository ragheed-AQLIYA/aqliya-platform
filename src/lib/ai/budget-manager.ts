import "server-only"

export interface BudgetQuotaResult {
  allowed: boolean
  reason?: string
}

export async function checkBudgetQuota(_organizationId: string): Promise<BudgetQuotaResult> {
  return { allowed: true }
}

import type { IAutomationService, AutomationRule, AutomationRun } from "../contracts/automation";
import type { KernelResult, PaginatedResult } from "../types";
import { randomUUID } from "crypto";

export class AutomationServiceWrapper implements IAutomationService {
  private runs = new Map<string, AutomationRun[]>();

  async trigger(ruleId: string, payload?: Record<string, unknown>): Promise<KernelResult<AutomationRun>> {
    const run: AutomationRun = {
      id: randomUUID(),
      ruleId,
      status: "completed",
      triggeredAt: new Date(),
      completedAt: new Date(),
      result: payload,
    };
    const existing = this.runs.get(ruleId) ?? [];
    existing.push(run);
    this.runs.set(ruleId, existing);
    return { success: true, data: run };
  }

  async execute(ruleId: string, payload?: Record<string, unknown>): Promise<KernelResult<AutomationRun>> {
    return this.trigger(ruleId, payload);
  }

  async getRunHistory(ruleId: string, params?: { skip?: number; take?: number }): Promise<KernelResult<PaginatedResult<AutomationRun>>> {
    const runs = this.runs.get(ruleId) ?? [];
    return {
      success: true,
      data: { items: runs, totalCount: runs.length, hasMore: false },
    };
  }

  async listRules(organizationId: string): Promise<KernelResult<AutomationRule[]>> {
    return { success: true, data: [] };
  }
}

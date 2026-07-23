import type { IAutomationService, AutomationRule, AutomationRun } from "../contracts/automation";
import type { KernelResult, PaginatedResult } from "../types";
import { randomUUID } from "crypto";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";

export class AutomationServiceWrapper implements IAutomationService {
  private rules = new Map<string, AutomationRule>();
  private runs = new Map<string, AutomationRun[]>();

  async trigger(
    ruleId: string,
    payload?: Record<string, unknown>,
  ): Promise<KernelResult<AutomationRun>> {
    return this.execute(ruleId, payload);
  }

  async execute(
    ruleId: string,
    payload?: Record<string, unknown>,
  ): Promise<KernelResult<AutomationRun>> {
    try {
      const rule = this.rules.get(ruleId);
      if (!rule) {
        return { success: false, error: `Rule ${ruleId} not found` };
      }
      if (!rule.enabled) {
        return { success: false, error: `Rule ${ruleId} is disabled` };
      }

      const run: AutomationRun = {
        id: randomUUID(),
        ruleId,
        status: "running",
        triggeredAt: new Date(),
      };

      const history = this.runs.get(ruleId) ?? [];
      history.push(run);
      this.runs.set(ruleId, history);

      // Log to platform audit trail
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: rule.organizationId,
          productKey: "automation",
          actorId: rule.createdBy,
          actorName: "automation-service",
          action: "automation.rule.executed",
          targetType: "AutomationRule",
          targetId: ruleId,
          metadata: {
            ruleName: rule.name,
            trigger: rule.trigger,
            payload,
            runId: run.id,
          } as Prisma.InputJsonValue,
        },
      });

      // Mark as completed
      run.status = "completed";
      run.completedAt = new Date();
      run.result = { message: "Executed successfully", payload };

      return { success: true, data: run };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Automation execution failed",
      };
    }
  }

  async getRunHistory(
    ruleId: string,
    params?: { skip?: number; take?: number },
  ): Promise<KernelResult<PaginatedResult<AutomationRun>>> {
    const runs = this.runs.get(ruleId) ?? [];
    const skip = params?.skip ?? 0;
    const take = params?.take ?? 20;
    const items = runs.slice(skip, skip + take);
    return {
      success: true,
      data: { items, totalCount: runs.length, hasMore: skip + take < runs.length },
    };
  }

  async listRules(organizationId: string): Promise<KernelResult<AutomationRule[]>> {
    const rules = Array.from(this.rules.values()).filter(
      (r) => r.organizationId === organizationId,
    );
    return { success: true, data: rules };
  }
}

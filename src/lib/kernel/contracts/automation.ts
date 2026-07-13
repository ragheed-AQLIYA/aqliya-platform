import type { KernelResult, PaginatedResult } from "../types";

export type AutomationTrigger = "manual" | "schedule" | "event" | "webhook";

export interface AutomationRule {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  trigger: AutomationTrigger;
  conditions: Record<string, unknown>;
  actions: Array<{ type: string; config: Record<string, unknown> }>;
  enabled: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AutomationRun {
  id: string;
  ruleId: string;
  status: "pending" | "running" | "completed" | "failed";
  triggeredAt: Date;
  completedAt?: Date;
  result?: Record<string, unknown>;
  error?: string;
}

export interface IAutomationService {
  trigger(ruleId: string, payload?: Record<string, unknown>): Promise<KernelResult<AutomationRun>>;
  execute(ruleId: string, payload?: Record<string, unknown>): Promise<KernelResult<AutomationRun>>;
  getRunHistory(ruleId: string, params?: { skip?: number; take?: number }): Promise<KernelResult<PaginatedResult<AutomationRun>>>;
  listRules(organizationId: string): Promise<KernelResult<AutomationRule[]>>;
}

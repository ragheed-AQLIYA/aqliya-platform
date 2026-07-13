import type { KernelResult } from "../types";

export type WorkflowTransitionAction = "submit" | "approve" | "reject" | "return" | "archive";

export interface WorkflowTransitionResult {
  allowed: boolean;
  toStatus?: string;
  reason?: string;
  governanceAction?: WorkflowTransitionAction;
}

export interface WorkflowTemplate {
  productKey: string;
  transitions: Array<{
    from: string[];
    to: string;
    action: WorkflowTransitionAction;
  }>;
}

export interface IWorkflowEngine {
  evaluateTransition(params: {
    productKey: string;
    fromStatus: string;
    action: WorkflowTransitionAction | string;
  }): WorkflowTransitionResult;
  getTemplate(productKey: string): WorkflowTemplate | null;
  getSupportedProducts(): string[];
}

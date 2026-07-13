import type { IWorkflowEngine, WorkflowTransitionResult, WorkflowTemplate } from "../contracts/workflow";
import { evaluateTransition, getProductTemplate } from "@/lib/core/workflow/state-machine";

export class WorkflowEngineWrapper implements IWorkflowEngine {
  evaluateTransition(params: {
    productKey: string;
    fromStatus: string;
    action: string;
  }): WorkflowTransitionResult {
    return evaluateTransition(params);
  }

  getTemplate(productKey: string): WorkflowTemplate | null {
    return getProductTemplate(productKey);
  }

  getSupportedProducts(): string[] {
    return ["decisionos", "decision", "workflowos", "sunbul", "local_content", "localcontent"];
  }
}

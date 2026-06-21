import "server-only";

export type WorkflowTransitionAction =
  | "submit"
  | "approve"
  | "reject"
  | "return"
  | "archive";

export interface WorkflowTransition {
  from: string[];
  to: string;
  action: WorkflowTransitionAction;
}

export interface ProductWorkflowTemplate {
  productKey: string;
  transitions: WorkflowTransition[];
}

const DECISION_OS_TEMPLATE: ProductWorkflowTemplate = {
  productKey: "decisionos",
  transitions: [
    { from: ["DRAFT"], to: "IN_REVIEW", action: "submit" },
    { from: ["IN_REVIEW"], to: "APPROVED", action: "approve" },
    { from: ["IN_REVIEW"], to: "REJECTED", action: "reject" },
    { from: ["IN_REVIEW"], to: "DRAFT", action: "return" },
  ],
};

const WORKFLOW_OS_TEMPLATE: ProductWorkflowTemplate = {
  productKey: "workflowos",
  transitions: [
    { from: ["Draft"], to: "UnderReview", action: "submit" },
    { from: ["UnderReview"], to: "Approved", action: "approve" },
    { from: ["UnderReview"], to: "Draft", action: "return" },
    { from: ["Approved"], to: "Archived", action: "archive" },
  ],
};

const LOCAL_CONTENT_TEMPLATE: ProductWorkflowTemplate = {
  productKey: "local_content",
  transitions: [
    { from: ["Draft", "FindingsDrafted"], to: "InReview", action: "submit" },
    { from: ["InReview"], to: "Approved", action: "approve" },
    { from: ["InReview"], to: "Rejected", action: "reject" },
    { from: ["InReview"], to: "Returned", action: "return" },
    { from: ["Approved", "ReportReady"], to: "Archived", action: "archive" },
  ],
};

const TEMPLATES: Record<string, ProductWorkflowTemplate> = {
  decisionos: DECISION_OS_TEMPLATE,
  decision: DECISION_OS_TEMPLATE,
  workflowos: WORKFLOW_OS_TEMPLATE,
  sunbul: WORKFLOW_OS_TEMPLATE,
  local_content: LOCAL_CONTENT_TEMPLATE,
  localcontent: LOCAL_CONTENT_TEMPLATE,
};

export function getProductTemplate(
  productKey: string,
): ProductWorkflowTemplate | null {
  return TEMPLATES[productKey.toLowerCase()] ?? null;
}

export function evaluateTransition(params: {
  productKey: string;
  fromStatus: string;
  action: WorkflowTransitionAction | string;
}): {
  allowed: boolean;
  toStatus?: string;
  reason?: string;
  governanceAction?: WorkflowTransitionAction;
} {
  const template = getProductTemplate(params.productKey);
  if (!template) {
    return { allowed: true };
  }

  const action = params.action as WorkflowTransitionAction;
  const match = template.transitions.find(
    (transition) =>
      transition.action === action &&
      transition.from.includes(params.fromStatus),
  );

  if (!match) {
    return {
      allowed: false,
      reason: `Transition ${params.fromStatus} → ${action} not allowed for ${params.productKey}`,
    };
  }

  return {
    allowed: true,
    toStatus: match.to,
    governanceAction: match.action,
  };
}

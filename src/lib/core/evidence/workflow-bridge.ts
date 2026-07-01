import "server-only";

import type { WorkflowTransitionAction } from "@/lib/core/workflow/state-machine";
import { evaluateTransition } from "@/lib/core/workflow/engine";
import type { EvidenceProductSlug } from "./evidence-service";
import type { EvidenceLifecycleStatus } from "./lifecycle";
import {
  getCoreEvidenceByProductRef,
  transitionEvidenceLifecycle,
} from "./core-evidence-service";

/** Map workflow governance actions to platform evidence lifecycle states. */
export function mapWorkflowActionToEvidenceLifecycle(
  action: WorkflowTransitionAction,
): EvidenceLifecycleStatus | null {
  switch (action) {
    case "submit":
      return "reviewed";
    case "approve":
      return "approved";
    case "reject":
      return "rejected";
    case "archive":
      return "archived";
    case "return":
      return "created";
    default:
      return null;
  }
}

/** Infer workflow action from AuditOS evidence state. */
export function inferWorkflowActionFromAuditState(
  state: string,
): WorkflowTransitionAction | null {
  if (state === "reviewed") return "submit";
  if (state === "accepted") return "approve";
  if (state === "rejected") return "reject";
  return null;
}

/** Infer workflow action from LocalContentOS evidence status. */
export function inferWorkflowActionFromLocalContentStatus(
  status: string,
): WorkflowTransitionAction | null {
  if (status === "reviewed") return "submit";
  if (status === "verified") return "approve";
  if (status === "rejected") return "reject";
  return null;
}

export interface ApplyWorkflowEvidenceTransitionInput {
  productSlug: EvidenceProductSlug;
  productEvidenceId: string;
  workflowAction: WorkflowTransitionAction;
  /** Optional product workflow context for validation */
  productWorkflowKey?: string;
  fromProductStatus?: string;
  actorId?: string;
  reason?: string;
}

/**
 * Drive evidence lifecycle from a workflow governance action.
 * Validates against WorkflowEngine when product context is provided.
 */
export async function applyWorkflowEvidenceTransition(
  input: ApplyWorkflowEvidenceTransitionInput,
): Promise<{ applied: boolean; lifecycleStatus?: EvidenceLifecycleStatus }> {
  const toStatus = mapWorkflowActionToEvidenceLifecycle(input.workflowAction);
  if (!toStatus) return { applied: false };

  if (input.productWorkflowKey && input.fromProductStatus) {
    const evaluation = evaluateTransition({
      productKey: input.productWorkflowKey,
      fromStatus: input.fromProductStatus,
      action: input.workflowAction,
    });
    if (!evaluation.allowed) {
      return { applied: false };
    }
  }

  const core = await getCoreEvidenceByProductRef({
    productSlug: input.productSlug,
    productEvidenceId: input.productEvidenceId,
  });
  if (!core) return { applied: false };

  if (core.lifecycleStatus === toStatus) {
    return { applied: true, lifecycleStatus: toStatus };
  }

  await transitionEvidenceLifecycle({
    coreEvidenceId: core.id,
    toStatus,
    actorId: input.actorId,
    reason: input.reason,
    provenance: {
      source: "workflow_bridge",
      workflowAction: input.workflowAction,
      productWorkflowKey: input.productWorkflowKey ?? null,
    },
  });

  return { applied: true, lifecycleStatus: toStatus };
}

/**
 * Apply workflow-driven lifecycle when product evidence state changes.
 * Ensures CoreEvidence exists before applying workflow transition.
 */
export async function syncEvidenceLifecycleFromProductState(params: {
  productSlug: EvidenceProductSlug;
  productEvidenceId: string;
  productState: string;
  productWorkflowKey?: string;
  actorId?: string;
  reason?: string;
}): Promise<void> {
  if (params.productSlug === "audit") {
    const { syncAuditEvidenceStateToCore } = await import(
      "./adapters/audit-adapter"
    );
    await syncAuditEvidenceStateToCore({
      evidenceId: params.productEvidenceId,
      newState: params.productState,
      actorId: params.actorId,
      reason: params.reason,
    });
    return;
  }

  if (params.productSlug === "local_content") {
    const { syncLocalContentEvidenceStateToCore } = await import(
      "./adapters/local-content-adapter"
    );
    await syncLocalContentEvidenceStateToCore({
      evidenceId: params.productEvidenceId,
      newStatus: params.productState,
      actorId: params.actorId,
      reason: params.reason,
    });
  }
}

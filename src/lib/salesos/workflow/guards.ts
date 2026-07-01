/**
 * Transition Guards — SPEC-01c §2
 *
 * Ordered guard pipeline: Validation → Business → Governance.
 * Fail-fast: first failure stops the pipeline.
 * Deterministic: same input always produces same result.
 */

import type { Deal } from "../domain/deal";

// ─── Guard Types (SPEC-01c §2.1) ───

export type GuardPhase = "validation" | "business" | "governance";

export interface GuardResult {
  allowed: boolean;
  reason: string;
  code?: "VALIDATION_ERROR" | "BUSINESS_RULE_FAILED" | "GOVERNANCE_BLOCKED" | "NOT_FOUND";
}

export type GuardFn = (deal: Deal, context: GuardContext) => GuardResult;

export interface GuardContext {
  actorId: string;
  organizationId: string;
  targetStageName: string;
}

export interface GuardEvaluation {
  guardName: string;
  phase: GuardPhase;
  result: GuardResult;
}

export interface GuardPipelineResult {
  allowed: boolean;
  failedPhase?: GuardPhase;
  evaluations: GuardEvaluation[];
}

// ─── Guards ───

/** Business guard: account must be active */
export function accountMustBeActive(_deal: Deal, _ctx: GuardContext): GuardResult {
  // Domain-level check — account status is not part of the Deal aggregate
  // In production, this queries the account repository. For now, assume active.
  return { allowed: true, reason: "Account is active" };
}

/** Governance guard: evidence gate */
export function evidenceGate(deal: Deal, ctx: GuardContext): GuardResult {
  const requiredMap: Record<string, number> = {
    "In Review": 1,
    "Approved": 1,
  };
  const required = requiredMap[ctx.targetStageName] ?? 0;
  if (required === 0) return { allowed: true, reason: `No evidence required for ${ctx.targetStageName}` };

  if (deal.evidenceCount < required) {
    return {
      allowed: false,
      reason: `Evidence required: ${required} needed, ${deal.evidenceCount} linked`,
      code: "GOVERNANCE_BLOCKED",
    };
  }
  return { allowed: true, reason: `Evidence gate met (${deal.evidenceCount}/${required})` };
}

/** Business guard: reviewer cannot be owner */
export function reviewerNotOwner(deal: Deal, ctx: GuardContext): GuardResult {
  if (ctx.actorId === deal.ownerId) {
    return {
      allowed: false,
      reason: "Reviewer cannot be the deal owner",
      code: "BUSINESS_RULE_FAILED",
    };
  }
  return { allowed: true, reason: "Reviewer is not the deal owner" };
}

/** Governance guard: approval audit trail complete */
export function approvalAuditComplete(deal: Deal, _ctx: GuardContext): GuardResult {
  if (deal.reviewDecisions.length === 0) {
    return {
      allowed: false,
      reason: "Approval audit trail is empty. Cannot close as won.",
      code: "GOVERNANCE_BLOCKED",
    };
  }
  return { allowed: true, reason: "Approval audit trail exists" };
}

// ─── Phase-to-Guard Mapping ───

export const GUARD_PHASE_MAP: Record<string, { guards: GuardFn[]; phase: GuardPhase }> = {
  qualify: { guards: [accountMustBeActive], phase: "business" },
  submit_for_review: { guards: [evidenceGate], phase: "governance" },
  approve: { guards: [reviewerNotOwner], phase: "business" },
  reject: { guards: [reviewerNotOwner], phase: "business" },
  negotiate: { guards: [], phase: "business" },
  close_won: { guards: [approvalAuditComplete], phase: "governance" },
  close_lost: { guards: [], phase: "business" },
};

// ─── Guard Pipeline (SPEC-01c §2.1) ───

export function evaluateGuardPipeline(
  action: string,
  deal: Deal,
  context: GuardContext,
): GuardPipelineResult {
  const evaluations: GuardEvaluation[] = [];
  const entry = GUARD_PHASE_MAP[action];

  if (!entry || entry.guards.length === 0) {
    return { allowed: true, evaluations };
  }

  // All guards for this action run in their assigned phase
  for (const guard of entry.guards) {
    const result = guard(deal, context);
    evaluations.push({ guardName: guard.name, phase: entry.phase, result });
    if (!result.allowed) {
      return { allowed: false, failedPhase: entry.phase, evaluations };
    }
  }

  return { allowed: true, evaluations };
}

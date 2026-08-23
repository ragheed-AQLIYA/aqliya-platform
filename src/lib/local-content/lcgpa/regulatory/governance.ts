// ─── LCGPA Regulatory Intelligence :: Governance Gate (§24, §25, §48, §50) ───
//
//   DETECTED → VERIFIED → PARSED → DIFFED → CLASSIFIED → IMPACT_ANALYZED
//            → PENDING_REVIEW → APPROVED → PUBLISHED → ACTIVE
//
// NO SILENT REGULATORY MUTATION (§25). A new file can never become production
// truth by arriving. It must be verified, diffed, impact-analysed, reviewed,
// approved, published, and only then activated — and activation still waits for
// the effective date.
//
// Approval is always attributable to a real authenticated user, except where a
// documented, auditable auto-approval policy explicitly permits otherwise.

import type {
  ApprovalRecord,
  AuthorityTier,
  AutoApprovalPolicy,
  Clock,
  GovernanceCase,
  GovernanceState,
  GovernanceTransition,
  RegulatoryDataset,
  RegulatoryDiff,
  RegulatorySource,
  RejectionRecord,
} from "./types";
import { deterministicId } from "./ids";
import { SEVERITY_ORDER, highestSeverity } from "./change-classification";
import { evaluateActivation } from "./effective-date";
import type { EffectiveDateEvidence } from "./effective-date-evidence";

/** Named principal used for automated steps so every transition has an actor. */
export const SYSTEM_PRINCIPAL = "system:lcgpa-regulatory-monitor";

// ─── State machine ───

export const ALLOWED_TRANSITIONS: Record<GovernanceState, GovernanceState[]> = {
  DETECTED: ["VERIFIED", "QUARANTINED", "FAILED"],
  VERIFIED: ["PARSED", "QUARANTINED", "FAILED"],
  PARSED: ["DIFFED", "FAILED"],
  DIFFED: ["CLASSIFIED", "FAILED"],
  CLASSIFIED: ["IMPACT_ANALYZED", "FAILED"],
  IMPACT_ANALYZED: ["PENDING_REVIEW", "AUTO_APPROVED", "FAILED"],
  PENDING_REVIEW: ["APPROVED", "REJECTED", "QUARANTINED"],
  AUTO_APPROVED: ["PUBLISHED", "PENDING_REVIEW"],
  APPROVED: ["PUBLISHED"],
  REJECTED: [],
  PUBLISHED: ["ACTIVE", "REJECTED"],
  ACTIVE: ["ROLLED_BACK"],
  ROLLED_BACK: [],
  QUARANTINED: ["PENDING_REVIEW", "REJECTED"],
  FAILED: ["DETECTED"],
};

export function canTransition(from: GovernanceState, to: GovernanceState): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

// ─── Case lifecycle ───

export interface CreateCaseInput {
  sourceId: string;
  artifactSha256: string;
  datasetVersion: string;
  correlationId: string;
  actorId?: string;
}

export function createGovernanceCase(
  input: CreateCaseInput,
  clock: Clock,
): GovernanceCase {
  const now = clock.now();
  return {
    caseId: deterministicId("CASE", [
      input.sourceId,
      input.artifactSha256,
      input.datasetVersion,
    ]),
    sourceId: input.sourceId,
    artifactSha256: input.artifactSha256,
    datasetVersion: input.datasetVersion,
    diffId: null,
    impactId: null,
    state: "DETECTED",
    history: [
      {
        from: "DETECTED",
        to: "DETECTED",
        at: now,
        actorId: input.actorId ?? SYSTEM_PRINCIPAL,
        actorName: null,
        reason: "Change detected at source; governance case opened.",
        correlationId: input.correlationId,
      },
    ],
    createdAt: now,
    updatedAt: now,
    approval: null,
    rejection: null,
  };
}

export interface TransitionInput {
  to: GovernanceState;
  actorId: string;
  actorName?: string | null;
  reason: string;
  correlationId: string;
  clock: Clock;
}

/**
 * Advance a case. Illegal transitions throw — there is no "force" path.
 */
export function transitionCase(
  current: GovernanceCase,
  input: TransitionInput,
): GovernanceCase {
  if (!input.actorId) {
    throw new Error(
      "ACTOR_REQUIRED: every governance transition must be attributable to an authenticated user or a named system principal",
    );
  }
  if (!canTransition(current.state, input.to)) {
    throw new Error(
      `ILLEGAL_TRANSITION: ${current.state} → ${input.to} is not permitted by the governance lifecycle`,
    );
  }
  const at = input.clock.now();
  const entry: GovernanceTransition = {
    from: current.state,
    to: input.to,
    at,
    actorId: input.actorId,
    actorName: input.actorName ?? null,
    reason: input.reason,
    correlationId: input.correlationId,
  };
  return {
    ...current,
    state: input.to,
    history: [...current.history, entry],
    updatedAt: at,
  };
}

// ─── Auto-approval policy (§24) ───

export const DEFAULT_AUTO_APPROVAL_POLICY: AutoApprovalPolicy = {
  policyId: "AUTO-LABEL-ONLY-V1",
  description:
    "Auto-approve label-only corrections from the regulatory authority: renames and description edits with no requirement, scope, timing or status change. Everything else requires a human reviewer.",
  allowedChangeTypes: ["PRODUCT_RENAMED", "PRODUCT_DESCRIPTION_CHANGED"],
  maxSeverity: "LOW",
  maxChangeCount: 25,
  requiredAuthorityTier: 1 as AuthorityTier,
  enabled: false,
};

export interface AutoApprovalDecision {
  eligible: boolean;
  policyId: string | null;
  reason: string;
}

/**
 * May this diff bypass human review?
 * Refuses by default. Every refusal states which condition failed.
 */
export function evaluateAutoApproval(
  policy: AutoApprovalPolicy,
  diff: RegulatoryDiff,
  source: RegulatorySource,
): AutoApprovalDecision {
  if (!policy.enabled) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: `POLICY_DISABLED: ${policy.policyId} is not enabled; human review required`,
    };
  }
  if (source.authorityTier > policy.requiredAuthorityTier) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: `TIER_INSUFFICIENT: source is TIER ${source.authorityTier}; policy requires TIER ${policy.requiredAuthorityTier} or higher`,
    };
  }
  if (diff.changes.length === 0) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: "NO_CHANGES: nothing to approve",
    };
  }
  if (diff.changes.length > policy.maxChangeCount) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: `CHANGE_COUNT_EXCEEDED: ${diff.changes.length} changes exceeds policy maximum of ${policy.maxChangeCount}`,
    };
  }
  const allowed = new Set(policy.allowedChangeTypes);
  const disallowed = Array.from(
    new Set(diff.changes.filter((c) => !allowed.has(c.changeType)).map((c) => c.changeType)),
  ).sort();
  if (disallowed.length > 0) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: `CHANGE_TYPE_NOT_ALLOWED: ${disallowed.join(", ")} not permitted for auto-approval`,
    };
  }
  const severity = highestSeverity(diff.changes.map((c) => c.severity));
  if (SEVERITY_ORDER[severity] > SEVERITY_ORDER[policy.maxSeverity]) {
    return {
      eligible: false,
      policyId: policy.policyId,
      reason: `SEVERITY_EXCEEDED: highest severity ${severity} exceeds policy maximum ${policy.maxSeverity}`,
    };
  }
  return {
    eligible: true,
    policyId: policy.policyId,
    reason: `AUTO_APPROVAL_PERMITTED: all ${diff.changes.length} change(s) satisfy ${policy.policyId}`,
  };
}

// ─── Review actions ───

export interface ReviewActorInput {
  actorId: string;
  actorName?: string | null;
  correlationId: string;
  clock: Clock;
}

export function requestReview(
  current: GovernanceCase,
  diffId: string,
  impactId: string,
  input: ReviewActorInput,
): GovernanceCase {
  const next = transitionCase(current, {
    to: "PENDING_REVIEW",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: "Impact analysis complete; routed to human review.",
    correlationId: input.correlationId,
    clock: input.clock,
  });
  return { ...next, diffId, impactId };
}

/** Human approval. Requires a real authenticated user id (§48). */
export function approveCase(
  current: GovernanceCase,
  input: ReviewActorInput & { note: string },
): GovernanceCase {
  if (!input.actorId || input.actorId.startsWith("system:")) {
    throw new Error(
      "HUMAN_APPROVAL_REQUIRED: approval must be attributable to a real authenticated user, not a system principal",
    );
  }
  const next = transitionCase(current, {
    to: "APPROVED",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: input.note,
    correlationId: input.correlationId,
    clock: input.clock,
  });
  const approval: ApprovalRecord = {
    approvedById: input.actorId,
    approvedByName: input.actorName ?? null,
    approvedAt: next.updatedAt,
    automatic: false,
    policyId: null,
    note: input.note,
  };
  return { ...next, approval };
}

/** Policy-controlled automatic approval. Auditable and attributable to the policy. */
export function autoApproveCase(
  current: GovernanceCase,
  decision: AutoApprovalDecision,
  input: ReviewActorInput,
): GovernanceCase {
  if (!decision.eligible) {
    throw new Error(`AUTO_APPROVAL_REFUSED: ${decision.reason}`);
  }
  const next = transitionCase(current, {
    to: "AUTO_APPROVED",
    actorId: input.actorId || SYSTEM_PRINCIPAL,
    actorName: input.actorName ?? null,
    reason: decision.reason,
    correlationId: input.correlationId,
    clock: input.clock,
  });
  const approval: ApprovalRecord = {
    approvedById: input.actorId || SYSTEM_PRINCIPAL,
    approvedByName: input.actorName ?? null,
    approvedAt: next.updatedAt,
    automatic: true,
    policyId: decision.policyId,
    note: decision.reason,
  };
  return { ...next, approval };
}

export function rejectCase(
  current: GovernanceCase,
  input: ReviewActorInput & { reason: string },
): GovernanceCase {
  if (!input.reason) {
    throw new Error("REJECTION_REASON_REQUIRED: a rejection must state its reason");
  }
  const next = transitionCase(current, {
    to: "REJECTED",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: input.reason,
    correlationId: input.correlationId,
    clock: input.clock,
  });
  const rejection: RejectionRecord = {
    rejectedById: input.actorId,
    rejectedByName: input.actorName ?? null,
    rejectedAt: next.updatedAt,
    reason: input.reason,
  };
  return { ...next, rejection };
}

export function publishCase(
  current: GovernanceCase,
  input: ReviewActorInput,
): GovernanceCase {
  if (!current.approval) {
    throw new Error(
      "PUBLISH_WITHOUT_APPROVAL: a case may only be published after approval",
    );
  }
  return transitionCase(current, {
    to: "PUBLISHED",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: "Approved change set published; awaiting effective date for activation.",
    correlationId: input.correlationId,
    clock: input.clock,
  });
}

// ─── Dataset publication & activation ───

export interface PublishDatasetResult {
  dataset: RegulatoryDataset;
  case: GovernanceCase;
}

/** Move an approved dataset to PUBLISHED. It is still NOT in production use. */
export function publishDataset(
  dataset: RegulatoryDataset,
  governanceCase: GovernanceCase,
  input: ReviewActorInput,
): PublishDatasetResult {
  if (
    governanceCase.state !== "APPROVED" &&
    governanceCase.state !== "AUTO_APPROVED"
  ) {
    throw new Error(
      `PUBLISH_BLOCKED: governance case is ${governanceCase.state}; only APPROVED or AUTO_APPROVED cases may publish`,
    );
  }
  const nextCase = publishCase(governanceCase, input);
  return {
    dataset: { ...dataset, status: "PUBLISHED" },
    case: nextCase,
  };
}

export interface ActivateDatasetInput extends ReviewActorInput {
  /** The dataset currently ACTIVE for this source, if any. */
  currentActive: RegulatoryDataset | null;
  /**
   * Recorded effective-date evidence. Consulted only when the artifact itself
   * states no date (P0.7).
   */
  effectiveDateEvidence?: EffectiveDateEvidence[];
}

export interface ActivateDatasetResult {
  activated: RegulatoryDataset | null;
  superseded: RegulatoryDataset | null;
  case: GovernanceCase;
  ok: boolean;
  reason: string;
}

/**
 * Activate a published dataset — the ONLY path by which regulatory truth changes.
 * Refuses before the effective date (§18).
 */
export function activateDataset(
  dataset: RegulatoryDataset,
  governanceCase: GovernanceCase,
  input: ActivateDatasetInput,
): ActivateDatasetResult {
  const now = input.clock.now();
  const decision = evaluateActivation(dataset, now, input.effectiveDateEvidence ?? []);
  if (!decision.eligible) {
    return {
      activated: null,
      superseded: null,
      case: governanceCase,
      ok: false,
      reason: decision.reason,
    };
  }
  if (governanceCase.state !== "PUBLISHED") {
    return {
      activated: null,
      superseded: null,
      case: governanceCase,
      ok: false,
      reason: `ACTIVATION_BLOCKED: governance case is ${governanceCase.state}; only PUBLISHED cases may activate`,
    };
  }

  const nextCase = transitionCase(governanceCase, {
    to: "ACTIVE",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: decision.reason,
    correlationId: input.correlationId,
    clock: input.clock,
  });

  return {
    activated: {
      ...dataset,
      status: "ACTIVE",
      activatedAt: now,
      // Stamp the resolved date so every later temporal resolution sees it.
      effectiveFrom: decision.activateAt ?? dataset.effectiveFrom,
    },
    superseded: input.currentActive
      ? { ...input.currentActive, status: "SUPERSEDED", deactivatedAt: now }
      : null,
    case: nextCase,
    ok: true,
    reason: decision.reason,
  };
}

// ─── Rollback (§50) ───

export interface RollbackResult {
  /** The dataset that was rolled back. Preserved as QUARANTINED evidence. */
  quarantined: RegulatoryDataset;
  /** The previously verified dataset, returned to ACTIVE. */
  restored: RegulatoryDataset | null;
  case: GovernanceCase;
  reason: string;
}

/**
 * Roll back an activated dataset that has been found invalid.
 *
 * The invalid dataset is NEVER destroyed — it is quarantined with its evidence
 * intact so the failure can be investigated and reproduced.
 */
export function rollbackDataset(
  active: RegulatoryDataset,
  previousVerified: RegulatoryDataset | null,
  governanceCase: GovernanceCase,
  input: ReviewActorInput & { reason: string },
): RollbackResult {
  if (!input.reason) {
    throw new Error("ROLLBACK_REASON_REQUIRED: a rollback must state its reason");
  }
  if (active.status !== "ACTIVE") {
    throw new Error(
      `ROLLBACK_BLOCKED: dataset ${active.datasetVersion} is ${active.status}; only an ACTIVE dataset can be rolled back`,
    );
  }
  const now = input.clock.now();
  const nextCase = transitionCase(governanceCase, {
    to: "ROLLED_BACK",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: input.reason,
    correlationId: input.correlationId,
    clock: input.clock,
  });

  return {
    quarantined: {
      ...active,
      status: "QUARANTINED",
      deactivatedAt: now,
    },
    restored: previousVerified
      ? { ...previousVerified, status: "ACTIVE", activatedAt: now, deactivatedAt: null }
      : null,
    case: nextCase,
    reason: input.reason,
  };
}

// ─── Dataset expiry (§18, §50) ───

/**
 * Result of expiring an ACTIVE dataset whose validity window has closed.
 *
 * The expired dataset is quarantined (not destroyed) so its evidence and
 * provenance are preserved for audit and reproduction.
 */
export interface ExpireDatasetResult {
  /** The dataset after expiry — status QUARANTINED, deactivatedAt stamped. */
  expired: RegulatoryDataset;
  /** The governance case after the ACTIVE → ROLLED_BACK transition. */
  case: GovernanceCase;
  reason: string;
}

/**
 * Expire an ACTIVE dataset whose `effectiveTo` date has passed.
 *
 * This is the time-based counterpart of `rollbackDataset()`:
 *   - `rollbackDataset` is triggered by a human decision (data invalid)
 *   - `expireDataset` is triggered by the clock (validity window closed)
 *
 * Both produce the same outcome: the dataset is quarantined with its evidence
 * intact, and the governance case transitions to ROLLED_BACK.
 *
 * The governance case MUST be in ACTIVE state — otherwise the dataset should
 * not have been active in the first place (assertGovernedActivation guard).
 *
 * @throws when the governance case is not in ACTIVE state
 * @throws when the dataset is not ACTIVE
 */
export function expireDataset(
  dataset: RegulatoryDataset,
  governanceCase: GovernanceCase,
  input: ReviewActorInput & { reason: string },
): ExpireDatasetResult {
  if (!input.reason) {
    throw new Error("EXPIRY_REASON_REQUIRED: an expiry must state its reason");
  }
  if (dataset.status !== "ACTIVE") {
    throw new Error(
      `EXPIRY_BLOCKED: dataset ${dataset.datasetVersion} is ${dataset.status}; only an ACTIVE dataset can be expired`,
    );
  }
  if (governanceCase.state !== "ACTIVE") {
    throw new Error(
      `EXPIRY_BLOCKED: governance case is ${governanceCase.state}; only an ACTIVE case may expire`,
    );
  }

  const now = input.clock.now();
  const nextCase = transitionCase(governanceCase, {
    to: "ROLLED_BACK",
    actorId: input.actorId,
    actorName: input.actorName,
    reason: input.reason,
    correlationId: input.correlationId,
    clock: input.clock,
  });

  return {
    expired: {
      ...dataset,
      status: "QUARANTINED",
      deactivatedAt: now,
    },
    case: nextCase,
    reason: input.reason,
  };
}

// ─── Silent-mutation guard (§25) ───

/**
 * Assert that a dataset reached ACTIVE only through the governance pipeline.
 * Call this before any code path reads a dataset as production truth.
 */
export function assertGovernedActivation(
  dataset: RegulatoryDataset,
  governanceCase: GovernanceCase,
): void {
  if (dataset.status !== "ACTIVE") return;
  if (governanceCase.state !== "ACTIVE") {
    throw new Error(
      `SILENT_MUTATION_DETECTED: dataset ${dataset.datasetVersion} is ACTIVE but its governance case is ${governanceCase.state}`,
    );
  }
  if (!governanceCase.approval) {
    throw new Error(
      `SILENT_MUTATION_DETECTED: dataset ${dataset.datasetVersion} is ACTIVE without an approval record`,
    );
  }
  if (dataset.activatedAt === null) {
    throw new Error(
      `SILENT_MUTATION_DETECTED: dataset ${dataset.datasetVersion} is ACTIVE without an activation timestamp`,
    );
  }
}

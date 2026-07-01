import type { EvidenceProductSlug } from "./evidence-service";

/** Platform canonical lifecycle states (Phase 5B). */
export const EVIDENCE_LIFECYCLE_STATUSES = [
  "created",
  "reviewed",
  "approved",
  "rejected",
  "archived",
] as const;

export type EvidenceLifecycleStatus =
  (typeof EVIDENCE_LIFECYCLE_STATUSES)[number];

export const EVIDENCE_RELATION_TYPES = [
  "derives_from",
  "supersedes",
  "duplicates",
  "related_to",
  "lineage",
] as const;

export type EvidenceRelationType = (typeof EVIDENCE_RELATION_TYPES)[number];

export const EVIDENCE_LINK_TYPES = [
  "supports",
  "contradicts",
  "references",
  "evidence_for",
] as const;

export type EvidenceLinkType = (typeof EVIDENCE_LINK_TYPES)[number];

const AUDIT_STATE_MAP: Record<string, EvidenceLifecycleStatus> = {
  missing: "created",
  requested: "created",
  uploaded: "created",
  linked: "created",
  reviewed: "reviewed",
  accepted: "approved",
  rejected: "rejected",
};

const LOCAL_CONTENT_STATUS_MAP: Record<string, EvidenceLifecycleStatus> = {
  missing: "created",
  uploaded: "created",
  linked: "created",
  reviewed: "reviewed",
  verified: "approved",
  rejected: "rejected",
};

/** Map product-specific state to platform lifecycle status. */
export function mapProductStateToLifecycle(
  productSlug: EvidenceProductSlug,
  productState: string,
): EvidenceLifecycleStatus {
  switch (productSlug) {
    case "audit":
      return AUDIT_STATE_MAP[productState] ?? "created";
    case "local_content":
      return LOCAL_CONTENT_STATUS_MAP[productState] ?? "created";
    case "decision":
    case "contact":
    case "workflow":
      if (productState === "archived") return "archived";
      if (productState === "rejected") return "rejected";
      if (productState === "approved" || productState === "verified") {
        return "approved";
      }
      if (productState === "reviewed") return "reviewed";
      return "created";
    default:
      return "created";
  }
}

/** Valid lifecycle transitions (from → to). */
const VALID_TRANSITIONS: Record<
  EvidenceLifecycleStatus,
  readonly EvidenceLifecycleStatus[]
> = {
  created: ["reviewed", "approved", "rejected", "archived"],
  reviewed: ["approved", "rejected", "archived"],
  approved: ["archived"],
  rejected: ["created", "archived"],
  archived: [],
};

export function isValidLifecycleTransition(
  from: EvidenceLifecycleStatus,
  to: EvidenceLifecycleStatus,
): boolean {
  if (from === to) return true;
  return VALID_TRANSITIONS[from].includes(to);
}

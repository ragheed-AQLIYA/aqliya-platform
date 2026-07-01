/**
 * Deal ViewModels — SPEC-01d §10
 *
 * Pure functions that transform API DTOs to UI-specific ViewModels.
 * Zero Domain types. Zero API types. Zero business logic.
 */

import type { DealResponse, DealDetailResponse } from "../api/dto";

// ─── UX States (SPEC-01d §1) ───

export type UXState =
  | "loading" | "empty" | "error" | "permission_denied"
  | "governance_blocked" | "data" | "ai_pending" | "ai_ready"
  | "not_found" | "conflict";

// ─── ViewModels ───

export interface DealRowViewModel {
  id: string;
  name: string;
  accountName: string;
  stage: StageViewModel;
  amount: string;              // formatted
  probability: number;
  ownerName: string;
  evidenceCount: number;
  evidenceRequired: number;
  evidenceGateMet: boolean;
  reviewStatus: string;
  slaStatus: SLAStatusViewModel | null;
  updatedAt: string;           // relative
  allowedActions: string[];
}

export interface StageViewModel {
  name: string;
  labelAr: string;
  color: string;
  isTerminal: boolean;
  sortOrder: number;
}

export interface StageProgressViewModel {
  stages: StageProgressItem[];
  currentStageIndex: number;
}

export interface StageProgressItem {
  name: string;
  labelAr: string;
  sortOrder: number;
  state: "completed" | "current" | "future" | "terminal_won" | "terminal_lost";
}

export interface SLAStatusViewModel {
  status: "on_track" | "approaching" | "breached" | "extreme";
  remainingHours?: number;
}

export interface DealDetailViewModel {
  header: DealRowViewModel;
  stageProgress: StageProgressViewModel;
  evidence: EvidencePanelViewModel;
  review: ReviewPanelViewModel;
  sla: SLAStatusViewModel | null;
  audit: AuditTrailViewModel;
}

export interface EvidencePanelViewModel {
  count: number;
  required: number;
  gateMet: boolean;
  items: EvidenceItemViewModel[];
}

export interface EvidenceItemViewModel {
  id: string;
  title: string;
  type: string;
  linkedAt: string;
}

export interface ReviewPanelViewModel {
  status: string;
  decisions: ReviewDecisionViewModel[];
}

export interface ReviewDecisionViewModel {
  actorName: string;
  decision: "approved" | "rejected";
  reason: string;
  createdAt: string;
}

export interface AuditTrailViewModel {
  items: AuditEventViewModel[];
}

export interface AuditEventViewModel {
  action: string;
  actorName: string;
  timestamp: string;
}

// ─── Stage Configuration (SPEC-01c §1.2) ───

const STAGE_CONFIG: Record<string, Omit<StageViewModel, "name">> = {
  "Draft": { labelAr: "مسودة", color: "gray", isTerminal: false, sortOrder: 1 },
  "Qualified": { labelAr: "مؤهل", color: "blue", isTerminal: false, sortOrder: 2 },
  "In Review": { labelAr: "قيد المراجعة", color: "yellow", isTerminal: false, sortOrder: 3 },
  "Approved": { labelAr: "معتمد", color: "green", isTerminal: false, sortOrder: 4 },
  "Negotiation": { labelAr: "تفاوض", color: "purple", isTerminal: false, sortOrder: 5 },
  "Closed Won": { labelAr: "فوز", color: "green", isTerminal: true, sortOrder: 6 },
  "Closed Lost": { labelAr: "خسارة", color: "red", isTerminal: true, sortOrder: 7 },
};

// ─── Mappers (pure functions) ───

export function toDealRowViewModel(
  dto: DealResponse,
  accountName: string,
  allowedActions: string[],
  slaStatus: SLAStatusViewModel | null = null,
): DealRowViewModel {
  const stageCfg = STAGE_CONFIG[dto.stage] ?? STAGE_CONFIG["Draft"];
  const evidenceRequired = dto.stage === "In Review" || dto.stage === "Approved" ? 1 : 0;

  return {
    id: dto.id,
    name: dto.name,
    accountName,
    stage: { name: dto.stage, ...stageCfg },
    amount: `${dto.amount.toLocaleString()} ${dto.currency}`,
    probability: dto.probability,
    ownerName: dto.ownerId,
    evidenceCount: dto.evidenceCount,
    evidenceRequired,
    evidenceGateMet: dto.evidenceCount >= evidenceRequired,
    reviewStatus: dto.reviewStatus,
    slaStatus,
    updatedAt: relativeTime(dto.updatedAt),
    allowedActions,
  };
}

export function toStageProgress(currentStage: string): StageProgressViewModel {
  const allStages = Object.entries(STAGE_CONFIG).sort((a, b) => a[1].sortOrder - b[1].sortOrder);
  const currentCfg = STAGE_CONFIG[currentStage];
  const currentSort = currentCfg?.sortOrder ?? 1;

  const stages: StageProgressItem[] = allStages.map(([name, cfg]) => {
    let state: StageProgressItem["state"];
    if (cfg.sortOrder < currentSort) state = "completed";
    else if (cfg.sortOrder === currentSort) {
      if (name === "Closed Won") state = "terminal_won";
      else if (name === "Closed Lost") state = "terminal_lost";
      else state = "current";
    } else {
      state = "future";
    }
    return { name, labelAr: cfg.labelAr, sortOrder: cfg.sortOrder, state };
  });

  return { stages, currentStageIndex: currentSort - 1 };
}

export function toDealDetailViewModel(
  dto: DealDetailResponse,
  allowedActions: string[],
  slaStatus: SLAStatusViewModel | null = null,
): DealDetailViewModel {
  const evidenceRequired = dto.stage === "In Review" || dto.stage === "Approved" ? 1 : 0;

  return {
    header: toDealRowViewModel(dto, dto.accountName, allowedActions, slaStatus),
    stageProgress: toStageProgress(dto.stage),
    evidence: {
      count: dto.evidenceCount,
      required: evidenceRequired,
      gateMet: dto.evidenceCount >= evidenceRequired,
      items: (dto.evidenceLinks as EvidenceItemViewModel[]) ?? [],
    },
    review: {
      status: dto.reviewStatus,
      decisions: (dto.reviewDecisions as ReviewDecisionViewModel[]) ?? [],
    },
    sla: slaStatus,
    audit: {
      items: (dto.auditEvents as AuditEventViewModel[]) ?? [],
    },
  };
}

// ─── Allowed Actions (SPEC-01d §11) ───

export function computeAllowedActions(
  stage: string,
  reviewStatus: string,
  isOwner: boolean,
  isManager: boolean,
  isAdmin: boolean,
  evidenceCount: number,
): string[] {
  const actions: string[] = [];

  // All roles
  if (isOwner) actions.push("edit");
  if (isManager || isAdmin) actions.push("edit", "link_evidence");
  if (isAdmin) actions.push("delete");

  // Stage-specific
  if (isOwner && stage === "Draft") actions.push("qualify");
  if (isOwner && stage === "Qualified" && evidenceCount >= 1) actions.push("submit_for_review");
  if (isManager && stage === "In Review") actions.push("approve", "reject");
  if (isOwner && stage === "Approved") actions.push("negotiate");
  if (isOwner && stage === "Negotiation") actions.push("close_won", "close_lost");

  return [...new Set(actions)];
}

// ─── Helpers ───

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

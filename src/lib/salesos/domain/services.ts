/**
 * Domain Service Interfaces — SPEC-01a §4
 */

import type { Deal } from "./deal";
import type { Stage, StageName } from "./value-objects/stage";
import type { ReviewDecision } from "./deal";

// ─── Deal Transition Service ───

export interface TransitionOptions {
  reason?: string;
  reviewDecision?: ReviewDecision;
}

export interface DealTransitionService {
  transition(
    deal: Deal,
    action: string,
    actorId: string,
    toStage: Stage,
    options?: TransitionOptions,
  ): Deal;
}

// ─── Evidence Gate Service ───

export interface EvidenceGateService {
  getRequiredEvidenceCount(stage: StageName): number;
  validateGate(deal: Deal, toStage: StageName): boolean;
}

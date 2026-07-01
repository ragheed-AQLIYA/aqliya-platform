/**
 * Domain Events — SPEC-01a §3
 *
 * 7 lifecycle events for Deal aggregate.
 * eventVersion = 1 for all events (SalesOS v2.0 baseline).
 */

import type { StageName } from "./value-objects/stage";

export const EVENT_VERSION_V1 = 1;

// ─── Base event envelope (Platform Kernel contract) ───

export interface DomainEvent {
  id: string;
  type: string;
  eventVersion: number;
  source: string;
  subject: string;
  data: unknown;
  timestamp: string;
  sequenceId: string;
  correlationId?: string;
}

// ─── Deal Created ───

export interface DealCreatedEvent {
  type: "salesos.deal.created";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    accountId: string;
    name: string;
    amount: number;
    currency: string;
    stage: StageName;
    ownerId: string;
    createdById: string;
  };
}

// ─── Deal Stage Changed ───

export interface DealStageChangedEvent {
  type: "salesos.deal.stage_changed";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    fromStage: StageName;
    toStage: StageName;
    action: string;
    actorId: string;
    reason?: string;
  };
}

// ─── Deal Submitted for Review ───

export interface DealSubmittedForReviewEvent {
  type: "salesos.deal.submitted_for_review";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    reviewerId: string;
    evidenceCount: number;
  };
}

// ─── Deal Approved ───

export interface DealApprovedEvent {
  type: "salesos.deal.approved";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    approverId: string;
    reviewDuration: number;  // hours from submission
  };
}

// ─── Deal Rejected ───

export interface DealRejectedEvent {
  type: "salesos.deal.rejected";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    reviewerId: string;
    reason: string;
  };
}

// ─── Deal Closed Won ───

export interface DealClosedWonEvent {
  type: "salesos.deal.closed_won";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    amount: number;
    currency: string;
    accountId: string;
    closedAt: string;
  };
}

// ─── Deal Closed Lost ───

export interface DealClosedLostEvent {
  type: "salesos.deal.closed_lost";
  eventVersion: 1;
  subject: string;
  data: {
    dealId: string;
    amount: number;
    reason: string;
    competitor?: string;
    closedAt: string;
  };
}

// ─── Event type union ───

export type DealEvent =
  | DealCreatedEvent
  | DealStageChangedEvent
  | DealSubmittedForReviewEvent
  | DealApprovedEvent
  | DealRejectedEvent
  | DealClosedWonEvent
  | DealClosedLostEvent;

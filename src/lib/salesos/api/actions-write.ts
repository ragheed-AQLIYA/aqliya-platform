/**
 * Write Server Actions — SPEC-01b §2
 *
 * Mutations: create, update, transition, linkEvidence, delete.
 * Every mutation goes through the Deal aggregate — never bypasses it.
 *
 * Zero business logic lives here. Logic lives in the Domain.
 */

import "server-only";
import type { DealRepository } from "../domain/repository";
import type { DomainEventPublisher } from "../domain/publisher";
import { Deal } from "../domain/deal";
import { Amount } from "../domain/value-objects/amount";
import { Probability } from "../domain/value-objects/probability";
import { Currency } from "../domain/value-objects/currency";
import { Stage } from "../domain/value-objects/stage";
import type {
  DealCreatedEvent,
  DealStageChangedEvent,
} from "../domain/events";
import { EVENT_VERSION_V1 } from "../domain/events";
import {
  BusinessRuleError,
  GovernanceBlockedError,
  ValidationError,
} from "../domain/errors";
import { safe, type ActionResult } from "./safe";
import type { AuthContext } from "./auth-context";
import { toDealResponse, type DealResponse } from "./dto";

// ─── Helpers ───

let eventSeq = 0;
function nextSeq(): string { return `seq-${Date.now()}-${++eventSeq}`; }

function genId(): string {
  return `deal-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function now(): string { return new Date().toISOString(); }

// ─── Write Actions ───

export async function createDealAction(
  repo: DealRepository,
  publisher: DomainEventPublisher | null,
  ctx: AuthContext,
  input: CreateDealInput,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const deal = Deal.create({
      accountId: input.accountId,
      name: input.name,
      amount: Amount.create(input.amount, input.currency ?? "SAR"),
      currency: Currency.create(input.currency ?? "SAR"),
      probability: Probability.create(input.probability ?? 0),
      expectedCloseDate: input.expectedCloseDate,
      ownerId: input.ownerId,
      organizationId: ctx.organizationId,
      createdById: ctx.user.id,
    });

    // Assign ID
    const id = genId();
    const dealWithId = Deal.reconstitute({ ...deal.toJSON(), id });
    const saved = await repo.save(dealWithId);

    // Publish event (outside transaction — best-effort)
    if (publisher) {
      const event: DealCreatedEvent = {
        type: "salesos.deal.created",
        eventVersion: EVENT_VERSION_V1,
        subject: saved.id,
        data: {
          dealId: saved.id,
          accountId: saved.accountId,
          name: saved.name,
          amount: saved.amount.value,
          currency: saved.currency.code,
          stage: saved.stage.name,
          ownerId: saved.ownerId,
          createdById: saved.createdById,
        },
      };
      await publisher.publish({
        id: genId(),
        type: event.type,
        eventVersion: event.eventVersion,
        source: "salesos",
        subject: event.subject,
        data: event.data,
        timestamp: now(),
        sequenceId: nextSeq(),
        correlationId: ctx.correlationId,
      });
    }

    return toDealResponse(saved);
  }, ctx.correlationId);
}

export async function updateDealAction(
  repo: DealRepository,
  ctx: AuthContext,
  dealId: string,
  input: UpdateDealInput,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const deal = await repo.findById(dealId, ctx.organizationId);
    if (!deal) throw new BusinessRuleError("Deal not found", { dealId });
    if (deal.lifecycle !== "created" && deal.lifecycle !== "active") {
      throw new BusinessRuleError("Cannot update a closed or archived deal", { dealId, lifecycle: deal.lifecycle });
    }

    // Version must match for optimistic concurrency
    if (input.version !== deal.version) {
      throw new BusinessRuleError("Concurrent modification detected", { expected: input.version, actual: deal.version });
    }

    let updated = deal;
    if (input.name !== undefined) updated = updated.updateField("name", input.name, ctx.user.id);
    if (input.expectedCloseDate !== undefined) updated = updated.updateField("expectedCloseDate", input.expectedCloseDate, ctx.user.id);
    if (input.ownerId !== undefined) updated = updated.updateField("ownerId", input.ownerId, ctx.user.id);

    const saved = await repo.save(updated);
    return toDealResponse(saved);
  }, ctx.correlationId);
}

export async function transitionDealAction(
  repo: DealRepository,
  publisher: DomainEventPublisher | null,
  ctx: AuthContext,
  dealId: string,
  action: string,
  input: TransitionInput,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const deal = await repo.findById(dealId, ctx.organizationId);
    if (!deal) throw new BusinessRuleError("Deal not found", { dealId });

    // Version check
    if (input.version !== deal.version) {
      throw new BusinessRuleError("Concurrent modification detected", { expected: input.version, actual: deal.version });
    }

    // Determine target stage
    const transitionMap: Record<string, Stage> = {
      qualify: Stage.QUALIFIED,
      submit_for_review: Stage.IN_REVIEW,
      approve: Stage.APPROVED,
      reject: Stage.CLOSED_LOST,
      negotiate: Stage.NEGOTIATION,
      close_won: Stage.CLOSED_WON,
      close_lost: Stage.CLOSED_LOST,
    };

    const toStage = transitionMap[action];
    if (!toStage) throw new ValidationError("Invalid transition action", { action });

    // Validations
    if (action === "submit_for_review" && deal.evidenceCount < 1) {
      throw new GovernanceBlockedError(
        `Evidence required: at least 1 needed, ${deal.evidenceCount} linked`,
        "evidence_gate",
        { required: 1, actual: deal.evidenceCount },
      );
    }
    if (action === "reject" && !input.reason) {
      throw new ValidationError("Rejection reason is required", { action });
    }
    if (action === "close_lost" && !input.reason) {
      throw new ValidationError("Loss reason is required", { action });
    }

    // Apply transition via aggregate
    const updated = deal.applyStageTransition(toStage, action, ctx.user.id, {
      reason: input.reason,
    });

    const saved = await repo.save(updated);

    // Publish event
    if (publisher) {
      const event: DealStageChangedEvent = {
        type: "salesos.deal.stage_changed",
        eventVersion: EVENT_VERSION_V1,
        subject: saved.id,
        data: {
          dealId: saved.id,
          fromStage: deal.stage.name,
          toStage: saved.stage.name,
          action,
          actorId: ctx.user.id,
          reason: input.reason,
        },
      };
      await publisher.publish({
        id: genId(),
        type: event.type,
        eventVersion: event.eventVersion,
        source: "salesos",
        subject: event.subject,
        data: event.data,
        timestamp: now(),
        sequenceId: nextSeq(),
        correlationId: ctx.correlationId,
      });
    }

    return toDealResponse(saved);
  }, ctx.correlationId);
}

export async function linkEvidenceAction(
  repo: DealRepository,
  ctx: AuthContext,
  dealId: string,
  evidenceId: string,
  version: number,
): Promise<ActionResult<DealResponse>> {
  return safe(async () => {
    const deal = await repo.findById(dealId, ctx.organizationId);
    if (!deal) throw new BusinessRuleError("Deal not found", { dealId });

    if (version !== deal.version) {
      throw new BusinessRuleError("Concurrent modification detected", { expected: version, actual: deal.version });
    }

    const synced = deal.syncEvidenceCount(deal.evidenceCount + 1);
    const saved = await repo.save(synced);
    return toDealResponse(saved);
  }, ctx.correlationId);
}

export async function deleteDealAction(
  repo: DealRepository,
  ctx: AuthContext,
  dealId: string,
  version: number,
): Promise<ActionResult<{ deleted: boolean }>> {
  return safe(async () => {
    const deal = await repo.findById(dealId, ctx.organizationId);
    if (!deal) throw new BusinessRuleError("Deal not found", { dealId });
    if (version !== deal.version) {
      throw new BusinessRuleError("Concurrent modification detected", { expected: version, actual: deal.version });
    }
    await repo.archive(dealId, ctx.organizationId);
    return { deleted: true };
  }, ctx.correlationId);
}

// ─── Input types ───

export interface CreateDealInput {
  accountId: string;
  name: string;
  amount: number;
  currency?: string;
  probability?: number;
  expectedCloseDate?: string;
  ownerId: string;
}

export interface UpdateDealInput {
  name?: string;
  expectedCloseDate?: string;
  ownerId?: string;
  version: number;
}

export interface TransitionInput {
  reason?: string;
  version: number;
}

/**
 * Workflow Transition Orchestrator — SPEC-01c
 *
 * Coordinates: Guard Pipeline → Aggregate Transition → Repository → Events → SLA.
 * The aggregate is the final authority — the orchestrator requests, never commands.
 *
 * Compensation: if event publication fails after a successful save,
 * the aggregate state remains (eventual consistency). No rollback.
 */

import type { DealRepository } from "../domain/repository";
import type { DomainEventPublisher } from "../domain/publisher";
import type { Deal } from "../domain/deal";
import { Stage } from "../domain/value-objects/stage";
import type { DealStageChangedEvent } from "../domain/events";
import { EVENT_VERSION_V1 } from "../domain/events";
import { BusinessRuleError } from "../domain/errors";
import { evaluateGuardPipeline, type GuardContext } from "./guards";
import { SLATracker } from "./sla";

let eventSeq = 0;
function nextSeq(): string { return `seq-${Date.now()}-${++eventSeq}`; }
function genId(): string { return `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function now(): string { return new Date().toISOString(); }

const TRANSITION_MAP: Record<string, Stage> = {
  qualify: Stage.QUALIFIED,
  submit_for_review: Stage.IN_REVIEW,
  approve: Stage.APPROVED,
  reject: Stage.CLOSED_LOST,
  negotiate: Stage.NEGOTIATION,
  close_won: Stage.CLOSED_WON,
  close_lost: Stage.CLOSED_LOST,
};

export interface TransitionRequest {
  dealId: string;
  action: string;
  actorId: string;
  organizationId: string;
  reason?: string;
  version: number;
  correlationId?: string;
}

export interface TransitionResult {
  deal: Deal;
  guardChecks: ReturnType<typeof evaluateGuardPipeline>;
  eventPublished: boolean;
  slaOk: boolean;
}

export class WorkflowOrchestrator {
  constructor(
    private readonly repo: DealRepository,
    private readonly publisher: DomainEventPublisher | null,
    private readonly sla: SLATracker,
  ) {}

  /**
   * Execute a transition through the full pipeline:
   * 1. Validate guard pipeline
   * 2. Apply transition via Deal aggregate
   * 3. Save to repository
   * 4. Publish event (best-effort, outside transaction)
   * 5. Update SLA
   */
  async transition(req: TransitionRequest): Promise<TransitionResult> {
    const deal = await this.repo.findById(req.dealId, req.organizationId);
    if (!deal) throw new BusinessRuleError("Deal not found", { dealId: req.dealId });

    // Optimistic concurrency check
    if (req.version !== deal.version) {
      throw new BusinessRuleError("Concurrent modification detected", {
        expected: req.version,
        actual: deal.version,
      });
    }

    // Phase 1: Guard pipeline
    const toStage = TRANSITION_MAP[req.action];
    const guardContext: GuardContext = {
      actorId: req.actorId,
      organizationId: deal.organizationId,
      targetStageName: toStage?.name ?? "",
    };
    const guardChecks = evaluateGuardPipeline(req.action, deal, guardContext);
    if (!guardChecks.allowed) {
      const failed = guardChecks.evaluations.find((e) => !e.result.allowed);
      if (failed) {
        const errorCode = failed.result.code ?? "BUSINESS_RULE_FAILED";
        if (errorCode === "GOVERNANCE_BLOCKED") {
          throw new (await import("../domain/errors")).GovernanceBlockedError(
            failed.result.reason, failed.guardName, undefined,
          );
        }
        throw new BusinessRuleError(failed.result.reason);
      }
    }

    // Phase 2: Apply transition via aggregate (aggregate is final authority)
    const updated = deal.applyStageTransition(toStage, req.action, req.actorId, { reason: req.reason });

    // Phase 3: Save (inside transaction boundary)
    const saved = await this.repo.save(updated);

    // Phase 4: Publish event (outside transaction — best-effort)
    let eventPublished = false;
    if (this.publisher) {
      try {
        const event: DealStageChangedEvent = {
          type: "salesos.deal.stage_changed",
          eventVersion: EVENT_VERSION_V1,
          subject: saved.id,
          data: {
            dealId: saved.id,
            fromStage: deal.stage.name,
            toStage: saved.stage.name,
            action: req.action,
            actorId: req.actorId,
            reason: req.reason,
          },
        };
        await this.publisher.publish({
          id: genId(),
          type: event.type,
          eventVersion: event.eventVersion,
          source: "salesos",
          subject: event.subject,
          data: event.data,
          timestamp: now(),
          sequenceId: nextSeq(),
          correlationId: req.correlationId,
        });
        eventPublished = true;
      } catch {
        // Event failure does not roll back the transition.
        // Aggregate is the source of truth.
      }
    }

    // Phase 5: SLA update
    this.sla.stopTimer(req.dealId);
    if (saved.stage.name === "Draft" || saved.stage.name === "In Review") {
      this.sla.startTimer(req.dealId, saved.stage.name);
    }
    this.sla.escalate(req.dealId); // Check if previous stage breached SLA

    return { deal: saved, guardChecks, eventPublished, slaOk: true };
  }
}

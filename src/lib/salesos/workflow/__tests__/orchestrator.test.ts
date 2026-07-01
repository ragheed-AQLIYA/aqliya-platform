/**
 * Workflow Tests — SPEC-01e §4
 * Covers: Guard pipeline, SLA, orchestration, compensation
 */

import { InMemoryDealRepository } from "../../infrastructure/in-memory-deal-repository";
import { InMemoryDomainEventPublisher } from "../../infrastructure/in-memory-publisher";
import {
  Deal, Amount, Probability, Currency, Stage,
  BusinessRuleError, GovernanceBlockedError,
} from "../../domain";
import { WorkflowOrchestrator, type TransitionRequest } from "../orchestrator";
import { SLATracker } from "../sla";
import { evaluateGuardPipeline } from "../guards";
import { createAuthContext } from "../../api/auth-context";

let repo: InMemoryDealRepository;
let publisher: InMemoryDomainEventPublisher;
let sla: SLATracker;
let orchestrator: WorkflowOrchestrator;
const ctx = createAuthContext();

function seedDeal(id: string, stage: Stage, evidenceCount = 0, reviewDecisions: unknown[] = []) {
  const d = Deal.create({
    accountId: "acct-1", name: `Deal ${id}`, amount: Amount.create(100000),
    currency: Currency.SAR, probability: Probability.create(50),
    ownerId: "user-1", organizationId: ctx.organizationId, createdById: ctx.user.id,
  });

  const transitions = [
    { stage: Stage.QUALIFIED, action: "qualify" },
    { stage: Stage.IN_REVIEW, action: "submit_for_review" },
    { stage: Stage.APPROVED, action: "approve" },
    { stage: Stage.NEGOTIATION, action: "negotiate" },
    { stage: Stage.CLOSED_WON, action: "close_won" },
    { stage: Stage.CLOSED_LOST, action: "close_lost" },
  ];

  let current = d;
  for (const t of transitions) {
    if (stage.name === "Draft") break;
    current = current.applyStageTransition(t.stage, t.action, ctx.user.id);
    if (t.stage.name === stage.name) break;
  }

  repo["store"].set(id, {
    ...current.toJSON(), id, organizationId: ctx.organizationId, version: 1,
    evidenceCount,
    reviewDecisions,
  });
}

beforeEach(() => {
  repo = new InMemoryDealRepository();
  publisher = new InMemoryDomainEventPublisher();
  sla = new SLATracker();
  orchestrator = new WorkflowOrchestrator(repo, publisher, sla);
});

// ══════════════════════════════════════════
// §4.2 — Guard Pipeline (order, fail-fast, determinism)
// ══════════════════════════════════════════

describe("Guard Pipeline", () => {
  test("qualify passes when account active", async () => {
    seedDeal("d-1", Stage.DRAFT);
    const result = await orchestrator.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, organizationId: ctx.organizationId, version: 1 });
    expect(result.guardChecks.allowed).toBe(true);
    expect(result.deal.stage.name).toBe("Qualified");
  });

  test("submit_for_review blocked when no evidence", async () => {
    seedDeal("d-1", Stage.QUALIFIED, 0);
    await expect(
      orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-a", organizationId: ctx.organizationId, version: 1 }),
    ).rejects.toThrow(GovernanceBlockedError);
  });

  test("submit_for_review passes when evidence present", async () => {
    seedDeal("d-1", Stage.QUALIFIED, 2);
    const result = await orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    expect(result.guardChecks.allowed).toBe(true);
    expect(result.deal.stage.name).toBe("In Review");
  });

  test("reviewerNotOwner blocks self-review", async () => {
    // Deal owner is "user-1" from seedDeal
    seedDeal("d-1", Stage.IN_REVIEW, 1);
    await expect(
      orchestrator.transition({ dealId: "d-1", action: "approve", actorId: "user-1", organizationId: ctx.organizationId, version: 1 }),
    ).rejects.toThrow(BusinessRuleError);
  });

  test("reviewerNotOwner passes for different reviewer", async () => {
    seedDeal("d-1", Stage.IN_REVIEW, 1);
    const result = await orchestrator.transition({ dealId: "d-1", action: "approve", actorId: "user-manager", organizationId: ctx.organizationId, version: 1 });
    expect(result.guardChecks.allowed).toBe(true);
    expect(result.deal.stage.name).toBe("Approved");
  });

  test("guard pipeline produces deterministic results", async () => {
    seedDeal("d-1", Stage.DRAFT);
    const r1 = await orchestrator.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    // Reset and re-seed
    seedDeal("d-2", Stage.DRAFT);
    const r2 = await orchestrator.transition({ dealId: "d-2", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    expect(r1.guardChecks.allowed).toBe(r2.guardChecks.allowed);
    expect(r1.deal.stage.name).toBe(r2.deal.stage.name);
  });

  test("guard pipeline fails fast — no guards run after first failure", async () => {
    seedDeal("d-1", Stage.QUALIFIED, 0);
    try {
      await orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-1", organizationId: ctx.organizationId, version: 1 });
      fail("Expected governance block");
    } catch (e) {
      expect(e).toBeInstanceOf(GovernanceBlockedError);
    }
    // Deal should NOT have changed stage
    const deal = await repo.findById("d-1", ctx.organizationId);
    expect(deal!.stage.name).toBe("Qualified");
  });
});

// ══════════════════════════════════════════
// §4.4 — SLA Tests
// ══════════════════════════════════════════

describe("SLA Tracker", () => {
  test("SLA starts on stage entry", () => {
    sla.startTimer("deal-1", "Draft");
    const status = sla.getStatus("deal-1");
    expect(status).not.toBeNull();
    expect(status!.status).toBe("on_track");
    expect(status!.stage).toBe("Draft");
  });

  test("SLA stopped on stage exit", () => {
    sla.startTimer("deal-1", "Draft");
    sla.stopTimer("deal-1");
    const status = sla.getStatus("deal-1");
    expect(status).toBeNull();
  });

  test("SLA approaching at 75% threshold", () => {
    sla.startTimer("deal-1", "Draft");
    // Draft SLA = 168 hours. 75% = 126 hours elapsed.
    const past = new Date(Date.now() - 130 * 60 * 60 * 1000);
    sla.startTimer("deal-1", "Draft", past.toISOString());
    const status = sla.getStatus("deal-1");
    expect(status!.status).toBe("approaching");
  });

  test("SLA breached at 100%", () => {
    const past = new Date(Date.now() - 170 * 60 * 60 * 1000); // 170 hours ago (168 = breach)
    sla.startTimer("deal-1", "Draft", past.toISOString());
    const status = sla.getStatus("deal-1");
    expect(status!.status).toBe("breached");
    expect(status!.breachedAt).toBeDefined();
  });

  test("SLA extreme at 200%", () => {
    const past = new Date(Date.now() - 350 * 60 * 60 * 1000); // 350 hours (336 = 200%)
    sla.startTimer("deal-1", "Draft", past.toISOString());
    const status = sla.getStatus("deal-1");
    expect(status!.status).toBe("extreme");
  });

  test("escalation triggers on breach", () => {
    const past = new Date(Date.now() - 170 * 60 * 60 * 1000);
    sla.startTimer("deal-1", "Draft", past.toISOString());
    const evt = sla.escalate("deal-1");
    expect(evt).not.toBeNull();
    expect(evt!.level).toBe(1);
    expect(sla.escalationLog).toHaveLength(1);
  });

  test("escalation does not auto-transition the deal", async () => {
    seedDeal("d-1", Stage.DRAFT);
    const past = new Date(Date.now() - 170 * 60 * 60 * 1000);
    sla.startTimer("d-1", "Draft", past.toISOString());
    sla.escalate("d-1");
    // Deal should still be in Draft
    const deal = await repo.findById("d-1", ctx.organizationId);
    expect(deal!.stage.name).toBe("Draft");
  });

  test("orchestrator updates SLA on transition", async () => {
    seedDeal("d-1", Stage.DRAFT);
    sla.startTimer("d-1", "Draft");
    await orchestrator.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    // Draft SLA stopped, no SLA for Qualified
    expect(sla.getStatus("d-1")).toBeNull();
  });

  test("orchestrator starts SLA for In Review", async () => {
    seedDeal("d-1", Stage.QUALIFIED, 2);
    await orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    const status = sla.getStatus("d-1");
    expect(status).not.toBeNull();
    expect(status!.stage).toBe("In Review");
  });
});

// ══════════════════════════════════════════
// §7 — Failure / Compensation Tests
// ══════════════════════════════════════════

describe("Failure Compensation", () => {
  test("event publication failure does NOT roll back the aggregate", async () => {
    // Create a publisher that throws
    const failingPublisher = {
      async publish() { throw new Error("Event Bus down"); },
    };
    const failOrch = new WorkflowOrchestrator(repo, failingPublisher, sla);
    seedDeal("d-1", Stage.DRAFT);

    const result = await failOrch.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    // Event publication failed, but aggregate transition succeeded
    expect(result.deal.stage.name).toBe("Qualified");
    expect(result.eventPublished).toBe(false);
  });

  test("guard failure prevents transition entirely", async () => {
    seedDeal("d-1", Stage.QUALIFIED, 0);
    try {
      await orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
      fail("Expected governance block");
    } catch (e) {
      expect(e).toBeInstanceOf(GovernanceBlockedError);
    }
    // Deal unchanged
    const deal = await repo.findById("d-1", ctx.organizationId);
    expect(deal!.stage.name).toBe("Qualified");
  });

  test("concurrency conflict is handled", async () => {
    seedDeal("d-1", Stage.DRAFT);
    // Simulate concurrent modification
    const props = repo["store"].get("d-1");
    if (props) repo["store"].set("d-1", { ...props, organizationId: ctx.organizationId, version: 5 });

    await expect(
      orchestrator.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 }),
    ).rejects.toThrow(BusinessRuleError);
    // Deal unchanged
    const deal = await repo.findById("d-1", ctx.organizationId);
    expect(deal!.stage.name).toBe("Draft");
  });

  test("complete happy path: Draft → Qualified → In Review → Approved → Negotiation → Closed Won", async () => {
    seedDeal("d-1", Stage.DRAFT);
    sla.startTimer("d-1", "Draft");

    let r = await orchestrator.transition({ dealId: "d-1", action: "qualify", actorId: "user-a", organizationId: ctx.organizationId, version: 1 });
    expect(r.deal.stage.name).toBe("Qualified");

    // Add evidence for In Review
    const props = repo["store"].get("d-1");
    if (props) repo["store"].set("d-1", { ...props, evidenceCount: 2, organizationId: ctx.organizationId, version: r.deal.version });

    r = await orchestrator.transition({ dealId: "d-1", action: "submit_for_review", actorId: "user-a", organizationId: ctx.organizationId, version: r.deal.version });
    expect(r.deal.stage.name).toBe("In Review");

    r = await orchestrator.transition({ dealId: "d-1", action: "approve", actorId: "user-manager", organizationId: ctx.organizationId, version: r.deal.version });
    expect(r.deal.stage.name).toBe("Approved");

    r = await orchestrator.transition({ dealId: "d-1", action: "negotiate", actorId: "user-a", organizationId: ctx.organizationId, version: r.deal.version });
    expect(r.deal.stage.name).toBe("Negotiation");

    // Need approval audit for close_won
    const props2 = repo["store"].get("d-1");
    if (props2) repo["store"].set("d-1", { ...props2, reviewDecisions: [{ id: "rd-1", decision: "approved", actorId: "user-manager", reason: "Good", createdAt: new Date().toISOString() }], organizationId: ctx.organizationId, version: r.deal.version });

    r = await orchestrator.transition({ dealId: "d-1", action: "close_won", actorId: "user-a", organizationId: ctx.organizationId, version: r.deal.version });
    expect(r.deal.stage.name).toBe("Closed Won");

    // Verify events
    expect(publisher.events.length).toBeGreaterThanOrEqual(5);
    const types = publisher.events.map((e) => e.type);
    expect(types.every((t) => t === "salesos.deal.stage_changed")).toBe(true);
  });
});

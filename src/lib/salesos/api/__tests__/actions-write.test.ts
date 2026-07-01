/**
 * Write API Tests — SPEC-01e §3, §6, §8
 * Covers: CRUD, concurrency, event publication, failure paths
 */

import { InMemoryDealRepository } from "../../infrastructure/in-memory-deal-repository";
import { InMemoryDomainEventPublisher } from "../../infrastructure/in-memory-publisher";
import {
  Deal, Amount, Probability, Currency, Stage,
} from "../../domain";
import {
  createDealAction, updateDealAction, transitionDealAction,
  linkEvidenceAction, deleteDealAction,
} from "../actions-write";
import { createAuthContext } from "../auth-context";

let repo: InMemoryDealRepository;
let publisher: InMemoryDomainEventPublisher;
const ctx = createAuthContext();

function seedDeal(id: string, name: string, targetStage = Stage.DRAFT) {
  const d = Deal.create({
    accountId: "acct-1", name, amount: Amount.create(100000),
    currency: Currency.SAR, probability: Probability.create(50),
    ownerId: ctx.user.id, organizationId: ctx.organizationId, createdById: ctx.user.id,
  });
  const transitions = [Stage.QUALIFIED, Stage.IN_REVIEW, Stage.APPROVED, Stage.NEGOTIATION, Stage.CLOSED_WON, Stage.CLOSED_LOST];
  const actions = ["qualify", "submit_for_review", "approve", "negotiate", "close_won", "close_lost"];
  let current = d;
  for (let i = 0; i < transitions.length; i++) {
    if (targetStage.name === "Draft") break;
    current = current.applyStageTransition(transitions[i], actions[i], ctx.user.id);
    if (transitions[i].name === targetStage.name) break;
  }
  repo["store"].set(id, { ...current.toJSON(), id, version: 1 });
}

beforeEach(() => {
  repo = new InMemoryDealRepository();
  publisher = new InMemoryDomainEventPublisher();
});

// ══════════════════════════════════════════
// §3.1 — Happy Path: Create
// ══════════════════════════════════════════

describe("createDealAction", () => {
  test("creates deal and returns DTO", async () => {
    const result = await createDealAction(repo, publisher, ctx, {
      accountId: "acct-1", name: "New Deal", amount: 500000, ownerId: "user-1",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("New Deal");
      expect(result.data.amount).toBe(500000);
      expect(result.data.stage).toBe("Draft");
      expect(result.data.version).toBe(1);
    }
  });

  test("publishes DealCreated event with correct payload", async () => {
    const result = await createDealAction(repo, publisher, ctx, {
      accountId: "acct-1", name: "Event Test", amount: 100000, ownerId: "user-1",
    });
    expect(result.ok).toBe(true);
    expect(publisher.events).toHaveLength(1);
    const event = publisher.events[0];
    expect(event.type).toBe("salesos.deal.created");
    expect(event.eventVersion).toBe(1);
    expect(event.source).toBe("salesos");
    expect(event.correlationId).toBe(ctx.correlationId);
    if (result.ok) {
      expect((event.data as any).dealId).toBe(result.data.id);
      expect((event.data as any).name).toBe("Event Test");
    }
  });
});

// ══════════════════════════════════════════
// Happy Path: Update
// ══════════════════════════════════════════

describe("updateDealAction", () => {
  test("updates deal name", async () => {
    seedDeal("d-1", "Original");
    const result = await updateDealAction(repo, ctx, "d-1", { name: "Updated", version: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data.name).toBe("Updated");
      expect(result.data.version).toBe(2);
    }
  });

  test("blocks update on closed deal", async () => {
    seedDeal("d-1", "Closed", Stage.CLOSED_WON);
    const result = await updateDealAction(repo, ctx, "d-1", { name: "New", version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BUSINESS_RULE_FAILED");
  });
});

// ══════════════════════════════════════════
// Happy Path: Transition
// ══════════════════════════════════════════

describe("transitionDealAction", () => {
  test("qualify: Draft → Qualified", async () => {
    seedDeal("d-1", "Deal");
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "qualify", { version: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.stage).toBe("Qualified");

    expect(publisher.events).toHaveLength(1);
    expect(publisher.events[0].type).toBe("salesos.deal.stage_changed");
    expect((publisher.events[0].data as any).fromStage).toBe("Draft");
    expect((publisher.events[0].data as any).toStage).toBe("Qualified");
  });

  test("submit_for_review requires evidence", async () => {
    seedDeal("d-1", "Deal", Stage.QUALIFIED);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "submit_for_review", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("GOVERNANCE_BLOCKED");
  });

  test("submit_for_review succeeds when evidence is present", async () => {
    seedDeal("d-1", "Deal", Stage.QUALIFIED);
    // Manually add evidence count
    const props = repo["store"].get("d-1");
    if (props) {
      repo["store"].set("d-1", { ...props, evidenceCount: 2 });
    }
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "submit_for_review", { version: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.stage).toBe("In Review");
  });

  test("reject requires reason", async () => {
    seedDeal("d-1", "Deal", Stage.IN_REVIEW);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "reject", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });

  test("reject succeeds with reason", async () => {
    seedDeal("d-1", "Deal", Stage.IN_REVIEW);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "reject", { reason: "Not qualified", version: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.stage).toBe("Closed Lost");
    const e = publisher.events[0] as any;
    if (e.data) expect(e.data.reason).toBe("Not qualified");
  });

  test("close_won: Negotiation → Closed Won", async () => {
    seedDeal("d-1", "Deal", Stage.NEGOTIATION);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "close_won", { version: 1 });
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.stage).toBe("Closed Won");
    expect(publisher.events[0].type).toBe("salesos.deal.stage_changed");
  });

  test("close_lost requires loss reason", async () => {
    seedDeal("d-1", "Deal", Stage.NEGOTIATION);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "close_lost", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });
});

// ══════════════════════════════════════════
// Happy Path: Evidence
// ══════════════════════════════════════════

describe("linkEvidenceAction", () => {
  test("increments evidence count", async () => {
    seedDeal("d-1", "Deal");
    const result = await linkEvidenceAction(repo, ctx, "d-1", "ev-1", 1);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.evidenceCount).toBe(1);
  });

  test("blocks with wrong version", async () => {
    seedDeal("d-1", "Deal");
    const result = await linkEvidenceAction(repo, ctx, "d-1", "ev-1", 99);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BUSINESS_RULE_FAILED");
  });
});

// ══════════════════════════════════════════
// §3.3 — Concurrency
// ══════════════════════════════════════════

describe("Concurrency", () => {
  test("first write succeeds, second fails with version mismatch", async () => {
    seedDeal("d-1", "Original");
    const r1 = await updateDealAction(repo, ctx, "d-1", { name: "User A Update", version: 1 });
    expect(r1.ok).toBe(true);

    // User B tries with stale version
    const r2 = await updateDealAction(repo, ctx, "d-1", { name: "User B Update", version: 1 });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.code).toBe("BUSINESS_RULE_FAILED");
  });

  test("transition with stale version fails", async () => {
    seedDeal("d-1", "Deal");
    const r1 = await updateDealAction(repo, ctx, "d-1", { name: "Updated", version: 1 });
    expect(r1.ok).toBe(true);
    // Now version is 2
    const r2 = await transitionDealAction(repo, publisher, ctx, "d-1", "qualify", { version: 1 });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.code).toBe("BUSINESS_RULE_FAILED");
  });

  test("retry after conflict succeeds with fresh version", async () => {
    seedDeal("d-1", "Original");
    // First user updates
    await updateDealAction(repo, ctx, "d-1", { name: "Updated", version: 1 });
    // Second user reads fresh version
    const fresh = await repo.findById("d-1", ctx.organizationId);
    expect(fresh!.version).toBe(2);
    // Retry with fresh version
    const retry = await updateDealAction(repo, ctx, "d-1", { name: "Retry Update", version: fresh!.version });
    expect(retry.ok).toBe(true);
    if (retry.ok) expect(retry.data.version).toBe(3);
  });
});

// ══════════════════════════════════════════
// §8 — Event Publication
// ══════════════════════════════════════════

describe("Event Publication", () => {
  test("create and multiple transitions produce correct event sequence", async () => {
    const r = await createDealAction(repo, publisher, ctx, {
      accountId: "acct-1", name: "Event Chain", amount: 100000, ownerId: "user-1",
    });
    expect(r.ok).toBe(true);
    const dealId = (r as any).data.id;

    // Add evidence so submission works
    const props = repo["store"].get(dealId);
    if (props) repo["store"].set(dealId, { ...props, evidenceCount: 1, version: 1 });

    publisher.clear();
    await transitionDealAction(repo, publisher, ctx, dealId, "qualify", { version: 1 });
    await transitionDealAction(repo, publisher, ctx, dealId, "submit_for_review", { version: 2 });
    await transitionDealAction(repo, publisher, ctx, dealId, "approve", { version: 3 });
    await transitionDealAction(repo, publisher, ctx, dealId, "negotiate", { version: 4 });
    await transitionDealAction(repo, publisher, ctx, dealId, "close_won", { version: 5 });

    expect(publisher.events).toHaveLength(5);
    const types = publisher.events.map((e) => e.type);
    expect(types.every((t) => t === "salesos.deal.stage_changed")).toBe(true);

    // All events have correlationId
    expect(publisher.events.every((e) => e.correlationId === ctx.correlationId)).toBe(true);

    // All events have eventVersion
    expect(publisher.events.every((e) => e.eventVersion === 1)).toBe(true);
  });

  test("each event has unique sequenceId", async () => {
    const r = await createDealAction(repo, publisher, ctx, {
      accountId: "acct-1", name: "Seq Test", amount: 100000, ownerId: "user-1",
    });
    const dealId = (r as any).data.id;
    const props = repo["store"].get(dealId);
    if (props) repo["store"].set(dealId, { ...props, evidenceCount: 1, version: 1 });
    publisher.clear();

    await transitionDealAction(repo, publisher, ctx, dealId, "qualify", { version: 1 });
    await transitionDealAction(repo, publisher, ctx, dealId, "submit_for_review", { version: 2 });

    const seqIds = publisher.events.map((e) => e.sequenceId);
    expect(new Set(seqIds).size).toBe(seqIds.length); // All unique
  });
});

// ══════════════════════════════════════════
// §7.2 — Failure Paths
// ══════════════════════════════════════════

describe("Failure Paths", () => {
  test("governance: submit without evidence blocked", async () => {
    seedDeal("d-1", "Deal", Stage.QUALIFIED);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "submit_for_review", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("GOVERNANCE_BLOCKED");
  });

  test("business rule: update closed deal blocked", async () => {
    seedDeal("d-1", "Deal", Stage.CLOSED_WON);
    const result = await updateDealAction(repo, ctx, "d-1", { name: "New", version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BUSINESS_RULE_FAILED");
  });

  test("validation: reject without reason blocked", async () => {
    seedDeal("d-1", "Deal", Stage.IN_REVIEW);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "reject", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });

  test("validation: close_lost without reason blocked", async () => {
    seedDeal("d-1", "Deal", Stage.NEGOTIATION);
    const result = await transitionDealAction(repo, publisher, ctx, "d-1", "close_lost", { version: 1 });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });

  test("concurrency: second update fails", async () => {
    seedDeal("d-1", "Original");
    await updateDealAction(repo, ctx, "d-1", { name: "First", version: 1 });
    const r2 = await updateDealAction(repo, ctx, "d-1", { name: "Second", version: 1 });
    expect(r2.ok).toBe(false);
    if (!r2.ok) expect(r2.code).toBe("BUSINESS_RULE_FAILED");
  });
});

// ══════════════════════════════════════════
// Delete
// ══════════════════════════════════════════

describe("deleteDealAction", () => {
  test("archives deal", async () => {
    seedDeal("d-1", "Deal");
    const result = await deleteDealAction(repo, ctx, "d-1", 1);
    expect(result.ok).toBe(true);

    const archived = await repo.findById("d-1", ctx.organizationId);
    expect(archived!.lifecycle).toBe("archived");
  });

  test("blocks delete with wrong version", async () => {
    seedDeal("d-1", "Deal");
    const result = await deleteDealAction(repo, ctx, "d-1", 99);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BUSINESS_RULE_FAILED");
  });
});

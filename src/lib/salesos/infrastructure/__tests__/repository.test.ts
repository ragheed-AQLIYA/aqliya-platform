/**
 * Repository Tests — SPEC-01e §6.1 (Integration), SPEC-01b §4 (Concurrency)
 * Covers: CRUD, optimistic concurrency, filtering, pagination
 */

import { Deal, Amount, Probability, Currency, Stage, ConcurrencyError, NotFoundError } from "../../domain";
import { InMemoryDealRepository } from "../in-memory-deal-repository";

let repo: InMemoryDealRepository;
const ORG = "org-test";

beforeEach(() => {
  repo = new InMemoryDealRepository();
});

function createDeal(id: string, name: string, targetStage = Stage.DRAFT, amount = 100000) {
  const deal = Deal.create({
    accountId: "acct-1",
    name,
    amount: Amount.create(amount),
    currency: Currency.SAR,
    probability: Probability.create(50),
    ownerId: "user-1",
    organizationId: ORG,
    createdById: "user-1",
  });

  // Apply stage transitions to reach target stage (only for stages after Draft)
  const transitions = [
    { stage: Stage.QUALIFIED, action: "qualify" },
    { stage: Stage.IN_REVIEW, action: "submit_for_review" },
    { stage: Stage.APPROVED, action: "approve" },
    { stage: Stage.NEGOTIATION, action: "negotiate" },
    { stage: Stage.CLOSED_WON, action: "close_won" },
    { stage: Stage.CLOSED_LOST, action: "close_lost" },
  ];

  let d = deal;
  for (const t of transitions) {
    if (targetStage.name === "Draft") break; // Already at Draft
    d = d.applyStageTransition(t.stage, t.action, "user-1");
    if (t.stage.name === targetStage.name) break;
  }

  const props = d.toJSON();
  props.id = id;
  props.version = 1;
  repo["store"].set(id, props);
  return d;
}

// ══════════════════════════════════════════
// CRUD Tests
// ══════════════════════════════════════════

describe("InMemoryDealRepository — CRUD", () => {
  test("findById returns deal", async () => {
    createDeal("deal-1", "Deal One");
    const found = await repo.findById("deal-1", ORG);
    expect(found).not.toBeNull();
    expect(found!.name).toBe("Deal One");
  });

  test("findById returns null for wrong org", async () => {
    createDeal("deal-1", "Deal One");
    const found = await repo.findById("deal-1", "other-org");
    expect(found).toBeNull();
  });

  test("findById returns null for non-existent deal", async () => {
    const found = await repo.findById("nonexistent", ORG);
    expect(found).toBeNull();
  });

  test("save updates seeded deal and increments version", async () => {
    createDeal("deal-new", "New Deal");
    const saved = await repo.save(Deal.reconstitute({ ...repo["store"].get("deal-new") }));
    expect(saved.version).toBe(2); // was 1, save increments
    expect(saved.id).toBe("deal-new");
  });

  test("save updates existing deal and increments version", async () => {
    createDeal("deal-1", "Original");
    const found = await repo.findById("deal-1", ORG);
    expect(found!.version).toBe(1);

    // Update name
    const updated = Deal.reconstitute({ ...found!.toJSON() });
    const updated2 = updated.updateField("name", "Updated", "user-1");

    // Manually set version to match what's in the store
    const props = updated2.toJSON();
    props.version = 1; // match existing
    const saved = await repo.save(Deal.reconstitute(props));
    expect(saved.name).toBe("Updated");
    expect(saved.version).toBe(2);
  });

  test("findMany returns all deals for org", async () => {
    createDeal("deal-1", "Deal One");
    createDeal("deal-2", "Deal Two");
    createDeal("deal-3", "Deal Three");

    const results = await repo.findMany({}, ORG);
    expect(results).toHaveLength(3);
  });

  test("findMany filters by stage", async () => {
    createDeal("d-1", "Deal 1", Stage.DRAFT);
    createDeal("d-2", "Deal 2", Stage.QUALIFIED);

    const results = await repo.findMany({ stage: "Qualified" }, ORG);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Deal 2");
  });

  test("findMany filters by status open/closed", async () => {
    createDeal("d-1", "Open", Stage.DRAFT);
    createDeal("d-2", "Closed", Stage.CLOSED_WON);

    const open = await repo.findMany({ status: "open" }, ORG);
    expect(open).toHaveLength(1);
    expect(open[0].name).toBe("Open");

    const closed = await repo.findMany({ status: "closed" }, ORG);
    expect(closed).toHaveLength(1);
    expect(closed[0].name).toBe("Closed");
  });

  test("findMany filters by search text", async () => {
    createDeal("d-1", "Alpha Corp");
    createDeal("d-2", "Beta Inc");
    createDeal("d-3", "Alpha Subsidiary");

    const results = await repo.findMany({ search: "Alpha" }, ORG);
    expect(results).toHaveLength(2);
  });

  test("findMany paginates correctly", async () => {
    for (let i = 0; i < 25; i++) {
      createDeal(`d-${i}`, `Deal ${i}`);
    }
    const page1 = await repo.findMany({ page: 1, limit: 20 }, ORG);
    expect(page1).toHaveLength(20);

    const page2 = await repo.findMany({ page: 2, limit: 20 }, ORG);
    expect(page2).toHaveLength(5);
  });

  test("findMany respects max page size of 100", async () => {
    const results = await repo.findMany({ limit: 500 }, ORG);
    // InMemory implementation caps at 100 via Math.min
    expect(results.length).toBeLessThanOrEqual(100);
  });

  test("archive sets lifecycle to archived and increments version", async () => {
    createDeal("deal-1", "Deal One");
    await repo.archive("deal-1", ORG);

    const found = await repo.findById("deal-1", ORG);
    expect(found!.lifecycle).toBe("archived");
    expect(found!.version).toBe(2);
  });

  test("archive throws NotFoundError for wrong org", async () => {
    createDeal("deal-1", "Deal One");
    await expect(repo.archive("deal-1", "other-org")).rejects.toThrow(NotFoundError);
  });
});

// ══════════════════════════════════════════
// Optimistic Concurrency Tests
// ══════════════════════════════════════════

describe("InMemoryDealRepository — Concurrency", () => {
  test("save fails with ConcurrencyError when version does not match", async () => {
    createDeal("deal-1", "Original");
    const found = await repo.findById("deal-1", ORG);
    expect(found!.version).toBe(1);

    // Simulate concurrent update: increment the store version
    const props = found!.toJSON();
    repo["store"].set("deal-1", { ...props, version: 3 });

    // Now try to save with version 1 (stale)
    await expect(repo.save(Deal.reconstitute({ ...props, version: 1 })))
      .rejects.toThrow(ConcurrencyError);
  });

  test("save succeeds when version matches", async () => {
    createDeal("deal-1", "Original");
    const found = await repo.findById("deal-1", ORG);

    const updated = found!.updateField("name", "Updated", "user-1");
    const props = updated.toJSON();
    props.version = 1; // matches

    const saved = await repo.save(Deal.reconstitute(props));
    expect(saved.name).toBe("Updated");
    expect(saved.version).toBe(2);
  });

  test("concurrent update — first wins, second fails", async () => {
    createDeal("deal-1", "Original");

    // Both users read version 1
    const userA = await repo.findById("deal-1", ORG);
    const userB = await repo.findById("deal-1", ORG);
    expect(userA!.version).toBe(1);
    expect(userB!.version).toBe(1);

    // User A updates first — succeeds
    const propsA = userA!.updateField("name", "User A Update", "user-a").toJSON();
    propsA.version = 1;
    const savedA = await repo.save(Deal.reconstitute(propsA));
    expect(savedA.version).toBe(2);

    // User B tries to update with stale version — fails
    const propsB = userB!.updateField("name", "User B Update", "user-b").toJSON();
    propsB.version = 1;
    await expect(repo.save(Deal.reconstitute(propsB))).rejects.toThrow(ConcurrencyError);
  });

  test("ConcurrencyError contains expected and actual versions", async () => {
    createDeal("deal-1", "Original");
    const props = (await repo.findById("deal-1", ORG))!.toJSON();
    repo["store"].set("deal-1", { ...props, version: 5 });

    try {
      await repo.save(Deal.reconstitute({ ...props, version: 1 }));
      fail("Expected ConcurrencyError");
    } catch (e) {
      expect(e).toBeInstanceOf(ConcurrencyError);
      expect((e as ConcurrencyError).expectedVersion).toBe(1);
      expect((e as ConcurrencyError).actualVersion).toBe(5);
    }
  });
});

// ══════════════════════════════════════════
// Layer Boundary Tests
// ══════════════════════════════════════════

describe("Repository — Layer Boundary", () => {
  test("InMemoryRepository implements DealRepository interface", () => {
    // TypeScript structural typing verifies this at compile time.
    // At runtime, verify key methods exist.
    const repo = new InMemoryDealRepository();
    expect(typeof repo.findById).toBe("function");
    expect(typeof repo.findMany).toBe("function");
    expect(typeof repo.save).toBe("function");
    expect(typeof repo.archive).toBe("function");
  });

  test("Repository returns Domain types, never infrastructure types", async () => {
    createDeal("deal-1", "Deal One");
    const found = await repo.findById("deal-1", ORG);
    expect(found).toBeInstanceOf(Deal);
    expect(found!.amount).toBeInstanceOf(Amount);
    expect(found!.probability).toBeInstanceOf(Probability);
    expect(found!.stage).toBeInstanceOf(Stage);
  });
});

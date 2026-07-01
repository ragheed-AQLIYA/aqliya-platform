/**
 * Domain Tests — SPEC-01e §2
 * Covers: Deal Aggregate, Value Objects, Invariants, Domain Events, Domain Errors
 */

import { Deal, Amount, Probability, Currency, Stage } from "../index";
import {
  BusinessRuleError,
  ValidationError,
  GovernanceBlockedError,
  ConcurrencyError,
  NotFoundError,
} from "../index";

const TEST_ORG = "org-test";
const TEST_USER_A = "user-a";
const TEST_USER_B = "user-b";
const TEST_ACCOUNT = "acct-1";

function createTestDeal(overrides?: Partial<Parameters<typeof Deal.create>[0]>): Deal {
  return Deal.create({
    accountId: TEST_ACCOUNT,
    name: "Test Deal",
    amount: Amount.create(500000, "SAR"),
    currency: Currency.SAR,
    probability: Probability.create(50),
    ownerId: TEST_USER_A,
    organizationId: TEST_ORG,
    createdById: TEST_USER_A,
    ...overrides,
  });
}

// ══════════════════════════════════════════
// §2.1 — Value Object Tests
// ══════════════════════════════════════════

describe("Amount Value Object (DI-01: value >= 0)", () => {
  test("create with zero is valid", () => {
    const amt = Amount.create(0, "SAR");
    expect(amt.value).toBe(0);
  });

  test("create with positive value", () => {
    const amt = Amount.create(100000, "SAR");
    expect(amt.value).toBe(100000);
    expect(amt.currency).toBe("SAR");
  });

  test("create with negative value throws BusinessRuleError", () => {
    expect(() => Amount.create(-1, "SAR")).toThrow(BusinessRuleError);
    try { Amount.create(-1); } catch (e) {
      expect((e as BusinessRuleError).code).toBe("BUSINESS_RULE_FAILED");
    }
  });

  test("create with invalid currency throws ValidationError", () => {
    expect(() => Amount.create(100, "INVALID")).toThrow(ValidationError);
  });

  test("add amounts with same currency", () => {
    const a = Amount.create(100, "SAR");
    const b = Amount.create(50, "SAR");
    const sum = a.add(b);
    expect(sum.value).toBe(150);
    expect(sum.currency).toBe("SAR");
  });

  test("add amounts with different currencies throws BusinessRuleError", () => {
    expect(() => Amount.create(100, "SAR").add(Amount.create(50, "USD")))
      .toThrow(BusinessRuleError);
  });

  test("multiply amount", () => {
    const a = Amount.create(100, "SAR");
    expect(a.multiply(3).value).toBe(300);
  });

  test("amount equality", () => {
    expect(Amount.create(100, "SAR").equals(Amount.create(100, "SAR"))).toBe(true);
    expect(Amount.create(100, "SAR").equals(Amount.create(200, "SAR"))).toBe(false);
  });
});

describe("Probability Value Object (DI-02: 0-100 integer)", () => {
  test("create with 0 (minimum)", () => {
    expect(Probability.create(0).value).toBe(0);
  });

  test("create with 100 (maximum)", () => {
    expect(Probability.create(100).value).toBe(100);
  });

  test("create with negative throws BusinessRuleError", () => {
    expect(() => Probability.create(-1)).toThrow(BusinessRuleError);
  });

  test("create with > 100 throws BusinessRuleError", () => {
    expect(() => Probability.create(101)).toThrow(BusinessRuleError);
  });

  test("create with non-integer throws BusinessRuleError", () => {
    expect(() => Probability.create(50.5)).toThrow(BusinessRuleError);
  });

  test("asDecimal returns 0.0-1.0", () => {
    expect(Probability.create(50).asDecimal()).toBe(0.5);
    expect(Probability.create(0).asDecimal()).toBe(0);
    expect(Probability.create(100).asDecimal()).toBe(1);
  });

  test("asPercentage returns the raw value", () => {
    expect(Probability.create(75).asPercentage()).toBe(75);
  });

  test("equality", () => {
    expect(Probability.create(50).equals(Probability.create(50))).toBe(true);
    expect(Probability.create(50).equals(Probability.create(60))).toBe(false);
  });
});

describe("Currency Value Object", () => {
  test("predefined constants", () => {
    expect(Currency.SAR.code).toBe("SAR");
    expect(Currency.USD.code).toBe("USD");
    expect(Currency.AED.code).toBe("AED");
  });

  test("create with valid 3-letter code", () => {
    expect(Currency.create("eur").code).toBe("EUR");
  });

  test("create with invalid code throws ValidationError", () => {
    expect(() => Currency.create("XX")).toThrow(ValidationError);
  });

  test("equality", () => {
    expect(Currency.SAR.equals(Currency.create("SAR"))).toBe(true);
    expect(Currency.SAR.equals(Currency.USD)).toBe(false);
  });
});

describe("Stage Value Object", () => {
  test("all 7 stages are valid", () => {
    expect(() => Stage.create("Draft")).not.toThrow();
    expect(() => Stage.create("Qualified")).not.toThrow();
    expect(() => Stage.create("In Review")).not.toThrow();
    expect(() => Stage.create("Approved")).not.toThrow();
    expect(() => Stage.create("Negotiation")).not.toThrow();
    expect(() => Stage.create("Closed Won")).not.toThrow();
    expect(() => Stage.create("Closed Lost")).not.toThrow();
  });

  test("invalid stage throws ValidationError", () => {
    expect(() => Stage.create("Invalid")).toThrow(ValidationError);
  });

  test("Closed Won and Closed Lost are terminal", () => {
    expect(Stage.CLOSED_WON.isClosed).toBe(true);
    expect(Stage.CLOSED_LOST.isClosed).toBe(true);
    expect(Stage.DRAFT.isClosed).toBe(false);
    expect(Stage.NEGOTIATION.isClosed).toBe(false);
  });

  test("static constants", () => {
    expect(Stage.DRAFT.name).toBe("Draft");
    expect(Stage.QUALIFIED.name).toBe("Qualified");
    expect(Stage.IN_REVIEW.name).toBe("In Review");
    expect(Stage.APPROVED.name).toBe("Approved");
    expect(Stage.NEGOTIATION.name).toBe("Negotiation");
    expect(Stage.CLOSED_WON.name).toBe("Closed Won");
    expect(Stage.CLOSED_LOST.name).toBe("Closed Lost");
  });
});

// ══════════════════════════════════════════
// §2.2 — Invariant Tests
// ══════════════════════════════════════════

describe("Deal Aggregate Invariants", () => {
  test("create deal with valid properties", () => {
    const deal = createTestDeal();
    expect(deal.id).toBe("");
    expect(deal.name).toBe("Test Deal");
    expect(deal.stage.name).toBe("Draft");
    expect(deal.version).toBe(1);
    expect(deal.lifecycle).toBe("created");
  });

  test("DI-01: amount >= 0 enforced at value object level", () => {
    expect(() => Amount.create(-1)).toThrow(BusinessRuleError);
  });

  test("DI-02: probability 0-100 enforced at value object level", () => {
    expect(() => Probability.create(101)).toThrow(BusinessRuleError);
  });

  test("DI-03: accountId is required", () => {
    const deal = createTestDeal();
    expect(deal.accountId).toBe(TEST_ACCOUNT);
  });

  test("DI-05: closed deal cannot be updated", () => {
    const deal = createTestDeal();
    const closedDeal = deal.applyStageTransition(Stage.CLOSED_WON, "close_won", TEST_USER_A);
    expect(() => closedDeal.updateField("name", "New Name", TEST_USER_A))
      .toThrow(BusinessRuleError);
  });

  test("DI-05: closed deal cannot transition", () => {
    const deal = createTestDeal();
    const closedDeal = deal.applyStageTransition(Stage.CLOSED_WON, "close_won", TEST_USER_A);
    expect(() => closedDeal.applyStageTransition(Stage.QUALIFIED, "reopen", TEST_USER_A))
      .toThrow(BusinessRuleError);
  });

  test("DI-06: valid stage enforced", () => {
    expect(() => Stage.create("FakeStage")).toThrow(ValidationError);
  });

  test("DI-07: evidenceCount synced from actual count", () => {
    const deal = createTestDeal();
    expect(deal.evidenceCount).toBe(0);
    const synced = deal.syncEvidenceCount(3);
    expect(synced.evidenceCount).toBe(3);
  });
});

// ══════════════════════════════════════════
// §2.3 — Domain Event Tests
// ══════════════════════════════════════════

describe("Stage Transitions", () => {
  test("happy path: Draft → Qualified", () => {
    const deal = createTestDeal();
    const qualified = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    expect(qualified.stage.name).toBe("Qualified");
    expect(qualified.lifecycle).toBe("active");
  });

  test("happy path: Qualified → In Review", () => {
    const deal = createTestDeal();
    const qualified = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    const inReview = qualified.applyStageTransition(Stage.IN_REVIEW, "submit_for_review", TEST_USER_A);
    expect(inReview.stage.name).toBe("In Review");
    expect(inReview.reviewStatus).toBe("in_review");
  });

  test("happy path: In Review → Approved", () => {
    const deal = createTestDeal();
    let d = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    d = d.applyStageTransition(Stage.IN_REVIEW, "submit_for_review", TEST_USER_A);
    const approved = d.applyStageTransition(Stage.APPROVED, "approve", TEST_USER_A, {
      reviewDecision: { id: "rd-1", decision: "approved", actorId: TEST_USER_B, reason: "Looks good", createdAt: new Date().toISOString() },
    });
    expect(approved.stage.name).toBe("Approved");
    expect(approved.reviewStatus).toBe("approved");
    expect(approved.reviewDecisions).toHaveLength(1);
  });

  test("happy path: Approved → Negotiation", () => {
    const deal = createTestDeal();
    let d = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    d = d.applyStageTransition(Stage.IN_REVIEW, "submit_for_review", TEST_USER_A);
    d = d.applyStageTransition(Stage.APPROVED, "approve", TEST_USER_A, {
      reviewDecision: { id: "rd-1", decision: "approved", actorId: TEST_USER_B, reason: "Approved", createdAt: new Date().toISOString() },
    });
    const negotiation = d.applyStageTransition(Stage.NEGOTIATION, "negotiate", TEST_USER_A);
    expect(negotiation.stage.name).toBe("Negotiation");
  });

  test("happy path: Negotiation → Closed Won", () => {
    const deal = createTestDeal();
    let d = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    d = d.applyStageTransition(Stage.IN_REVIEW, "submit_for_review", TEST_USER_A);
    d = d.applyStageTransition(Stage.APPROVED, "approve", TEST_USER_A, {
      reviewDecision: { id: "rd-1", decision: "approved", actorId: TEST_USER_B, reason: "Approved", createdAt: new Date().toISOString() },
    });
    d = d.applyStageTransition(Stage.NEGOTIATION, "negotiate", TEST_USER_A);
    const won = d.applyStageTransition(Stage.CLOSED_WON, "close_won", TEST_USER_A);
    expect(won.stage.name).toBe("Closed Won");
    expect(won.lifecycle).toBe("closed");
    expect(won.closedAt).toBeTruthy();
  });

  test("rejection: In Review → Closed Lost (rejected)", () => {
    const deal = createTestDeal();
    let d = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    d = d.applyStageTransition(Stage.IN_REVIEW, "submit_for_review", TEST_USER_A);
    const rejected = d.applyStageTransition(Stage.CLOSED_LOST, "reject", TEST_USER_A, {
      reviewDecision: { id: "rd-2", decision: "rejected", actorId: TEST_USER_B, reason: "Not qualified enough", createdAt: new Date().toISOString() },
    });
    expect(rejected.stage.name).toBe("Closed Lost");
    expect(rejected.reviewStatus).toBe("rejected");
    expect(rejected.lifecycle).toBe("closed");
  });

  test("previous stage is tracked", () => {
    const deal = createTestDeal();
    const qualified = deal.applyStageTransition(Stage.QUALIFIED, "qualify", TEST_USER_A);
    expect(qualified.previousStage?.name).toBe("Draft");
  });
});

// ══════════════════════════════════════════
// §2.4 — Domain Error Tests
// ══════════════════════════════════════════

describe("Domain Errors", () => {
  test("ValidationError has correct code", () => {
    const err = new ValidationError("test");
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.recoverable).toBe(true);
    expect(err).toBeInstanceOf(Error);
  });

  test("BusinessRuleError has correct code", () => {
    const err = new BusinessRuleError("test");
    expect(err.code).toBe("BUSINESS_RULE_FAILED");
    expect(err.recoverable).toBe(true);
  });

  test("GovernanceBlockedError has correct code and guardType", () => {
    const err = new GovernanceBlockedError("test", "evidence_gate");
    expect(err.code).toBe("GOVERNANCE_BLOCKED");
    expect(err.guardType).toBe("evidence_gate");
    expect(err.recoverable).toBe(true);
  });

  test("ConcurrencyError has correct code and versions", () => {
    const err = new ConcurrencyError("test", 5, 6);
    expect(err.code).toBe("CONFLICT");
    expect(err.expectedVersion).toBe(5);
    expect(err.actualVersion).toBe(6);
    expect(err.recoverable).toBe(true);
  });

  test("NotFoundError has correct code and is NOT recoverable", () => {
    const err = new NotFoundError("test");
    expect(err.code).toBe("NOT_FOUND");
    expect(err.recoverable).toBe(false);
  });
});

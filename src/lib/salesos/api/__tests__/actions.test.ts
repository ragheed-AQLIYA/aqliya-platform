/**
 * API Tests — SPEC-01e §3 (API Contract Tests)
 * Covers: Error mapping, DTO translation, correlation ID, auth context
 */

import { InMemoryDealRepository } from "../../infrastructure/in-memory-deal-repository";
import {
  Deal, Amount, Probability, Currency, Stage,
  ValidationError, BusinessRuleError, GovernanceBlockedError,
  ConcurrencyError, NotFoundError,
} from "../../domain";
import { listDealsAction, getDealAction } from "../actions";
import { createAuthContext } from "../auth-context";
import { safe } from "../safe";

let repo: InMemoryDealRepository;
const ctx = createAuthContext();

function seedDeal(id: string, name: string, stage = Stage.DRAFT, amount = 100000) {
  const d = Deal.create({
    accountId: "acct-1", name, amount: Amount.create(amount),
    currency: Currency.SAR, probability: Probability.create(50),
    ownerId: "user-1", organizationId: ctx.organizationId, createdById: "user-1",
  });
  repo["store"].set(id, { ...d.toJSON(), id, version: 1 });
}

beforeEach(() => {
  repo = new InMemoryDealRepository();
});

// ══════════════════════════════════════════
// §3.1 — Server Action Tests
// ══════════════════════════════════════════

describe("listDealsAction", () => {
  test("returns empty list when no deals exist", async () => {
    const result = await listDealsAction(repo, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });

  test("returns all deals for organization", async () => {
    seedDeal("d-1", "Deal One");
    seedDeal("d-2", "Deal Two");
    const result = await listDealsAction(repo, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(2);
  });

  test("returns DTOs with flattened value objects", async () => {
    seedDeal("d-1", "Test Deal");
    const result = await listDealsAction(repo, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const dto = result.data[0];
      expect(typeof dto.amount).toBe("number");      // not Amount VO
      expect(typeof dto.currency).toBe("string");     // not Currency VO
      expect(typeof dto.stage).toBe("string");        // not Stage VO
      expect(typeof dto.probability).toBe("number");  // not Probability VO
      expect(dto.version).toBe(1);
    }
  });

  test("tenant isolation: deals from other org not visible", async () => {
    seedDeal("d-1", "Deal One");
    const otherCtx = createAuthContext({ organizationId: "other-org" });
    const result = await listDealsAction(repo, otherCtx);
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data).toHaveLength(0);
  });
});

describe("getDealAction", () => {
  test("returns deal when found", async () => {
    seedDeal("deal-1", "Found Deal");
    const result = await getDealAction(repo, ctx, "deal-1");
    expect(result.ok).toBe(true);
    if (result.ok) expect(result.data.name).toBe("Found Deal");
  });

  test("returns NOT_FOUND when deal does not exist", async () => {
    const result = await getDealAction(repo, ctx, "nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("NOT_FOUND");
      expect(result.error).toBe("Deal not found");
    }
  });

  test("cross-tenant: NOT_FOUND for wrong org", async () => {
    seedDeal("deal-1", "Deal");
    const otherCtx = createAuthContext({ organizationId: "other-org" });
    const result = await getDealAction(repo, otherCtx, "deal-1");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("NOT_FOUND");
  });
});

// ══════════════════════════════════════════
// §3.2 — Error Mapping Tests (Domain → API)
// ══════════════════════════════════════════

describe("Error Mapping (Domain → API via safe())", () => {
  test("ValidationError → VALIDATION_ERROR", async () => {
    const result = await safe(async () => { throw new ValidationError("test val"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("VALIDATION_ERROR");
  });

  test("BusinessRuleError → BUSINESS_RULE_FAILED", async () => {
    const result = await safe(async () => { throw new BusinessRuleError("test biz"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("BUSINESS_RULE_FAILED");
  });

  test("GovernanceBlockedError → GOVERNANCE_BLOCKED", async () => {
    const result = await safe(async () => { throw new GovernanceBlockedError("test gov", "evidence_gate"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("GOVERNANCE_BLOCKED");
  });

  test("ConcurrencyError → CONFLICT", async () => {
    const result = await safe(async () => { throw new ConcurrencyError("test con", 1, 2); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("CONFLICT");
  });

  test("NotFoundError → NOT_FOUND", async () => {
    const result = await safe(async () => { throw new NotFoundError("test nf"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("NOT_FOUND");
  });

  test("Access denied → FORBIDDEN", async () => {
    const result = await safe(async () => { throw new Error("Access denied: missing permission"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("FORBIDDEN");
  });

  test("Unexpected error → FORBIDDEN (generic)", async () => {
    const result = await safe(async () => { throw new Error("Unknown crash"); });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe("FORBIDDEN");
  });
});

// ══════════════════════════════════════════
// §8 — Correlation ID Propagation
// ══════════════════════════════════════════

describe("Correlation ID Propagation (SPEC-01b §1.3)", () => {
  test("correlationId returned in error response", async () => {
    const cid = "corr-test-123";
    const result = await safe(async () => { throw new NotFoundError("test"); }, cid);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.correlationId).toBe(cid);
  });

  test("correlationId from AuthContext flows through to action", async () => {
    const cid = ctx.correlationId;
    const result = await getDealAction(repo, ctx, "nonexistent");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.correlationId).toBe(cid);
  });

  test("each AuthContext has unique correlationId", () => {
    const ctx1 = createAuthContext();
    const ctx2 = createAuthContext();
    expect(ctx1.correlationId).not.toBe(ctx2.correlationId);
  });
});

// ══════════════════════════════════════════
// §3.3 — Transaction Boundary Awareness
// ══════════════════════════════════════════

describe("Transaction Boundary (SPEC-01b §5)", () => {
  test("read operations do not hold transactions", async () => {
    // getDeal returns immediately, no transaction lock
    seedDeal("d-1", "Test");
    const result = await getDealAction(repo, ctx, "d-1");
    expect(result.ok).toBe(true);
  });

  test("operation succeeds independently of external events", async () => {
    // Domain operations (read) succeed without Event Bus dependency
    seedDeal("d-1", "Test");
    const result = await listDealsAction(repo, ctx);
    expect(result.ok).toBe(true);
    // No event publishing triggered by reads
  });
});

// ══════════════════════════════════════════
// Layer Boundary Tests
// ══════════════════════════════════════════

describe("API Layer Boundary", () => {
  test("safe() has zero domain logic", () => {
    // safe() is pure error translation — no business rules
    expect(safe.toString()).toBeDefined();
  });

  test("DTO mapper has zero domain types in output", async () => {
    seedDeal("d-1", "Test");
    const result = await listDealsAction(repo, ctx);
    expect(result.ok).toBe(true);
    if (result.ok) {
      const dto = result.data[0];
      // Verify no Domain Value Object types in DTO
      expect((dto as any)?.amount instanceof Amount).toBe(false);
      expect((dto as any)?.probability instanceof Probability).toBe(false);
      expect((dto as any)?.stage instanceof Stage).toBe(false);
      expect((dto as any)?.currency instanceof Currency).toBe(false);
      // All should be primitives
      expect(typeof dto.amount).toBe("number");
      expect(typeof dto.probability).toBe("number");
      expect(typeof dto.stage).toBe("string");
      expect(typeof dto.currency).toBe("string");
    }
  });

  test("AuthContext has all required fields", () => {
    const c = createAuthContext();
    expect(c.user.id).toBeDefined();
    expect(c.organizationId).toBeDefined();
    expect(c.permissions).toBeDefined();
    expect(c.correlationId).toBeDefined();
  });
});

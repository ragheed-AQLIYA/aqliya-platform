import { describe, expect, it, jest, beforeEach } from "@jest/globals";

// ─── Mock external dependencies ───

jest.mock("@/lib/core/audit/audit-ledger-prisma", () => ({
  PrismaAuditLedger: jest.fn().mockImplementation(() => ({
    write: jest.fn(),
  })),
}));

jest.mock("@/products/sales/product-definition", () => ({
  SALESOS_PRODUCT_KEY: "salesos",
}));

jest.mock("server-only", () => ({}));

// ─── Imports under test ───

import {
  normalizeSalesEventType,
  resolveSalesTenantId,
} from "../core-adapters/audit-adapter/common";
import {
  mapSalesAuditCategory,
  mapSalesAuditCategoryToPlatform,
  mapSalesToContractCategory,
  resolveSalesEventType,
} from "../core-adapters/audit-adapter/mapping";
import {
  writeCoreSalesAuditEvent,
  getAuditLedger,
} from "../core-adapters/audit-adapter/writer";
import {
  recordSalesAuditEvent,
  recordSalesMutationAudit,
} from "../core-adapters/audit-adapter/recorder";
import { SALES_CORE_AUDIT_PREFIXES } from "../core-adapters/audit-adapter/types";

import type { SalesAuditActor } from "../core-adapters/audit-adapter/types";

// ─── Tests ───

describe("SalesOS Audit Adapter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─── normalizeSalesEventType ───

  describe("normalizeSalesEventType()", () => {
    it("normalizes sales.opportunity.submitted_for_review", () => {
      expect(normalizeSalesEventType("sales.opportunity.submitted_for_review")).toBe("sales.review.submitted");
    });

    it("normalizes sales.opportunity.approved", () => {
      expect(normalizeSalesEventType("sales.opportunity.approved")).toBe("sales.approval.approved");
    });

    it("normalizes sales.evidence.linked", () => {
      expect(normalizeSalesEventType("sales.evidence.linked")).toBe("sales.proof.linked");
    });

    it("normalizes evidence.linked (without sales prefix)", () => {
      expect(normalizeSalesEventType("evidence.linked")).toBe("sales.proof.linked");
    });

    it("passes through other sales.* events", () => {
      expect(normalizeSalesEventType("sales.account.created")).toBe("sales.account.created");
      expect(normalizeSalesEventType("sales.intelligence.interaction_logged")).toBe("sales.intelligence.interaction_logged");
    });

    it("passes through non-sales events unchanged", () => {
      expect(normalizeSalesEventType("audit.event")).toBe("audit.event");
    });
  });

  // ─── resolveSalesTenantId ───

  describe("resolveSalesTenantId()", () => {
    it("prefers platformOrganizationId", () => {
      const user = { organizationId: "org-a", platformOrganizationId: "platform-1" };
      expect(resolveSalesTenantId(user)).toBe("platform-1");
    });

    it("falls back to organizationId", () => {
      const user = { organizationId: "org-a" };
      expect(resolveSalesTenantId(user)).toBe("org-a");
    });
  });

  // ─── SALES_CORE_AUDIT_PREFIXES ───

  describe("SALES_CORE_AUDIT_PREFIXES", () => {
    it("includes all expected prefixes", () => {
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.account.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.opportunity.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.intelligence.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.proof.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.output.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.recommendation.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.review.");
      expect(SALES_CORE_AUDIT_PREFIXES).toContain("sales.approval.");
    });
  });

  // ─── mapSalesAuditCategory ───

  describe("mapSalesAuditCategory()", () => {
    it("maps sales.account.* to mutation", () => {
      expect(mapSalesAuditCategory("sales.account.created")).toBe("mutation");
      expect(mapSalesAuditCategory("sales.account.updated")).toBe("mutation");
    });

    it("maps sales.opportunity.* to mutation", () => {
      expect(mapSalesAuditCategory("sales.opportunity.created")).toBe("mutation");
    });

    it("maps sales.intelligence.* to ai", () => {
      expect(mapSalesAuditCategory("sales.intelligence.interaction_logged")).toBe("ai");
    });

    it("maps sales.proof.* to evidence", () => {
      expect(mapSalesAuditCategory("sales.proof.linked")).toBe("evidence");
    });

    it("maps sales.output.* to export", () => {
      expect(mapSalesAuditCategory("sales.output.exported")).toBe("export");
    });

    it("maps sales.recommendation.* to governance", () => {
      expect(mapSalesAuditCategory("sales.recommendation.persisted")).toBe("governance");
    });

    it("maps sales.review.* to review", () => {
      expect(mapSalesAuditCategory("sales.review.submitted")).toBe("review");
    });

    it("maps sales.approval.* to approval", () => {
      expect(mapSalesAuditCategory("sales.approval.approved")).toBe("approval");
    });

    it("maps sales.evidence.* to evidence", () => {
      expect(mapSalesAuditCategory("sales.evidence.linked")).toBe("evidence");
    });

    it("maps fallback to system", () => {
      expect(mapSalesAuditCategory("unknown.event")).toBe("system");
    });
  });

  // ─── mapSalesAuditCategoryToPlatform ───

  describe("mapSalesAuditCategoryToPlatform()", () => {
    it("maps intelligence to ai_execution", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.intelligence.analysis")).toBe("ai_execution");
    });

    it("maps proof to evidence", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.proof.linked")).toBe("evidence");
    });

    it("maps output to output", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.output.exported")).toBe("output");
    });

    it("maps review to review", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.review.submitted")).toBe("review");
    });

    it("maps approval to approval", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.approval.approved")).toBe("approval");
    });

    it("maps account/opportunity to workflow_transition", () => {
      expect(mapSalesAuditCategoryToPlatform("sales.account.created")).toBe("workflow_transition");
      expect(mapSalesAuditCategoryToPlatform("sales.opportunity.updated")).toBe("workflow_transition");
    });
  });

  // ─── mapSalesToContractCategory (alias) ───

  describe("mapSalesToContractCategory()", () => {
    it("is an alias for mapSalesAuditCategoryToPlatform", () => {
      expect(mapSalesToContractCategory).toBe(mapSalesAuditCategoryToPlatform);
      expect(mapSalesToContractCategory("sales.intelligence.analysis")).toBe("ai_execution");
    });
  });

  // ─── resolveSalesEventType ───

  describe("resolveSalesEventType()", () => {
    it("uses explicitAction when provided", () => {
      const result = resolveSalesEventType({
        mutation: "create",
        resourceType: "SalesAccount",
        explicitAction: "sales.review.submitted",
      });
      expect(result).toBe("sales.review.submitted");
    });

    it("resolves SalesAccount create", () => {
      const result = resolveSalesEventType({ mutation: "create", resourceType: "SalesAccount" });
      expect(result).toBe("sales.account.created");
    });

    it("resolves SalesAccount update", () => {
      const result = resolveSalesEventType({ mutation: "update", resourceType: "SalesAccount" });
      expect(result).toBe("sales.account.updated");
    });

    it("resolves SalesOpportunity transition with approved details", () => {
      const result = resolveSalesEventType({
        mutation: "transition",
        resourceType: "SalesOpportunity",
        details: { approvalStatus: "Approved" },
      });
      expect(result).toBe("sales.approval.approved");
    });

    it("resolves SalesOpportunity transition with review status", () => {
      const result = resolveSalesEventType({
        mutation: "transition",
        resourceType: "SalesOpportunity",
        details: { reviewStatus: "Submitted" },
      });
      expect(result).toBe("sales.review.submitted");
    });

    it("resolves SalesOpportunity transition default", () => {
      const result = resolveSalesEventType({ mutation: "transition", resourceType: "SalesOpportunity" });
      expect(result).toBe("sales.opportunity.stage_changed");
    });

    it("resolves SalesInteractionLog", () => {
      const result = resolveSalesEventType({ mutation: "create", resourceType: "SalesInteractionLog" });
      expect(result).toBe("sales.intelligence.interaction_logged");
    });

    it("resolves SalesEvidenceRef", () => {
      const result = resolveSalesEventType({ mutation: "update", resourceType: "SalesEvidenceRef" });
      expect(result).toBe("sales.proof.linked");
    });

    it("resolves SalesOutput export", () => {
      const result = resolveSalesEventType({ mutation: "export", resourceType: "SalesOutput" });
      expect(result).toBe("sales.output.exported");
    });

    it("resolves SalesRecommendation", () => {
      const result = resolveSalesEventType({ mutation: "create", resourceType: "SalesRecommendation" });
      expect(result).toBe("sales.recommendation.persisted");
    });

    it("falls back to dynamic resource type for unknown types", () => {
      const result = resolveSalesEventType({ mutation: "create", resourceType: "SalesCustomEntity" });
      expect(result).toBe("sales.customentity.create");
    });
  });

  // ─── writeCoreSalesAuditEvent ───

  describe("writeCoreSalesAuditEvent()", () => {
    it("writes to the PrismaAuditLedger", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await writeCoreSalesAuditEvent({
        tenantId: "org-1",
        eventType: "sales.account.created",
        actorId: "user-1",
        actorRole: "OPERATOR",
        resourceType: "SalesAccount",
        resourceId: "acct-1",
        summary: "Account created",
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({
          tenantId: "org-1",
          action: "sales.account.created",
          actorId: "user-1",
          productKey: "salesos",
        }),
      );
    });

    it("normalizes eventType before writing", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await writeCoreSalesAuditEvent({
        tenantId: "org-1",
        eventType: "sales.opportunity.submitted_for_review",
        actorId: "user-1",
        actorRole: "OPERATOR",
        resourceType: "SalesOpportunity",
        resourceId: "opp-1",
        summary: "Submitted",
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "sales.review.submitted" }),
      );
    });

    it("includes optional metadata like accountId and opportunityId", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await writeCoreSalesAuditEvent({
        tenantId: "org-1",
        eventType: "sales.opportunity.updated",
        actorId: "user-1",
        actorRole: "OPERATOR",
        resourceType: "SalesOpportunity",
        resourceId: "opp-1",
        summary: "Updated opportunity",
        accountId: "acct-1",
        opportunityId: "opp-1",
        changes: { stage: { from: "Draft", to: "Qualification" } },
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ accountId: "acct-1", opportunityId: "opp-1" }),
          changes: expect.objectContaining({ stage: { from: "Draft", to: "Qualification" } }),
        }),
      );
    });

    it("swallows errors from ledger.write (fail-soft)", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockRejectedValue(new Error("ledger unavailable"));

      await expect(
        writeCoreSalesAuditEvent({
          tenantId: "org-1",
          eventType: "sales.account.created",
          actorId: "user-1",
          actorRole: "OPERATOR",
          resourceType: "SalesAccount",
          resourceId: "acct-1",
          summary: "test",
        }),
      ).resolves.toBeUndefined();
    });
  });

  // ─── recordSalesAuditEvent ───

  describe("recordSalesAuditEvent()", () => {
    const actor: SalesAuditActor = { id: "user-1", role: "OPERATOR", organizationId: "org-1" };

    it("records event via writeCoreSalesAuditEvent", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await recordSalesAuditEvent({
        user: actor,
        eventType: "sales.output.exported",
        resourceType: "SalesOutput",
        resourceId: "out-1",
        summary: "Exported report",
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "sales.output.exported" }),
      );
    });

    it("calls onLocalCache callback when provided", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      const onLocalCache = jest.fn();
      await recordSalesAuditEvent({
        user: actor,
        eventType: "sales.account.created",
        resourceType: "SalesAccount",
        resourceId: "acct-1",
        summary: "Created",
        onLocalCache,
      });

      expect(onLocalCache).toHaveBeenCalledWith(
        expect.objectContaining({
          organizationId: "org-1",
          action: "sales.account.created",
          actorId: "user-1",
        }),
      );
    });

    it("swallows errors gracefully", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockRejectedValue(new Error("down"));

      await expect(
        recordSalesAuditEvent({
          user: actor,
          eventType: "sales.account.created",
          resourceType: "SalesAccount",
          resourceId: "acct-1",
          summary: "test",
        }),
      ).resolves.toBeUndefined();
    });
  });

  // ─── recordSalesMutationAudit ───

  describe("recordSalesMutationAudit()", () => {
    const actor: SalesAuditActor = { id: "user-1", role: "OPERATOR", organizationId: "org-1" };

    it("records create mutation for SalesAccount", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await recordSalesMutationAudit(actor, "create", "SalesAccount", "acct-1");

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "sales.account.created" }),
      );
    });

    it("records transition with approval details", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await recordSalesMutationAudit(actor, "transition", "SalesOpportunity", "opp-1", {
        approvalStatus: "Approved",
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({ action: "sales.approval.approved" }),
      );
    });

    it("passes metadata to recordSalesAuditEvent", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      await recordSalesMutationAudit(actor, "export", "SalesOutput", "out-1", {
        format: "pdf",
      });

      expect(ledger.write).toHaveBeenCalledWith(
        expect.objectContaining({
          action: "sales.output.exported",
        }),
      );
    });

    it("calls onLocalCache when provided", async () => {
      const ledger = getAuditLedger();
      jest.spyOn(ledger, "write").mockResolvedValue(undefined);

      const onLocalCache = jest.fn();
      await recordSalesMutationAudit(actor, "create", "SalesAccount", "acct-1", undefined, onLocalCache);

      expect(onLocalCache).toHaveBeenCalled();
    });
  });

  // ─── getAuditLedger ───

  describe("getAuditLedger()", () => {
    it("returns the PrismaAuditLedger instance", () => {
      const ledger = getAuditLedger();
      expect(ledger).toBeDefined();
      expect(typeof ledger.write).toBe("function");
    });
  });
});

/**
 * Unit Test: IFRS Rule Checks - Earnings per Share (IAS 33)
 *
 * Tests the four EPS handlers directly:
 * - handleBasicEps (IAS 33.9)
 * - handleDilutedEps (IAS 33.30)
 * - handleEpsReconciliation (IAS 33.48)
 * - handleEpsShareReconciliation (IAS 33.66)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleBasicEps,
  handleDilutedEps,
  handleEpsReconciliation,
  handleEpsShareReconciliation,
} from "@/lib/audit/rules/ifrs-rule-checks/earnings-per-share";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 33.9",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 33",
    ...overrides,
  };
}

function ctxWithMappings(names: string[], noteCount = 0): IfrsEvaluationContext {
  return {
    engagementId: "test",
    engagementStatus: "in_progress",
    reportingFramework: "ifrs",
    currencyCode: "SAR",
    statementTypes: ["balance_sheet", "income_statement"],
    statements: [],
    mappings: names.map((n, i) => ({
      sourceAccountCode: "ACC-" + i,
      sourceAccountName: n,
      status: "confirmed",
      statementClassification: null,
      canonicalName: null,
      canonicalCategory: null,
    })),
    tbLines: [],
    disclosureNoteCount: noteCount,
  };
}

// --- handleBasicEps (IAS 33.9) ---

describe("handleBasicEps", () => {
  const r = rule("basic-eps", { paragraphReference: "IAS 33.9" });

  it("skips when no profit or share accounts are mapped", () => {
    const ev = handleBasicEps(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No profit or share");
  });

  it("skips when mappings exist but none are profit or shares", () => {
    const ev = handleBasicEps(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when profit present without share accounts", () => {
    const ev = handleBasicEps(r, ctxWithMappings(["Net Profit"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without ordinary share");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("warns when shares present without profit accounts", () => {
    const ev = handleBasicEps(r, ctxWithMappings(["Ordinary Shares Outstanding"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without profit");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when both profit and share accounts are present", () => {
    const ev = handleBasicEps(
      r,
      ctxWithMappings(["Net Profit Attributable to Parent", "Weighted Average Ordinary Shares"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("skips when profit mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Net Profit", "Ordinary Shares"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleBasicEps(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects profit via canonicalName (earnings)", () => {
    const ctx = ctxWithMappings(["Account 4001", "Ordinary Shares"]);
    ctx.mappings[0].canonicalName = "Earnings Attributable to Parent";
    const ev = handleBasicEps(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic profit hint (ربح)", () => {
    const ev = handleBasicEps(r, ctxWithMappings(["صافي الربح", "أسهم عادية"]));
    expect(ev.status).toBe("pass");
  });
});

// --- handleDilutedEps (IAS 33.30) ---

describe("handleDilutedEps", () => {
  const r = rule("diluted-eps", { paragraphReference: "IAS 33.30" });

  it("skips when no profit accounts are mapped", () => {
    const ev = handleDilutedEps(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are profit", () => {
    const ev = handleDilutedEps(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when profit present but no dilutive instruments", () => {
    const ev = handleDilutedEps(r, ctxWithMappings(["Net Profit"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("diluted EPS");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when both profit and dilutive instruments are present", () => {
    const ev = handleDilutedEps(
      r,
      ctxWithMappings(["Net Profit", "Convertible Bonds"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("skips when profit mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Net Profit", "Warrants"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleDilutedEps(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects dilutive via canonicalName (options)", () => {
    const ctx = ctxWithMappings(["Net Profit", "Account 5001"]);
    ctx.mappings[1].canonicalName = "Share Options";
    const ev = handleDilutedEps(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic dilutive hint (مخففة)", () => {
    const ev = handleDilutedEps(r, ctxWithMappings(["صافي الربح", "أسهم مخففة"]));
    expect(ev.status).toBe("pass");
  });
});

// --- handleEpsReconciliation (IAS 33.48) ---

describe("handleEpsReconciliation", () => {
  const r = rule("eps-reconciliation", { paragraphReference: "IAS 33.48" });

  it("skips when no profit accounts are mapped", () => {
    const ev = handleEpsReconciliation(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are profit", () => {
    const ev = handleEpsReconciliation(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when profit present without EPS disclosure and noteCount is zero", () => {
    const ev = handleEpsReconciliation(r, ctxWithMappings(["Net Profit"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("EPS reconciliation");
  });

  it("passes when EPS disclosure account is present even with noteCount zero", () => {
    const ev = handleEpsReconciliation(
      r,
      ctxWithMappings(["Net Profit", "EPS Reconciliation Note"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleEpsReconciliation(r, ctxWithMappings(["Net Profit"], 3));
    expect(ev.status).toBe("pass");
  });

  it("skips when profit mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Net Profit"]);
    ctx.mappings[0].status = "pending";
    const ev = handleEpsReconciliation(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic profit hint (أرباح)", () => {
    const ev = handleEpsReconciliation(r, ctxWithMappings(["أرباح صافية"], 2));
    expect(ev.status).toBe("pass");
  });
});

// --- handleEpsShareReconciliation (IAS 33.66) ---

describe("handleEpsShareReconciliation", () => {
  const r = rule("eps-share-reconciliation", { paragraphReference: "IAS 33.66" });

  it("skips when no share accounts are mapped", () => {
    const ev = handleEpsShareReconciliation(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are shares", () => {
    const ev = handleEpsShareReconciliation(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when shares present without EPS disclosure and noteCount is zero", () => {
    const ev = handleEpsShareReconciliation(r, ctxWithMappings(["Ordinary Shares Outstanding"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("share reconciliation");
  });

  it("passes when EPS disclosure account is present even with noteCount zero", () => {
    const ev = handleEpsShareReconciliation(
      r,
      ctxWithMappings(["Ordinary Shares", "EPS Disclosure"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleEpsShareReconciliation(r, ctxWithMappings(["Ordinary Shares"], 2));
    expect(ev.status).toBe("pass");
  });

  it("skips when share mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Ordinary Shares"]);
    ctx.mappings[0].status = "pending";
    const ev = handleEpsShareReconciliation(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic share hint (أسهم)", () => {
    const ev = handleEpsShareReconciliation(r, ctxWithMappings(["أسهم عادية"], 1));
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("earnings-per-share - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("basic-eps", {
      ruleId: "ias33-009",
      standardCode: "IAS 33",
      paragraphReference: "IAS 33.9",
    });
    const ev = handleBasicEps(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias33-009");
    expect(ev.standardCode).toBe("IAS 33");
    expect(ev.paragraphReference).toBe("IAS 33.9");
    expect(ev.topic).toBe("basic-eps");
  });
});

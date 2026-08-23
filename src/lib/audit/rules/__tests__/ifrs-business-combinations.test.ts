/**
 * Unit Test: IFRS Rule Checks - Business Combinations (IFRS 3)
 *
 * Tests the four business combination handlers directly:
 * - handleAcquisitionMethod (IFRS 3.4)
 * - handleIdentifyAcquirer (IFRS 3.7)
 * - handleFairValue (IFRS 3.32)
 * - handleGoodwill (IFRS 3.36)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleAcquisitionMethod,
  handleIdentifyAcquirer,
  handleFairValue,
  handleGoodwill,
} from "@/lib/audit/rules/ifrs-rule-checks/business-combinations";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks/common";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IFRS 3.4",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IFRS 3",
    ...overrides,
  };
}

function ctxWithMappings(names: string[]): IfrsEvaluationContext {
  return {
    engagementId: "test",
    engagementStatus: "in_progress",
    reportingFramework: "ifrs",
    currencyCode: "SAR",
    statementTypes: ["balance_sheet", "income_statement"],
    statements: [],
    mappings: names.map((n, i) => ({
      sourceAccountCode: `ACC-${i}`,
      sourceAccountName: n,
      status: "confirmed",
      statementClassification: null,
      canonicalName: null,
      canonicalCategory: null,
    })),
    tbLines: [],
    disclosureNoteCount: 0,
  };
}

// --- handleAcquisitionMethod (IFRS 3.4) ---

describe("handleAcquisitionMethod", () => {
  const r = rule("acquisition-method", {
    paragraphReference: "IFRS 3.4",
  });

  it("skips when no acquisition accounts are mapped", () => {
    const ev = handleAcquisitionMethod(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are acquisition accounts", () => {
    const ev = handleAcquisitionMethod(
      r,
      ctxWithMappings(["Revenue", "Cash"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
  });

  it("passes when acquisition accounts are present", () => {
    const ev = handleAcquisitionMethod(
      r,
      ctxWithMappings(["Acquisition Cost"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Acquisition accounts present");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- handleIdentifyAcquirer (IFRS 3.7) ---

describe("handleIdentifyAcquirer", () => {
  const r = rule("identify-acquirer", {
    paragraphReference: "IFRS 3.7",
  });

  it("skips when no acquisition accounts are mapped", () => {
    const ev = handleIdentifyAcquirer(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are acquisition accounts", () => {
    const ev = handleIdentifyAcquirer(
      r,
      ctxWithMappings(["Inventory", "Accounts Payable"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
  });

  it("returns advisory when acquisition accounts are present", () => {
    const ev = handleIdentifyAcquirer(
      r,
      ctxWithMappings(["Business Combination"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("Ensure acquirer is correctly identified");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleFairValue (IFRS 3.32) ---

describe("handleFairValue", () => {
  const r = rule("fair-value", { paragraphReference: "IFRS 3.32" });

  it("skips when no acquisition accounts are mapped", () => {
    const ev = handleFairValue(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when only fair value (no acquisition) is mapped", () => {
    const ev = handleFairValue(r, ctxWithMappings(["Fair Value Adjustment"]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition accounts");
  });

  it("warns when acquisition present without fair value", () => {
    const ev = handleFairValue(r, ctxWithMappings(["Acquisition"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without fair value");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when both acquisition and fair value accounts are present", () => {
    const ev = handleFairValue(
      r,
      ctxWithMappings(["Acquisition", "Fair Value Adjustment"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Acquisition and fair value accounts present");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- handleGoodwill (IFRS 3.36) ---

describe("handleGoodwill", () => {
  const r = rule("goodwill", { paragraphReference: "IFRS 3.36" });

  it("skips when no acquisition and no goodwill are mapped", () => {
    const ev = handleGoodwill(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition or goodwill accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none relate to acquisition or goodwill", () => {
    const ev = handleGoodwill(r, ctxWithMappings(["Revenue", "Cash"]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No acquisition or goodwill accounts");
  });

  it("warns when acquisition present without goodwill", () => {
    const ev = handleGoodwill(r, ctxWithMappings(["Acquisition"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without goodwill");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("returns advisory when goodwill present without NCI", () => {
    const ev = handleGoodwill(r, ctxWithMappings(["Goodwill"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("non-controlling interest");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when both goodwill and NCI accounts are present", () => {
    const ev = handleGoodwill(
      r,
      ctxWithMappings(["Goodwill", "Non-Controlling Interest"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Goodwill and NCI mapped");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- Edge cases ---

describe("business-combinations - edge cases", () => {
  it("skips when acquisition mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Acquisition"]);
    ctx.mappings[0].status = "draft";
    const ev = handleAcquisitionMethod(
      rule("acquisition-method", { paragraphReference: "IFRS 3.4" }),
      ctx,
    );
    expect(ev.status).toBe("skipped");
  });

  it("detects acquisition via canonicalName field", () => {
    const ctx = ctxWithMappings(["GL Entry"]);
    ctx.mappings[0].canonicalName = "Acquisition";
    const ev = handleAcquisitionMethod(
      rule("acquisition-method", { paragraphReference: "IFRS 3.4" }),
      ctx,
    );
    expect(ev.status).toBe("pass");
  });

  it("detects goodwill via canonicalCategory field", () => {
    const ctx = ctxWithMappings(["Intangibles"]);
    ctx.mappings[0].canonicalCategory = "goodwill";
    const ev = handleGoodwill(
      rule("goodwill", { paragraphReference: "IFRS 3.36" }),
      ctx,
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects Arabic acquisition hint (استحواذ)", () => {
    const ev = handleAcquisitionMethod(
      rule("acquisition-method", { paragraphReference: "IFRS 3.4" }),
      ctxWithMappings(["استحواذ"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic goodwill hint (شهرة)", () => {
    const ev = handleGoodwill(
      rule("goodwill", { paragraphReference: "IFRS 3.36" }),
      ctxWithMappings(["شهرة"]),
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects fair value via fvlm hint", () => {
    const ev = handleFairValue(
      rule("fair-value", { paragraphReference: "IFRS 3.32" }),
      ctxWithMappings(["Acquisition", "FVLM Reserve"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic fair value hint (قيمة عادلة)", () => {
    const ev = handleFairValue(
      rule("fair-value", { paragraphReference: "IFRS 3.32" }),
      ctxWithMappings(["استحواذ", "قيمة عادلة"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects NCI via minority interest hint", () => {
    const ev = handleGoodwill(
      rule("goodwill", { paragraphReference: "IFRS 3.36" }),
      ctxWithMappings(["Goodwill", "Minority Interest"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic NCI hint (حقوق الأقلية)", () => {
    const ev = handleGoodwill(
      rule("goodwill", { paragraphReference: "IFRS 3.36" }),
      ctxWithMappings(["شهرة", "حقوق الأقلية"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("business-combinations - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("acquisition-method", {
      ruleId: "ifrs3-004",
      standardCode: "IFRS 3",
      paragraphReference: "IFRS 3.4",
    });
    const ev = handleAcquisitionMethod(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ifrs3-004");
    expect(ev.standardCode).toBe("IFRS 3");
    expect(ev.paragraphReference).toBe("IFRS 3.4");
    expect(ev.topic).toBe("acquisition-method");
  });
});
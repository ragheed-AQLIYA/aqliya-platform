/**
 * Unit Test: IFRS Rule Checks - Fair Value Measurement (IFRS 13)
 *
 * Tests the four fair value handlers directly:
 * - handleFairValueDefinition (IFRS 13.9)
 * - handleValuationTechniques (IFRS 13.61)
 * - handleFairValueHierarchy (IFRS 13.76)
 * - handleFairValueDisclosure (IFRS 13.91)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleFairValueDefinition,
  handleValuationTechniques,
  handleFairValueHierarchy,
  handleFairValueDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/fair-value";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks/common";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IFRS 13.9",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IFRS 13",
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

// --- handleFairValueDefinition (IFRS 13.9) ---

describe("handleFairValueDefinition", () => {
  const r = rule("fair-value-definition", {
    paragraphReference: "IFRS 13.9",
  });

  it("skips when no fair value accounts are mapped", () => {
    const ev = handleFairValueDefinition(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are fair value accounts", () => {
    const ev = handleFairValueDefinition(
      r,
      ctxWithMappings(["Revenue", "Cash"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
  });

  it("returns advisory when fair value accounts are present", () => {
    const ev = handleFairValueDefinition(
      r,
      ctxWithMappings(["Fair Value Adjustment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("exit price");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleValuationTechniques (IFRS 13.61) ---

describe("handleValuationTechniques", () => {
  const r = rule("valuation-techniques", {
    paragraphReference: "IFRS 13.61",
  });

  it("skips when no fair value accounts are mapped", () => {
    const ev = handleValuationTechniques(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when only valuation (no fair value) is mapped", () => {
    const ev = handleValuationTechniques(
      r,
      ctxWithMappings(["Valuation Reserve"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
  });

  it("returns advisory when fair value present without valuation", () => {
    const ev = handleValuationTechniques(
      r,
      ctxWithMappings(["Fair Value Adjustment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("without valuation technique");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("passes when both fair value and valuation accounts are present", () => {
    const ev = handleValuationTechniques(
      r,
      ctxWithMappings(["Fair Value Adjustment", "Valuation Reserve"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("valuation technique accounts present");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleFairValueHierarchy (IFRS 13.76) ---

describe("handleFairValueHierarchy", () => {
  const r = rule("fair-value-hierarchy", {
    paragraphReference: "IFRS 13.76",
  });

  it("skips when no fair value accounts are mapped", () => {
    const ev = handleFairValueHierarchy(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("warns when fair value present without hierarchy classification", () => {
    const ev = handleFairValueHierarchy(
      r,
      ctxWithMappings(["Fair Value Adjustment"]),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without hierarchy classification");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("passes when hierarchy classification is present", () => {
    const ev = handleFairValueHierarchy(
      r,
      ctxWithMappings(["Fair Value Adjustment", "Level 1 Investments"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("hierarchy classification present");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleFairValueDisclosure (IFRS 13.91) ---

describe("handleFairValueDisclosure", () => {
  const r = rule("disclosure", { paragraphReference: "IFRS 13.91" });

  it("skips when no fair value accounts are mapped", () => {
    const ev = handleFairValueDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No fair value accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("warns when fair value present without disclosure and noteCount is zero", () => {
    const ev = handleFairValueDisclosure(
      r,
      ctxWithMappings(["Fair Value Adjustment"]),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without disclosures");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("passes when disclosure account is present (noteCount zero)", () => {
    const ev = handleFairValueDisclosure(
      r,
      ctxWithMappings(["Fair Value Adjustment", "Fair Value Disclosure"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("disclosures present");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ctx = ctxWithMappings(["Fair Value Adjustment"]);
    ctx.disclosureNoteCount = 3;
    const ev = handleFairValueDisclosure(r, ctx);
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("disclosures present");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- Edge cases ---

describe("fair-value - edge cases", () => {
  it("skips when fair value mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Fair Value Adjustment"]);
    ctx.mappings[0].status = "pending";
    const ev = handleFairValueDefinition(
      rule("fair-value-definition", { paragraphReference: "IFRS 13.9" }),
      ctx,
    );
    expect(ev.status).toBe("skipped");
  });

  it("detects fair value via canonicalName field", () => {
    const ctx = ctxWithMappings(["Investments"]);
    ctx.mappings[0].canonicalName = "Fair Value";
    const ev = handleFairValueDefinition(
      rule("fair-value-definition", { paragraphReference: "IFRS 13.9" }),
      ctx,
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects fair value via fvlm hint", () => {
    const ev = handleFairValueDefinition(
      rule("fair-value-definition", { paragraphReference: "IFRS 13.9" }),
      ctxWithMappings(["FVLM Reserve"]),
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects fair value via fair market hint", () => {
    const ev = handleFairValueDefinition(
      rule("fair-value-definition", { paragraphReference: "IFRS 13.9" }),
      ctxWithMappings(["Fair Market Value"]),
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects Arabic fair value hint (قيمة عادلة)", () => {
    const ev = handleFairValueDefinition(
      rule("fair-value-definition", { paragraphReference: "IFRS 13.9" }),
      ctxWithMappings(["قيمة عادلة"]),
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects valuation via market approach hint", () => {
    const ev = handleValuationTechniques(
      rule("valuation-techniques", { paragraphReference: "IFRS 13.61" }),
      ctxWithMappings(["Fair Value Adjustment", "Market Approach Model"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects valuation via Arabic hint (تقييم)", () => {
    const ev = handleValuationTechniques(
      rule("valuation-techniques", { paragraphReference: "IFRS 13.61" }),
      ctxWithMappings(["قيمة عادلة", "تقييم"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects hierarchy via level 2 hint", () => {
    const ev = handleFairValueHierarchy(
      rule("fair-value-hierarchy", { paragraphReference: "IFRS 13.76" }),
      ctxWithMappings(["Fair Value Adjustment", "Level 2 Assets"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects hierarchy via observable hint", () => {
    const ev = handleFairValueHierarchy(
      rule("fair-value-hierarchy", { paragraphReference: "IFRS 13.76" }),
      ctxWithMappings(["Fair Value Adjustment", "Observable Inputs"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("detects disclosure via إفصاح hint", () => {
    const ev = handleFairValueDisclosure(
      rule("disclosure", { paragraphReference: "IFRS 13.91" }),
      ctxWithMappings(["Fair Value Adjustment", "إفصاح"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("fair-value - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("fair-value-definition", {
      ruleId: "ifrs13-009",
      standardCode: "IFRS 13",
      paragraphReference: "IFRS 13.9",
    });
    const ev = handleFairValueDefinition(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ifrs13-009");
    expect(ev.standardCode).toBe("IFRS 13");
    expect(ev.paragraphReference).toBe("IFRS 13.9");
    expect(ev.topic).toBe("fair-value-definition");
  });
});
/**
 * Unit Test: IFRS Rule Checks - Impairment of Assets (IAS 36)
 *
 * Tests the four impairment handlers directly:
 * - handleIndicatorAssessment (IAS 36.9)
 * - handleRecoverableAmount (IAS 36.59)
 * - handleImpairmentLoss (IAS 36.104)
 * - handleReversal (IAS 36.117)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleIndicatorAssessment,
  handleRecoverableAmount,
  handleImpairmentLoss,
  handleReversal,
} from "@/lib/audit/rules/ifrs-rule-checks/impairment";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 36.9",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 36",
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
      sourceAccountCode: "ACC-" + i,
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

// --- handleIndicatorAssessment (IAS 36.9) ---

describe("handleIndicatorAssessment", () => {
  const r = rule("indicator-assessment", {
    paragraphReference: "IAS 36.9",
  });

  it("skips when no asset accounts are mapped", () => {
    const ev = handleIndicatorAssessment(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No asset accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are asset accounts", () => {
    const ev = handleIndicatorAssessment(
      r,
      ctxWithMappings(["Revenue", "Accounts Payable"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No asset accounts");
  });

  it("returns advisory when asset accounts are present", () => {
    const ev = handleIndicatorAssessment(
      r,
      ctxWithMappings(["Property, Plant & Equipment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("impairment indicators");
  });
});

// --- handleRecoverableAmount (IAS 36.59) ---

describe("handleRecoverableAmount", () => {
  const r = rule("recoverable-amount", {
    paragraphReference: "IAS 36.59",
  });

  it("skips when no asset accounts are mapped", () => {
    const ev = handleRecoverableAmount(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No asset accounts");
  });

  it("returns advisory when assets are present without impairment", () => {
    const ev = handleRecoverableAmount(
      r,
      ctxWithMappings(["Property, Plant & Equipment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("recoverable amount is determined");
  });

  it("returns advisory when impairment is recognised", () => {
    const ev = handleRecoverableAmount(
      r,
      ctxWithMappings(["Property, Plant & Equipment", "Impairment Loss"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("Impairment loss recognised");
    expect(ev.messageEn).toContain("higher of fair value");
  });
});

// --- handleImpairmentLoss (IAS 36.104) ---

describe("handleImpairmentLoss", () => {
  const r = rule("impairment-loss", {
    paragraphReference: "IAS 36.104",
  });

  it("skips when no asset accounts are mapped", () => {
    const ev = handleImpairmentLoss(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No asset accounts");
  });

  it("passes when impairment loss is recognised for assets", () => {
    const ev = handleImpairmentLoss(
      r,
      ctxWithMappings(["Property, Plant & Equipment", "Impairment Loss"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("ensure it is recognised in profit or loss");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("returns advisory when assets present but no impairment recognised", () => {
    const ev = handleImpairmentLoss(
      r,
      ctxWithMappings(["Property, Plant & Equipment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("No impairment loss recognised");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleReversal (IAS 36.117) ---

describe("handleReversal", () => {
  const r = rule("reversal", { paragraphReference: "IAS 36.117" });

  it("skips when no asset accounts are mapped", () => {
    const ev = handleReversal(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No asset accounts");
  });

  it("returns advisory when impairment is recognised without reversal", () => {
    const ev = handleReversal(
      r,
      ctxWithMappings(["Property, Plant & Equipment", "Impairment Loss"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("without reversal");
  });

  it("returns advisory otherwise when no impairment is recognised", () => {
    const ev = handleReversal(
      r,
      ctxWithMappings(["Property, Plant & Equipment"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("Ensure reversal");
  });

  it("returns advisory otherwise when impairment and reversal are present", () => {
    const ev = handleReversal(
      r,
      ctxWithMappings([
        "Property, Plant & Equipment",
        "Impairment Loss",
        "Reversal of Impairment",
      ]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("Ensure reversal");
    expect(ev.messageEn).not.toContain("without reversal");
  });
});

// --- Edge cases ---

describe("impairment - edge cases", () => {
  it("skips when asset mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Property, Plant & Equipment"]);
    ctx.mappings[0].status = "draft";
    const ev = handleIndicatorAssessment(
      rule("indicator-assessment", { paragraphReference: "IAS 36.9" }),
      ctx,
    );
    expect(ev.status).toBe("skipped");
  });

  it("detects assets via canonicalCategory field", () => {
    const ctx = ctxWithMappings(["Current Items"]);
    ctx.mappings[0].canonicalCategory = "PPE";
    const ev = handleIndicatorAssessment(
      rule("indicator-assessment", { paragraphReference: "IAS 36.9" }),
      ctx,
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects goodwill as an asset", () => {
    const ev = handleIndicatorAssessment(
      rule("indicator-assessment", { paragraphReference: "IAS 36.9" }),
      ctxWithMappings(["Goodwill"]),
    );
    expect(ev.status).toBe("advisory");
  });

  it("detects intangible assets", () => {
    const ev = handleImpairmentLoss(
      rule("impairment-loss", { paragraphReference: "IAS 36.104" }),
      ctxWithMappings(["Intangible Assets"]),
    );
    expect(ev.status).toBe("advisory");
  });
});

// --- Rule metadata propagation ---

describe("impairment - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("indicator-assessment", {
      ruleId: "ias36-009",
      standardCode: "IAS 36",
      paragraphReference: "IAS 36.9",
    });
    const ev = handleIndicatorAssessment(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias36-009");
    expect(ev.standardCode).toBe("IAS 36");
    expect(ev.paragraphReference).toBe("IAS 36.9");
    expect(ev.topic).toBe("indicator-assessment");
  });
});
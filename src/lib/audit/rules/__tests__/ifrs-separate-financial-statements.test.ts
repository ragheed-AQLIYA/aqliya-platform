/**
 * Unit Test: IFRS Rule Checks - Separate Financial Statements (IAS 27)
 *
 * Tests the four separate FS handlers directly:
 * - handleSeparateFsMeasurement (IAS 27.10)
 * - handleSeparateFsConsistency (IAS 27.11)
 * - handleSeparateFsDisclosure (IAS 27.12)
 * - handleSeparateFsJudgements (IAS 27.13)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleSeparateFsMeasurement,
  handleSeparateFsConsistency,
  handleSeparateFsDisclosure,
  handleSeparateFsJudgements,
} from "@/lib/audit/rules/ifrs-rule-checks/separate-financial-statements";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 27.10",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 27",
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

// --- handleSeparateFsMeasurement (IAS 27.10) ---

describe("handleSeparateFsMeasurement", () => {
  const r = rule("separate-fs-measurement", { paragraphReference: "IAS 27.10" });

  it("skips when no investment accounts are mapped", () => {
    const ev = handleSeparateFsMeasurement(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No investment");
  });

  it("skips when mappings exist but none are investment accounts", () => {
    const ev = handleSeparateFsMeasurement(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when investment present without measurement basis", () => {
    const ev = handleSeparateFsMeasurement(r, ctxWithMappings(["Investment in Subsidiary"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("measurement basis");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when investment and cost basis are present", () => {
    const ev = handleSeparateFsMeasurement(
      r,
      ctxWithMappings(["Investment in Subsidiary", "At Cost"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when investment and fair value basis are present", () => {
    const ev = handleSeparateFsMeasurement(
      r,
      ctxWithMappings(["Investment in Associate", "Fair Value"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when investment and equity method are present", () => {
    const ev = handleSeparateFsMeasurement(
      r,
      ctxWithMappings(["Investment in Joint Venture", "Equity Method"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when investment mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment in Subsidiary", "At Cost"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleSeparateFsMeasurement(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects investment via canonicalName (subsidiary investment)", () => {
    const ctx = ctxWithMappings(["Account 1001", "At Cost"]);
    ctx.mappings[0].canonicalName = "Investment in Subsidiary";
    const ev = handleSeparateFsMeasurement(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic investment hint (استثمار في شركة تابعة)", () => {
    const ev = handleSeparateFsMeasurement(
      r,
      ctxWithMappings(["استثمار في شركة تابعة", "تكلفة"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleSeparateFsConsistency (IAS 27.11) ---

describe("handleSeparateFsConsistency", () => {
  const r = rule("separate-fs-consistency", { paragraphReference: "IAS 27.11" });

  it("skips when no investment accounts are mapped", () => {
    const ev = handleSeparateFsConsistency(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are investments", () => {
    const ev = handleSeparateFsConsistency(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when investment accounts are present", () => {
    const ev = handleSeparateFsConsistency(r, ctxWithMappings(["Investment in Subsidiary"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("same accounting policy");
  });

  it("skips when investment mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment in Subsidiary"]);
    ctx.mappings[0].status = "pending";
    const ev = handleSeparateFsConsistency(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic investment hint (استثمار)", () => {
    const ev = handleSeparateFsConsistency(r, ctxWithMappings(["استثمار في شركة شقيقة"]));
    expect(ev.status).toBe("advisory");
  });
});

// --- handleSeparateFsDisclosure (IAS 27.12) ---

describe("handleSeparateFsDisclosure", () => {
  const r = rule("separate-fs-disclosure", { paragraphReference: "IAS 27.12" });

  it("skips when no investment accounts are mapped", () => {
    const ev = handleSeparateFsDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are investments", () => {
    const ev = handleSeparateFsDisclosure(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when investment present without disclosure and noteCount is zero", () => {
    const ev = handleSeparateFsDisclosure(r, ctxWithMappings(["Investment in Subsidiary"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("accounting policy");
  });

  it("passes when disclosure account is present even with noteCount zero", () => {
    const ev = handleSeparateFsDisclosure(
      r,
      ctxWithMappings(["Investment in Subsidiary", "Separate Financial Statements Policy"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleSeparateFsDisclosure(r, ctxWithMappings(["Investment in Subsidiary"], 2));
    expect(ev.status).toBe("pass");
  });

  it("skips when investment mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment in Subsidiary"]);
    ctx.mappings[0].status = "pending";
    const ev = handleSeparateFsDisclosure(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic investment hint (استثمار)", () => {
    const ev = handleSeparateFsDisclosure(r, ctxWithMappings(["استثمار في مشروع مشترك"], 1));
    expect(ev.status).toBe("pass");
  });
});

// --- handleSeparateFsJudgements (IAS 27.13) ---

describe("handleSeparateFsJudgements", () => {
  const r = rule("separate-fs-judgements", { paragraphReference: "IAS 27.13" });

  it("skips when no investment accounts are mapped", () => {
    const ev = handleSeparateFsJudgements(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are investments", () => {
    const ev = handleSeparateFsJudgements(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when investment present without judgement disclosure and noteCount zero", () => {
    const ev = handleSeparateFsJudgements(r, ctxWithMappings(["Investment in Subsidiary"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("significant judgements");
  });

  it("passes when judgement disclosure account is present", () => {
    const ev = handleSeparateFsJudgements(
      r,
      ctxWithMappings(["Investment in Subsidiary", "Significant Influence Assessment"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no judgement account but noteCount is greater than zero", () => {
    const ev = handleSeparateFsJudgements(r, ctxWithMappings(["Investment in Subsidiary"], 3));
    expect(ev.status).toBe("pass");
  });

  it("skips when investment mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment in Subsidiary"]);
    ctx.mappings[0].status = "pending";
    const ev = handleSeparateFsJudgements(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic control hint (تأثير جوهري)", () => {
    const ev = handleSeparateFsJudgements(
      r,
      ctxWithMappings(["استثمار في شركة شقيقة", "تأثير جوهري"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("separate-financial-statements - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("separate-fs-measurement", {
      ruleId: "ias27-010",
      standardCode: "IAS 27",
      paragraphReference: "IAS 27.10",
    });
    const ev = handleSeparateFsMeasurement(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias27-010");
    expect(ev.standardCode).toBe("IAS 27");
    expect(ev.paragraphReference).toBe("IAS 27.10");
    expect(ev.topic).toBe("separate-fs-measurement");
  });
});

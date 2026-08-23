/**
 * Unit Test: IFRS Rule Checks - Investment Property (IAS 40)
 *
 * Tests the four investment property handlers directly:
 * - handleIpDefinition (IAS 40.5)
 * - handleIpMeasurement (IAS 40.30)
 * - handleIpFairValue (IAS 40.55)
 * - handleIpDisclosure (IAS 40.75)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleIpDefinition,
  handleIpMeasurement,
  handleIpFairValue,
  handleIpDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/investment-property";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 40.5",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 40",
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

// --- handleIpDefinition (IAS 40.5) ---

describe("handleIpDefinition", () => {
  const r = rule("ip-definition", { paragraphReference: "IAS 40.5" });

  it("skips when no investment property accounts are mapped", () => {
    const ev = handleIpDefinition(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No investment property");
  });

  it("skips when mappings exist but none are IP accounts", () => {
    const ev = handleIpDefinition(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("passes when investment property accounts are present", () => {
    const ev = handleIpDefinition(r, ctxWithMappings(["Investment Property"]));
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("present");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("skips when IP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment Property"]);
    ctx.mappings[0].status = "pending";
    const ev = handleIpDefinition(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects IP via canonicalName (rental property)", () => {
    const ctx = ctxWithMappings(["Account 1050"]);
    ctx.mappings[0].canonicalName = "Rental Property";
    const ev = handleIpDefinition(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic IP hint (استثمار عقاري)", () => {
    const ev = handleIpDefinition(r, ctxWithMappings(["عقار استثماري"]));
    expect(ev.status).toBe("pass");
  });
});

// --- handleIpMeasurement (IAS 40.30) ---

describe("handleIpMeasurement", () => {
  const r = rule("ip-measurement", { paragraphReference: "IAS 40.30" });

  it("skips when no IP accounts are mapped", () => {
    const ev = handleIpMeasurement(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are IP", () => {
    const ev = handleIpMeasurement(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when IP present without measurement model", () => {
    const ev = handleIpMeasurement(r, ctxWithMappings(["Investment Property"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("measurement model");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when IP and fair value model are present", () => {
    const ev = handleIpMeasurement(
      r,
      ctxWithMappings(["Investment Property", "Fair Value Model"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when IP and cost model are present", () => {
    const ev = handleIpMeasurement(
      r,
      ctxWithMappings(["Investment Property", "Cost Model"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("returns advisory when both fair value and cost models are present", () => {
    const ev = handleIpMeasurement(
      r,
      ctxWithMappings(["Investment Property", "Fair Value Model", "Cost Model"]),
    );
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("single model");
  });

  it("skips when IP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment Property", "Fair Value Model"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleIpMeasurement(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects fair value via canonicalName (fvlm)", () => {
    const ctx = ctxWithMappings(["Investment Property", "Account 2001"]);
    ctx.mappings[1].canonicalName = "FVLM";
    const ev = handleIpMeasurement(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic cost model hint (نموذج التكلفة)", () => {
    const ev = handleIpMeasurement(
      r,
      ctxWithMappings(["استثمار عقاري", "نموذج التكلفة"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleIpFairValue (IAS 40.55) ---

describe("handleIpFairValue", () => {
  const r = rule("ip-fair-value", { paragraphReference: "IAS 40.55" });

  it("skips when no IP accounts are mapped", () => {
    const ev = handleIpFairValue(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are IP", () => {
    const ev = handleIpFairValue(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when IP present but no fair value model", () => {
    const ev = handleIpFairValue(r, ctxWithMappings(["Investment Property"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("fair value model");
  });

  it("warns when FVM present but no gain/loss account", () => {
    const ev = handleIpFairValue(
      r,
      ctxWithMappings(["Investment Property", "Fair Value Model"]),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("fair value change");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when FVM and gain/loss accounts are present", () => {
    const ev = handleIpFairValue(
      r,
      ctxWithMappings(["Investment Property", "Fair Value Model", "Fair Value Gain"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("skips when IP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment Property", "Fair Value Model"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleIpFairValue(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects FVM via canonicalName (fair value)", () => {
    const ctx = ctxWithMappings(["Investment Property", "Account 3001"]);
    ctx.mappings[1].canonicalName = "Fair Value";
    const ev = handleIpFairValue(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic FVM hint (قيمة عادلة)", () => {
    const ev = handleIpFairValue(
      r,
      ctxWithMappings(["استثمار عقاري", "نموذج القيمة العادلة", "تغير القيمة"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleIpDisclosure (IAS 40.75) ---

describe("handleIpDisclosure", () => {
  const r = rule("ip-disclosure", { paragraphReference: "IAS 40.75" });

  it("skips when no IP accounts are mapped", () => {
    const ev = handleIpDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are IP", () => {
    const ev = handleIpDisclosure(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when IP present without disclosure and noteCount is zero", () => {
    const ev = handleIpDisclosure(r, ctxWithMappings(["Investment Property"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("disclosures");
  });

  it("passes when IP disclosure account is present even with noteCount zero", () => {
    const ev = handleIpDisclosure(
      r,
      ctxWithMappings(["Investment Property", "Measurement Policy Disclosure"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleIpDisclosure(r, ctxWithMappings(["Investment Property"], 3));
    expect(ev.status).toBe("pass");
  });

  it("skips when IP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Investment Property"]);
    ctx.mappings[0].status = "pending";
    const ev = handleIpDisclosure(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic IP hint (عقار استثماري)", () => {
    const ev = handleIpDisclosure(r, ctxWithMappings(["عقار استثماري"], 2));
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("investment-property - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("ip-definition", {
      ruleId: "ias40-005",
      standardCode: "IAS 40",
      paragraphReference: "IAS 40.5",
    });
    const ev = handleIpDefinition(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias40-005");
    expect(ev.standardCode).toBe("IAS 40");
    expect(ev.paragraphReference).toBe("IAS 40.5");
    expect(ev.topic).toBe("ip-definition");
  });
});

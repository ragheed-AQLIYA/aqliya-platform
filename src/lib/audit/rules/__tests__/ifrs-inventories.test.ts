/**
 * Unit Test: IFRS Rule Checks - Inventories (IAS 2)
 *
 * Tests the four inventory handlers directly:
 * - handleInventoryMeasurement (IAS 2.9)
 * - handleCostComponents (IAS 2.10)
 * - handleSpecificIdentification (IAS 2.23)
 * - handleCostFormulas (IAS 2.25)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleInventoryMeasurement,
  handleCostComponents,
  handleSpecificIdentification,
  handleCostFormulas,
} from "@/lib/audit/rules/ifrs-rule-checks/inventories";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 2.9",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 2",
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

// --- handleInventoryMeasurement (IAS 2.9) ---

describe("handleInventoryMeasurement", () => {
  const r = rule("measurement", { paragraphReference: "IAS 2.9" });

  it("skips when no inventory accounts are mapped", () => {
    const ev = handleInventoryMeasurement(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No inventory accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are inventory accounts", () => {
    const ev = handleInventoryMeasurement(
      r,
      ctxWithMappings(["Cash", "Accounts Receivable"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No inventory accounts");
  });

  it("warns when inventory is mapped without NRV assessment", () => {
    const ev = handleInventoryMeasurement(r, ctxWithMappings(["Inventory"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without NRV");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when both inventory and NRV write-down accounts are present", () => {
    const ev = handleInventoryMeasurement(
      r,
      ctxWithMappings(["Inventory", "NRV Provision"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("present");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("skips when inventory mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Inventory"]);
    ctx.mappings[0].status = "pending";
    const ev = handleInventoryMeasurement(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects inventory via canonicalName field", () => {
    const ctx = ctxWithMappings(["Merchandise"]);
    ctx.mappings[0].canonicalName = "Inventory";
    const ev = handleInventoryMeasurement(r, ctx);
    expect(ev.status).toBe("warning");
  });
});

// --- handleCostComponents (IAS 2.10) ---

describe("handleCostComponents", () => {
  const r = rule("cost-components", { paragraphReference: "IAS 2.10" });

  it("skips when no inventory accounts are mapped", () => {
    const ev = handleCostComponents(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No inventory accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("warns when inventory is mapped without purchase cost components", () => {
    const ev = handleCostComponents(r, ctxWithMappings(["Inventory"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without clear purchase cost");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("passes when inventory and cost of goods accounts are present", () => {
    const ev = handleCostComponents(
      r,
      ctxWithMappings(["Inventory", "Cost of Goods Sold"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("cost components present");
  });
});

// --- handleSpecificIdentification (IAS 2.23) ---

describe("handleSpecificIdentification", () => {
  const r = rule("specific-identification", {
    paragraphReference: "IAS 2.23",
  });

  it("skips when no inventory accounts are mapped", () => {
    const ev = handleSpecificIdentification(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No inventory accounts");
  });

  it("returns advisory when inventory accounts are present", () => {
    const ev = handleSpecificIdentification(r, ctxWithMappings(["Inventory"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("specific identification");
  });
});

// --- handleCostFormulas (IAS 2.25) ---

describe("handleCostFormulas", () => {
  const r = rule("cost-formulas", { paragraphReference: "IAS 2.25" });

  it("skips when no inventory accounts are mapped", () => {
    const ev = handleCostFormulas(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No inventory accounts");
  });

  it("returns advisory when inventory accounts are present", () => {
    const ev = handleCostFormulas(r, ctxWithMappings(["Inventory"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("FIFO or weighted average");
  });
});

// --- Rule metadata propagation ---

describe("inventories - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("measurement", {
      ruleId: "ias2-009",
      standardCode: "IAS 2",
      paragraphReference: "IAS 2.9",
    });
    const ev = handleInventoryMeasurement(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias2-009");
    expect(ev.standardCode).toBe("IAS 2");
    expect(ev.paragraphReference).toBe("IAS 2.9");
    expect(ev.topic).toBe("measurement");
  });
});
/**
 * Unit Test: IFRS Rule Checks - Income Taxes (IAS 12)
 *
 * Tests the six income tax handlers directly:
 * - handleCurrentTaxLiability (IAS 12.15)
 * - handleDeferredTaxLiability (IAS 12.24)
 * - handleDeferredTaxAsset (IAS 12.34)
 * - handleTaxExpenseRecognition (IAS 12.46)
 * - handleTaxRateMeasurement (IAS 12.51)
 * - handleTaxOffsetting (IAS 12.74)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleCurrentTaxLiability,
  handleDeferredTaxLiability,
  handleDeferredTaxAsset,
  handleTaxExpenseRecognition,
  handleTaxRateMeasurement,
  handleTaxOffsetting,
} from "@/lib/audit/rules/ifrs-rule-checks/income-taxes";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 12.15",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 12",
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

// --- handleCurrentTaxLiability (IAS 12.15) ---

describe("handleCurrentTaxLiability", () => {
  const r = rule("current-tax-liability", {
    paragraphReference: "IAS 12.15",
  });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleCurrentTaxLiability(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });

  it("skips when mappings exist but none are tax accounts", () => {
    const ev = handleCurrentTaxLiability(
      r,
      ctxWithMappings(["Revenue", "Cost of Sales"]),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("warns when tax is mapped without current tax liability", () => {
    const ev = handleCurrentTaxLiability(r, ctxWithMappings(["Tax Expense"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without current tax liability");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when current tax liability is mapped", () => {
    const ev = handleCurrentTaxLiability(r, ctxWithMappings(["Tax Payable"]));
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Current tax liability mapped");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- handleDeferredTaxLiability (IAS 12.24) ---

describe("handleDeferredTaxLiability", () => {
  const r = rule("deferred-tax-liability", {
    paragraphReference: "IAS 12.24",
  });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleDeferredTaxLiability(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("warns when tax is mapped without deferred tax liability", () => {
    const ev = handleDeferredTaxLiability(r, ctxWithMappings(["Tax Payable"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without deferred tax liability");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when deferred tax liability is mapped", () => {
    const ev = handleDeferredTaxLiability(
      r,
      ctxWithMappings(["Deferred Tax Liability"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Deferred tax liability mapped");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- handleDeferredTaxAsset (IAS 12.34) ---

describe("handleDeferredTaxAsset", () => {
  const r = rule("deferred-tax-asset", {
    paragraphReference: "IAS 12.34",
  });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleDeferredTaxAsset(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("returns advisory when tax is mapped without deferred tax asset", () => {
    const ev = handleDeferredTaxAsset(r, ctxWithMappings(["Tax Payable"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("without deferred tax asset");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when deferred tax asset is mapped", () => {
    const ev = handleDeferredTaxAsset(
      r,
      ctxWithMappings(["Deferred Tax Asset"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Deferred tax asset mapped");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });
});

// --- handleTaxExpenseRecognition (IAS 12.46) ---

describe("handleTaxExpenseRecognition", () => {
  const r = rule("tax-expense-recognition", {
    paragraphReference: "IAS 12.46",
  });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleTaxExpenseRecognition(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("warns when tax is mapped without tax expense in P&L", () => {
    const ev = handleTaxExpenseRecognition(r, ctxWithMappings(["Tax Payable"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without tax expense");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when tax expense is mapped in income statement", () => {
    const ev = handleTaxExpenseRecognition(r, ctxWithMappings(["Tax Expense"]));
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Tax expense mapped");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });
});

// --- handleTaxRateMeasurement (IAS 12.51) ---

describe("handleTaxRateMeasurement", () => {
  const r = rule("tax-rate-measurement", {
    paragraphReference: "IAS 12.51",
  });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleTaxRateMeasurement(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("returns advisory when tax accounts are present", () => {
    const ev = handleTaxRateMeasurement(r, ctxWithMappings(["Tax Expense"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("enacted or substantively enacted");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- handleTaxOffsetting (IAS 12.74) ---

describe("handleTaxOffsetting", () => {
  const r = rule("tax-offsetting", { paragraphReference: "IAS 12.74" });

  it("skips when no tax accounts are mapped", () => {
    const ev = handleTaxOffsetting(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No tax accounts");
  });

  it("returns advisory when tax accounts are present", () => {
    const ev = handleTaxOffsetting(r, ctxWithMappings(["Tax Expense"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("legally enforceable right");
    expect(ev.linkedStatementTypes).toBeUndefined();
  });
});

// --- Edge cases ---

describe("income-taxes - edge cases", () => {
  it("skips when tax mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Tax Payable"]);
    ctx.mappings[0].status = "pending";
    const ev = handleCurrentTaxLiability(
      rule("current-tax-liability", { paragraphReference: "IAS 12.15" }),
      ctx,
    );
    expect(ev.status).toBe("skipped");
  });

  it("detects tax via statementClassification field", () => {
    const ctx = ctxWithMappings(["Revenue"]);
    ctx.mappings[0].statementClassification = "Tax";
    const ev = handleCurrentTaxLiability(
      rule("current-tax-liability", { paragraphReference: "IAS 12.15" }),
      ctx,
    );
    expect(ev.status).toBe("warning");
  });
});

// --- Rule metadata propagation ---

describe("income-taxes - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("current-tax-liability", {
      ruleId: "ias12-015",
      standardCode: "IAS 12",
      paragraphReference: "IAS 12.15",
    });
    const ev = handleCurrentTaxLiability(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias12-015");
    expect(ev.standardCode).toBe("IAS 12");
    expect(ev.paragraphReference).toBe("IAS 12.15");
    expect(ev.topic).toBe("current-tax-liability");
  });
});
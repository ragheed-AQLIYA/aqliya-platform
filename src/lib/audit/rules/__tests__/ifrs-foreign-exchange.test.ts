/**
 * Unit Test: IFRS Rule Checks - Foreign Exchange (IAS 21)
 *
 * Tests the five foreign exchange handlers directly:
 * - handleFunctionalCurrency (IAS 21.9)
 * - handleTransactionRate (IAS 21.20)
 * - handleReportingRate (IAS 21.23)
 * - handleExchangeDifferences (IAS 21.28)
 * - handleFxDisclosure (IAS 21.48)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleFunctionalCurrency,
  handleTransactionRate,
  handleReportingRate,
  handleExchangeDifferences,
  handleFxDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/foreign-exchange";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 21.9",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 21",
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

// --- handleFunctionalCurrency (IAS 21.9) ---

describe("handleFunctionalCurrency", () => {
  const r = rule("functional-currency", { paragraphReference: "IAS 21.9" });

  it("skips when no foreign currency accounts are mapped", () => {
    const ev = handleFunctionalCurrency(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No foreign currency");
  });

  it("skips when mappings exist but none are FX accounts", () => {
    const ev = handleFunctionalCurrency(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when FX accounts present but no functional currency", () => {
    const ev = handleFunctionalCurrency(r, ctxWithMappings(["Foreign Exchange Account"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("functional currency");
  });

  it("passes when both FX and functional currency accounts present", () => {
    const ev = handleFunctionalCurrency(
      r,
      ctxWithMappings(["Foreign Currency Cash", "Functional Currency USD"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when FX mapping exists but is not confirmed", () => {
    const ctx = ctxWithMappings(["Foreign Exchange"]);
    ctx.mappings[0].status = "pending";
    const ev = handleFunctionalCurrency(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects FX via canonicalName field", () => {
    const ctx = ctxWithMappings(["Account 1050"]);
    ctx.mappings[0].canonicalName = "Foreign Currency";
    const ev = handleFunctionalCurrency(r, ctx);
    expect(ev.status).toBe("advisory");
  });

  it("detects Arabic FX hint (صرف)", () => {
    const ev = handleFunctionalCurrency(r, ctxWithMappings(["حساب صرف workingo"]));
    expect(ev.status).toBe("advisory");
  });
});

// --- handleTransactionRate (IAS 21.20) ---

describe("handleTransactionRate", () => {
  const r = rule("transaction-rate", { paragraphReference: "IAS 21.20" });

  it("skips when no FX accounts are mapped", () => {
    const ev = handleTransactionRate(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are FX accounts", () => {
    const ev = handleTransactionRate(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when FX present without spot rate", () => {
    const ev = handleTransactionRate(r, ctxWithMappings(["Foreign Currency Payable"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("spot rate");
  });

  it("passes when both FX and spot rate accounts present", () => {
    const ev = handleTransactionRate(
      r,
      ctxWithMappings(["Foreign Currency Payable", "Spot Rate Adjustment"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when FX mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Foreign Currency"]);
    ctx.mappings[0].status = "pending";
    const ev = handleTransactionRate(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects FX via canonicalCategory field", () => {
    const ctx = ctxWithMappings(["Account 2001"]);
    ctx.mappings[0].canonicalCategory = "foreign exchange";
    const ev = handleTransactionRate(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic FX hint (عملة)", () => {
    const ev = handleTransactionRate(r, ctxWithMappings(["حساب عملة أجنبية"]));
    expect(ev.status).toBe("warning");
  });
});

// --- handleReportingRate (IAS 21.23) ---

describe("handleReportingRate", () => {
  const r = rule("reporting-rate", { paragraphReference: "IAS 21.23" });

  it("skips when no monetary accounts are mapped", () => {
    const ev = handleReportingRate(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are monetary", () => {
    const ev = handleReportingRate(r, ctxWithMappings(["Inventory", "Land"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when monetary items present without closing rate", () => {
    const ev = handleReportingRate(r, ctxWithMappings(["Cash", "Accounts Receivable"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("closing rate");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when monetary and closing rate accounts present", () => {
    const ev = handleReportingRate(
      r,
      ctxWithMappings(["Cash", "Closing Rate Adjustment"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("skips when monetary mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Cash"]);
    ctx.mappings[0].status = "draft";
    const ev = handleReportingRate(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects monetary via canonicalName (loan)", () => {
    const ctx = ctxWithMappings(["Account 3000"]);
    ctx.mappings[0].canonicalName = "Loan Payable";
    const ev = handleReportingRate(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic monetary hint (نقدية)", () => {
    const ev = handleReportingRate(r, ctxWithMappings(["نقدية بالعملة الأجنبية"]));
    expect(ev.status).toBe("warning");
  });
});

// --- handleExchangeDifferences (IAS 21.28) ---

describe("handleExchangeDifferences", () => {
  const r = rule("exchange-differences", { paragraphReference: "IAS 21.28" });

  it("skips when no FX accounts are mapped", () => {
    const ev = handleExchangeDifferences(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are FX", () => {
    const ev = handleExchangeDifferences(r, ctxWithMappings(["Sales", "Cost of Goods"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when FX present without exchange difference account", () => {
    const ev = handleExchangeDifferences(r, ctxWithMappings(["Foreign Currency Cash"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("exchange difference");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when FX and exchange difference accounts present", () => {
    const ev = handleExchangeDifferences(
      r,
      ctxWithMappings(["Foreign Currency Cash", "FX Gain/Loss"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("skips when FX mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Foreign Currency"]);
    ctx.mappings[0].status = "pending";
    const ev = handleExchangeDifferences(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects exchange diff via canonicalName (fx gain)", () => {
    const ctx = ctxWithMappings(["Foreign Currency"]);
    ctx.mappings[0].canonicalName = "FX Gain";
    const ev = handleExchangeDifferences(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic exchange diff hint (فروق صرف)", () => {
    const ev = handleExchangeDifferences(
      r,
      ctxWithMappings(["عملة أجنبية", "فروق صرف"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleFxDisclosure (IAS 21.48) ---

describe("handleFxDisclosure", () => {
  const r = rule("fx-disclosure", { paragraphReference: "IAS 21.48" });

  it("skips when no FX accounts are mapped", () => {
    const ev = handleFxDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when FX present without disclosure and noteCount is zero", () => {
    const ev = handleFxDisclosure(r, ctxWithMappings(["Foreign Currency Cash"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("disclosures");
  });

  it("passes when FX disclosure account is present even with noteCount zero", () => {
    const ev = handleFxDisclosure(
      r,
      ctxWithMappings(["Foreign Currency", "Exchange Difference Disclosure"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleFxDisclosure(
      r,
      ctxWithMappings(["Foreign Currency"], 3),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when FX mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Foreign Exchange"]);
    ctx.mappings[0].status = "pending";
    const ev = handleFxDisclosure(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic FX hint (أجنبي)", () => {
    const ev = handleFxDisclosure(r, ctxWithMappings(["حساب أجنبي"], 2));
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("foreign-exchange - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("functional-currency", {
      ruleId: "ias21-009",
      standardCode: "IAS 21",
      paragraphReference: "IAS 21.9",
    });
    const ev = handleFunctionalCurrency(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias21-009");
    expect(ev.standardCode).toBe("IAS 21");
    expect(ev.paragraphReference).toBe("IAS 21.9");
    expect(ev.topic).toBe("functional-currency");
  });
});

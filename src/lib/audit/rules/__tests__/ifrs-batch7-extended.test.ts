/**
 * Unit Test: IFRS Rule Checks - Investments in Associates (IAS 28)
 * + Events After Reporting Period (IAS 10)
 * + Financial Instruments (IFRS 9) + Presentation (IAS 32) + Intangible Assets (IAS 38)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleEquityMethodApplication,
  handleEquityMethodInitialRecognition,
  handleEquityMethodCessation,
  handleEquityMethodDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/investments-associates";
import {
  handleAdjustingEvents,
  handleNonAdjustingEvents,
  handleDividends,
} from "@/lib/audit/rules/ifrs-rule-checks/events-after-reporting";
import {
  handleAmortisedCost,
  handleLiabilityMeasurement,
  handleExpectedCreditLoss,
  handleEclStaging,
  handleHedgeAccounting,
} from "@/lib/audit/rules/ifrs-rule-checks/financial-instruments";
import {
  handleEquityInstrument,
  handleFinancialLiability,
  handleTreasuryShares,
} from "@/lib/audit/rules/ifrs-rule-checks/financial-instruments-presentation";
import {
  handleIntangibleRecognition,
  handleExpenseVsCapitalise,
  handleIntangibleAmortisation,
} from "@/lib/audit/rules/ifrs-rule-checks/intangible-assets";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

function rule(topic: string, std: string, para: string): IfrsKnowledgeRule {
  return { ruleId: "test-" + topic, paragraphReference: para, ruleText: "Test", topic, standardCode: std };
}

function ctxWithMappings(names: string[], noteCount = 0): IfrsEvaluationContext {
  return {
    engagementId: "test", engagementStatus: "in_progress", reportingFramework: "ifrs",
    currencyCode: "SAR", statementTypes: ["balance_sheet", "income_statement"],
    statements: [],
    mappings: names.map((n, i) => ({
      sourceAccountCode: "ACC-" + i, sourceAccountName: n, status: "confirmed",
      statementClassification: null, canonicalName: null, canonicalCategory: null,
    })),
    tbLines: [], disclosureNoteCount: noteCount,
  };
}

// === IAS 28 — Investments in Associates ===

describe("IAS 28 — Investments in Associates", () => {
  describe("handleEquityMethodApplication", () => {
    const r = rule("equity-method-application", "IAS 28", "IAS 28.10");
    it("skips when no associate accounts", () => {
      expect(handleEquityMethodApplication(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when associate present without equity method", () => {
      const ev = handleEquityMethodApplication(r, ctxWithMappings(["Investment in Associate"]));
      expect(ev.status).toBe("warning");
    });
    it("passes when both associate and equity method present", () => {
      const ev = handleEquityMethodApplication(r, ctxWithMappings(["Investment in Associate", "Equity Method"]));
      expect(ev.status).toBe("pass");
    });
    it("skips when not confirmed", () => {
      const ctx = ctxWithMappings(["Investment in Associate", "Equity Method"]);
      ctx.mappings.forEach(m => (m.status = "pending"));
      expect(handleEquityMethodApplication(r, ctx).status).toBe("skipped");
    });
    it("detects Arabic associate hint", () => {
      const ev = handleEquityMethodApplication(r, ctxWithMappings(["استثمار في شركة شقيقة", "طريقة حقوق الملكية"]));
      expect(ev.status).toBe("pass");
    });
  });

  describe("handleEquityMethodInitialRecognition", () => {
    const r = rule("equity-method-initial-recognition", "IAS 28", "IAS 28.24");
    it("skips when no associate", () => {
      expect(handleEquityMethodInitialRecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when associate without cost or share of profit", () => {
      expect(handleEquityMethodInitialRecognition(r, ctxWithMappings(["Investment in Associate"])).status).toBe("warning");
    });
    it("passes when cost present", () => {
      expect(handleEquityMethodInitialRecognition(r, ctxWithMappings(["Investment in Associate", "At Cost"])).status).toBe("pass");
    });
    it("passes when share of profit present", () => {
      expect(handleEquityMethodInitialRecognition(r, ctxWithMappings(["Investment in Associate", "Share of Profit"])).status).toBe("pass");
    });
  });

  describe("handleEquityMethodCessation", () => {
    const r = rule("equity-method-cessation", "IAS 28", "IAS 28.38");
    it("skips when no associate", () => {
      expect(handleEquityMethodCessation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when associate present", () => {
      expect(handleEquityMethodCessation(r, ctxWithMappings(["Investment in Associate"])).status).toBe("advisory");
    });
    it("returns advisory when reclassification detected", () => {
      const ev = handleEquityMethodCessation(r, ctxWithMappings(["Investment in Associate", "Fair Value Reclassification"]));
      expect(ev.status).toBe("advisory");
      expect(ev.messageEn).toContain("reclassification");
    });
  });

  describe("handleEquityMethodDisclosure", () => {
    const r = rule("equity-method-disclosure", "IAS 28", "IAS 28.50");
    it("skips when no associate", () => {
      expect(handleEquityMethodDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when no disclosure and no notes", () => {
      expect(handleEquityMethodDisclosure(r, ctxWithMappings(["Investment in Associate"])).status).toBe("warning");
    });
    it("passes when disclosure account present", () => {
      expect(handleEquityMethodDisclosure(r, ctxWithMappings(["Investment in Associate", "Summarised Financial Info"])).status).toBe("pass");
    });
    it("passes when noteCount > 0", () => {
      expect(handleEquityMethodDisclosure(r, ctxWithMappings(["Investment in Associate"], 2)).status).toBe("pass");
    });
  });
});

// === IAS 10 — Events After the Reporting Period ===

describe("IAS 10 — Events After the Reporting Period", () => {
  describe("handleAdjustingEvents", () => {
    const r = rule("adjusting-events", "IAS 10", "IAS 10.3");
    it("returns advisory when no adjusting event mapped", () => {
      expect(handleAdjustingEvents(r, ctxWithMappings([])).status).toBe("advisory");
    });
    it("passes when adjusting event present", () => {
      expect(handleAdjustingEvents(r, ctxWithMappings(["Adjusting Event After Reporting"])).status).toBe("pass");
    });
    it("detects Arabic adjusting hint", () => {
      expect(handleAdjustingEvents(r, ctxWithMappings(["حدث تعديلي"])).status).toBe("pass");
    });
  });

  describe("handleNonAdjustingEvents", () => {
    const r = rule("non-adjusting-events", "IAS 10", "IAS 10.10");
    it("returns advisory when no non-adjusting event", () => {
      expect(handleNonAdjustingEvents(r, ctxWithMappings([])).status).toBe("advisory");
    });
    it("warns when non-adjusting present but no notes", () => {
      expect(handleNonAdjustingEvents(r, ctxWithMappings(["Non-Adjusting Event"])).status).toBe("warning");
    });
    it("passes when non-adjusting and notes present", () => {
      expect(handleNonAdjustingEvents(r, ctxWithMappings(["Non-Adjusting Event"], 1)).status).toBe("pass");
    });
  });

  describe("handleDividends", () => {
    const r = rule("dividends", "IAS 10", "IAS 10.12");
    it("skips when no dividend accounts", () => {
      expect(handleDividends(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("passes when dividends not recognised as liability", () => {
      expect(handleDividends(r, ctxWithMappings(["Dividend Declared"])).status).toBe("pass");
    });
    it("warns when dividend payable detected", () => {
      expect(handleDividends(r, ctxWithMappings(["Dividend Declared", "Dividend Payable"])).status).toBe("warning");
    });
    it("detects Arabic dividend hint", () => {
      expect(handleDividends(r, ctxWithMappings(["توزيعات أرباح"])).status).toBe("pass");
    });
  });
});

// === IFRS 9 — Financial Instruments ===

describe("IFRS 9 — Financial Instruments", () => {
  describe("handleAmortisedCost", () => {
    const r = rule("amortised-cost", "IFRS 9", "IFRS 9.4.1");
    it("skips when no financial assets", () => {
      expect(handleAmortisedCost(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when FA present without amortised cost", () => {
      expect(handleAmortisedCost(r, ctxWithMappings(["Bond Investment"])).status).toBe("advisory");
    });
    it("passes when FA and amortised cost present", () => {
      expect(handleAmortisedCost(r, ctxWithMappings(["Bond Investment", "Amortised Cost"])).status).toBe("pass");
    });
    it("detects Arabic FA hint", () => {
      expect(handleAmortisedCost(r, ctxWithMappings(["سند استثمار", "تكلفة مستهلكة"])).status).toBe("pass");
    });
  });

  describe("handleLiabilityMeasurement", () => {
    const r = rule("liability-measurement", "IFRS 9", "IFRS 9.4.2");
    it("skips when no financial liabilities", () => {
      expect(handleLiabilityMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when liability present without measurement basis", () => {
      expect(handleLiabilityMeasurement(r, ctxWithMappings(["Loan Payable"])).status).toBe("warning");
    });
    it("passes when liability and FVTPL present", () => {
      expect(handleLiabilityMeasurement(r, ctxWithMappings(["Loan Payable", "Fair Value Through Profit or Loss"])).status).toBe("pass");
    });
    it("passes when liability and amortised cost present", () => {
      expect(handleLiabilityMeasurement(r, ctxWithMappings(["Bond Payable", "Amortised Cost"])).status).toBe("pass");
    });
  });

  describe("handleExpectedCreditLoss", () => {
    const r = rule("expected-credit-loss", "IFRS 9", "IFRS 9.5.5");
    it("skips when no financial assets", () => {
      expect(handleExpectedCreditLoss(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when FA without ECL", () => {
      expect(handleExpectedCreditLoss(r, ctxWithMappings(["Trade Receivable"])).status).toBe("warning");
    });
    it("passes when FA and ECL present", () => {
      expect(handleExpectedCreditLoss(r, ctxWithMappings(["Trade Receivable", "Expected Credit Loss"])).status).toBe("pass");
    });
  });

  describe("handleEclStaging", () => {
    const r = rule("ecl-staging", "IFRS 9", "IFRS 9.5.5");
    it("skips when no ECL accounts", () => {
      expect(handleEclStaging(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when ECL present without staging", () => {
      expect(handleEclStaging(r, ctxWithMappings(["Expected Credit Loss"])).status).toBe("advisory");
    });
    it("passes when ECL and staging present", () => {
      expect(handleEclStaging(r, ctxWithMappings(["Expected Credit Loss", "Stage 1"])).status).toBe("pass");
    });
  });

  describe("handleHedgeAccounting", () => {
    const r = rule("hedge-accounting", "IFRS 9", "IFRS 9.6.5");
    it("skips when no hedge accounts", () => {
      expect(handleHedgeAccounting(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when hedge present without type", () => {
      expect(handleHedgeAccounting(r, ctxWithMappings(["Derivative"])).status).toBe("warning");
    });
    it("passes when hedge type designated", () => {
      expect(handleHedgeAccounting(r, ctxWithMappings(["Derivative", "Cash Flow Hedge"])).status).toBe("pass");
    });
    it("detects Arabic hedge hint", () => {
      expect(handleHedgeAccounting(r, ctxWithMappings(["مشتقات", "تحوط القيمة العادلة"])).status).toBe("pass");
    });
  });
});

// === IAS 32 — Financial Instruments Presentation ===

describe("IAS 32 — Financial Instruments Presentation", () => {
  describe("handleEquityInstrument", () => {
    const r = rule("equity-instrument", "IAS 32", "IAS 32.11");
    it("skips when no equity instruments", () => {
      expect(handleEquityInstrument(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("passes when equity instruments present", () => {
      expect(handleEquityInstrument(r, ctxWithMappings(["Ordinary Shares"])).status).toBe("pass");
    });
    it("detects Arabic equity hint", () => {
      expect(handleEquityInstrument(r, ctxWithMappings(["أسهم عادية"])).status).toBe("pass");
    });
  });

  describe("handleFinancialLiability", () => {
    const r = rule("financial-liability", "IAS 32", "IAS 32.15");
    it("skips when no financial liabilities", () => {
      expect(handleFinancialLiability(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("passes when only liabilities present", () => {
      expect(handleFinancialLiability(r, ctxWithMappings(["Bond Payable"])).status).toBe("pass");
    });
    it("returns advisory when both equity and liability present", () => {
      expect(handleFinancialLiability(r, ctxWithMappings(["Ordinary Shares", "Bond Payable"])).status).toBe("advisory");
    });
  });

  describe("handleTreasuryShares", () => {
    const r = rule("treasury-shares", "IAS 32", "IAS 32.33");
    it("skips when no treasury shares", () => {
      expect(handleTreasuryShares(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when treasury shares without equity deduction", () => {
      expect(handleTreasuryShares(r, ctxWithMappings(["Treasury Shares"])).status).toBe("warning");
    });
    it("passes when treasury shares and equity deduction present", () => {
      expect(handleTreasuryShares(r, ctxWithMappings(["Treasury Shares", "Deducted from Equity"])).status).toBe("pass");
    });
    it("detects Arabic treasury hint", () => {
      expect(handleTreasuryShares(r, ctxWithMappings(["أسهم الخزينة", "مخصوم من حقوق الملكية"])).status).toBe("pass");
    });
  });
});

// === IAS 38 — Intangible Assets ===

describe("IAS 38 — Intangible Assets", () => {
  describe("handleIntangibleRecognition", () => {
    const r = rule("recognition", "IAS 38", "IAS 38.21");
    it("skips when no intangible assets", () => {
      expect(handleIntangibleRecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when intangible present without recognition criteria", () => {
      expect(handleIntangibleRecognition(r, ctxWithMappings(["Software"])).status).toBe("advisory");
    });
    it("passes when recognition criteria present", () => {
      expect(handleIntangibleRecognition(r, ctxWithMappings(["Software", "Identifiable Non-Monetary"])).status).toBe("pass");
    });
    it("detects Arabic intangible hint", () => {
      expect(handleIntangibleRecognition(r, ctxWithMappings(["برمجيات", "قابل للتحديد"])).status).toBe("pass");
    });
  });

  describe("handleExpenseVsCapitalise", () => {
    const r = rule("expense-vs-capitalise", "IAS 38", "IAS 38.54");
    it("skips when no intangible", () => {
      expect(handleExpenseVsCapitalise(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when research present without development", () => {
      expect(handleExpenseVsCapitalise(r, ctxWithMappings(["Software", "Research Expense"])).status).toBe("warning");
    });
    it("returns advisory when intangible without R&D", () => {
      expect(handleExpenseVsCapitalise(r, ctxWithMappings(["Patent"])).status).toBe("advisory");
    });
    it("passes when both research and development present", () => {
      expect(handleExpenseVsCapitalise(r, ctxWithMappings(["Software", "Research Expense", "Development Cost"])).status).toBe("pass");
    });
  });

  describe("handleIntangibleAmortisation", () => {
    const r = rule("amortisation", "IAS 38", "IAS 38.97");
    it("skips when no intangible", () => {
      expect(handleIntangibleAmortisation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when intangible without amortisation", () => {
      expect(handleIntangibleAmortisation(r, ctxWithMappings(["Patent"])).status).toBe("warning");
    });
    it("passes when amortisation present", () => {
      expect(handleIntangibleAmortisation(r, ctxWithMappings(["Patent", "Amortisation"])).status).toBe("pass");
    });
    it("detects Arabic amortisation hint", () => {
      expect(handleIntangibleAmortisation(r, ctxWithMappings(["براءة اختراع", "إهلاك"])).status).toBe("pass");
    });
  });
});

// === Rule metadata propagation ===

describe("batch-7 — rule metadata propagation", () => {
  it("carries IAS 28 metadata", () => {
    const r = rule("equity-method-application", "IAS 28", "IAS 28.10");
    const ev = handleEquityMethodApplication(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("test-equity-method-application");
    expect(ev.standardCode).toBe("IAS 28");
    expect(ev.topic).toBe("equity-method-application");
  });

  it("carries IFRS 9 metadata", () => {
    const r = rule("amortised-cost", "IFRS 9", "IFRS 9.4.1");
    const ev = handleAmortisedCost(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 9");
    expect(ev.topic).toBe("amortised-cost");
  });
});

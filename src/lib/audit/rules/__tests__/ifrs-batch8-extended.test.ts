/**
 * Unit Test: IFRS Rule Checks - IFRS 18 (Presentation & Disclosure)
 * + Extended topics: IFRS 16, IAS 16, IAS 7, IFRS 15
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleIncomeExpenseCategorisation,
  handleOperatingExpenseClassification,
  handleMpmDisclosure,
  handleExpenseDisaggregation,
} from "@/lib/audit/rules/ifrs-rule-checks/presentation-disclosure";
import {
  handleLeases,
  handleSubsequentLeaseLiability,
  handleDepreciationInterest,
} from "@/lib/audit/rules/ifrs-rule-checks/leases";
import {
  handlePpeRecognition,
  handleDepreciation,
  handleDerecognition,
} from "@/lib/audit/rules/ifrs-rule-checks/ppe";
import {
  handleCashFlow,
  handleInvestingActivities,
  handleFinancingActivities,
} from "@/lib/audit/rules/ifrs-rule-checks/cash-flow";
import {
  handleRevenue,
  handlePerformanceObligations,
  handleDistinctGoodsServices,
  handleTransactionPriceAllocation,
  handleRevenueRecognitionTiming,
} from "@/lib/audit/rules/ifrs-rule-checks/revenue";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

function rule(topic: string, std: string, para: string): IfrsKnowledgeRule {
  return { ruleId: "test-" + topic, paragraphReference: para, ruleText: "Test", topic, standardCode: std };
}

function ctxWithMappings(names: string[], noteCount = 0, statementTypes: string[] = ["balance_sheet", "income_statement"]): IfrsEvaluationContext {
  return {
    engagementId: "test", engagementStatus: "in_progress", reportingFramework: "ifrs",
    currencyCode: "SAR", statementTypes,
    statements: statementTypes.includes("cash_flow")
      ? [{ statementType: "cash_flow", lines: [
          { label: "Operating Activities", amount: 1000 } as any,
          { label: "Investing Activities", amount: -500 } as any,
          { label: "Financing Activities", amount: 300 } as any,
        ]}]
      : [],
    mappings: names.map((n, i) => ({
      sourceAccountCode: "ACC-" + i, sourceAccountName: n, status: "confirmed",
      statementClassification: null, canonicalName: null, canonicalCategory: null,
    })),
    tbLines: [], disclosureNoteCount: noteCount,
  };
}

// === IFRS 18 — Presentation and Disclosure ===

describe("IFRS 18 — Presentation and Disclosure", () => {
  describe("handleIncomeExpenseCategorisation", () => {
    const r = rule("income-expense-categorisation", "IFRS 18", "IFRS 18.14");
    it("skips when no profit accounts", () => {
      expect(handleIncomeExpenseCategorisation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when profit present without categories", () => {
      expect(handleIncomeExpenseCategorisation(r, ctxWithMappings(["Net Profit"])).status).toBe("warning");
    });
    it("returns advisory when only some categories present", () => {
      expect(handleIncomeExpenseCategorisation(r, ctxWithMappings(["Net Profit", "Operating Income"])).status).toBe("advisory");
    });
    it("passes when all three categories present", () => {
      expect(handleIncomeExpenseCategorisation(r, ctxWithMappings(["Net Profit", "Operating", "Investing", "Financing"])).status).toBe("pass");
    });
    it("detects Arabic category hint", () => {
      expect(handleIncomeExpenseCategorisation(r, ctxWithMappings(["صافي الربح", "تشغيلي", "استثماري", "تمويلي"])).status).toBe("pass");
    });
  });

  describe("handleOperatingExpenseClassification", () => {
    const r = rule("operating-expense-classification", "IFRS 18", "IFRS 18.23");
    it("skips when no operating accounts", () => {
      expect(handleOperatingExpenseClassification(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when operating present without nature/function", () => {
      expect(handleOperatingExpenseClassification(r, ctxWithMappings(["Operating Expense"])).status).toBe("warning");
    });
    it("passes when nature-based classification present", () => {
      expect(handleOperatingExpenseClassification(r, ctxWithMappings(["Operating Expense", "Depreciation"])).status).toBe("pass");
    });
    it("passes when function-based classification present", () => {
      expect(handleOperatingExpenseClassification(r, ctxWithMappings(["Operating Expense", "Cost of Sales"])).status).toBe("pass");
    });
  });

  describe("handleMpmDisclosure", () => {
    const r = rule("mpm-disclosure", "IFRS 18", "IFRS 18.50");
    it("skips when no MPM accounts", () => {
      expect(handleMpmDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when MPM present without notes", () => {
      expect(handleMpmDisclosure(r, ctxWithMappings(["Adjusted EBITDA"])).status).toBe("warning");
    });
    it("passes when MPM and notes present", () => {
      expect(handleMpmDisclosure(r, ctxWithMappings(["Adjusted EBITDA"], 2)).status).toBe("pass");
    });
  });

  describe("handleExpenseDisaggregation", () => {
    const r = rule("expense-disaggregation", "IFRS 18", "IFRS 18.60");
    it("skips when no operating accounts", () => {
      expect(handleExpenseDisaggregation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when operating without disaggregation and no notes", () => {
      expect(handleExpenseDisaggregation(r, ctxWithMappings(["Operating Expense"])).status).toBe("warning");
    });
    it("passes when nature disaggregation present", () => {
      expect(handleExpenseDisaggregation(r, ctxWithMappings(["Operating Expense", "Depreciation"])).status).toBe("pass");
    });
    it("passes when notes present", () => {
      expect(handleExpenseDisaggregation(r, ctxWithMappings(["Operating Expense"], 3)).status).toBe("pass");
    });
  });
});

// === IFRS 16 — Leases (remaining topics) ===

describe("IFRS 16 — Leases (extended)", () => {
  describe("handleSubsequentLeaseLiability", () => {
    const r = rule("subsequent-lease-liability", "IFRS 16", "IFRS 16.36");
    it("skips when no lease accounts", () => {
      expect(handleSubsequentLeaseLiability(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when lease present without interest", () => {
      expect(handleSubsequentLeaseLiability(r, ctxWithMappings(["Lease Liability"])).status).toBe("warning");
    });
    it("passes when lease and interest present", () => {
      expect(handleSubsequentLeaseLiability(r, ctxWithMappings(["Lease Liability", "Interest Expense"])).status).toBe("pass");
    });
    it("detects Arabic lease hint", () => {
      expect(handleSubsequentLeaseLiability(r, ctxWithMappings(["إيجار", "فائدة"])).status).toBe("pass");
    });
  });

  describe("handleDepreciationInterest", () => {
    const r = rule("depreciation-interest", "IFRS 16", "IFRS 16.32");
    it("skips when no RoU accounts", () => {
      expect(handleDepreciationInterest(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when RoU without depreciation", () => {
      expect(handleDepreciationInterest(r, ctxWithMappings(["Right-of-Use Asset"])).status).toBe("warning");
    });
    it("warns when depreciation but no separate interest", () => {
      expect(handleDepreciationInterest(r, ctxWithMappings(["Right-of-Use Asset", "Depreciation"])).status).toBe("warning");
    });
    it("passes when both depreciation and interest present", () => {
      expect(handleDepreciationInterest(r, ctxWithMappings(["Right-of-Use Asset", "Depreciation", "Interest Expense"])).status).toBe("pass");
    });
  });
});

// === IAS 16 — PPE (remaining topic) ===

describe("IAS 16 — PPE (extended)", () => {
  describe("handleDerecognition", () => {
    const r = rule("derecognition", "IAS 16", "IAS 16.67");
    it("skips when no PPE accounts", () => {
      expect(handleDerecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when PPE present without disposal", () => {
      expect(handleDerecognition(r, ctxWithMappings(["Property Plant Equipment"])).status).toBe("advisory");
    });
    it("passes when disposal present", () => {
      expect(handleDerecognition(r, ctxWithMappings(["Property Plant Equipment", "Gain on Disposal"])).status).toBe("pass");
    });
    it("detects Arabic disposal hint", () => {
      expect(handleDerecognition(r, ctxWithMappings(["ممتلكات", "تصرف"])).status).toBe("pass");
    });
  });
});

// === IAS 7 — Cash Flows (remaining topics) ===

describe("IAS 7 — Cash Flows (extended)", () => {
  describe("handleInvestingActivities", () => {
    const r = rule("investing", "IAS 7", "IAS 7.6");
    it("skips when no cash flow statement", () => {
      expect(handleInvestingActivities(r, ctxWithMappings([], 0, ["balance_sheet"])).status).toBe("skipped");
    });
    it("warns when cash flow without investing section", () => {
      const ctx = ctxWithMappings([], 0, ["cash_flow", "balance_sheet"]);
      ctx.statements = [{ statementType: "cash_flow", lines: [{ label: "Operating", amount: 100 } as any] }];
      expect(handleInvestingActivities(r, ctx).status).toBe("warning");
    });
    it("passes when investing section present", () => {
      expect(handleInvestingActivities(r, ctxWithMappings([], 0, ["cash_flow"])).status).toBe("pass");
    });
  });

  describe("handleFinancingActivities", () => {
    const r = rule("financing", "IAS 7", "IAS 7.6");
    it("skips when no cash flow statement", () => {
      expect(handleFinancingActivities(r, ctxWithMappings([], 0, ["balance_sheet"])).status).toBe("skipped");
    });
    it("warns when cash flow without financing section", () => {
      const ctx = ctxWithMappings([], 0, ["cash_flow", "balance_sheet"]);
      ctx.statements = [{ statementType: "cash_flow", lines: [{ label: "Operating", amount: 100 } as any] }];
      expect(handleFinancingActivities(r, ctx).status).toBe("warning");
    });
    it("passes when financing section present", () => {
      expect(handleFinancingActivities(r, ctxWithMappings([], 0, ["cash_flow"])).status).toBe("pass");
    });
  });
});

// === IFRS 15 — Revenue (remaining topics) ===

describe("IFRS 15 — Revenue (extended)", () => {
  describe("handlePerformanceObligations", () => {
    const r = rule("performance-obligations", "IFRS 15", "IFRS 15.14");
    it("skips when no revenue", () => {
      expect(handlePerformanceObligations(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when revenue without PO", () => {
      expect(handlePerformanceObligations(r, ctxWithMappings(["Revenue"])).status).toBe("advisory");
    });
    it("passes when performance obligation present", () => {
      expect(handlePerformanceObligations(r, ctxWithMappings(["Revenue", "Deferred Revenue"])).status).toBe("pass");
    });
  });

  describe("handleDistinctGoodsServices", () => {
    const r = rule("distinct-goods-services", "IFRS 15", "IFRS 15.22");
    it("skips when no revenue", () => {
      expect(handleDistinctGoodsServices(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when revenue present", () => {
      expect(handleDistinctGoodsServices(r, ctxWithMappings(["Revenue"])).status).toBe("advisory");
    });
  });

  describe("handleTransactionPriceAllocation", () => {
    const r = rule("transaction-price-allocation", "IFRS 15", "IFRS 15.70");
    it("skips when no revenue", () => {
      expect(handleTransactionPriceAllocation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when revenue without allocation", () => {
      expect(handleTransactionPriceAllocation(r, ctxWithMappings(["Revenue"])).status).toBe("advisory");
    });
    it("passes when allocation present", () => {
      expect(handleTransactionPriceAllocation(r, ctxWithMappings(["Revenue", "Standalone Selling Price"])).status).toBe("pass");
    });
  });

  describe("handleRevenueRecognitionTiming", () => {
    const r = rule("revenue-recognition-timing", "IFRS 15", "IFRS 15.31");
    it("skips when no revenue", () => {
      expect(handleRevenueRecognitionTiming(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when revenue without timing", () => {
      expect(handleRevenueRecognitionTiming(r, ctxWithMappings(["Revenue"])).status).toBe("advisory");
    });
    it("passes when timing present", () => {
      expect(handleRevenueRecognitionTiming(r, ctxWithMappings(["Revenue", "Over Time"])).status).toBe("pass");
    });
  });
});

// === Rule metadata propagation ===

describe("batch-8 — rule metadata propagation", () => {
  it("carries IFRS 18 metadata", () => {
    const r = rule("income-expense-categorisation", "IFRS 18", "IFRS 18.14");
    const ev = handleIncomeExpenseCategorisation(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 18");
    expect(ev.topic).toBe("income-expense-categorisation");
  });

  it("carries IFRS 16 extended metadata", () => {
    const r = rule("subsequent-lease-liability", "IFRS 16", "IFRS 16.36");
    const ev = handleSubsequentLeaseLiability(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 16");
    expect(ev.topic).toBe("subsequent-lease-liability");
  });
});

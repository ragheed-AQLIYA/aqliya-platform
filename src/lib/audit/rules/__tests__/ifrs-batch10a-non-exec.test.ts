/**
 * Unit Tests: IFRS Rule Checks — Wave 9 Part A
 * IAS 19, IAS 23, IAS 37, IAS 8, IFRS 2, IFRS 5
 * Pure function tests — no Prisma mocking required.
 */

import { handleEmployeeBenefitScope, handleShortTermBenefits, handleDefinedBenefit, handlePucMethod } from "@/lib/audit/rules/ifrs-rule-checks/employee-benefits";
import { handleBorrowingCostCapitalisation, handleEligibleBorrowingCosts, handleCapitalisationCommencement, handleCapitalisationCessation } from "@/lib/audit/rules/ifrs-rule-checks/borrowing-costs";
import { handleProvisionDefinition, handleProvisionRecognition, handleProvisionMeasurement, handleContingentLiability } from "@/lib/audit/rules/ifrs-rule-checks/provisions";
import { handlePolicySelection, handlePolicyChange, handleEstimateChange, handleErrorCorrection } from "@/lib/audit/rules/ifrs-rule-checks/accounting-policies";
import { handleSharePaymentScope, handleEquitySettled, handleCashSettled, handleVestingPeriod } from "@/lib/audit/rules/ifrs-rule-checks/share-based-payment";
import { handleHeldForSale, handleHeldForSaleMeasurement, handleDiscontinuedOperations, handleNoDepreciation } from "@/lib/audit/rules/ifrs-rule-checks/held-for-sale";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

function rule(topic: string, std: string, para: string): IfrsKnowledgeRule {
  return { ruleId: "test-" + topic, paragraphReference: para, ruleText: "Test", topic, standardCode: std };
}

function ctx(names: string[], noteCount = 0): IfrsEvaluationContext {
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

// === IAS 19 — Employee Benefits ===
describe("IAS 19 — Employee Benefits", () => {
  describe("handleEmployeeBenefitScope", () => {
    const r = rule("scope", "IAS 19", "IAS 19.4");
    it("skips when no employee benefit accounts", () => {
      expect(handleEmployeeBenefitScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when employee benefit present", () => {
      expect(handleEmployeeBenefitScope(r, ctx(["Employee Benefits"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleEmployeeBenefitScope(r, ctx(["مزايا الموظفين"])).status).toBe("pass");
    });
  });

  describe("handleShortTermBenefits", () => {
    const r = rule("short-term", "IAS 19", "IAS 19.11");
    it("skips when no benefit accounts", () => {
      expect(handleShortTermBenefits(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when benefits present without short-term", () => {
      expect(handleShortTermBenefits(r, ctx(["Employee Benefits"])).status).toBe("advisory");
    });
    it("passes when short-term benefits present", () => {
      expect(handleShortTermBenefits(r, ctx(["Short-term Benefit"])).status).toBe("pass");
    });
  });

  describe("handleDefinedBenefit", () => {
    const r = rule("defined-benefit", "IAS 19", "IAS 19.54");
    it("skips when no defined benefit", () => {
      expect(handleDefinedBenefit(r, ctx([])).status).toBe("skipped");
    });
    it("passes when defined benefit present", () => {
      expect(handleDefinedBenefit(r, ctx(["Defined Benefit Plan"])).status).toBe("pass");
    });
  });

  describe("handlePucMethod", () => {
    const r = rule("puc-method", "IAS 19", "IAS 19.67");
    it("skips when no defined benefit", () => {
      expect(handlePucMethod(r, ctx([])).status).toBe("skipped");
    });
    it("warns when defined benefit without PUC", () => {
      expect(handlePucMethod(r, ctx(["Defined Benefit Plan"])).status).toBe("warning");
    });
    it("passes when PUC method present", () => {
      expect(handlePucMethod(r, ctx(["Defined Benefit Plan", "Projected Unit Credit"])).status).toBe("pass");
    });
  });
});

// === IAS 23 — Borrowing Costs ===
describe("IAS 23 — Borrowing Costs", () => {
  describe("handleBorrowingCostCapitalisation", () => {
    const r = rule("capitalisation", "IAS 23", "IAS 23.8");
    it("skips when no borrowing costs", () => {
      expect(handleBorrowingCostCapitalisation(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when borrowing present without qualifying asset", () => {
      expect(handleBorrowingCostCapitalisation(r, ctx(["Borrowing Costs"])).status).toBe("advisory");
    });
    it("passes when both present", () => {
      expect(handleBorrowingCostCapitalisation(r, ctx(["Borrowing Costs", "Qualifying Asset"])).status).toBe("pass");
    });
  });

  describe("handleEligibleBorrowingCosts", () => {
    const r = rule("eligible-costs", "IAS 23", "IAS 23.10");
    it("skips when no borrowing costs", () => {
      expect(handleEligibleBorrowingCosts(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when no investment income", () => {
      expect(handleEligibleBorrowingCosts(r, ctx(["Borrowing Costs"])).status).toBe("advisory");
    });
    it("passes when investment income present", () => {
      expect(handleEligibleBorrowingCosts(r, ctx(["Borrowing Costs", "Temporary Investment Income"])).status).toBe("pass");
    });
  });

  describe("handleCapitalisationCommencement", () => {
    const r = rule("commencement", "IAS 23", "IAS 23.13");
    it("skips when no borrowing costs", () => {
      expect(handleCapitalisationCommencement(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when no expenditure", () => {
      expect(handleCapitalisationCommencement(r, ctx(["Borrowing Costs"])).status).toBe("advisory");
    });
    it("passes when expenditure present", () => {
      expect(handleCapitalisationCommencement(r, ctx(["Borrowing Costs", "Construction in Progress"])).status).toBe("pass");
    });
  });

  describe("handleCapitalisationCessation", () => {
    const r = rule("cessation", "IAS 23", "IAS 23.22");
    it("skips when no borrowing costs", () => {
      expect(handleCapitalisationCessation(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when no completion", () => {
      expect(handleCapitalisationCessation(r, ctx(["Borrowing Costs"])).status).toBe("advisory");
    });
    it("passes when substantially complete present", () => {
      expect(handleCapitalisationCessation(r, ctx(["Borrowing Costs", "Substantially Complete"])).status).toBe("pass");
    });
  });
});

// === IAS 37 — Provisions ===
describe("IAS 37 — Provisions", () => {
  describe("handleProvisionDefinition", () => {
    const r = rule("provision-definition", "IAS 37", "IAS 37.10");
    it("skips when no provisions", () => {
      expect(handleProvisionDefinition(r, ctx([])).status).toBe("skipped");
    });
    it("warns when provision without obligation", () => {
      expect(handleProvisionDefinition(r, ctx(["Provision"])).status).toBe("warning");
    });
    it("passes when provision and obligation present", () => {
      expect(handleProvisionDefinition(r, ctx(["Provision", "Present Obligation"])).status).toBe("pass");
    });
  });

  describe("handleProvisionRecognition", () => {
    const r = rule("recognition", "IAS 37", "IAS 37.14");
    it("skips when no provisions", () => {
      expect(handleProvisionRecognition(r, ctx([])).status).toBe("skipped");
    });
    it("warns when provision without obligation", () => {
      expect(handleProvisionRecognition(r, ctx(["Provision"])).status).toBe("warning");
    });
    it("passes when obligation present", () => {
      expect(handleProvisionRecognition(r, ctx(["Provision", "Present Obligation"])).status).toBe("pass");
    });
  });

  describe("handleProvisionMeasurement", () => {
    const r = rule("measurement", "IAS 37", "IAS 37.36");
    it("skips when no provisions", () => {
      expect(handleProvisionMeasurement(r, ctx([])).status).toBe("skipped");
    });
    it("warns when provision without measurement", () => {
      expect(handleProvisionMeasurement(r, ctx(["Provision"])).status).toBe("warning");
    });
    it("passes when best estimate present", () => {
      expect(handleProvisionMeasurement(r, ctx(["Provision", "Best Estimate"])).status).toBe("pass");
    });
  });

  describe("handleContingentLiability", () => {
    const r = rule("contingent-liability", "IAS 37", "IAS 37.27");
    it("skips when no contingent liability", () => {
      expect(handleContingentLiability(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when contingent liability present", () => {
      expect(handleContingentLiability(r, ctx(["Contingent Liability"])).status).toBe("advisory");
    });
  });
});

// === IAS 8 — Accounting Policies ===
describe("IAS 8 — Accounting Policies", () => {
  describe("handlePolicySelection", () => {
    const r = rule("policy-selection", "IAS 8", "IAS 8.7");
    it("skips when no policy accounts", () => {
      expect(handlePolicySelection(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when policy without consistency", () => {
      expect(handlePolicySelection(r, ctx(["Accounting Policy"])).status).toBe("advisory");
    });
    it("passes when consistent", () => {
      expect(handlePolicySelection(r, ctx(["Accounting Policy", "Consistent"])).status).toBe("pass");
    });
  });

  describe("handlePolicyChange", () => {
    const r = rule("policy-change", "IAS 8", "IAS 8.19");
    it("skips when no policy change", () => {
      expect(handlePolicyChange(r, ctx([])).status).toBe("skipped");
    });
    it("warns when change without retrospective", () => {
      expect(handlePolicyChange(r, ctx(["Policy Change"])).status).toBe("warning");
    });
    it("passes when retrospective present", () => {
      expect(handlePolicyChange(r, ctx(["Policy Change", "Retrospective"])).status).toBe("pass");
    });
  });

  describe("handleEstimateChange", () => {
    const r = rule("estimate-change", "IAS 8", "IAS 8.36");
    it("skips when no estimate change", () => {
      expect(handleEstimateChange(r, ctx([])).status).toBe("skipped");
    });
    it("warns when change without prospective", () => {
      expect(handleEstimateChange(r, ctx(["Estimate Change"])).status).toBe("warning");
    });
    it("passes when prospective present", () => {
      expect(handleEstimateChange(r, ctx(["Estimate Change", "Prospective"])).status).toBe("pass");
    });
  });

  describe("handleErrorCorrection", () => {
    const r = rule("error-correction", "IAS 8", "IAS 8.41");
    it("skips when no error correction", () => {
      expect(handleErrorCorrection(r, ctx([])).status).toBe("skipped");
    });
    it("warns when correction without restatement", () => {
      expect(handleErrorCorrection(r, ctx(["Error Correction"])).status).toBe("warning");
    });
    it("passes when restatement present", () => {
      expect(handleErrorCorrection(r, ctx(["Error Correction", "Restatement"])).status).toBe("pass");
    });
  });
});

// === IFRS 2 — Share-based Payment ===
describe("IFRS 2 — Share-based Payment", () => {
  describe("handleSharePaymentScope", () => {
    const r = rule("scope", "IFRS 2", "IFRS 2.2");
    it("skips when no share payment", () => {
      expect(handleSharePaymentScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when share-based payment present", () => {
      expect(handleSharePaymentScope(r, ctx(["Share-based Payment"])).status).toBe("pass");
    });
  });

  describe("handleEquitySettled", () => {
    const r = rule("equity-settled", "IFRS 2", "IFRS 2.11");
    it("skips when no equity-settled", () => {
      expect(handleEquitySettled(r, ctx([])).status).toBe("skipped");
    });
    it("warns when equity-settled without fair value", () => {
      expect(handleEquitySettled(r, ctx(["Equity-settled"])).status).toBe("warning");
    });
    it("passes when fair value at grant date present", () => {
      expect(handleEquitySettled(r, ctx(["Equity-settled", "Fair Value Grant Date"])).status).toBe("pass");
    });
  });

  describe("handleCashSettled", () => {
    const r = rule("cash-settled", "IFRS 2", "IFRS 2.23");
    it("skips when no cash-settled", () => {
      expect(handleCashSettled(r, ctx([])).status).toBe("skipped");
    });
    it("warns when cash-settled without fair value", () => {
      expect(handleCashSettled(r, ctx(["Cash-settled"])).status).toBe("warning");
    });
    it("passes when fair value liability present", () => {
      expect(handleCashSettled(r, ctx(["Cash-settled", "Fair Value Liability"])).status).toBe("pass");
    });
  });

  describe("handleVestingPeriod", () => {
    const r = rule("vesting-period", "IFRS 2", "IFRS 2.17");
    it("skips when no share payment", () => {
      expect(handleVestingPeriod(r, ctx([])).status).toBe("skipped");
    });
    it("warns when no vesting period", () => {
      expect(handleVestingPeriod(r, ctx(["Share-based Payment"])).status).toBe("warning");
    });
    it("passes when vesting period present", () => {
      expect(handleVestingPeriod(r, ctx(["Share-based Payment", "Vesting Period"])).status).toBe("pass");
    });
  });
});

// === IFRS 5 — Held for Sale ===
describe("IFRS 5 — Non-current Assets Held for Sale", () => {
  describe("handleHeldForSale", () => {
    const r = rule("held-for-sale", "IFRS 5", "IFRS 5.6");
    it("skips when no held-for-sale", () => {
      expect(handleHeldForSale(r, ctx([])).status).toBe("skipped");
    });
    it("passes when held-for-sale present", () => {
      expect(handleHeldForSale(r, ctx(["Held for Sale"])).status).toBe("pass");
    });
  });

  describe("handleHeldForSaleMeasurement", () => {
    const r = rule("measurement", "IFRS 5", "IFRS 5.15");
    it("skips when no held-for-sale", () => {
      expect(handleHeldForSaleMeasurement(r, ctx([])).status).toBe("skipped");
    });
    it("warns when held-for-sale without measurement", () => {
      expect(handleHeldForSaleMeasurement(r, ctx(["Held for Sale"])).status).toBe("warning");
    });
    it("passes when fair value less costs present", () => {
      expect(handleHeldForSaleMeasurement(r, ctx(["Held for Sale", "Fair Value Less Costs to Sell"])).status).toBe("pass");
    });
  });

  describe("handleDiscontinuedOperations", () => {
    const r = rule("discontinued-operations", "IFRS 5", "IFRS 5.33");
    it("skips when no discontinued operations", () => {
      expect(handleDiscontinuedOperations(r, ctx([])).status).toBe("skipped");
    });
    it("warns when discontinued without separate presentation", () => {
      expect(handleDiscontinuedOperations(r, ctx(["Discontinued Operations"])).status).toBe("warning");
    });
    it("passes when separate line present", () => {
      expect(handleDiscontinuedOperations(r, ctx(["Discontinued Operations", "Separate Line"])).status).toBe("pass");
    });
  });

  describe("handleNoDepreciation", () => {
    const r = rule("no-depreciation", "IFRS 5", "IFRS 5.27");
    it("skips when no held-for-sale", () => {
      expect(handleNoDepreciation(r, ctx([])).status).toBe("skipped");
    });
    it("warns when no depreciation cessation", () => {
      expect(handleNoDepreciation(r, ctx(["Held for Sale"])).status).toBe("warning");
    });
    it("passes when cease depreciation present", () => {
      expect(handleNoDepreciation(r, ctx(["Held for Sale", "Cease Depreciation"])).status).toBe("pass");
    });
  });
});

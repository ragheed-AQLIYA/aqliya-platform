/**
 * Unit Tests: IFRS Rule Checks — Wave 8 Missing Standards
 *
 * IAS 34 (Interim Financial Reporting)
 * IFRS 6 (Exploration & Evaluation of Mineral Resources)
 * IAS 41 (Agriculture)
 * IFRS 19 (Subsidiaries without Public Accountability: Disclosures)
 * IFRS 4 (Insurance Contracts — Phase I)
 * IFRS 14 (Regulatory Deferral Accounts)
 * IAS 26 (Accounting and Reporting by Retirement Benefit Plans)
 * IAS 29 (Financial Reporting in Hyperinflationary Economies)
 *
 * Pure function tests — no Prisma mocking required.
 */

import {
  handleInterimPeriodMeasurement,
  handleInterimDisclosure,
  handleInterimTaxReconciliation,
  handleInterimImpairmentAssessment,
} from "@/lib/audit/rules/ifrs-rule-checks/interim-reporting";
import {
  handleExplorationEvaluationMeasurement,
  handleExplorationEvaluationClassification,
  handleExplorationEvaluationImpairment,
  handleExplorationEvaluationDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/exploration-evaluation";
import {
  handleBiologicalAssetRecognition,
  handleBiologicalAssetMeasurement,
  handleAgriculturalProduceMeasurement,
  handleAgriculturalDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/agriculture";
import {
  handleSubsidiaryScopeElection,
  handleSubsidiaryElectionDisclosure,
  handleSubsidiaryEligibilityAssessment,
  handleSubsidiaryEffectiveDate,
} from "@/lib/audit/rules/ifrs-rule-checks/subsidiary-disclosures";
import {
  handleInsuranceLiabilityRecognition,
  handleInsuranceLiabilityAdequacyTest,
  handleInsuranceLiabilityDerecognition,
  handleInsuranceDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/insurance-contracts";
import {
  handleRegulatoryDeferralClassification,
  handleRegulatoryDeferralPresentation,
  handleRegulatoryDeferralCashFlow,
  handleRegulatoryDeferralDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/regulatory-deferral";
import {
  handleRetirementPlanAssetMeasurement,
  handleRetirementPlanObligationMeasurement,
  handleRetirementPlanContributionRecognition,
  handleRetirementPlanDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/retirement-benefit-plans";
import {
  handleHyperinflationRestatement,
  handleHyperinflationComparativeRestatement,
  handleHyperinflationNonMonetaryItems,
  handleHyperinflationDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/hyperinflation";
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

// === IAS 34 — Interim Financial Reporting ===

describe("IAS 34 — Interim Financial Reporting", () => {
  describe("handleInterimPeriodMeasurement", () => {
    const r = rule("interim-period-measurement", "IAS 34", "IAS 34.14");
    it("skips when no interim accounts", () => {
      expect(handleInterimPeriodMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when interim present without policy consistency", () => {
      expect(handleInterimPeriodMeasurement(r, ctxWithMappings(["Interim Report Q1"])).status).toBe("warning");
    });
    it("passes when both interim and policy consistency present", () => {
      expect(handleInterimPeriodMeasurement(r, ctxWithMappings(["Interim Report", "Accounting Policies Consistent"])).status).toBe("pass");
    });
    it("detects Arabic interim hint", () => {
      expect(handleInterimPeriodMeasurement(r, ctxWithMappings(["تقرير مرحلي", "سياسات محاسبية متسقة"])).status).toBe("pass");
    });
  });

  describe("handleInterimDisclosure", () => {
    const r = rule("interim-disclosure", "IAS 34", "IAS 34.15");
    it("skips when no interim accounts", () => {
      expect(handleInterimDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when interim without disclosure and no notes", () => {
      expect(handleInterimDisclosure(r, ctxWithMappings(["Interim Report"])).status).toBe("warning");
    });
    it("passes when significant events disclosure present", () => {
      expect(handleInterimDisclosure(r, ctxWithMappings(["Interim Report", "Significant Events Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleInterimDisclosure(r, ctxWithMappings(["Interim Report"], 3)).status).toBe("pass");
    });
    it("detects Arabic disclosure hint", () => {
      expect(handleInterimDisclosure(r, ctxWithMappings(["تقرير مرحلي", "إفصاح مرحلي"])).status).toBe("pass");
    });
  });

  describe("handleInterimTaxReconciliation", () => {
    const r = rule("interim-tax-reconciliation", "IAS 34", "IAS 34.28");
    it("skips when no interim accounts", () => {
      expect(handleInterimTaxReconciliation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when interim without tax reconciliation", () => {
      expect(handleInterimTaxReconciliation(r, ctxWithMappings(["Interim Report"])).status).toBe("warning");
    });
    it("passes when tax reconciliation present", () => {
      expect(handleInterimTaxReconciliation(r, ctxWithMappings(["Interim Report", "Tax Reconciliation"])).status).toBe("pass");
    });
    it("detects Arabic tax reconciliation hint", () => {
      expect(handleInterimTaxReconciliation(r, ctxWithMappings(["تقرير مرحلي", "مطابقة ضريبية"])).status).toBe("pass");
    });
  });

  describe("handleInterimImpairmentAssessment", () => {
    const r = rule("interim-impairment-assessment", "IAS 34", "IAS 34.37");
    it("skips when no interim accounts", () => {
      expect(handleInterimImpairmentAssessment(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when interim without impairment", () => {
      expect(handleInterimImpairmentAssessment(r, ctxWithMappings(["Interim Report"])).status).toBe("advisory");
    });
    it("passes when impairment assessment present", () => {
      expect(handleInterimImpairmentAssessment(r, ctxWithMappings(["Interim Report", "Impairment Test"])).status).toBe("pass");
    });
    it("detects Arabic impairment hint", () => {
      expect(handleInterimImpairmentAssessment(r, ctxWithMappings(["تقرير مرحلي", "ضياع القيمة"])).status).toBe("pass");
    });
  });
});

// === IFRS 6 — Exploration for and Evaluation of Mineral Resources ===

describe("IFRS 6 — Exploration & Evaluation", () => {
  describe("handleExplorationEvaluationMeasurement", () => {
    const r = rule("exploration-evaluation-measurement", "IFRS 6", "IFRS 6.12");
    it("skips when no exploration accounts", () => {
      expect(handleExplorationEvaluationMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when exploration present without cost", () => {
      expect(handleExplorationEvaluationMeasurement(r, ctxWithMappings(["Exploration Assets"])).status).toBe("warning");
    });
    it("passes when exploration and cost present", () => {
      expect(handleExplorationEvaluationMeasurement(r, ctxWithMappings(["Exploration Assets", "At Cost"])).status).toBe("pass");
    });
    it("detects Arabic exploration hint", () => {
      expect(handleExplorationEvaluationMeasurement(r, ctxWithMappings(["تنقيب", "تكلفة"])).status).toBe("pass");
    });
  });

  describe("handleExplorationEvaluationClassification", () => {
    const r = rule("exploration-evaluation-classification", "IFRS 6", "IFRS 6.13");
    it("skips when no exploration accounts", () => {
      expect(handleExplorationEvaluationClassification(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when exploration without classification", () => {
      expect(handleExplorationEvaluationClassification(r, ctxWithMappings(["Exploration Assets"])).status).toBe("warning");
    });
    it("passes when tangible classification present", () => {
      expect(handleExplorationEvaluationClassification(r, ctxWithMappings(["Exploration Assets", "Tangible"])).status).toBe("pass");
    });
    it("passes when intangible classification present", () => {
      expect(handleExplorationEvaluationClassification(r, ctxWithMappings(["Exploration Assets", "Intangible Classification"])).status).toBe("pass");
    });
    it("detects Arabic classification hint", () => {
      expect(handleExplorationEvaluationClassification(r, ctxWithMappings(["تنقيب", "ملموس"])).status).toBe("pass");
    });
  });

  describe("handleExplorationEvaluationImpairment", () => {
    const r = rule("exploration-evaluation-impairment", "IFRS 6", "IFRS 6.20");
    it("skips when no exploration accounts", () => {
      expect(handleExplorationEvaluationImpairment(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when exploration without impairment test", () => {
      expect(handleExplorationEvaluationImpairment(r, ctxWithMappings(["Exploration Assets"])).status).toBe("advisory");
    });
    it("passes when impairment test present", () => {
      expect(handleExplorationEvaluationImpairment(r, ctxWithMappings(["Exploration Assets", "Impairment Test"])).status).toBe("pass");
    });
    it("detects Arabic impairment hint", () => {
      expect(handleExplorationEvaluationImpairment(r, ctxWithMappings(["تنقيب", "ضياع القيمة"])).status).toBe("pass");
    });
  });

  describe("handleExplorationEvaluationDisclosure", () => {
    const r = rule("exploration-evaluation-disclosure", "IFRS 6", "IFRS 6.23");
    it("skips when no exploration accounts", () => {
      expect(handleExplorationEvaluationDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when exploration without disclosure and no notes", () => {
      expect(handleExplorationEvaluationDisclosure(r, ctxWithMappings(["Exploration Assets"])).status).toBe("warning");
    });
    it("passes when exploration disclosure present", () => {
      expect(handleExplorationEvaluationDisclosure(r, ctxWithMappings(["Exploration Assets", "Exploration Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleExplorationEvaluationDisclosure(r, ctxWithMappings(["Exploration Assets"], 2)).status).toBe("pass");
    });
  });
});

// === IAS 41 — Agriculture ===

describe("IAS 41 — Agriculture", () => {
  describe("handleBiologicalAssetRecognition", () => {
    const r = rule("biological-asset-recognition", "IAS 41", "IAS 41.12");
    it("skips when no biological accounts", () => {
      expect(handleBiologicalAssetRecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when biological present without fair value", () => {
      expect(handleBiologicalAssetRecognition(r, ctxWithMappings(["Biological Assets"])).status).toBe("warning");
    });
    it("passes when both biological and fair value present", () => {
      expect(handleBiologicalAssetRecognition(r, ctxWithMappings(["Biological Assets", "Fair Value"])).status).toBe("pass");
    });
    it("detects Arabic biological hint", () => {
      expect(handleBiologicalAssetRecognition(r, ctxWithMappings(["أصول بيولوجية", "قيمة عادلة"])).status).toBe("pass");
    });
  });

  describe("handleBiologicalAssetMeasurement", () => {
    const r = rule("biological-asset-measurement", "IAS 41", "IAS 41.13");
    it("skips when no biological accounts", () => {
      expect(handleBiologicalAssetMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when biological without any fair value", () => {
      expect(handleBiologicalAssetMeasurement(r, ctxWithMappings(["Biological Assets"])).status).toBe("warning");
    });
    it("returns advisory when fair value but not less costs to sell", () => {
      expect(handleBiologicalAssetMeasurement(r, ctxWithMappings(["Biological Assets", "Fair Value"])).status).toBe("advisory");
    });
    it("passes when fair value less costs to sell present", () => {
      expect(handleBiologicalAssetMeasurement(r, ctxWithMappings(["Biological Assets", "Fair Value Less Costs to Sell"])).status).toBe("pass");
    });
    it("detects Arabic fair value less costs hint", () => {
      expect(handleBiologicalAssetMeasurement(r, ctxWithMappings(["أصول بيولوجية", "قيمة عادلة ناقصة تكاليف البيع"])).status).toBe("pass");
    });
  });

  describe("handleAgriculturalProduceMeasurement", () => {
    const r = rule("agricultural-produce-measurement", "IAS 41", "IAS 41.13");
    it("skips when no produce accounts", () => {
      expect(handleAgriculturalProduceMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when produce without fair value", () => {
      expect(handleAgriculturalProduceMeasurement(r, ctxWithMappings(["Agricultural Produce at Harvest"])).status).toBe("warning");
    });
    it("passes when produce and fair value present", () => {
      expect(handleAgriculturalProduceMeasurement(r, ctxWithMappings(["Agricultural Produce", "Fair Value"])).status).toBe("pass");
    });
    it("detects Arabic produce hint", () => {
      expect(handleAgriculturalProduceMeasurement(r, ctxWithMappings(["منتج زراعي", "قيمة عادلة"])).status).toBe("pass");
    });
  });

  describe("handleAgriculturalDisclosure", () => {
    const r = rule("agricultural-disclosure", "IAS 41", "IAS 41.40");
    it("skips when no biological accounts", () => {
      expect(handleAgriculturalDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when biological without disclosure and no notes", () => {
      expect(handleAgriculturalDisclosure(r, ctxWithMappings(["Biological Assets"])).status).toBe("warning");
    });
    it("passes when gain/loss disclosure present", () => {
      expect(handleAgriculturalDisclosure(r, ctxWithMappings(["Biological Assets", "Gain or Loss Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleAgriculturalDisclosure(r, ctxWithMappings(["Biological Assets"], 2)).status).toBe("pass");
    });
  });
});

// === IFRS 19 — Subsidiaries without Public Accountability ===

describe("IFRS 19 — Subsidiaries without Public Accountability", () => {
  describe("handleSubsidiaryScopeElection", () => {
    const r = rule("subsidiary-scope-election", "IFRS 19", "IFRS 19.3");
    it("skips when no subsidiary accounts", () => {
      expect(handleSubsidiaryScopeElection(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when subsidiary present without election", () => {
      expect(handleSubsidiaryScopeElection(r, ctxWithMappings(["Subsidiary"])).status).toBe("advisory");
    });
    it("passes when subsidiary and election present", () => {
      expect(handleSubsidiaryScopeElection(r, ctxWithMappings(["Subsidiary", "Elected IFRS 19"])).status).toBe("pass");
    });
    it("detects Arabic subsidiary hint", () => {
      expect(handleSubsidiaryScopeElection(r, ctxWithMappings(["شركة تابعة", "اختيار"])).status).toBe("pass");
    });
  });

  describe("handleSubsidiaryElectionDisclosure", () => {
    const r = rule("subsidiary-election-disclosure", "IFRS 19", "IFRS 19.6");
    it("skips when no subsidiary accounts", () => {
      expect(handleSubsidiaryElectionDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when subsidiary without election and no notes", () => {
      expect(handleSubsidiaryElectionDisclosure(r, ctxWithMappings(["Subsidiary"])).status).toBe("warning");
    });
    it("passes when election disclosure present", () => {
      expect(handleSubsidiaryElectionDisclosure(r, ctxWithMappings(["Subsidiary", "Election"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleSubsidiaryElectionDisclosure(r, ctxWithMappings(["Subsidiary"], 1)).status).toBe("pass");
    });
  });

  describe("handleSubsidiaryEligibilityAssessment", () => {
    const r = rule("subsidiary-eligibility-assessment", "IFRS 19", "IFRS 19.B2");
    it("skips when no subsidiary accounts", () => {
      expect(handleSubsidiaryEligibilityAssessment(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when subsidiary without eligibility", () => {
      expect(handleSubsidiaryEligibilityAssessment(r, ctxWithMappings(["Subsidiary"])).status).toBe("advisory");
    });
    it("passes when eligibility assessment present", () => {
      expect(handleSubsidiaryEligibilityAssessment(r, ctxWithMappings(["Subsidiary", "Public Accountability Assessment"])).status).toBe("pass");
    });
    it("detects Arabic eligibility hint", () => {
      expect(handleSubsidiaryEligibilityAssessment(r, ctxWithMappings(["شركة تابعة", "محاسبية عامة"])).status).toBe("pass");
    });
  });

  describe("handleSubsidiaryEffectiveDate", () => {
    const r = rule("subsidiary-effective-date", "IFRS 19", "IFRS 19.C5");
    it("skips when no subsidiary accounts", () => {
      expect(handleSubsidiaryEffectiveDate(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when subsidiary without effective date", () => {
      expect(handleSubsidiaryEffectiveDate(r, ctxWithMappings(["Subsidiary"])).status).toBe("advisory");
    });
    it("passes when effective date present", () => {
      expect(handleSubsidiaryEffectiveDate(r, ctxWithMappings(["Subsidiary", "Effective Date 1 January 2027"])).status).toBe("pass");
    });
    it("detects Arabic effective date hint", () => {
      expect(handleSubsidiaryEffectiveDate(r, ctxWithMappings(["شركة تابعة", "تاريخ السريان"])).status).toBe("pass");
    });
  });
});

// === IFRS 4 — Insurance Contracts ===

describe("IFRS 4 — Insurance Contracts", () => {
  describe("handleInsuranceLiabilityRecognition", () => {
    const r = rule("insurance-liability-recognition", "IFRS 4", "IFRS 4.12");
    it("skips when no insurance accounts", () => {
      expect(handleInsuranceLiabilityRecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when future claims liability recognised", () => {
      expect(handleInsuranceLiabilityRecognition(r, ctxWithMappings(["Insurance Liability", "Future Claims"])).status).toBe("warning");
    });
    it("passes when insurance present without future claims", () => {
      expect(handleInsuranceLiabilityRecognition(r, ctxWithMappings(["Insurance Liability"])).status).toBe("pass");
    });
    it("detects Arabic insurance hint", () => {
      expect(handleInsuranceLiabilityRecognition(r, ctxWithMappings(["التزامات تأمين"])).status).toBe("pass");
    });
  });

  describe("handleInsuranceLiabilityAdequacyTest", () => {
    const r = rule("insurance-liability-adequacy-test", "IFRS 4", "IFRS 4.15");
    it("skips when no insurance accounts", () => {
      expect(handleInsuranceLiabilityAdequacyTest(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when insurance without adequacy test", () => {
      expect(handleInsuranceLiabilityAdequacyTest(r, ctxWithMappings(["Insurance Liability"])).status).toBe("warning");
    });
    it("passes when adequacy test present", () => {
      expect(handleInsuranceLiabilityAdequacyTest(r, ctxWithMappings(["Insurance Liability", "Liability Adequacy Test"])).status).toBe("pass");
    });
    it("detects Arabic adequacy hint", () => {
      expect(handleInsuranceLiabilityAdequacyTest(r, ctxWithMappings(["التزامات تأمين", "اختبار كفاية الالتزامات"])).status).toBe("pass");
    });
  });

  describe("handleInsuranceLiabilityDerecognition", () => {
    const r = rule("insurance-liability-derecognition", "IFRS 4", "IFRS 4.16");
    it("skips when no insurance accounts", () => {
      expect(handleInsuranceLiabilityDerecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("returns advisory when insurance without derecognition", () => {
      expect(handleInsuranceLiabilityDerecognition(r, ctxWithMappings(["Insurance Liability"])).status).toBe("advisory");
    });
    it("passes when discharge/cancellation present", () => {
      expect(handleInsuranceLiabilityDerecognition(r, ctxWithMappings(["Insurance Liability", "Discharge"])).status).toBe("pass");
    });
    it("detects Arabic derecognition hint", () => {
      expect(handleInsuranceLiabilityDerecognition(r, ctxWithMappings(["التزامات تأمين", "تخليص"])).status).toBe("pass");
    });
  });

  describe("handleInsuranceDisclosure", () => {
    const r = rule("insurance-disclosure", "IFRS 4", "IFRS 4.20");
    it("skips when no insurance accounts", () => {
      expect(handleInsuranceDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when insurance without disclosure and no notes", () => {
      expect(handleInsuranceDisclosure(r, ctxWithMappings(["Insurance Liability"])).status).toBe("warning");
    });
    it("passes when insurance disclosure present", () => {
      expect(handleInsuranceDisclosure(r, ctxWithMappings(["Insurance Liability", "Insurance Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleInsuranceDisclosure(r, ctxWithMappings(["Insurance Liability"], 2)).status).toBe("pass");
    });
  });
});

// === IFRS 14 — Regulatory Deferral Accounts ===

describe("IFRS 14 — Regulatory Deferral Accounts", () => {
  describe("handleRegulatoryDeferralClassification", () => {
    const r = rule("regulatory-deferral-classification", "IFRS 14", "IFRS 14.8");
    it("skips when no regulatory accounts", () => {
      expect(handleRegulatoryDeferralClassification(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when regulatory present without separate line", () => {
      expect(handleRegulatoryDeferralClassification(r, ctxWithMappings(["Regulatory Deferral Account"])).status).toBe("warning");
    });
    it("passes when separate line item present", () => {
      expect(handleRegulatoryDeferralClassification(r, ctxWithMappings(["Regulatory Deferral Account", "Separate Line Item"])).status).toBe("pass");
    });
    it("detects Arabic regulatory hint", () => {
      expect(handleRegulatoryDeferralClassification(r, ctxWithMappings(["حسابات تأجيل تنظيمية", "بند مستقل"])).status).toBe("pass");
    });
  });

  describe("handleRegulatoryDeferralPresentation", () => {
    const r = rule("regulatory-deferral-presentation", "IFRS 14", "IFRS 14.9");
    it("skips when no regulatory accounts", () => {
      expect(handleRegulatoryDeferralPresentation(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when regulatory without separate column", () => {
      expect(handleRegulatoryDeferralPresentation(r, ctxWithMappings(["Regulatory Deferral"])).status).toBe("warning");
    });
    it("passes when separate column present", () => {
      expect(handleRegulatoryDeferralPresentation(r, ctxWithMappings(["Regulatory Deferral", "Separate Column"])).status).toBe("pass");
    });
    it("detects Arabic presentation hint", () => {
      expect(handleRegulatoryDeferralPresentation(r, ctxWithMappings(["حسابات تأجيل تنظيمية", "عمود مستقل"])).status).toBe("pass");
    });
  });

  describe("handleRegulatoryDeferralCashFlow", () => {
    const r = rule("regulatory-deferral-cash-flow", "IFRS 14", "IFRS 14.10");
    it("skips when no regulatory accounts", () => {
      expect(handleRegulatoryDeferralCashFlow(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when regulatory without cash flow presentation", () => {
      expect(handleRegulatoryDeferralCashFlow(r, ctxWithMappings(["Regulatory Deferral"])).status).toBe("warning");
    });
    it("passes when cash flow classification present", () => {
      expect(handleRegulatoryDeferralCashFlow(r, ctxWithMappings(["Regulatory Deferral", "Cash Flow Operating"])).status).toBe("pass");
    });
    it("detects Arabic cash flow hint", () => {
      expect(handleRegulatoryDeferralCashFlow(r, ctxWithMappings(["حسابات تأجيل تنظيمية", "تدفق نقدي"])).status).toBe("pass");
    });
  });

  describe("handleRegulatoryDeferralDisclosure", () => {
    const r = rule("regulatory-deferral-disclosure", "IFRS 14", "IFRS 14.22");
    it("skips when no regulatory accounts", () => {
      expect(handleRegulatoryDeferralDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when regulatory without disclosure and no notes", () => {
      expect(handleRegulatoryDeferralDisclosure(r, ctxWithMappings(["Regulatory Deferral"])).status).toBe("warning");
    });
    it("passes when regulatory disclosure present", () => {
      expect(handleRegulatoryDeferralDisclosure(r, ctxWithMappings(["Regulatory Deferral", "Regulatory Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleRegulatoryDeferralDisclosure(r, ctxWithMappings(["Regulatory Deferral"], 1)).status).toBe("pass");
    });
  });
});

// === IAS 26 — Retirement Benefit Plans ===

describe("IAS 26 — Retirement Benefit Plans", () => {
  describe("handleRetirementPlanAssetMeasurement", () => {
    const r = rule("retirement-plan-asset-measurement", "IAS 26", "IAS 26.8");
    it("skips when no retirement plan accounts", () => {
      expect(handleRetirementPlanAssetMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when plan assets without fair value", () => {
      expect(handleRetirementPlanAssetMeasurement(r, ctxWithMappings(["Retirement Plan Assets"])).status).toBe("warning");
    });
    it("passes when plan assets and fair value present", () => {
      expect(handleRetirementPlanAssetMeasurement(r, ctxWithMappings(["Retirement Plan Assets", "Fair Value"])).status).toBe("pass");
    });
    it("detects Arabic retirement hint", () => {
      expect(handleRetirementPlanAssetMeasurement(r, ctxWithMappings(["خطة مزايا التقاعد", "قيمة عادلة"])).status).toBe("pass");
    });
  });

  describe("handleRetirementPlanObligationMeasurement", () => {
    const r = rule("retirement-plan-obligation-measurement", "IAS 26", "IAS 26.18");
    it("skips when no retirement plan accounts", () => {
      expect(handleRetirementPlanObligationMeasurement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("skips when not defined benefit plan", () => {
      expect(handleRetirementPlanObligationMeasurement(r, ctxWithMappings(["Retirement Plan"])).status).toBe("skipped");
    });
    it("warns when defined benefit without obligation measurement", () => {
      expect(handleRetirementPlanObligationMeasurement(r, ctxWithMappings(["Defined Benefit Plan"])).status).toBe("warning");
    });
    it("passes when defined benefit and present value obligation present", () => {
      expect(handleRetirementPlanObligationMeasurement(r, ctxWithMappings(["Defined Benefit Plan", "Present Value Obligation"])).status).toBe("pass");
    });
    it("detects Arabic defined benefit hint", () => {
      expect(handleRetirementPlanObligationMeasurement(r, ctxWithMappings(["مزايا محددة", "الالتزام الحالي"])).status).toBe("pass");
    });
  });

  describe("handleRetirementPlanContributionRecognition", () => {
    const r = rule("retirement-plan-contribution-recognition", "IAS 26", "IAS 26.19");
    it("skips when no retirement plan accounts", () => {
      expect(handleRetirementPlanContributionRecognition(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("skips when not defined contribution plan", () => {
      expect(handleRetirementPlanContributionRecognition(r, ctxWithMappings(["Retirement Plan"])).status).toBe("skipped");
    });
    it("warns when defined contribution without contribution", () => {
      expect(handleRetirementPlanContributionRecognition(r, ctxWithMappings(["Defined Contribution Plan"])).status).toBe("warning");
    });
    it("passes when defined contribution and contribution present", () => {
      expect(handleRetirementPlanContributionRecognition(r, ctxWithMappings(["Defined Contribution Plan", "Contributions Payable"])).status).toBe("pass");
    });
    it("detects Arabic contribution hint", () => {
      expect(handleRetirementPlanContributionRecognition(r, ctxWithMappings(["مساهمات محددة", "مساهمة"])).status).toBe("pass");
    });
  });

  describe("handleRetirementPlanDisclosure", () => {
    const r = rule("retirement-plan-disclosure", "IAS 26", "IAS 26.30");
    it("skips when no retirement plan accounts", () => {
      expect(handleRetirementPlanDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when plan without disclosure and no notes", () => {
      expect(handleRetirementPlanDisclosure(r, ctxWithMappings(["Retirement Plan"])).status).toBe("warning");
    });
    it("passes when net assets disclosure present", () => {
      expect(handleRetirementPlanDisclosure(r, ctxWithMappings(["Retirement Plan", "Net Assets Available"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleRetirementPlanDisclosure(r, ctxWithMappings(["Retirement Plan"], 2)).status).toBe("pass");
    });
  });
});

// === IAS 29 — Hyperinflationary Economies ===

describe("IAS 29 — Hyperinflationary Economies", () => {
  describe("handleHyperinflationRestatement", () => {
    const r = rule("hyperinflation-restatement", "IAS 29", "IAS 29.3");
    it("skips when no hyperinflation accounts", () => {
      expect(handleHyperinflationRestatement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when hyperinflation present without restatement", () => {
      expect(handleHyperinflationRestatement(r, ctxWithMappings(["Hyperinflationary Economy"])).status).toBe("warning");
    });
    it("passes when restatement present", () => {
      expect(handleHyperinflationRestatement(r, ctxWithMappings(["Hyperinflationary Economy", "Restatement"])).status).toBe("pass");
    });
    it("detects Arabic hyperinflation hint", () => {
      expect(handleHyperinflationRestatement(r, ctxWithMappings(["تضخم مفرط", "إعادة عرض"])).status).toBe("pass");
    });
  });

  describe("handleHyperinflationComparativeRestatement", () => {
    const r = rule("hyperinflation-comparative-restatement", "IAS 29", "IAS 29.8");
    it("skips when no hyperinflation accounts", () => {
      expect(handleHyperinflationComparativeRestatement(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when hyperinflation without comparative restatement", () => {
      expect(handleHyperinflationComparativeRestatement(r, ctxWithMappings(["Hyperinflationary Economy"])).status).toBe("warning");
    });
    it("passes when comparative figures present", () => {
      expect(handleHyperinflationComparativeRestatement(r, ctxWithMappings(["Hyperinflationary Economy", "Comparative Figures"])).status).toBe("pass");
    });
    it("detects Arabic comparative hint", () => {
      expect(handleHyperinflationComparativeRestatement(r, ctxWithMappings(["تضخم مفرط", "مقارنة"])).status).toBe("pass");
    });
  });

  describe("handleHyperinflationNonMonetaryItems", () => {
    const r = rule("hyperinflation-non-monetary-items", "IAS 29", "IAS 29.9");
    it("skips when no hyperinflation accounts", () => {
      expect(handleHyperinflationNonMonetaryItems(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when hyperinflation without non-monetary items", () => {
      expect(handleHyperinflationNonMonetaryItems(r, ctxWithMappings(["Hyperinflationary Economy"])).status).toBe("warning");
    });
    it("passes when non-monetary historical cost present", () => {
      expect(handleHyperinflationNonMonetaryItems(r, ctxWithMappings(["Hyperinflationary Economy", "Non-Monetary Historical Cost"])).status).toBe("pass");
    });
    it("detects Arabic non-monetary hint", () => {
      expect(handleHyperinflationNonMonetaryItems(r, ctxWithMappings(["تضخم مفرط", "غير نقدي"])).status).toBe("pass");
    });
  });

  describe("handleHyperinflationDisclosure", () => {
    const r = rule("hyperinflation-disclosure", "IAS 29", "IAS 29.12");
    it("skips when no hyperinflation accounts", () => {
      expect(handleHyperinflationDisclosure(r, ctxWithMappings([])).status).toBe("skipped");
    });
    it("warns when hyperinflation without disclosure and no notes", () => {
      expect(handleHyperinflationDisclosure(r, ctxWithMappings(["Hyperinflationary Economy"])).status).toBe("warning");
    });
    it("passes when restatement disclosure present", () => {
      expect(handleHyperinflationDisclosure(r, ctxWithMappings(["Hyperinflationary Economy", "Restatement Disclosure"])).status).toBe("pass");
    });
    it("passes when notes count > 0", () => {
      expect(handleHyperinflationDisclosure(r, ctxWithMappings(["Hyperinflationary Economy"], 1)).status).toBe("pass");
    });
  });
});

// === Rule metadata propagation ===

describe("batch-9 — rule metadata propagation", () => {
  it("carries IAS 34 metadata", () => {
    const r = rule("interim-period-measurement", "IAS 34", "IAS 34.14");
    const ev = handleInterimPeriodMeasurement(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("test-interim-period-measurement");
    expect(ev.standardCode).toBe("IAS 34");
    expect(ev.paragraphReference).toBe("IAS 34.14");
    expect(ev.topic).toBe("interim-period-measurement");
  });

  it("carries IFRS 6 metadata", () => {
    const r = rule("exploration-evaluation-measurement", "IFRS 6", "IFRS 6.12");
    const ev = handleExplorationEvaluationMeasurement(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("test-exploration-evaluation-measurement");
    expect(ev.standardCode).toBe("IFRS 6");
    expect(ev.paragraphReference).toBe("IFRS 6.12");
  });

  it("carries IAS 41 metadata", () => {
    const r = rule("biological-asset-recognition", "IAS 41", "IAS 41.12");
    const ev = handleBiologicalAssetRecognition(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IAS 41");
    expect(ev.topic).toBe("biological-asset-recognition");
  });

  it("carries IFRS 19 metadata", () => {
    const r = rule("subsidiary-scope-election", "IFRS 19", "IFRS 19.3");
    const ev = handleSubsidiaryScopeElection(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 19");
    expect(ev.paragraphReference).toBe("IFRS 19.3");
  });

  it("carries IFRS 4 metadata", () => {
    const r = rule("insurance-liability-recognition", "IFRS 4", "IFRS 4.12");
    const ev = handleInsuranceLiabilityRecognition(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 4");
  });

  it("carries IFRS 14 metadata", () => {
    const r = rule("regulatory-deferral-classification", "IFRS 14", "IFRS 14.8");
    const ev = handleRegulatoryDeferralClassification(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IFRS 14");
  });

  it("carries IAS 26 metadata", () => {
    const r = rule("retirement-plan-asset-measurement", "IAS 26", "IAS 26.8");
    const ev = handleRetirementPlanAssetMeasurement(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IAS 26");
  });

  it("carries IAS 29 metadata", () => {
    const r = rule("hyperinflation-restatement", "IAS 29", "IAS 29.3");
    const ev = handleHyperinflationRestatement(r, ctxWithMappings([]));
    expect(ev.standardCode).toBe("IAS 29");
  });
});

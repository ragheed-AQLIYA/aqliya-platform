/**
 * Unit Tests: IFRS Rule Checks — Wave 9 Part C
 * IFRS 17, IFRIC 10, IFRIC 12, IFRIC 19, IFRIC 23, IFRS for SMEs
 * Pure function tests — no Prisma mocking required.
 */

import { handleInsuranceContractScope, handleGeneralModel, handleInsuranceRecognition, handleRevenueSeparation } from "@/lib/audit/rules/ifrs-rule-checks/insurance-contracts-ifrs17";
import { handleInterimImpairment, handleIas36Link, handleTestingConsistency, handleIfric10Scope } from "@/lib/audit/rules/ifrs-rule-checks/interim-impairment-ifric";
import { handleServiceConcessionScope, handleFinancialVsIntangible, handleOperationServices, handleMaintenanceObligation } from "@/lib/audit/rules/ifrs-rule-checks/service-concessions";
import { handleDebtRestructuringScope, handleDebtMeasurement, handleFallbackMeasurement, handleDebtGainLoss } from "@/lib/audit/rules/ifrs-rule-checks/debt-restructuring";
import { handleUncertaintyScope, handleUnitOfAccount, handleExaminationAssumption, handleReflectUncertainty } from "@/lib/audit/rules/ifrs-rule-checks/uncertainty-over-income-taxes";
import { handleSmesScope, handleSmesFairPresentation, handleSmesRevenueGoods, handleSmesPpeMeasurement, handleSmesIncomeTax, handleSmesConsistency } from "@/lib/audit/rules/ifrs-rule-checks/ifrs-for-smes";
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

// === IFRS 17 — Insurance Contracts ===
describe("IFRS 17 — Insurance Contracts", () => {
  describe("handleInsuranceContractScope", () => {
    const r = rule("insurance-scope", "IFRS 17", "IFRS 17.3");
    it("skips when no insurance contracts", () => {
      expect(handleInsuranceContractScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when insurance contract present", () => {
      expect(handleInsuranceContractScope(r, ctx(["Insurance Contract"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleInsuranceContractScope(r, ctx(["عقد تأمين"])).status).toBe("pass");
    });
  });

  describe("handleGeneralModel", () => {
    const r = rule("general-model", "IFRS 17", "IFRS 17.16");
    it("skips when no insurance contracts", () => {
      expect(handleGeneralModel(r, ctx([])).status).toBe("skipped");
    });
    it("warns when insurance without general model", () => {
      expect(handleGeneralModel(r, ctx(["Insurance Contract"])).status).toBe("warning");
    });
    it("passes when general model present", () => {
      expect(handleGeneralModel(r, ctx(["Insurance Contract", "General Model"])).status).toBe("pass");
    });
    it("passes when building block approach present", () => {
      expect(handleGeneralModel(r, ctx(["Insurance Contract", "Building Block Approach"])).status).toBe("pass");
    });
  });

  describe("handleInsuranceRecognition", () => {
    const r = rule("insurance-recognition", "IFRS 17", "IFRS 17.32");
    it("skips when no insurance contracts", () => {
      expect(handleInsuranceRecognition(r, ctx([])).status).toBe("skipped");
    });
    it("warns when insurance without group recognition", () => {
      expect(handleInsuranceRecognition(r, ctx(["Insurance Contract"])).status).toBe("warning");
    });
    it("passes when group of contracts present", () => {
      expect(handleInsuranceRecognition(r, ctx(["Insurance Contract", "Group of Contracts"])).status).toBe("pass");
    });
  });

  describe("handleRevenueSeparation", () => {
    const r = rule("revenue-separation", "IFRS 17", "IFRS 17.45");
    it("skips when no insurance contracts", () => {
      expect(handleRevenueSeparation(r, ctx([])).status).toBe("skipped");
    });
    it("warns when insurance without revenue separation", () => {
      expect(handleRevenueSeparation(r, ctx(["Insurance Contract"])).status).toBe("warning");
    });
    it("passes when insurance service revenue present", () => {
      expect(handleRevenueSeparation(r, ctx(["Insurance Contract", "Insurance Service Revenue"])).status).toBe("pass");
    });
    it("passes when investment component present", () => {
      expect(handleRevenueSeparation(r, ctx(["Insurance Contract", "Investment Component"])).status).toBe("pass");
    });
  });
});

// === IFRIC 10 — Interim Financial Reporting: Impairment ===
describe("IFRIC 10 — Interim Financial Reporting: Impairment", () => {
  describe("handleInterimImpairment", () => {
    const r = rule("interim-impairment", "IFRIC 10", "IFRIC 10.3");
    it("skips when no interim impairment", () => {
      expect(handleInterimImpairment(r, ctx([])).status).toBe("skipped");
    });
    it("passes when interim impairment present", () => {
      expect(handleInterimImpairment(r, ctx(["Interim Impairment"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleInterimImpairment(r, ctx(["ضياع القيمة المرحلي"])).status).toBe("pass");
    });
  });

  describe("handleIas36Link", () => {
    const r = rule("ias36-link", "IFRIC 10", "IFRIC 10.4");
    it("skips when no interim impairment", () => {
      expect(handleIas36Link(r, ctx([])).status).toBe("skipped");
    });
    it("warns when interim impairment without IAS 36 link", () => {
      expect(handleIas36Link(r, ctx(["Interim Impairment"])).status).toBe("warning");
    });
    it("passes when IAS 36 present", () => {
      expect(handleIas36Link(r, ctx(["Interim Impairment", "IAS 36"])).status).toBe("pass");
    });
    it("passes when impairment test present", () => {
      expect(handleIas36Link(r, ctx(["Interim Impairment", "Impairment Test"])).status).toBe("pass");
    });
  });

  describe("handleTestingConsistency", () => {
    const r = rule("testing-consistency", "IFRIC 10", "IFRIC 10.5");
    it("skips when no interim impairment", () => {
      expect(handleTestingConsistency(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when interim impairment without consistency", () => {
      expect(handleTestingConsistency(r, ctx(["Interim Impairment"])).status).toBe("advisory");
    });
    it("passes when consistency present", () => {
      expect(handleTestingConsistency(r, ctx(["Interim Impairment", "Consistency"])).status).toBe("pass");
    });
  });

  describe("handleIfric10Scope", () => {
    const r = rule("ifric10-scope", "IFRIC 10", "IFRIC 10.2");
    it("skips when no interim or goodwill", () => {
      expect(handleIfric10Scope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when interim impairment present", () => {
      expect(handleIfric10Scope(r, ctx(["Interim Impairment"])).status).toBe("pass");
    });
    it("passes when goodwill present", () => {
      expect(handleIfric10Scope(r, ctx(["Goodwill"])).status).toBe("pass");
    });
    it("detects Arabic goodwill hint", () => {
      expect(handleIfric10Scope(r, ctx(["شهرة"])).status).toBe("pass");
    });
  });
});

// === IFRIC 12 — Service Concession Arrangements ===
describe("IFRIC 12 — Service Concession Arrangements", () => {
  describe("handleServiceConcessionScope", () => {
    const r = rule("service-concession-scope", "IFRIC 12", "IFRIC 12.2");
    it("skips when no service concession", () => {
      expect(handleServiceConcessionScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when service concession present", () => {
      expect(handleServiceConcessionScope(r, ctx(["Service Concession"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleServiceConcessionScope(r, ctx(["امتياز خدمي"])).status).toBe("pass");
    });
  });

  describe("handleFinancialVsIntangible", () => {
    const r = rule("financial-vs-intangible", "IFRIC 12", "IFRIC 12.16");
    it("skips when no service concession", () => {
      expect(handleFinancialVsIntangible(r, ctx([])).status).toBe("skipped");
    });
    it("warns when concession without classification", () => {
      expect(handleFinancialVsIntangible(r, ctx(["Service Concession"])).status).toBe("warning");
    });
    it("passes when financial asset present", () => {
      expect(handleFinancialVsIntangible(r, ctx(["Service Concession", "Financial Asset"])).status).toBe("pass");
    });
    it("passes when intangible asset present", () => {
      expect(handleFinancialVsIntangible(r, ctx(["Service Concession", "Intangible Asset"])).status).toBe("pass");
    });
  });

  describe("handleOperationServices", () => {
    const r = rule("operation-services", "IFRIC 12", "IFRIC 12.17");
    it("skips when no service concession", () => {
      expect(handleOperationServices(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when concession without operation services", () => {
      expect(handleOperationServices(r, ctx(["Service Concession"])).status).toBe("advisory");
    });
    it("passes when operation services present", () => {
      expect(handleOperationServices(r, ctx(["Service Concession", "Operation Services"])).status).toBe("pass");
    });
  });

  describe("handleMaintenanceObligation", () => {
    const r = rule("maintenance-obligation", "IFRIC 12", "IFRIC 12.23");
    it("skips when no service concession", () => {
      expect(handleMaintenanceObligation(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when concession without maintenance obligation", () => {
      expect(handleMaintenanceObligation(r, ctx(["Service Concession"])).status).toBe("advisory");
    });
    it("passes when maintenance obligation present", () => {
      expect(handleMaintenanceObligation(r, ctx(["Service Concession", "Maintenance Obligation"])).status).toBe("pass");
    });
  });
});

// === IFRIC 19 — Extinguishing Financial Liabilities with Equity Instruments ===
describe("IFRIC 19 — Extinguishing Financial Liabilities with Equity Instruments", () => {
  describe("handleDebtRestructuringScope", () => {
    const r = rule("debt-restructuring-scope", "IFRIC 19", "IFRIC 19.2");
    it("skips when no debt restructuring", () => {
      expect(handleDebtRestructuringScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when debt restructuring present", () => {
      expect(handleDebtRestructuringScope(r, ctx(["Debt Restructuring"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleDebtRestructuringScope(r, ctx(["إعادة هيكلة الديون"])).status).toBe("pass");
    });
  });

  describe("handleDebtMeasurement", () => {
    const r = rule("debt-measurement", "IFRIC 19", "IFRIC 19.5");
    it("skips when no debt restructuring", () => {
      expect(handleDebtMeasurement(r, ctx([])).status).toBe("skipped");
    });
    it("warns when restructuring without fair value", () => {
      expect(handleDebtMeasurement(r, ctx(["Debt Restructuring"])).status).toBe("warning");
    });
    it("passes when fair value present", () => {
      expect(handleDebtMeasurement(r, ctx(["Debt Restructuring", "Fair Value"])).status).toBe("pass");
    });
  });

  describe("handleFallbackMeasurement", () => {
    const r = rule("fallback-measurement", "IFRIC 19", "IFRIC 19.8");
    it("skips when no debt restructuring", () => {
      expect(handleFallbackMeasurement(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when restructuring without fallback", () => {
      expect(handleFallbackMeasurement(r, ctx(["Debt Restructuring"])).status).toBe("advisory");
    });
    it("passes when carrying amount present", () => {
      expect(handleFallbackMeasurement(r, ctx(["Debt Restructuring", "Carrying Amount"])).status).toBe("pass");
    });
  });

  describe("handleDebtGainLoss", () => {
    const r = rule("debt-gain-loss", "IFRIC 19", "IFRIC 19.9");
    it("skips when no debt restructuring", () => {
      expect(handleDebtGainLoss(r, ctx([])).status).toBe("skipped");
    });
    it("warns when restructuring without gain/loss", () => {
      expect(handleDebtGainLoss(r, ctx(["Debt Restructuring"])).status).toBe("warning");
    });
    it("passes when gain present", () => {
      expect(handleDebtGainLoss(r, ctx(["Debt Restructuring", "Gain"])).status).toBe("pass");
    });
    it("passes when loss present", () => {
      expect(handleDebtGainLoss(r, ctx(["Debt Restructuring", "Loss"])).status).toBe("pass");
    });
  });
});

// === IFRIC 23 — Uncertainty over Income Tax Treatments ===
describe("IFRIC 23 — Uncertainty over Income Tax Treatments", () => {
  describe("handleUncertaintyScope", () => {
    const r = rule("uncertainty-scope", "IFRIC 23", "IFRIC 23.2");
    it("skips when no tax uncertainty", () => {
      expect(handleUncertaintyScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when tax uncertainty present", () => {
      expect(handleUncertaintyScope(r, ctx(["Uncertainty over Income Tax Treatment"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleUncertaintyScope(r, ctx(["عدم يقين المعالجة الضريبية"])).status).toBe("pass");
    });
  });

  describe("handleUnitOfAccount", () => {
    const r = rule("unit-of-account", "IFRIC 23", "IFRIC 23.9");
    it("skips when no tax uncertainty", () => {
      expect(handleUnitOfAccount(r, ctx([])).status).toBe("skipped");
    });
    it("warns when uncertainty without unit of account", () => {
      expect(handleUnitOfAccount(r, ctx(["Uncertainty over Income Tax Treatment"])).status).toBe("warning");
    });
    it("passes when unit of account present", () => {
      expect(handleUnitOfAccount(r, ctx(["Uncertainty over Income Tax Treatment", "Unit of Account"])).status).toBe("pass");
    });
  });

  describe("handleExaminationAssumption", () => {
    const r = rule("examination-assumption", "IFRIC 23", "IFRIC 23.5");
    it("skips when no tax uncertainty", () => {
      expect(handleExaminationAssumption(r, ctx([])).status).toBe("skipped");
    });
    it("warns when uncertainty without examination assumption", () => {
      expect(handleExaminationAssumption(r, ctx(["Uncertainty over Income Tax Treatment"])).status).toBe("warning");
    });
    it("passes when tax authority present", () => {
      expect(handleExaminationAssumption(r, ctx(["Uncertainty over Income Tax Treatment", "Tax Authority"])).status).toBe("pass");
    });
  });

  describe("handleReflectUncertainty", () => {
    const r = rule("reflect-uncertainty", "IFRIC 23", "IFRIC 23.10");
    it("skips when no tax uncertainty", () => {
      expect(handleReflectUncertainty(r, ctx([])).status).toBe("skipped");
    });
    it("warns when uncertainty without reflection", () => {
      expect(handleReflectUncertainty(r, ctx(["Uncertainty over Income Tax Treatment"])).status).toBe("warning");
    });
    it("passes when expected value present", () => {
      expect(handleReflectUncertainty(r, ctx(["Uncertainty over Income Tax Treatment", "Expected Value"])).status).toBe("pass");
    });
    it("passes when most likely amount present", () => {
      expect(handleReflectUncertainty(r, ctx(["Uncertainty over Income Tax Treatment", "Most Likely Amount"])).status).toBe("pass");
    });
  });
});

// === IFRS for SMEs ===
describe("IFRS for SMEs", () => {
  describe("handleSmesScope", () => {
    const r = rule("smes-scope", "IFRS for SMEs", "IFRS for SMEs.2");
    it("skips when no SME accounts", () => {
      expect(handleSmesScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when SME present", () => {
      expect(handleSmesScope(r, ctx(["IFRS for SMEs"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleSmesScope(r, ctx(["منشآت صغيرة ومتوسطة"])).status).toBe("pass");
    });
  });

  describe("handleSmesFairPresentation", () => {
    const r = rule("smes-fair-presentation", "IFRS for SMEs", "IFRS for SMEs.3.2");
    it("skips when no SME accounts", () => {
      expect(handleSmesFairPresentation(r, ctx([])).status).toBe("skipped");
    });
    it("warns when SME without fair presentation", () => {
      expect(handleSmesFairPresentation(r, ctx(["IFRS for SMEs"])).status).toBe("warning");
    });
    it("passes when fair presentation present", () => {
      expect(handleSmesFairPresentation(r, ctx(["IFRS for SMEs", "Fair Presentation"])).status).toBe("pass");
    });
  });

  describe("handleSmesRevenueGoods", () => {
    const r = rule("smes-revenue-goods", "IFRS for SMEs", "IFRS for SMEs.23");
    it("skips when no SME accounts", () => {
      expect(handleSmesRevenueGoods(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when SME without revenue", () => {
      expect(handleSmesRevenueGoods(r, ctx(["IFRS for SMEs"])).status).toBe("advisory");
    });
    it("passes when revenue from goods present", () => {
      expect(handleSmesRevenueGoods(r, ctx(["IFRS for SMEs", "Revenue from Goods"])).status).toBe("pass");
    });
  });

  describe("handleSmesPpeMeasurement", () => {
    const r = rule("smes-ppe-measurement", "IFRS for SMEs", "IFRS for SMEs.17");
    it("skips when no SME accounts", () => {
      expect(handleSmesPpeMeasurement(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when SME without PPE", () => {
      expect(handleSmesPpeMeasurement(r, ctx(["IFRS for SMEs"])).status).toBe("advisory");
    });
    it("passes when PPE present", () => {
      expect(handleSmesPpeMeasurement(r, ctx(["IFRS for SMEs", "PPE"])).status).toBe("pass");
    });
    it("passes when cost model present", () => {
      expect(handleSmesPpeMeasurement(r, ctx(["IFRS for SMEs", "Cost Model"])).status).toBe("pass");
    });
  });

  describe("handleSmesIncomeTax", () => {
    const r = rule("smes-income-tax", "IFRS for SMEs", "IFRS for SMEs.29");
    it("skips when no SME accounts", () => {
      expect(handleSmesIncomeTax(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when SME without income tax", () => {
      expect(handleSmesIncomeTax(r, ctx(["IFRS for SMEs"])).status).toBe("advisory");
    });
    it("passes when income tax present", () => {
      expect(handleSmesIncomeTax(r, ctx(["IFRS for SMEs", "Income Tax"])).status).toBe("pass");
    });
    it("passes when deferred tax present", () => {
      expect(handleSmesIncomeTax(r, ctx(["IFRS for SMEs", "Deferred Tax"])).status).toBe("pass");
    });
  });

  describe("handleSmesConsistency", () => {
    const r = rule("smes-consistency", "IFRS for SMEs", "IFRS for SMEs.10");
    it("skips when no SME accounts", () => {
      expect(handleSmesConsistency(r, ctx([])).status).toBe("skipped");
    });
    it("warns when SME without consistency", () => {
      expect(handleSmesConsistency(r, ctx(["IFRS for SMEs"])).status).toBe("warning");
    });
    it("passes when consistency present", () => {
      expect(handleSmesConsistency(r, ctx(["IFRS for SMEs", "Consistency"])).status).toBe("pass");
    });
  });
});

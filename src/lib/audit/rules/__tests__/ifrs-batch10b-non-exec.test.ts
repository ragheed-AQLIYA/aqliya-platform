/**
 * Unit Tests: IFRS Rule Checks — Wave 9 Part B
 * IFRS 7, IFRS 8, IFRS 10, IFRS 11, IFRS 12, IFRS 1
 * Pure function tests — no Prisma mocking required.
 */

import { handleSignificanceDisclosure, handleCarryingAmounts, handleRiskDisclosure, handleEclDisclosure } from "@/lib/audit/rules/ifrs-rule-checks/financial-instruments-disclosure";
import { handleCodmBasis, handleSegmentDefinition, handleSegmentMeasures, handleSegmentReconciliation } from "@/lib/audit/rules/ifrs-rule-checks/operating-segments";
import { handleConsolidationRequirement, handleControlDefinition, handleConsolidationProcedure, handleUniformPolicies } from "@/lib/audit/rules/ifrs-rule-checks/consolidated-financial-statements";
import { handleJointArrangement, handleJointOperation, handleJointVenture, handleJointEquityMethod } from "@/lib/audit/rules/ifrs-rule-checks/joint-arrangements";
import { handleDisclosureScope, handleSubsidiaryDisclosure, handleJointAssociateDisclosure, handleStructuredEntities } from "@/lib/audit/rules/ifrs-rule-checks/disclosure-of-interests";
import { handleFirstIfrsScope, handleFirstIfrsStatements, handleOpeningStatement, handleRetrospectiveApplication } from "@/lib/audit/rules/ifrs-rule-checks/first-time-adoption";
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

// === IFRS 7 — Financial Instruments: Disclosures ===
describe("IFRS 7 — Financial Instruments: Disclosures", () => {
  describe("handleSignificanceDisclosure", () => {
    const r = rule("significance-disclosure", "IFRS 7", "IFRS 7.21");
    it("skips when no financial instruments", () => {
      expect(handleSignificanceDisclosure(r, ctx([])).status).toBe("skipped");
    });
    it("warns when financial instruments without disclosure and no notes", () => {
      expect(handleSignificanceDisclosure(r, ctx(["Financial Instrument"])).status).toBe("warning");
    });
    it("passes when significance disclosure present", () => {
      expect(handleSignificanceDisclosure(r, ctx(["Financial Instrument", "Significance"])).status).toBe("pass");
    });
    it("passes when notes exist even without explicit disclosure hint", () => {
      expect(handleSignificanceDisclosure(r, ctx(["Financial Instrument"], 5)).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleSignificanceDisclosure(r, ctx(["أداة مالية", "الأهمية"])).status).toBe("pass");
    });
  });

  describe("handleCarryingAmounts", () => {
    const r = rule("carrying-amounts", "IFRS 7", "IFRS 7.14");
    it("skips when no financial instruments", () => {
      expect(handleCarryingAmounts(r, ctx([])).status).toBe("skipped");
    });
    it("warns when financial instruments without carrying amount", () => {
      expect(handleCarryingAmounts(r, ctx(["Financial Instrument"])).status).toBe("warning");
    });
    it("passes when carrying amount present", () => {
      expect(handleCarryingAmounts(r, ctx(["Financial Instrument", "Carrying Amount"])).status).toBe("pass");
    });
    it("passes when fair value present", () => {
      expect(handleCarryingAmounts(r, ctx(["Financial Instrument", "Fair Value"])).status).toBe("pass");
    });
  });

  describe("handleRiskDisclosure", () => {
    const r = rule("risk-disclosure", "IFRS 7", "IFRS 7.31");
    it("skips when no financial instruments", () => {
      expect(handleRiskDisclosure(r, ctx([])).status).toBe("skipped");
    });
    it("warns when financial instruments without risk disclosure and no notes", () => {
      expect(handleRiskDisclosure(r, ctx(["Financial Instrument"])).status).toBe("warning");
    });
    it("passes when credit risk present", () => {
      expect(handleRiskDisclosure(r, ctx(["Financial Instrument", "Credit Risk"])).status).toBe("pass");
    });
    it("passes when notes exist", () => {
      expect(handleRiskDisclosure(r, ctx(["Financial Instrument"], 3)).status).toBe("pass");
    });
  });

  describe("handleEclDisclosure", () => {
    const r = rule("ecl-disclosure", "IFRS 7", "IFRS 7.35");
    it("skips when no financial instruments", () => {
      expect(handleEclDisclosure(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when financial instruments without ECL", () => {
      expect(handleEclDisclosure(r, ctx(["Financial Instrument"])).status).toBe("advisory");
    });
    it("passes when ECL present", () => {
      expect(handleEclDisclosure(r, ctx(["Financial Instrument", "Expected Credit Loss"])).status).toBe("pass");
    });
    it("passes when loss allowance present", () => {
      expect(handleEclDisclosure(r, ctx(["Financial Instrument", "Loss Allowance"])).status).toBe("pass");
    });
  });
});

// === IFRS 8 — Operating Segments ===
describe("IFRS 8 — Operating Segments", () => {
  describe("handleCodmBasis", () => {
    const r = rule("codm-basis", "IFRS 8", "IFRS 8.5");
    it("skips when no segment accounts", () => {
      expect(handleCodmBasis(r, ctx([])).status).toBe("skipped");
    });
    it("warns when segment without CODM", () => {
      expect(handleCodmBasis(r, ctx(["Operating Segment"])).status).toBe("warning");
    });
    it("passes when CODM present", () => {
      expect(handleCodmBasis(r, ctx(["Operating Segment", "CODM"])).status).toBe("pass");
    });
    it("detects Arabic segment hint", () => {
      expect(handleCodmBasis(r, ctx(["قطاع تشغيلي", "صانع القرار التشغيلي"])).status).toBe("pass");
    });
  });

  describe("handleSegmentDefinition", () => {
    const r = rule("segment-definition", "IFRS 8", "IFRS 8.5");
    it("skips when no segment accounts", () => {
      expect(handleSegmentDefinition(r, ctx([])).status).toBe("skipped");
    });
    it("returns advisory when segment without definition", () => {
      expect(handleSegmentDefinition(r, ctx(["Operating Segment"])).status).toBe("advisory");
    });
    it("passes when segment definition present", () => {
      expect(handleSegmentDefinition(r, ctx(["Operating Segment", "Segment Definition"])).status).toBe("pass");
    });
  });

  describe("handleSegmentMeasures", () => {
    const r = rule("segment-measures", "IFRS 8", "IFRS 8.21");
    it("skips when no segment accounts", () => {
      expect(handleSegmentMeasures(r, ctx([])).status).toBe("skipped");
    });
    it("warns when segment without measures and no notes", () => {
      expect(handleSegmentMeasures(r, ctx(["Operating Segment"])).status).toBe("warning");
    });
    it("passes when segment revenue present", () => {
      expect(handleSegmentMeasures(r, ctx(["Operating Segment", "Segment Revenue"])).status).toBe("pass");
    });
    it("passes when notes exist", () => {
      expect(handleSegmentMeasures(r, ctx(["Operating Segment"], 4)).status).toBe("pass");
    });
  });

  describe("handleSegmentReconciliation", () => {
    const r = rule("segment-reconciliation", "IFRS 8", "IFRS 8.28");
    it("skips when no segment accounts", () => {
      expect(handleSegmentReconciliation(r, ctx([])).status).toBe("skipped");
    });
    it("warns when segment without reconciliation", () => {
      expect(handleSegmentReconciliation(r, ctx(["Operating Segment"])).status).toBe("warning");
    });
    it("passes when reconciliation present", () => {
      expect(handleSegmentReconciliation(r, ctx(["Operating Segment", "Reconciliation"])).status).toBe("pass");
    });
  });
});

// === IFRS 10 — Consolidated Financial Statements ===
describe("IFRS 10 — Consolidated Financial Statements", () => {
  describe("handleConsolidationRequirement", () => {
    const r = rule("consolidation-requirement", "IFRS 10", "IFRS 10.19");
    it("skips when no consolidation", () => {
      expect(handleConsolidationRequirement(r, ctx([])).status).toBe("skipped");
    });
    it("passes when consolidation present", () => {
      expect(handleConsolidationRequirement(r, ctx(["Consolidated"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleConsolidationRequirement(r, ctx(["قوائم مالية مجمعة"])).status).toBe("pass");
    });
  });

  describe("handleControlDefinition", () => {
    const r = rule("control-definition", "IFRS 10", "IFRS 10.6");
    it("skips when no consolidation", () => {
      expect(handleControlDefinition(r, ctx([])).status).toBe("skipped");
    });
    it("warns when consolidation without control criteria", () => {
      expect(handleControlDefinition(r, ctx(["Consolidated"])).status).toBe("warning");
    });
    it("passes when control present", () => {
      expect(handleControlDefinition(r, ctx(["Consolidated", "Control"])).status).toBe("pass");
    });
  });

  describe("handleConsolidationProcedure", () => {
    const r = rule("consolidation-procedure", "IFRS 10", "IFRS 10.84");
    it("skips when no consolidation", () => {
      expect(handleConsolidationProcedure(r, ctx([])).status).toBe("skipped");
    });
    it("warns when consolidation without procedures", () => {
      expect(handleConsolidationProcedure(r, ctx(["Consolidated"])).status).toBe("warning");
    });
    it("passes when elimination present", () => {
      expect(handleConsolidationProcedure(r, ctx(["Consolidated", "Elimination"])).status).toBe("pass");
    });
    it("passes when intercompany present", () => {
      expect(handleConsolidationProcedure(r, ctx(["Consolidated", "Intercompany"])).status).toBe("pass");
    });
  });

  describe("handleUniformPolicies", () => {
    const r = rule("uniform-policies", "IFRS 10", "IFRS 10.19");
    it("skips when no consolidation", () => {
      expect(handleUniformPolicies(r, ctx([])).status).toBe("skipped");
    });
    it("warns when consolidation without uniform policies", () => {
      expect(handleUniformPolicies(r, ctx(["Consolidated"])).status).toBe("warning");
    });
    it("passes when uniform policies present", () => {
      expect(handleUniformPolicies(r, ctx(["Consolidated", "Uniform Accounting Policies"])).status).toBe("pass");
    });
  });
});

// === IFRS 11 — Joint Arrangements ===
describe("IFRS 11 — Joint Arrangements", () => {
  describe("handleJointArrangement", () => {
    const r = rule("joint-arrangement", "IFRS 11", "IFRS 11.4");
    it("skips when no joint arrangement", () => {
      expect(handleJointArrangement(r, ctx([])).status).toBe("skipped");
    });
    it("passes when joint arrangement present", () => {
      expect(handleJointArrangement(r, ctx(["Joint Arrangement"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleJointArrangement(r, ctx(["مشروع مشترك"])).status).toBe("pass");
    });
  });

  describe("handleJointOperation", () => {
    const r = rule("joint-operation", "IFRS 11", "IFRS 11.20");
    it("skips when no joint operation", () => {
      expect(handleJointOperation(r, ctx([])).status).toBe("skipped");
    });
    it("warns when joint operation without share recognition", () => {
      expect(handleJointOperation(r, ctx(["Joint Operation"])).status).toBe("warning");
    });
    it("passes when share of assets present", () => {
      expect(handleJointOperation(r, ctx(["Joint Operation", "Share of Assets"])).status).toBe("pass");
    });
  });

  describe("handleJointVenture", () => {
    const r = rule("joint-venture", "IFRS 11", "IFRS 11.24");
    it("skips when no joint venture", () => {
      expect(handleJointVenture(r, ctx([])).status).toBe("skipped");
    });
    it("warns when joint venture without equity method", () => {
      expect(handleJointVenture(r, ctx(["Joint Venture"])).status).toBe("warning");
    });
    it("passes when equity method present", () => {
      expect(handleJointVenture(r, ctx(["Joint Venture", "Equity Method"])).status).toBe("pass");
    });
  });

  describe("handleJointEquityMethod", () => {
    const r = rule("joint-equity-method", "IFRS 11", "IFRS 11.B34");
    it("skips when no joint venture", () => {
      expect(handleJointEquityMethod(r, ctx([])).status).toBe("skipped");
    });
    it("skips when joint venture without equity method", () => {
      expect(handleJointEquityMethod(r, ctx(["Joint Venture"])).status).toBe("skipped");
    });
    it("passes when both joint venture and equity method present", () => {
      expect(handleJointEquityMethod(r, ctx(["Joint Venture", "Equity Method"])).status).toBe("pass");
    });
  });
});

// === IFRS 12 — Disclosure of Interests ===
describe("IFRS 12 — Disclosure of Interests in Other Entities", () => {
  describe("handleDisclosureScope", () => {
    const r = rule("disclosure-scope", "IFRS 12", "IFRS 12.1");
    it("skips when no interests", () => {
      expect(handleDisclosureScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when subsidiary present", () => {
      expect(handleDisclosureScope(r, ctx(["Subsidiary"])).status).toBe("pass");
    });
    it("passes when joint venture present", () => {
      expect(handleDisclosureScope(r, ctx(["Joint Venture"])).status).toBe("pass");
    });
    it("passes when structured entity present", () => {
      expect(handleDisclosureScope(r, ctx(["Structured Entity"])).status).toBe("pass");
    });
  });

  describe("handleSubsidiaryDisclosure", () => {
    const r = rule("subsidiary-disclosure", "IFRS 12", "IFRS 12.10");
    it("skips when no subsidiary", () => {
      expect(handleSubsidiaryDisclosure(r, ctx([])).status).toBe("skipped");
    });
    it("warns when subsidiary without disclosure and no notes", () => {
      expect(handleSubsidiaryDisclosure(r, ctx(["Subsidiary"])).status).toBe("warning");
    });
    it("passes when disclosure present", () => {
      expect(handleSubsidiaryDisclosure(r, ctx(["Subsidiary", "Disclosure of Interests"])).status).toBe("pass");
    });
    it("passes when notes exist", () => {
      expect(handleSubsidiaryDisclosure(r, ctx(["Subsidiary"], 3)).status).toBe("pass");
    });
  });

  describe("handleJointAssociateDisclosure", () => {
    const r = rule("joint-associate-disclosure", "IFRS 12", "IFRS 12.21");
    it("skips when no JV or associate", () => {
      expect(handleJointAssociateDisclosure(r, ctx([])).status).toBe("skipped");
    });
    it("warns when JV without disclosure and no notes", () => {
      expect(handleJointAssociateDisclosure(r, ctx(["Joint Venture"])).status).toBe("warning");
    });
    it("passes when associate with disclosure present", () => {
      expect(handleJointAssociateDisclosure(r, ctx(["Associate", "Disclosure of Interests"])).status).toBe("pass");
    });
    it("passes when notes exist", () => {
      expect(handleJointAssociateDisclosure(r, ctx(["Associate"], 2)).status).toBe("pass");
    });
  });

  describe("handleStructuredEntities", () => {
    const r = rule("structured-entities", "IFRS 12", "IFRS 12.24");
    it("skips when no structured entity", () => {
      expect(handleStructuredEntities(r, ctx([])).status).toBe("skipped");
    });
    it("warns when structured entity without disclosure and no notes", () => {
      expect(handleStructuredEntities(r, ctx(["Structured Entity"])).status).toBe("warning");
    });
    it("passes when disclosure present", () => {
      expect(handleStructuredEntities(r, ctx(["Structured Entity", "Disclosure of Interests"])).status).toBe("pass");
    });
    it("passes when notes exist", () => {
      expect(handleStructuredEntities(r, ctx(["Structured Entity"], 2)).status).toBe("pass");
    });
  });
});

// === IFRS 1 — First-time Adoption of IFRS ===
describe("IFRS 1 — First-time Adoption of IFRS", () => {
  describe("handleFirstIfrsScope", () => {
    const r = rule("first-ifrs-scope", "IFRS 1", "IFRS 1.2");
    it("skips when no first-time adoption", () => {
      expect(handleFirstIfrsScope(r, ctx([])).status).toBe("skipped");
    });
    it("passes when first-time adoption present", () => {
      expect(handleFirstIfrsScope(r, ctx(["First IFRS"])).status).toBe("pass");
    });
    it("detects Arabic hint", () => {
      expect(handleFirstIfrsScope(r, ctx(["أول تطبيق"])).status).toBe("pass");
    });
  });

  describe("handleFirstIfrsStatements", () => {
    const r = rule("first-ifrs-statements", "IFRS 1", "IFRS 1.6");
    it("skips when no first-time adoption", () => {
      expect(handleFirstIfrsStatements(r, ctx([])).status).toBe("skipped");
    });
    it("warns when first adoption without statements", () => {
      expect(handleFirstIfrsStatements(r, ctx(["First IFRS"])).status).toBe("warning");
    });
    it("passes when first IFRS statements present", () => {
      expect(handleFirstIfrsStatements(r, ctx(["First IFRS", "First IFRS Financial Statements"])).status).toBe("pass");
    });
  });

  describe("handleOpeningStatement", () => {
    const r = rule("opening-statement", "IFRS 1", "IFRS 1.6");
    it("skips when no first-time adoption", () => {
      expect(handleOpeningStatement(r, ctx([])).status).toBe("skipped");
    });
    it("warns when first adoption without opening balance sheet", () => {
      expect(handleOpeningStatement(r, ctx(["First IFRS"])).status).toBe("warning");
    });
    it("passes when opening balance sheet present", () => {
      expect(handleOpeningStatement(r, ctx(["First IFRS", "Opening Balance Sheet"])).status).toBe("pass");
    });
    it("passes when transition date present", () => {
      expect(handleOpeningStatement(r, ctx(["First IFRS", "Transition Date"])).status).toBe("pass");
    });
  });

  describe("handleRetrospectiveApplication", () => {
    const r = rule("retrospective-application", "IFRS 1", "IFRS 1.7");
    it("skips when no first-time adoption", () => {
      expect(handleRetrospectiveApplication(r, ctx([])).status).toBe("skipped");
    });
    it("warns when first adoption without retrospective", () => {
      expect(handleRetrospectiveApplication(r, ctx(["First IFRS"])).status).toBe("warning");
    });
    it("passes when retrospective application present", () => {
      expect(handleRetrospectiveApplication(r, ctx(["First IFRS", "Retrospective Application"])).status).toBe("pass");
    });
    it("passes when exemptions present", () => {
      expect(handleRetrospectiveApplication(r, ctx(["First IFRS", "Exemptions"])).status).toBe("pass");
    });
  });
});

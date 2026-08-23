/**
 * Unit Test: IFRS Rule Checks - Government Grants (IAS 20)
 *
 * Tests the four government grant handlers directly:
 * - handleGrantRecognition (IAS 20.12)
 * - handleGrantCompensation (IAS 20.24)
 * - handleGrantPresentation (IAS 20.26)
 * - handleGrantDisclosure (IAS 20.39)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleGrantRecognition,
  handleGrantCompensation,
  handleGrantPresentation,
  handleGrantDisclosure,
} from "@/lib/audit/rules/ifrs-rule-checks/government-grants";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 20.12",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 20",
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

// --- handleGrantRecognition (IAS 20.12) ---

describe("handleGrantRecognition", () => {
  const r = rule("grant-recognition", { paragraphReference: "IAS 20.12" });

  it("skips when no government grant accounts are mapped", () => {
    const ev = handleGrantRecognition(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No government grant");
  });

  it("skips when mappings exist but none are grant accounts", () => {
    const ev = handleGrantRecognition(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when grant may be credited to equity without grant income", () => {
    const ev = handleGrantRecognition(r, ctxWithMappings(["Government Grant", "Capital Reserve Grant"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("equity");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("returns advisory when grant present but no income or equity", () => {
    const ev = handleGrantRecognition(r, ctxWithMappings(["Government Grant"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("P&L");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("passes when grant income is recognised in P&L", () => {
    const ev = handleGrantRecognition(
      r,
      ctxWithMappings(["Government Grant", "Grant Income"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["income_statement"]);
  });

  it("skips when grant mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Government Grant", "Grant Income"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleGrantRecognition(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects grant via canonicalName (subsidy)", () => {
    const ctx = ctxWithMappings(["Account 4001", "Grant Income"]);
    ctx.mappings[0].canonicalName = "Government Subsidy";
    const ev = handleGrantRecognition(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic grant hint (منحة حكومية)", () => {
    const ev = handleGrantRecognition(
      r,
      ctxWithMappings(["منحة حكومية", "إيراد منحة"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleGrantCompensation (IAS 20.24) ---

describe("handleGrantCompensation", () => {
  const r = rule("grant-compensation", { paragraphReference: "IAS 20.24" });

  it("skips when no government grant accounts are mapped", () => {
    const ev = handleGrantCompensation(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are grant accounts", () => {
    const ev = handleGrantCompensation(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when grant accounts are present", () => {
    const ev = handleGrantCompensation(r, ctxWithMappings(["Government Grant"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("compensation");
  });

  it("skips when grant mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Government Grant"]);
    ctx.mappings[0].status = "pending";
    const ev = handleGrantCompensation(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic grant hint (إعانة)", () => {
    const ev = handleGrantCompensation(r, ctxWithMappings(["إعانة حكومية"]));
    expect(ev.status).toBe("advisory");
  });
});

// --- handleGrantPresentation (IAS 20.26) ---

describe("handleGrantPresentation", () => {
  const r = rule("grant-presentation", { paragraphReference: "IAS 20.26" });

  it("skips when no government grant accounts are mapped", () => {
    const ev = handleGrantPresentation(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are grant accounts", () => {
    const ev = handleGrantPresentation(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when grant present without deferred income or asset deduction", () => {
    const ev = handleGrantPresentation(r, ctxWithMappings(["Government Grant"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("deferred income or asset deduction");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when grant and deferred income are present", () => {
    const ev = handleGrantPresentation(
      r,
      ctxWithMappings(["Government Grant", "Deferred Income"]),
    );
    expect(ev.status).toBe("pass");
    expect(ev.linkedStatementTypes).toEqual(["balance_sheet"]);
  });

  it("passes when grant and asset deduction are present", () => {
    const ev = handleGrantPresentation(
      r,
      ctxWithMappings(["Government Grant", "Asset Deduction"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when grant mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Government Grant", "Deferred Income"]);
    ctx.mappings[0].status = "pending";
    ctx.mappings[1].status = "pending";
    const ev = handleGrantPresentation(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects deferred income via canonicalName", () => {
    const ctx = ctxWithMappings(["Government Grant", "Account 2001"]);
    ctx.mappings[1].canonicalName = "Deferred Grant Income";
    const ev = handleGrantPresentation(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic deferred income hint (إيراد مؤجل)", () => {
    const ev = handleGrantPresentation(
      r,
      ctxWithMappings(["منحة حكومية", "إيراد مؤجل"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleGrantDisclosure (IAS 20.39) ---

describe("handleGrantDisclosure", () => {
  const r = rule("grant-disclosure", { paragraphReference: "IAS 20.39" });

  it("skips when no government grant accounts are mapped", () => {
    const ev = handleGrantDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are grant accounts", () => {
    const ev = handleGrantDisclosure(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when grant present without disclosure and noteCount is zero", () => {
    const ev = handleGrantDisclosure(r, ctxWithMappings(["Government Grant"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("disclosure");
  });

  it("passes when grant disclosure account is present even with noteCount zero", () => {
    const ev = handleGrantDisclosure(
      r,
      ctxWithMappings(["Government Grant", "Grant Disclosure Policy"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("passes when no disclosure account but noteCount is greater than zero", () => {
    const ev = handleGrantDisclosure(r, ctxWithMappings(["Government Grant"], 3));
    expect(ev.status).toBe("pass");
  });

  it("skips when grant mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Government Grant"]);
    ctx.mappings[0].status = "pending";
    const ev = handleGrantDisclosure(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects Arabic grant hint (دعم حكومي)", () => {
    const ev = handleGrantDisclosure(r, ctxWithMappings(["دعم حكومي"], 2));
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("government-grants - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("grant-recognition", {
      ruleId: "ias20-012",
      standardCode: "IAS 20",
      paragraphReference: "IAS 20.12",
    });
    const ev = handleGrantRecognition(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias20-012");
    expect(ev.standardCode).toBe("IAS 20");
    expect(ev.paragraphReference).toBe("IAS 20.12");
    expect(ev.topic).toBe("grant-recognition");
  });
});

/**
 * Unit Test: IFRS Rule Checks - Related Party (IAS 24)
 *
 * Tests the four related party handlers directly:
 * - handleRpDisclosure (IAS 24.13)
 * - handleKmpCompensation (IAS 24.18)
 * - handleRpTransactions (IAS 24.21)
 * - handleArmLength (IAS 24.24)
 *
 * Pure function tests - no Prisma mocking required.
 */

import {
  handleRpDisclosure,
  handleKmpCompensation,
  handleRpTransactions,
  handleArmLength,
} from "@/lib/audit/rules/ifrs-rule-checks/related-party";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// --- Helpers ---

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: "test-" + topic,
    paragraphReference: "IAS 24.13",
    ruleText: "Test rule for " + topic,
    topic,
    standardCode: "IAS 24",
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

// --- handleRpDisclosure (IAS 24.13) ---

describe("handleRpDisclosure", () => {
  const r = rule("rp-disclosure", { paragraphReference: "IAS 24.13" });

  it("skips when no related party accounts are mapped", () => {
    const ev = handleRpDisclosure(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No related party");
  });

  it("skips when mappings exist but none are RP accounts", () => {
    const ev = handleRpDisclosure(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when RP present but noteCount is zero", () => {
    const ev = handleRpDisclosure(r, ctxWithMappings(["Related Party Receivable"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("disclosures");
  });

  it("passes when RP present and noteCount is greater than zero", () => {
    const ev = handleRpDisclosure(r, ctxWithMappings(["Related Party Payable"], 2));
    expect(ev.status).toBe("pass");
  });

  it("skips when RP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Related Party"]);
    ctx.mappings[0].status = "pending";
    const ev = handleRpDisclosure(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects RP via canonicalName (subsidiary)", () => {
    const ctx = ctxWithMappings(["Account 4001"]);
    ctx.mappings[0].canonicalName = "Subsidiary Investment";
    const ev = handleRpDisclosure(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic RP hint (أطراف ذات علاقة)", () => {
    const ev = handleRpDisclosure(r, ctxWithMappings(["ذمم أطراف ذات علاقة"], 1));
    expect(ev.status).toBe("pass");
  });
});

// --- handleKmpCompensation (IAS 24.18) ---

describe("handleKmpCompensation", () => {
  const r = rule("kmp-compensation", { paragraphReference: "IAS 24.18" });

  it("skips when no KMP accounts are mapped", () => {
    const ev = handleKmpCompensation(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are KMP accounts", () => {
    const ev = handleKmpCompensation(r, ctxWithMappings(["Sales", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("warns when KMP present but noteCount is zero", () => {
    const ev = handleKmpCompensation(r, ctxWithMappings(["Key Management Compensation"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("KMP");
  });

  it("passes when KMP present and noteCount is greater than zero", () => {
    const ev = handleKmpCompensation(r, ctxWithMappings(["Director Remuneration"], 1));
    expect(ev.status).toBe("pass");
  });

  it("skips when KMP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Director Fees"]);
    ctx.mappings[0].status = "pending";
    const ev = handleKmpCompensation(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects KMP via canonicalName (executive)", () => {
    const ctx = ctxWithMappings(["Account 5001"]);
    ctx.mappings[0].canonicalName = "Executive Compensation";
    const ev = handleKmpCompensation(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic KMP hint (إدارة العليا)", () => {
    const ev = handleKmpCompensation(r, ctxWithMappings(["تعويضات الإدارة العليا"], 2));
    expect(ev.status).toBe("pass");
  });
});

// --- handleRpTransactions (IAS 24.21) ---

describe("handleRpTransactions", () => {
  const r = rule("rp-transactions", { paragraphReference: "IAS 24.21" });

  it("skips when no RP transaction and no RP accounts are mapped", () => {
    const ev = handleRpTransactions(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are RP or RP transaction", () => {
    const ev = handleRpTransactions(r, ctxWithMappings(["Cash", "Inventory"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when RP present but no RP transaction accounts", () => {
    const ev = handleRpTransactions(r, ctxWithMappings(["Subsidiary Investment"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("transactions");
  });

  it("warns when RP transactions present but noteCount is zero", () => {
    const ev = handleRpTransactions(r, ctxWithMappings(["Intercompany Transaction"]));
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("disclosure");
  });

  it("passes when RP transactions present and noteCount is greater than zero", () => {
    const ev = handleRpTransactions(r, ctxWithMappings(["Due From Related Party"], 2));
    expect(ev.status).toBe("pass");
  });

  it("skips when RP transaction mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Related Party Transaction"]);
    ctx.mappings[0].status = "pending";
    const ev = handleRpTransactions(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects RP transaction via canonicalName (intercompany)", () => {
    const ctx = ctxWithMappings(["Account 6001"]);
    ctx.mappings[0].canonicalName = "Intercompany Loan";
    const ev = handleRpTransactions(r, ctx);
    expect(ev.status).toBe("warning");
  });

  it("detects Arabic RP transaction hint (معاملات أطراف ذات علاقة)", () => {
    const ev = handleRpTransactions(
      r,
      ctxWithMappings(["معاملات أطراف ذات علاقة"], 1),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- handleArmLength (IAS 24.24) ---

describe("handleArmLength", () => {
  const r = rule("arm-length", { paragraphReference: "IAS 24.24" });

  it("skips when no RP accounts are mapped", () => {
    const ev = handleArmLength(r, ctxWithMappings([]));
    expect(ev.status).toBe("skipped");
  });

  it("skips when mappings exist but none are RP", () => {
    const ev = handleArmLength(r, ctxWithMappings(["Cash", "Sales"]));
    expect(ev.status).toBe("skipped");
  });

  it("returns advisory when RP present but no arm's length terms", () => {
    const ev = handleArmLength(r, ctxWithMappings(["Related Party Transaction"]));
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("arm's length");
  });

  it("passes when arm's length terms are present", () => {
    const ev = handleArmLength(
      r,
      ctxWithMappings(["Related Party", "Arm's Length Terms"]),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when RP mapping is not confirmed", () => {
    const ctx = ctxWithMappings(["Related Party"]);
    ctx.mappings[0].status = "pending";
    const ev = handleArmLength(r, ctx);
    expect(ev.status).toBe("skipped");
  });

  it("detects arm's length via canonicalName (comparable terms)", () => {
    const ctx = ctxWithMappings(["Related Party", "Account 7001"]);
    ctx.mappings[1].canonicalName = "Comparable Terms";
    const ev = handleArmLength(r, ctx);
    expect(ev.status).toBe("pass");
  });

  it("detects Arabic arm's length hint (تنافسي)", () => {
    const ev = handleArmLength(
      r,
      ctxWithMappings(["أطراف ذات علاقة", "شروط تنافسية"]),
    );
    expect(ev.status).toBe("pass");
  });
});

// --- Rule metadata propagation ---

describe("related-party - rule metadata propagation", () => {
  it("carries rule metadata through the evaluation", () => {
    const r = rule("rp-disclosure", {
      ruleId: "ias24-013",
      standardCode: "IAS 24",
      paragraphReference: "IAS 24.13",
    });
    const ev = handleRpDisclosure(r, ctxWithMappings([]));
    expect(ev.ruleId).toBe("ias24-013");
    expect(ev.standardCode).toBe("IAS 24");
    expect(ev.paragraphReference).toBe("IAS 24.13");
    expect(ev.topic).toBe("rp-disclosure");
  });
});

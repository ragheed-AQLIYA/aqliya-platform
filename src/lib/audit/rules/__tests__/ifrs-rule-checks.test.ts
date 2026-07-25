/**
 * Unit Test: IFRS Rule Checks (AuditOS)
 *
 * Tests the evaluateIfrsRule dispatcher and all IFRS topic handlers:
 * complete-set, going-concern, revenue, leases, note-disclosure,
 * materiality, no-offsetting, oci-presentation, ppe, depreciation,
 * cash-flow, and default (unknown topic).
 *
 * Pure function tests — no Prisma mocking required.
 */

import { evaluateIfrsRule } from "@/lib/audit/rules/ifrs-rule-checks";
import type { IfrsKnowledgeRule } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

// ─── Helpers ────────────────────────────────────────────────────────

function rule(topic: string, overrides?: Partial<IfrsKnowledgeRule>): IfrsKnowledgeRule {
  return {
    ruleId: `test-${topic}`,
    paragraphReference: "IFRS X.Y",
    ruleText: `Test rule for ${topic}`,
    topic,
    standardCode: "IFRS 99",
    ...overrides,
  };
}

function ctx(overrides?: Partial<IfrsEvaluationContext>): IfrsEvaluationContext {
  return {
    engagementId: "eng-1",
    engagementStatus: "in_progress",
    reportingFramework: "ifrs",
    currencyCode: "SAR",
    statementTypes: ["income_statement", "balance_sheet", "equity", "cash_flow"],
    statements: [
      {
        statementType: "income_statement",
        lines: [
          { id: "is-1", statementId: "is", label: "Revenue", amount: 1_000_000, isTotal: true, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
          { id: "is-2", statementId: "is", label: "Net Profit", amount: 100_000, isTotal: true, indentLevel: 0, displayOrder: 2, linkedAccountMappings: [] },
        ],
      },
      {
        statementType: "balance_sheet",
        lines: [
          { id: "bs-1", statementId: "bs", label: "Assets", amount: 5_000_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
          { id: "bs-2", statementId: "bs", label: "Property, Plant & Equipment", amount: 2_000_000, isTotal: false, indentLevel: 1, displayOrder: 2, linkedAccountMappings: [] },
        ],
      },
      {
        statementType: "equity",
        lines: [
          { id: "eq-1", statementId: "eq", label: "Retained Earnings", amount: 500_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
        ],
      },
      {
        statementType: "cash_flow",
        lines: [
          { id: "cf-1", statementId: "cf", label: "OPERATING ACTIVITIES", amount: 200_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
        ],
      },
    ],
    mappings: [
      {
        sourceAccountCode: "4000",
        sourceAccountName: "Revenue",
        status: "confirmed",
        statementClassification: "Revenue",
        canonicalName: "Revenue",
        canonicalCategory: "Revenue",
      },
      {
        sourceAccountCode: "1500",
        sourceAccountName: "Property, Plant & Equipment",
        status: "confirmed",
        statementClassification: "PPE",
        canonicalName: "PPE",
        canonicalCategory: "PPE",
      },
    ],
    tbLines: [],
    disclosureNoteCount: 3,
    performanceMateriality: 50_000,
    ...overrides,
  };
}

// ─── Tests ──────────────────────────────────────────────────────────

describe("evaluateIfrsRule — complete-set", () => {
  it("passes when all core statements are present", () => {
    const ev = evaluateIfrsRule(rule("complete-set"), ctx());
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Complete set");
  });

  it("fails when core statements are missing", () => {
    const ev = evaluateIfrsRule(
      rule("complete-set"),
      ctx({ statementTypes: ["income_statement"] }),
    );
    expect(ev.status).toBe("fail");
    expect(ev.messageEn).toContain("Missing core");
  });

  it("warns when cash flow is missing", () => {
    const ev = evaluateIfrsRule(
      rule("complete-set"),
      ctx({ statementTypes: ["income_statement", "balance_sheet", "equity"] }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("cash flow");
  });
});

describe("evaluateIfrsRule — going-concern", () => {
  it("warns when engagement is in liquidation", () => {
    const ev = evaluateIfrsRule(
      rule("going-concern"),
      ctx({ engagementStatus: "liquidation" }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("liquidation");
  });

  it("returns advisory when no liquidation indicators", () => {
    const ev = evaluateIfrsRule(rule("going-concern"), ctx());
    expect(ev.status).toBe("advisory");
    expect(ev.messageEn).toContain("no liquidation indicators");
  });
});

describe("evaluateIfrsRule — revenue (IFRS 15)", () => {
  it("passes when revenue accounts are mapped", () => {
    const ev = evaluateIfrsRule(rule("five-step-model"), ctx());
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Revenue accounts mapped");
  });

  it("skips when no revenue accounts are mapped", () => {
    const ev = evaluateIfrsRule(
      rule("contract-identification"),
      ctx({ mappings: [] }),
    );
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No confirmed revenue accounts");
  });
});

describe("evaluateIfrsRule — leases (IFRS 16)", () => {
  it("passes when lease accounts are mapped", () => {
    const ev = evaluateIfrsRule(
      rule("lease-definition"),
      ctx({
        mappings: [
          {
            sourceAccountCode: "1700",
            sourceAccountName: "Right-of-Use Asset",
            status: "confirmed",
            statementClassification: "Lease",
            canonicalName: "ROU Asset",
            canonicalCategory: "Lease",
          },
        ],
      }),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("Lease-related");
  });

  it("passes on initial-recognition with lease accounts", () => {
    const ev = evaluateIfrsRule(
      rule("initial-recognition"),
      ctx({
        mappings: [
          {
            sourceAccountCode: "1700",
            sourceAccountName: "Lease Liability",
            status: "confirmed",
            statementClassification: "Lease",
            canonicalName: "Lease",
            canonicalCategory: "Lease",
          },
        ],
      }),
    );
    expect(ev.status).toBe("pass");
  });

  it("skips when no lease accounts exist", () => {
    const ev = evaluateIfrsRule(rule("rou-asset-measurement"), ctx({ mappings: [] }));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No lease accounts");
  });
});

describe("evaluateIfrsRule — note-disclosure", () => {
  it("warns when disclosure notes are missing", () => {
    const ev = evaluateIfrsRule(
      rule("note-disclosure"),
      ctx({ disclosureNoteCount: 0 }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("No disclosure notes");
  });

  it("passes when disclosure notes exist", () => {
    const ev = evaluateIfrsRule(
      rule("note-disclosure"),
      ctx({ disclosureNoteCount: 5 }),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("5 disclosure note(s)");
  });
});

describe("evaluateIfrsRule — materiality-presentation", () => {
  it("returns advisory when performance materiality is zero", () => {
    const ev = evaluateIfrsRule(
      rule("materiality-presentation"),
      ctx({ performanceMateriality: 0 }),
    );
    expect(ev.status).toBe("advisory");
  });

  it("returns advisory when performance materiality is not set", () => {
    const ev = evaluateIfrsRule(
      rule("materiality-presentation"),
      ctx({ performanceMateriality: undefined }),
    );
    expect(ev.status).toBe("advisory");
  });

  it("passes when lines are within threshold", () => {
    const ev = evaluateIfrsRule(
      rule("materiality-presentation"),
      ctx({ performanceMateriality: 10_000 }),
    );
    expect(ev.status).toBe("pass");
  });
});

describe("evaluateIfrsRule — no-offsetting (IAS 1)", () => {
  it("warns when negative asset lines exist", () => {
    const ev = evaluateIfrsRule(
      rule("no-offsetting"),
      ctx({
        statements: [
          {
            statementType: "balance_sheet",
            lines: [
              { id: "bs-n1", statementId: "bs", label: "Asset A", amount: -5_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
              { id: "bs-p1", statementId: "bs", label: "Liability X", amount: 10_000, isTotal: false, indentLevel: 0, displayOrder: 2, linkedAccountMappings: [] },
            ],
          },
        ],
      }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("negative asset");
  });

  it("passes when no negative asset lines exist", () => {
    const ev = evaluateIfrsRule(
      rule("no-offsetting"),
      ctx({
        statements: [
          {
            statementType: "balance_sheet",
            lines: [
              { id: "bs-p1", statementId: "bs", label: "Cash", amount: 50_000, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
            ],
          },
        ],
      }),
    );
    expect(ev.status).toBe("pass");
  });
});

describe("evaluateIfrsRule — oci-presentation", () => {
  it("always returns skipped (not modeled in v1)", () => {
    const ev = evaluateIfrsRule(rule("oci-presentation"), ctx());
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("OCI not modeled");
  });
});

describe("evaluateIfrsRule — PPE (IAS 16)", () => {
  it("passes when PPE accounts are mapped", () => {
    const ev = evaluateIfrsRule(rule("definition"), ctx());
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("PPE accounts present");
  });

  it("skips when no PPE accounts are mapped", () => {
    const ev = evaluateIfrsRule(
      rule("initial-measurement"),
      ctx({ mappings: [] }),
    );
    expect(ev.status).toBe("skipped");
  });

  it("warns on depreciation when PPE lacks accumulated depreciation", () => {
    const ev = evaluateIfrsRule(
      rule("depreciation"),
      ctx({
        mappings: [
          {
            sourceAccountCode: "1500",
            sourceAccountName: "Property, Plant & Equipment",
            status: "confirmed",
            statementClassification: "PPE",
            canonicalName: "PPE",
            canonicalCategory: "PPE",
          },
        ],
      }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("without accumulated depreciation");
  });

  it("passes depreciation when both PPE and depreciation exist", () => {
    const ev = evaluateIfrsRule(
      rule("depreciation"),
      ctx({
        mappings: [
          {
            sourceAccountCode: "1500",
            sourceAccountName: "Property, Plant & Equipment",
            status: "confirmed",
            statementClassification: "PPE",
            canonicalName: "PPE",
            canonicalCategory: "PPE",
          },
          {
            sourceAccountCode: "1600",
            sourceAccountName: "Accumulated Depreciation",
            status: "confirmed",
            statementClassification: "Depreciation",
            canonicalName: "Accum Dep",
            canonicalCategory: "Depreciation",
          },
        ],
      }),
    );
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("PPE and depreciation");
  });

  it("skips depreciation when no PPE at all", () => {
    const ev = evaluateIfrsRule(rule("depreciation"), ctx({ mappings: [] }));
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("No PPE");
  });
});

describe("evaluateIfrsRule — cash-flow (IAS 7)", () => {
  it("warns when no cash flow statement exists", () => {
    const ev = evaluateIfrsRule(
      rule("classification"),
      ctx({ statementTypes: ["income_statement", "balance_sheet", "equity"] }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("No cash flow statement");
  });

  it("warns when cash flow has no operating section", () => {
    const ev = evaluateIfrsRule(
      rule("operating-method"),
      ctx({
        statements: [
          {
            statementType: "cash_flow",
            lines: [
              { id: "cf-1", statementId: "cf", label: "Misc Items", amount: 100, isTotal: false, indentLevel: 0, displayOrder: 1, linkedAccountMappings: [] },
            ],
          },
        ],
      }),
    );
    expect(ev.status).toBe("warning");
    expect(ev.messageEn).toContain("missing operating");
  });

  it("passes when cash flow has operating section", () => {
    const ev = evaluateIfrsRule(rule("classification"), ctx());
    expect(ev.status).toBe("pass");
    expect(ev.messageEn).toContain("classified per IAS 7");
  });
});

describe("evaluateIfrsRule — unknown topic", () => {
  it("returns skipped for unsupported topics", () => {
    const ev = evaluateIfrsRule(rule("future-topic"), ctx());
    expect(ev.status).toBe("skipped");
    expect(ev.messageEn).toContain("not executable");
  });
});

import { evaluateIfrsRule } from "@/lib/audit/rules/ifrs-rule-checks";
import { buildDisclosureTriggersFromEvaluations } from "@/lib/audit/rules/disclosure-triggers";
import { isIfrsRulesEnabled, clearIfrsRulesCache } from "@/lib/audit/rules";
import { loadIfrsKnowledgeRules } from "@/lib/audit/rules/ifrs-rules-loader";
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks";

function baseContext(
  overrides?: Partial<IfrsEvaluationContext>,
): IfrsEvaluationContext {
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
          {
            id: "is-1",
            statementId: "is",
            label: "Net Profit",
            amount: 100_000,
            isTotal: true,
            indentLevel: 0,
            displayOrder: 1,
            linkedAccountMappings: [],
          },
          {
            id: "is-2",
            statementId: "is",
            label: "Revenue",
            amount: 1_000_000,
            isTotal: true,
            indentLevel: 0,
            displayOrder: 2,
            linkedAccountMappings: [],
          },
        ],
      },
      {
        statementType: "cash_flow",
        lines: [
          {
            id: "cf-1",
            statementId: "cf",
            label: "OPERATING ACTIVITIES",
            amount: 0,
            isTotal: false,
            indentLevel: 0,
            displayOrder: 1,
            linkedAccountMappings: [],
          },
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
    ],
    tbLines: [],
    disclosureNoteCount: 0,
    performanceMateriality: 50_000,
    ...overrides,
  };
}

describe("IFRS rules loader", () => {
  it("loads executable rules from knowledge packs", () => {
    clearIfrsRulesCache();
    const rules = loadIfrsKnowledgeRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((r) => r.standardCode.includes("IAS 1"))).toBe(true);
  });
});

describe("evaluateIfrsRule", () => {
  it("flags missing disclosure notes", () => {
    const rules = loadIfrsKnowledgeRules().filter((r) => r.topic === "note-disclosure");
    expect(rules.length).toBeGreaterThan(0);
    const ev = evaluateIfrsRule(rules[0]!, baseContext({ disclosureNoteCount: 0 }));
    expect(ev.status).toBe("warning");
  });

  it("passes revenue rules when revenue mapped", () => {
    const rules = loadIfrsKnowledgeRules().filter((r) => r.topic === "five-step-model");
    expect(rules.length).toBeGreaterThan(0);
    const ev = evaluateIfrsRule(rules[0]!, baseContext());
    expect(ev.status).toBe("pass");
  });

  it("builds disclosure triggers from warnings", () => {
    const ev = evaluateIfrsRule(
      {
        ruleId: "ias1-r005",
        paragraphReference: "IAS 1.54",
        ruleText: "disclose",
        topic: "note-disclosure",
        standardCode: "IAS 1",
      },
      baseContext({ disclosureNoteCount: 0 }),
    );
    const triggers = buildDisclosureTriggersFromEvaluations([ev]);
    expect(triggers.length).toBe(1);
    expect(triggers[0]?.suggestedTitle).toContain("Disclosure");
  });
});

describe("isIfrsRulesEnabled", () => {
  const prev = process.env.FF_AUDIT_IFRS_RULES;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_IFRS_RULES;
    else process.env.FF_AUDIT_IFRS_RULES = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_IFRS_RULES;
    expect(isIfrsRulesEnabled()).toBe(false);
  });
});

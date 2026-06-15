import {
  evaluateSocpaRule,
  isSocpaJurisdiction,
  type SocpaEvaluationContext,
} from "@/lib/audit/rules/socpa-rule-checks";
import { buildSocpaDisclosureTriggersFromEvaluations } from "@/lib/audit/rules/socpa-disclosure-triggers";
import {
  clearSocpaRulesCache,
  loadSocpaKnowledgeRules,
} from "@/lib/audit/rules/socpa-rules-loader";
import { isSocpaRulesEnabled } from "@/lib/audit/rules";

function saudiContext(
  overrides?: Partial<SocpaEvaluationContext>,
): SocpaEvaluationContext {
  return {
    engagementId: "eng-1",
    engagementStatus: "in_progress",
    reportingFramework: "ifrs_for_smes",
    currencyCode: "SAR",
    jurisdiction: "saudi-arabia",
    statementTypes: ["income_statement", "balance_sheet", "equity"],
    statements: [],
    mappings: [
      {
        sourceAccountCode: "5000",
        sourceAccountName: "Zakat provision",
        status: "confirmed",
        statementClassification: "Current Liabilities",
        canonicalName: "Zakat",
        canonicalCategory: "Liabilities",
      },
    ],
    disclosureNoteCount: 0,
    disclosureNotes: [],
    ...overrides,
  };
}

describe("SOCPA rules loader", () => {
  it("loads executable rules from socpa packs", () => {
    clearSocpaRulesCache();
    const rules = loadSocpaKnowledgeRules();
    expect(rules.length).toBeGreaterThan(0);
    expect(rules.some((r) => r.standardCode.includes("ZAKAT"))).toBe(true);
  });
});

describe("isSocpaJurisdiction", () => {
  it("detects SAR engagements", () => {
    expect(isSocpaJurisdiction(saudiContext())).toBe(true);
    expect(
      isSocpaJurisdiction(
        saudiContext({ currencyCode: "USD", jurisdiction: "other" }),
      ),
    ).toBe(false);
  });
});

describe("evaluateSocpaRule", () => {
  it("warns on zakat accounts without disclosure note", () => {
    const rules = loadSocpaKnowledgeRules().filter(
      (r) => r.topic === "zakat-presentation",
    );
    expect(rules.length).toBeGreaterThan(0);
    const ev = evaluateSocpaRule(rules[0]!, saudiContext());
    expect(ev.status).toBe("warning");
  });

  it("skips rules outside Saudi jurisdiction", () => {
    const rules = loadSocpaKnowledgeRules().filter(
      (r) => r.topic === "zakat-presentation",
    );
    const ev = evaluateSocpaRule(
      rules[0]!,
      saudiContext({ currencyCode: "USD", jurisdiction: "other" }),
    );
    expect(ev.status).toBe("skipped");
  });

  it("builds zakat disclosure triggers", () => {
    const triggers = buildSocpaDisclosureTriggersFromEvaluations([
      {
        ruleId: "socpa-zakat-tax-r001",
        standardCode: "SOCPA-ZAKAT-TAX",
        paragraphReference: "SOCPA-ZT-1",
        topic: "zakat-presentation",
        status: "warning",
        messageAr: "test",
        messageEn: "test",
      },
    ]);
    expect(triggers.length).toBe(1);
    expect(triggers[0]?.suggestedNoteType).toBe("zakat");
  });
});

describe("isSocpaRulesEnabled", () => {
  const prev = process.env.FF_AUDIT_SOCPA_RULES;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_SOCPA_RULES;
    else process.env.FF_AUDIT_SOCPA_RULES = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_SOCPA_RULES;
    expect(isSocpaRulesEnabled()).toBe(false);
  });
});

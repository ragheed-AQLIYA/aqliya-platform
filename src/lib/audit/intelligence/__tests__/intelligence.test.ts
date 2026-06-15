import {
  buildDeterministicEnrichmentSection,
  parseEnrichmentFromHandlerOutput,
} from "@/lib/audit/intelligence/enrichment-builder";
import { hasIntelligenceEnrichment } from "@/lib/audit/intelligence/types";
import { isAuditIntelligenceEnabled } from "@/lib/audit/intelligence";
import {
  extractRuleCitations,
  formatRuleCitationMarker,
} from "@/lib/audit/notes/disclosure-types";

describe("buildDeterministicEnrichmentSection", () => {
  it("includes citation anchors and review disclaimer", () => {
    const section = buildDeterministicEnrichmentSection({
      noteId: "n1",
      noteTitle: "Zakat and Income Tax",
      noteType: "tax",
      existingContent: "base",
      engagementLabel: "Acme — FY2024",
      citations: [
        {
          source: "socpa",
          ruleId: "socpa-zakat-tax-r001",
          standardCode: "SOCPA-ZAKAT-TAX",
        },
      ],
    });

    expect(section).toContain("SOCPA-ZAKAT-TAX");
    expect(section).toContain("reviewer approval");
    expect(hasIntelligenceEnrichment(section)).toBe(true);
  });
});

describe("parseEnrichmentFromHandlerOutput", () => {
  it("falls back to deterministic section on invalid JSON", () => {
    const input = {
      noteId: "n1",
      noteTitle: "Revenue",
      noteType: "revenue",
      existingContent: "",
      engagementLabel: "Test",
      citations: [
        { source: "ifrs" as const, ruleId: "r1", standardCode: "IFRS 15" },
      ],
    };
    const section = parseEnrichmentFromHandlerOutput("not-json", input, "v1");
    expect(section).toContain("IFRS 15");
  });
});

describe("rule citation markers", () => {
  it("round-trips citation markers", () => {
    const marker = formatRuleCitationMarker({
      source: "ifrs",
      ruleId: "ifrs15-r001",
      standardCode: "IFRS 15",
    });
    expect(extractRuleCitations([marker])).toHaveLength(1);
  });
});

describe("isAuditIntelligenceEnabled", () => {
  const original = process.env.FF_AUDIT_INTELLIGENCE;

  afterEach(() => {
    if (original === undefined) delete process.env.FF_AUDIT_INTELLIGENCE;
    else process.env.FF_AUDIT_INTELLIGENCE = original;
  });

  it("is off by default", () => {
    delete process.env.FF_AUDIT_INTELLIGENCE;
    expect(isAuditIntelligenceEnabled()).toBe(false);
  });

  it("is on when FF_AUDIT_INTELLIGENCE=true", () => {
    process.env.FF_AUDIT_INTELLIGENCE = "true";
    expect(isAuditIntelligenceEnabled()).toBe(true);
  });
});

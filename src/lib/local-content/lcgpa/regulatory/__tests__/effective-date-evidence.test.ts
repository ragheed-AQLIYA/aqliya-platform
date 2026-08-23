import {
  createEffectiveDateEvidence,
  deriveEvidenceFromDataset,
  detectEvidenceConflicts,
  renderEvidence,
  resolveEffectiveDate,
  supersedeEvidence,
  type EffectiveDateEvidence,
} from "../effective-date-evidence";
import { evaluateActivation } from "../effective-date";
import { activateDataset } from "../governance";
import { clockAt, product, steppingClock } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-08-22T00:00:00.000Z");

function evidence(over: Partial<Parameters<typeof createEffectiveDateEvidence>[0]> = {}) {
  return createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-minimum-lc-schedule",
      dateKind: "MINIMUM_LC_REQUIREMENT",
      scope: "DATASET",
      datasetVersion: "LCGPA_MINIMUM_LC_2026-07",
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "Stated in the July 2026 workbook.",
      recordedById: "user-reg-officer-1",
      ...over,
    },
    CLOCK,
  );
}

describe("LCGPA :: effective-date evidence must be attributable (P0.7)", () => {
  it("REFUSES a claim with no actor", () => {
    expect(() => evidence({ recordedById: "" })).toThrow(/EVIDENCE_ACTOR_REQUIRED/);
  });

  it("REFUSES a claim with no stated source", () => {
    expect(() => evidence({ evidence: "  " })).toThrow(/EVIDENCE_REQUIRED/);
  });

  it("REFUSES a date with no stated subject", () => {
    expect(() =>
      evidence({ dateKind: undefined as unknown as "MINIMUM_LC_REQUIREMENT" }),
    ).toThrow(/EVIDENCE_KIND_REQUIRED/);
  });

  it("REFUSES an invalid date", () => {
    expect(() => evidence({ effectiveFrom: new Date("nonsense") })).toThrow(
      /EVIDENCE_DATE_INVALID/,
    );
  });

  it("REFUSES product-scoped evidence that names no products", () => {
    expect(() => evidence({ scope: "PRODUCT", productCodes: [] })).toThrow(
      /EVIDENCE_SCOPE_MISMATCH/,
    );
  });

  it("REFUSES cohort-scoped evidence with no cohort label", () => {
    expect(() => evidence({ scope: "COHORT", cohortLabel: null })).toThrow(
      /EVIDENCE_SCOPE_MISMATCH/,
    );
  });

  it("is deterministic and renders for an operator", () => {
    expect(evidence().evidenceId).toBe(evidence().evidenceId);
    expect(evidence().evidenceId).toMatch(/^EDE-[0-9a-f]{16}$/);
    expect(renderEvidence(evidence())).toMatch(/confidence {4}VERIFIED/);
  });

  it("is superseded, never edited away", () => {
    const original = evidence();
    const superseded = supersedeEvidence(original, "EDE-newer", new Date("2026-09-01"));
    expect(superseded.supersededById).toBe("EDE-newer");
    expect(superseded.effectiveFrom).toEqual(original.effectiveFrom);
  });
});

describe("LCGPA :: deriving evidence from what the artifact itself states", () => {
  const dataset = makeDataset("LCGPA_MINIMUM_LC_2026-07", [
    product("2353", { effectiveFrom: new Date("2026-08-01T00:00:00.000Z") }),
    product("2354", { effectiveFrom: new Date("2026-08-01T00:00:00.000Z") }),
    product("2118", { effectiveFrom: new Date("2027-08-01T00:00:00.000Z") }),
    product("9999", { effectiveFrom: null }),
  ]);

  it("groups products by the date the artifact states, one record per cohort", () => {
    const derived = deriveEvidenceFromDataset(dataset, CLOCK, {
      dateKind: "MINIMUM_LC_REQUIREMENT",
    });
    expect(derived).toHaveLength(2);
    expect(derived[0].effectiveFrom.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(derived[0].productCodes).toEqual(["2353", "2354"]);
    expect(derived[1].productCodes).toEqual(["2118"]);
  });

  it("marks it VERIFIED and cites the artifact hash", () => {
    const derived = deriveEvidenceFromDataset(dataset, CLOCK, {
      dateKind: "MINIMUM_LC_REQUIREMENT",
      regime: "ALL",
    });
    expect(derived[0].confidence).toBe("VERIFIED");
    expect(derived[0].dateKind).toBe("MINIMUM_LC_REQUIREMENT");
    expect(derived[0].regime).toBe("ALL");
    expect(derived[0].artifactSha256).toBe(dataset.artifactSha256);
    expect(derived[0].evidence).toContain(dataset.artifactSha256);
  });

  it("says nothing about a product whose date the artifact omits", () => {
    const derived = deriveEvidenceFromDataset(dataset, CLOCK, {
      dateKind: "MINIMUM_LC_REQUIREMENT",
    });
    expect(derived.flatMap((d) => d.productCodes ?? [])).not.toContain("9999");
  });
});

describe("LCGPA :: resolving an effective date", () => {
  const artifactClaim = evidence({
    scope: "PRODUCT",
    productCodes: ["2353"],
    effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
    confidence: "VERIFIED",
    evidence: "Workbook row.",
  });
  const operatorClaim = evidence({
    sourceId: "lcgpa-mandatory-list-government",
    scope: "DATASET",
    effectiveFrom: new Date("2026-07-01T00:00:00.000Z"),
    confidence: "ASSERTED",
    evidence: "Operator note, ticket LC-1421.",
  });

  it("returns UNKNOWN when nothing is on record — never a guess", () => {
    const r = resolveEffectiveDate([], { productCode: "2353" });
    expect(r.effectiveFrom).toBeNull();
    expect(r.basis).toBe("UNKNOWN");
    expect(r.rationale).toMatch(/NO_EFFECTIVE_DATE_EVIDENCE/);
  });

  it("prefers the authority's own words over an operator's assertion", () => {
    const r = resolveEffectiveDate([operatorClaim, artifactClaim], {
      productCode: "2353",
      datasetVersion: "LCGPA_MINIMUM_LC_2026-07",
    });
    expect(r.confidence).toBe("VERIFIED");
    expect(r.basis).toBe("ARTIFACT_EVIDENCE");
    expect(r.effectiveFrom?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("falls back to operator evidence when the artifact says nothing", () => {
    const r = resolveEffectiveDate([operatorClaim], {
      datasetVersion: "LCGPA_MINIMUM_LC_2026-07",
    });
    expect(r.basis).toBe("OPERATOR_EVIDENCE");
    expect(r.confidence).toBe("ASSERTED");
  });

  it("IGNORES disputed evidence entirely", () => {
    const disputed = evidence({ confidence: "DISPUTED" });
    expect(resolveEffectiveDate([disputed], { datasetVersion: "LCGPA_MINIMUM_LC_2026-07" }).basis).toBe(
      "UNKNOWN",
    );
  });

  it("IGNORES superseded evidence", () => {
    const gone = supersedeEvidence(artifactClaim, "EDE-newer", new Date());
    expect(resolveEffectiveDate([gone], { productCode: "2353" }).basis).toBe("UNKNOWN");
  });

  it("does NOT apply a cohort claim to a product it never named", () => {
    const cohort = evidence({
      scope: "COHORT",
      cohortLabel: "1 أغسطس 2026م",
      datasetVersion: null,
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
    });
    expect(resolveEffectiveDate([cohort], { productCode: "2353" }).basis).toBe("UNKNOWN");
    expect(
      resolveEffectiveDate([cohort], { cohortLabel: "1 أغسطس 2026م" }).effectiveFrom?.toISOString(),
    ).toBe("2026-08-01T00:00:00.000Z");
  });
});

describe("LCGPA :: the 233-product cohort is not one fact", () => {
  // SPA N2514218 (2026-02-17) announced 233 products commencing 2026-08-01.
  const spaClaim = createEffectiveDateEvidence(
    {
      sourceId: "spa-lcgpa-announcements",
      dateKind: "MINIMUM_LC_REQUIREMENT",
      scope: "COHORT",
      cohortLabel: "SPA-N2514218-first-tranche",
      productCodes: ["2353", "2354", "2118"],
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      confidence: "CORROBORATED",
      evidence: "SPA announcement N2514218, 2026-02-17: 233 products from 1 August 2026.",
      recordedById: "user-reg-officer-1",
    },
    CLOCK,
  );

  // The July 2026 workbook states 2027-08-01 for product 2118.
  const workbookClaim = createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-minimum-lc-schedule",
      dateKind: "MINIMUM_LC_REQUIREMENT",
      artifactSha256: "acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f",
      datasetVersion: "LCGPA_MINIMUM_LC_2026-07",
      scope: "PRODUCT",
      productCodes: ["2118"],
      effectiveFrom: new Date("2027-08-01T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "تاريخ بدء إشتراط الحد الأدنى = 1 أغسطس 2027م in the July 2026 workbook.",
      recordedById: "system:lcgpa-regulatory-monitor",
    },
    CLOCK,
  );

  it("keeps the announcement and the workbook as two separate claims", () => {
    expect(spaClaim.sourceId).not.toBe(workbookClaim.sourceId);
    expect(spaClaim.confidence).toBe("CORROBORATED");
    expect(workbookClaim.confidence).toBe("VERIFIED");
  });

  it("SURFACES the disagreement instead of silently picking one", () => {
    const conflicts = detectEvidenceConflicts([spaClaim, workbookClaim]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].scopeKey).toContain("2118");
    expect(conflicts[0].detail).toMatch(/2026-08-01.*CORROBORATED/);
    expect(conflicts[0].detail).toMatch(/2027-08-01.*VERIFIED/);
  });

  it("lets the TIER 1 workbook win for the product it actually names", () => {
    const r = resolveEffectiveDate([spaClaim, workbookClaim], { productCode: "2118" });
    expect(r.effectiveFrom?.toISOString()).toBe("2027-08-01T00:00:00.000Z");
    expect(r.confidence).toBe("VERIFIED");
    expect(r.considered).toHaveLength(2);
  });

  it("raises no conflict where the two agree", () => {
    expect(detectEvidenceConflicts([spaClaim, spaClaim])).toHaveLength(0);
  });
});

describe("LCGPA :: activation rests on evidence, never on assumption", () => {
  const undated = makeDataset("LCGPA_MANDATORY_LIST_GOV_2026-07", [product("1")], {
    status: "PUBLISHED",
    effectiveFrom: null,
  });

  it("REFUSES to activate with no artifact date and no evidence", () => {
    const d = evaluateActivation(undated, new Date("2026-09-01T00:00:00.000Z"));
    expect(d.eligible).toBe(false);
    expect(d.reason).toMatch(/EFFECTIVE_DATE_UNKNOWN/);
    expect(d.reason).toMatch(/do not assume a date/);
    expect(d.basis).toBe("NONE");
  });

  it("activates on operator evidence and records where the date came from", () => {
    const operator = evidence({
      sourceId: "lcgpa-mandatory-list-government",
      dateKind: "MANDATORY_LIST_INCLUSION",
      datasetVersion: "LCGPA_MANDATORY_LIST_GOV_2026-07",
      scope: "DATASET",
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      confidence: "ASSERTED",
      evidence: "LCGPA letter ref 1447/ح/2210 confirming the July publication applies from 1 August 2026.",
    });
    const d = evaluateActivation(undated, new Date("2026-09-01T00:00:00.000Z"), [operator]);
    expect(d.eligible).toBe(true);
    expect(d.basis).toBe("OPERATOR_EVIDENCE");
    expect(d.evidenceId).toBe(operator.evidenceId);
    expect(d.reason).toMatch(/LCGPA letter ref/);
  });

  it("still waits when the evidenced date is in the future", () => {
    const future = evidence({
      dateKind: "MANDATORY_LIST_INCLUSION",
      datasetVersion: "LCGPA_MANDATORY_LIST_GOV_2026-07",
      effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
      confidence: "ASSERTED",
      evidence: "Operator record.",
    });
    const d = evaluateActivation(undated, new Date("2026-09-01T00:00:00.000Z"), [future]);
    expect(d.eligible).toBe(false);
    expect(d.reason).toMatch(/NOT_YET_EFFECTIVE/);
    expect(d.activateAt?.toISOString()).toBe("2027-01-01T00:00:00.000Z");
  });

  it("stamps the evidenced date onto the activated dataset", () => {
    const clock = steppingClock("2026-09-01T00:00:00.000Z", 1000);
    const operator = evidence({
      dateKind: "MANDATORY_LIST_INCLUSION",
      datasetVersion: "LCGPA_MANDATORY_LIST_GOV_2026-07",
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      confidence: "ASSERTED",
      evidence: "Operator record with LCGPA correspondence.",
    });
    const governanceCase = {
      caseId: "CASE-1",
      sourceId: "lcgpa-mandatory-list-government",
      artifactSha256: "a".repeat(64),
      datasetVersion: "LCGPA_MANDATORY_LIST_GOV_2026-07",
      diffId: null,
      impactId: null,
      state: "PUBLISHED" as const,
      history: [],
      createdAt: new Date("2026-08-25T00:00:00.000Z"),
      updatedAt: new Date("2026-08-25T00:00:00.000Z"),
      approval: {
        approvedById: "user-reg-officer-1",
        approvedByName: "Reg Officer",
        approvedAt: new Date("2026-08-25T00:00:00.000Z"),
        automatic: false,
        policyId: null,
        note: "approved",
      },
      rejection: null,
    };

    const result = activateDataset(undated, governanceCase, {
      actorId: "user-reg-officer-1",
      correlationId: "c",
      clock,
      currentActive: null,
      effectiveDateEvidence: [operator],
    });

    expect(result.ok).toBe(true);
    expect(result.activated?.effectiveFrom?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
    expect(result.activated?.status).toBe("ACTIVE");
  });
});


describe("LCGPA :: a different KIND of date is not a disagreement", () => {
  const inclusion = createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-mandatory-list-government",
      dateKind: "MANDATORY_LIST_INCLUSION",
      regime: "GOVERNMENT_ENTITIES",
      scope: "PRODUCT",
      productCodes: ["2353"],
      effectiveFrom: new Date("2019-12-09T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "تاريخ التطبيق in the Mandatory List.",
      recordedById: "system:lcgpa-regulatory-monitor",
    },
    CLOCK,
  );
  const minimum = createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-minimum-lc-schedule",
      dateKind: "MINIMUM_LC_REQUIREMENT",
      regime: "ALL",
      scope: "PRODUCT",
      productCodes: ["2353"],
      effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "تاريخ بدء إشتراط الحد الأدنى in the schedule.",
      recordedById: "system:lcgpa-regulatory-monitor",
    },
    CLOCK,
  );

  it("does NOT flag list-inclusion against minimum-LC commencement", () => {
    // The product joined the list in 2019 and its minimum binds from 2026.
    // Both are true; neither contradicts the other.
    expect(detectEvidenceConflicts([inclusion, minimum])).toHaveLength(0);
  });

  it("keeps the two answerable separately", () => {
    expect(
      resolveEffectiveDate([inclusion, minimum], {
        productCode: "2353",
        dateKind: "MANDATORY_LIST_INCLUSION",
      }).effectiveFrom?.toISOString(),
    ).toBe("2019-12-09T00:00:00.000Z");
    expect(
      resolveEffectiveDate([inclusion, minimum], {
        productCode: "2353",
        dateKind: "MINIMUM_LC_REQUIREMENT",
      }).effectiveFrom?.toISOString(),
    ).toBe("2026-08-01T00:00:00.000Z");
  });

  it("STILL flags two claims about the same kind and regime", () => {
    const rival = createEffectiveDateEvidence(
      {
        sourceId: "spa-lcgpa-announcements",
        dateKind: "MINIMUM_LC_REQUIREMENT",
        regime: "ALL",
        scope: "PRODUCT",
        productCodes: ["2353"],
        effectiveFrom: new Date("2027-08-01T00:00:00.000Z"),
        confidence: "CORROBORATED",
        evidence: "Announcement.",
        recordedById: "user-1",
      },
      CLOCK,
    );
    const conflicts = detectEvidenceConflicts([minimum, rival]);
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].scopeKey).toMatch(/^MINIMUM_LC_REQUIREMENT\//);
  });
});

describe("LCGPA :: different regimes are not a disagreement", () => {
  const gov = createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-mandatory-list-government",
      dateKind: "MANDATORY_LIST_INCLUSION",
      regime: "GOVERNMENT_ENTITIES",
      scope: "PRODUCT",
      productCodes: ["1"],
      effectiveFrom: new Date("2020-04-07T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "Government-entities list.",
      recordedById: "system:lcgpa-regulatory-monitor",
    },
    CLOCK,
  );
  const soc = createEffectiveDateEvidence(
    {
      sourceId: "lcgpa-mandatory-list-state-owned",
      dateKind: "MANDATORY_LIST_INCLUSION",
      regime: "STATE_OWNED_COMPANIES",
      scope: "PRODUCT",
      productCodes: ["1"],
      effectiveFrom: new Date("2022-12-18T00:00:00.000Z"),
      confidence: "VERIFIED",
      evidence: "State-owned-companies list.",
      recordedById: "system:lcgpa-regulatory-monitor",
    },
    CLOCK,
  );

  it("lets the same product commence on different dates under each regime", () => {
    expect(detectEvidenceConflicts([gov, soc])).toHaveLength(0);
  });

  it("answers per regime", () => {
    expect(
      resolveEffectiveDate([gov, soc], {
        productCode: "1",
        dateKind: "MANDATORY_LIST_INCLUSION",
        regime: "STATE_OWNED_COMPANIES",
      }).effectiveFrom?.toISOString(),
    ).toBe("2022-12-18T00:00:00.000Z");
  });
});

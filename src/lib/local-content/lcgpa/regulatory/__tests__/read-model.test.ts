import { buildReadModel, explainRegulatoryValue, renderExplanation } from "../read-model";
import { createGovernanceCase, approveCase, transitionCase, SYSTEM_PRINCIPAL } from "../governance";
import { createChangeJournal } from "../change-journal";
import { computeSemanticDiff } from "../semantic-diff";
import type { GovernanceCase, RegulatoryAlert, RegulatoryArtifact, SourceCheckResult } from "../types";
import { clockAt, product, steppingClock, tier1Source, verifiedTier1Source } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const NOW = new Date("2026-11-01T00:00:00.000Z");
const CLOCK = clockAt("2026-11-01T00:00:00.000Z");

const OLD = makeDataset("LCGPA_MANDATORY_LIST_2026-01", [product("P-00421", { minimumLcPct: 40 })], {
  status: "SUPERSEDED",
  effectiveFrom: new Date("2026-01-01T00:00:00.000Z"),
  effectiveTo: new Date("2026-10-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
});

const CURRENT = makeDataset(
  "LCGPA_MANDATORY_LIST_2026-08",
  [
    product("P-00421", {
      minimumLcPct: 50,
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    }),
  ],
  {
    status: "ACTIVE",
    effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    createdAt: new Date("2026-08-21T00:00:00.000Z"),
    activatedAt: new Date("2026-10-01T00:00:00.000Z"),
  },
);

const FUTURE = makeDataset(
  "LCGPA_MANDATORY_LIST_2027-01",
  [product("P-00421", { minimumLcPct: 55 })],
  {
    status: "APPROVED",
    effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
    createdAt: new Date("2026-11-01T00:00:00.000Z"),
  },
);

function approvedCase(): GovernanceCase {
  const clock = steppingClock("2026-09-01T00:00:00.000Z", 1000);
  let c = createGovernanceCase(
    {
      sourceId: "lcgpa-mandatory-list-documents",
      artifactSha256: CURRENT.artifactSha256,
      datasetVersion: CURRENT.datasetVersion,
      correlationId: "corr",
    },
    clock,
  );
  for (const to of ["VERIFIED", "PARSED", "DIFFED", "CLASSIFIED", "IMPACT_ANALYZED", "PENDING_REVIEW"] as const) {
    c = transitionCase(c, {
      to,
      actorId: SYSTEM_PRINCIPAL,
      reason: "advance",
      correlationId: "corr",
      clock,
    });
  }
  return approveCase(c, {
    actorId: "user-reg-officer-1",
    actorName: "Reg Officer",
    correlationId: "corr",
    clock,
    note: "Confirmed against the official artifact.",
  });
}

describe("LCGPA regulatory :: explainability (§36)", () => {
  it("reconstructs the full evidence chain behind a percentage", () => {
    const journal = createChangeJournal();
    const event = journal.append({
      source: verifiedTier1Source(),
      artifact: {
        sha256: CURRENT.artifactSha256,
        filename: "mandatory-list-2026-08.csv",
      } as RegulatoryArtifact,
      datasetVersion: CURRENT.datasetVersion,
      diff: computeSemanticDiff({ before: OLD, after: CURRENT, clock: CLOCK }),
      impact: null,
      governanceCase: approvedCase(),
      correlationId: "corr",
      clock: CLOCK,
    });

    const explanation = explainRegulatoryValue({
      datasets: [OLD, CURRENT, FUTURE],
      productCode: "P-00421",
      field: "minimumLcPct",
      asOf: NOW,
      journal: journal.list(),
      cases: [approvedCase()],
    });

    expect(explanation.outcome).toBe("RESOLVED");
    expect(explanation.value).toBe("50");
    expect(explanation.previousValue).toBe("40");
    expect(explanation.sourceAuthority).toBe("LCGPA");
    expect(explanation.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-08");
    expect(explanation.artifactSha256).toBe(CURRENT.artifactSha256);
    expect(explanation.effectiveFrom?.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(explanation.changeEventId).toBe(event.eventId);
    expect(explanation.approval?.approvedById).toBe("user-reg-officer-1");
    expect(explanation.approval?.automatic).toBe(false);
    expect(explanation.ruleVersion).toBe("2026-01");
  });

  it("renders the §36 operator answer", () => {
    const rendered = renderExplanation(
      explainRegulatoryValue({
        datasets: [OLD, CURRENT],
        productCode: "P-00421",
        asOf: NOW,
      }),
    );
    expect(rendered).toMatch(/Product: {10}P-00421/);
    expect(rendered).toMatch(/Value: {12}50/);
    expect(rendered).toMatch(/Source Authority: LCGPA/);
    expect(rendered).toMatch(/Rule Version: {5}2026-01/);
  });

  it("returns UNKNOWN with a rationale rather than a substituted value (§45)", () => {
    const explanation = explainRegulatoryValue({
      datasets: [OLD, CURRENT],
      productCode: "P-99999",
      asOf: NOW,
    });
    expect(explanation.outcome).toBe("UNKNOWN");
    expect(explanation.value).toBeNull();
    expect(explanation.rationale).toMatch(/PRODUCT_NOT_IN_FORCE/);
  });

  it("explains a historical value at a past date", () => {
    const explanation = explainRegulatoryValue({
      datasets: [OLD, CURRENT],
      productCode: "P-00421",
      asOf: new Date("2026-05-01T00:00:00.000Z"),
    });
    expect(explanation.value).toBe("40");
    expect(explanation.datasetVersion).toBe("LCGPA_MANDATORY_LIST_2026-01");
  });
});

describe("LCGPA regulatory :: dashboard read model (§38, §39)", () => {
  const checks: SourceCheckResult[] = [
    {
      checkId: "CHK-1",
      sourceId: "lcgpa-mandatory-list-documents",
      checkedAt: new Date("2026-10-31T02:00:00.000Z"),
      outcome: "SOURCE_UNAVAILABLE",
      httpStatus: 503,
      observedSha256: null,
      previousSha256: null,
      metadata: null,
      errorCode: "HTTP_503",
      errorMessage: "unavailable",
      nextCheckAt: new Date("2026-11-01T02:00:00.000Z"),
      attemptCount: 1,
      correlationId: "c",
    },
  ];

  const alerts: RegulatoryAlert[] = [
    {
      alertId: "ALERT-1",
      category: "MINIMUM_LC_CHANGED",
      severity: "CRITICAL",
      sourceId: "lcgpa-mandatory-list-documents",
      changeId: "CHG-1",
      summary: "P-00421 40 → 50",
      evidence: [],
      effectiveDate: new Date("2026-10-01T00:00:00.000Z"),
      impactLevel: "HIGH",
      recommendedAction: "review",
      createdAt: new Date("2026-08-21T00:00:00.000Z"),
      status: "OPEN",
    },
  ];

  it("reports current state, future changes and monitoring health", () => {
    const model = buildReadModel({
      sources: [verifiedTier1Source(), tier1Source({ id: "lcgpa-documents-library" })],
      datasets: [OLD, CURRENT, FUTURE],
      journal: [],
      cases: [],
      alerts,
      checks,
      now: NOW,
    });

    expect(model.currentState.dataset?.datasetVersion).toBe(
      "LCGPA_MANDATORY_LIST_2026-08",
    );
    expect(model.futureChanges.map((d) => d.datasetVersion)).toEqual([
      "LCGPA_MANDATORY_LIST_2027-01",
    ]);
    expect(model.monitoringHealth.totalSources).toBe(2);
    expect(model.monitoringHealth.authoritativeSourcesAwaitingVerification).toEqual([
      "lcgpa-documents-library",
    ]);
    expect(model.openAlerts).toHaveLength(1);
    expect(model.dataPipelineFailures[0].errorCode).toBe("HTTP_503");
    expect(model.sourceHealth.map((h) => h.sourceId)).toEqual([
      "lcgpa-documents-library",
      "lcgpa-mandatory-list-documents",
    ]);
  });

  it("surfaces pending reviews", () => {
    const clock = steppingClock("2026-09-01T00:00:00.000Z", 1000);
    let c = createGovernanceCase(
      {
        sourceId: "lcgpa-mandatory-list-documents",
        artifactSha256: "a".repeat(64),
        datasetVersion: "v",
        correlationId: "corr",
      },
      clock,
    );
    for (const to of ["VERIFIED", "PARSED", "DIFFED", "CLASSIFIED", "IMPACT_ANALYZED", "PENDING_REVIEW"] as const) {
      c = transitionCase(c, {
        to,
        actorId: SYSTEM_PRINCIPAL,
        reason: "advance",
        correlationId: "corr",
        clock,
      });
    }
    const model = buildReadModel({
      sources: [verifiedTier1Source()],
      datasets: [CURRENT],
      journal: [],
      cases: [c],
      alerts: [],
      checks: [],
      now: NOW,
    });
    expect(model.pendingReviews).toHaveLength(1);
  });
});

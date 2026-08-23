// ─── LCGPA Regulatory Intelligence :: end-to-end acceptance chain ───
//
// "615 tests passing" proves software behaviour, not regulatory correctness.
// This file encodes the acceptance chain itself, as one ordered walk:
//
//   PENDING_REVIEW
//     → a calculation CANNOT use the dataset
//     → human approval (a system principal is refused)
//     → published
//     → activation REFUSED while only cohort-scoped dates are on record
//     → dataset-scoped evidence recorded, with its basis
//     → ACTIVE, carrying the evidence id that justified the date
//     → a calculation binds to the EXACT dataset version, sha and parser
//     → an out-of-window product comes back UNKNOWN, never substituted
//     → the same calculation date reproduces the same binding, forever
//
// It runs against fixtures, not the database, so it is deterministic and can
// gate every build. The same walk was executed against a real PostgreSQL and
// the real July-2026 LCGPA artifacts; see docs/regulatory/LCGPA_RUNBOOK.md.

import {
  bindCalculation,
  canRecordCalculation,
} from "../calculation-binding";
import { createEffectiveDateEvidence } from "../effective-date-evidence";
import {
  SYSTEM_PRINCIPAL,
  activateDataset,
  approveCase,
  createGovernanceCase,
  publishDataset,
  requestReview,
  transitionCase,
} from "../governance";
import type { GovernanceCase } from "../types";
import { clockAt, product, steppingClock } from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const SOURCE_ID = "lcgpa-mandatory-list-documents";
const DATASET_VERSION = "LCGPA_MINIMUM_LC_sha-acceptance";
const SHA = "c".repeat(64);
const CORRELATION = "acceptance-chain";
const OPERATOR = { actorId: "user-reg-officer-1", actorName: "Reg Officer", correlationId: CORRELATION };

/** 2026-08-22 — after the first cohort's date, long before the 2028 one. */
const NOW = new Date("2026-08-22T00:00:00.000Z");
const IN_FORCE_FROM = new Date("2026-08-01T00:00:00.000Z");
const NOT_YET_FROM = new Date("2028-06-01T00:00:00.000Z");

const IN_FORCE = "2353";
const NOT_YET = "1";

function pendingReviewCase(clock = steppingClock("2026-08-22T00:00:00.000Z", 1000)): GovernanceCase {
  let c = createGovernanceCase(
    { sourceId: SOURCE_ID, artifactSha256: SHA, datasetVersion: DATASET_VERSION, correlationId: CORRELATION },
    clock,
  );
  for (const to of ["VERIFIED", "PARSED", "DIFFED", "CLASSIFIED", "IMPACT_ANALYZED"] as const) {
    c = transitionCase(c, { to, actorId: SYSTEM_PRINCIPAL, reason: `advance to ${to}`, correlationId: CORRELATION, clock });
  }
  return requestReview(c, "DIFF-1", "IMP-1", { ...OPERATOR, clock });
}

function draftDataset() {
  return makeDataset(
    DATASET_VERSION,
    [
      product(IN_FORCE, { minimumLcPct: 23, effectiveFrom: IN_FORCE_FROM }),
      product(NOT_YET, { minimumLcPct: 30, effectiveFrom: NOT_YET_FROM }),
    ],
    { sha256: SHA, status: "DRAFT", effectiveFrom: null, sourceId: SOURCE_ID },
  );
}

/** The workbook publishes per-cohort dates. It never states a dataset-level one. */
function cohortEvidence() {
  const clock = clockAt("2026-08-22T00:00:00.000Z");
  return [
    createEffectiveDateEvidence(
      {
        sourceId: SOURCE_ID,
        datasetVersion: DATASET_VERSION,
        dateKind: "MINIMUM_LC_REQUIREMENT",
        regime: "ALL",
        scope: "COHORT",
        cohortLabel: "minimum-lc-2026-08-01",
        effectiveFrom: IN_FORCE_FROM,
        confidence: "VERIFIED",
        evidence: "تاريخ بدء إشتراط الحد الأدنى = 1 أغسطس 2026, as printed in the workbook.",
        recordedById: "system:bootstrap",
      },
      clock,
    ),
    createEffectiveDateEvidence(
      {
        sourceId: SOURCE_ID,
        datasetVersion: DATASET_VERSION,
        dateKind: "MINIMUM_LC_REQUIREMENT",
        regime: "ALL",
        scope: "COHORT",
        cohortLabel: "minimum-lc-2028-06-01",
        effectiveFrom: NOT_YET_FROM,
        confidence: "VERIFIED",
        evidence: "تاريخ بدء إشتراط الحد الأدنى = 1 يونيو 2028, as printed in the workbook.",
        recordedById: "system:bootstrap",
      },
      clock,
    ),
  ];
}

function datasetScopedEvidence() {
  return createEffectiveDateEvidence(
    {
      sourceId: SOURCE_ID,
      datasetVersion: DATASET_VERSION,
      artifactSha256: SHA,
      dateKind: "MINIMUM_LC_REQUIREMENT",
      regime: "ALL",
      scope: "DATASET",
      effectiveFrom: IN_FORCE_FROM,
      confidence: "ASSERTED",
      evidence:
        "Regulatory officer decision: the earliest cohort in the workbook is taken as the date the dataset itself governs from.",
      note: "ASSERTED, not VERIFIED — the workbook states cohort dates, not a dataset-level one.",
      recordedById: OPERATOR.actorId,
    },
    clockAt("2026-08-22T01:00:00.000Z"),
  );
}

describe("LCGPA regulatory :: acceptance chain", () => {
  it("a PENDING_REVIEW dataset cannot be used by a calculation", () => {
    const binding = bindCalculation({
      datasets: [draftDataset()],
      calculationDate: NOW,
      productCodes: [IN_FORCE],
    });

    expect(binding.regulatoryDatasetVersion).toBeNull();
    const gate = canRecordCalculation(binding);
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toContain("REGULATORY_STATE_UNRESOLVED");
  });

  it("approval must be attributable to a human, not a system principal", () => {
    const clock = steppingClock("2026-08-22T00:00:00.000Z", 1000);
    expect(() =>
      approveCase(pendingReviewCase(clock), {
        actorId: SYSTEM_PRINCIPAL,
        correlationId: CORRELATION,
        clock,
        note: "auto",
      }),
    ).toThrow(/HUMAN_APPROVAL_REQUIRED/);
  });

  it("refuses to activate while only cohort-scoped dates are on record", () => {
    const clock = steppingClock("2026-08-22T00:00:00.000Z", 1000);
    const approved = approveCase(pendingReviewCase(clock), {
      ...OPERATOR,
      clock,
      note: "Reviewed the minimum-LC dataset.",
    });
    const published = publishDataset(draftDataset(), approved, { ...OPERATOR, clock });

    const decision = activateDataset(published.dataset, published.case, {
      ...OPERATOR,
      clock,
      currentActive: null,
      effectiveDateEvidence: cohortEvidence(),
    });

    expect(decision.ok).toBe(false);
    expect(decision.reason).toContain("EFFECTIVE_DATE_UNKNOWN");
    expect(decision.activated).toBeNull();
  });

  it("activates once dataset-scoped evidence exists, and records what justified the date", () => {
    const clock = steppingClock("2026-08-22T02:00:00.000Z", 1000);
    const approved = approveCase(pendingReviewCase(clock), {
      ...OPERATOR,
      clock,
      note: "Reviewed the minimum-LC dataset.",
    });
    const published = publishDataset(draftDataset(), approved, { ...OPERATOR, clock });
    const claim = datasetScopedEvidence();

    const decision = activateDataset(published.dataset, published.case, {
      ...OPERATOR,
      clock,
      currentActive: null,
      effectiveDateEvidence: [...cohortEvidence(), claim],
    });

    expect(decision.ok).toBe(true);
    expect(decision.activated?.status).toBe("ACTIVE");
    expect(decision.activated?.effectiveFrom).toEqual(IN_FORCE_FROM);
    expect(decision.reason).toContain("ASSERTED DATASET-scoped evidence");
    expect(decision.case.state).toBe("ACTIVE");
  });

  describe("once ACTIVE", () => {
    function activeDataset() {
      const clock = steppingClock("2026-08-22T02:00:00.000Z", 1000);
      const approved = approveCase(pendingReviewCase(clock), {
        ...OPERATOR,
        clock,
        note: "Reviewed the minimum-LC dataset.",
      });
      const published = publishDataset(draftDataset(), approved, { ...OPERATOR, clock });
      const decision = activateDataset(published.dataset, published.case, {
        ...OPERATOR,
        clock,
        currentActive: null,
        effectiveDateEvidence: [...cohortEvidence(), datasetScopedEvidence()],
      });
      if (!decision.activated) throw new Error("fixture: activation refused");
      return decision.activated;
    }

    it("binds a calculation to the exact dataset version, artifact and parser", () => {
      const dataset = activeDataset();
      const binding = bindCalculation({
        datasets: [dataset],
        calculationDate: NOW,
        productCodes: [IN_FORCE],
      });

      expect(binding.regulatoryDatasetVersion).toBe(DATASET_VERSION);
      expect(binding.regulatoryArtifactSha256).toBe(SHA);
      expect(binding.regulatoryParserVersion).toBe(dataset.parserVersion);
      expect(binding.regulatorySchemaVersion).toBe(dataset.schemaVersion);
      expect(binding.ruleVersion).toBe(dataset.ruleVersion);
      expect(canRecordCalculation(binding).allowed).toBe(true);
    });

    it("returns UNKNOWN for a product whose requirement has not started, and never substitutes a value", () => {
      const binding = bindCalculation({
        datasets: [activeDataset()],
        calculationDate: NOW,
        productCodes: [IN_FORCE, NOT_YET],
      });

      const notYet = binding.resolution.find((r) => r.productCode === NOT_YET);
      expect(notYet?.outcome).toBe("UNKNOWN");
      expect(notYet?.minimumLcPct).toBeNull();
      expect(notYet?.rationale).toContain("PRODUCT_NOT_YET_EFFECTIVE");

      const inForce = binding.resolution.find((r) => r.productCode === IN_FORCE);
      expect(inForce?.outcome).toBe("RESOLVED");
      expect(inForce?.minimumLcPct).toBe(23);
    });

    it("refuses to record an incompletely resolved calculation unless the policy says so", () => {
      const binding = bindCalculation({
        datasets: [activeDataset()],
        calculationDate: NOW,
        productCodes: [IN_FORCE, NOT_YET],
      });

      const strict = canRecordCalculation(binding);
      expect(strict.allowed).toBe(false);
      expect(strict.reason).toContain("PRODUCTS_UNRESOLVED");

      const permitted = canRecordCalculation(binding, { allowIncompleteResolution: true });
      expect(permitted.allowed).toBe(true);
      // The UNKNOWN is still carried, not dropped and not filled in.
      expect(binding.unresolved).toEqual([NOT_YET]);
    });

    it("reproduces the identical binding for the same calculation date", () => {
      const dataset = activeDataset();
      const request = { datasets: [dataset], productCodes: [IN_FORCE, NOT_YET] };

      const first = bindCalculation({ ...request, calculationDate: NOW });
      const second = bindCalculation({ ...request, calculationDate: new Date(NOW) });

      expect(second).toEqual(first);
    });

    it("gives a different answer for a date before the dataset was in force", () => {
      const dataset = activeDataset();
      const before = bindCalculation({
        datasets: [dataset],
        calculationDate: new Date("2026-07-31T00:00:00.000Z"),
        productCodes: [IN_FORCE],
      });

      expect(before.regulatoryDatasetVersion).toBeNull();
      expect(canRecordCalculation(before).allowed).toBe(false);
    });

    it("resolves the 2028 product once the calculation date reaches it", () => {
      const later = bindCalculation({
        datasets: [activeDataset()],
        calculationDate: new Date("2028-06-02T00:00:00.000Z"),
        productCodes: [NOT_YET],
      });

      const row = later.resolution.find((r) => r.productCode === NOT_YET);
      expect(row?.outcome).toBe("RESOLVED");
      expect(row?.minimumLcPct).toBe(30);
      expect(canRecordCalculation(later).allowed).toBe(true);
    });
  });
});

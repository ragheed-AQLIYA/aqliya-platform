import {
  buildConflictAlert,
  buildDiffAlerts,
  buildParserFailureAlert,
  buildSourceFailureAlert,
  buildValidationFailureAlert,
} from "../alerts";
import { createDiscoverySignal, detectConflicts } from "../conflict-detection";
import {
  createAuditTrail,
  createChangeJournal,
  renderChangeEvent,
} from "../change-journal";
import { computeSemanticDiff } from "../semantic-diff";
import { analyzeImpact } from "../impact-analysis";
import { createGovernanceCase } from "../governance";
import type { RegulatoryArtifact, SourceCheckResult } from "../types";
import {
  clockAt,
  ids,
  product,
  resolverReturning,
  steppingClock,
  tier2Source,
  tier4Source,
  verifiedTier1Source,
} from "./fixtures";
import { makeDataset } from "./dataset-helpers";

const CLOCK = clockAt("2026-09-01T02:00:00.000Z");
const SOURCE = verifiedTier1Source();

const LC_DIFF = computeSemanticDiff({
  before: makeDataset("v1", [product("P-00421", { minimumLcPct: 40 })]),
  after: makeDataset("v2", [
    product("P-00421", {
      minimumLcPct: 50,
      effectiveFrom: new Date("2026-10-01T00:00:00.000Z"),
    }),
  ]),
  clock: CLOCK,
});

function checkResult(overrides: Partial<SourceCheckResult> = {}): SourceCheckResult {
  return {
    checkId: "CHK-1",
    sourceId: SOURCE.id,
    checkedAt: new Date("2026-09-01T02:00:00.000Z"),
    outcome: "SOURCE_UNAVAILABLE",
    httpStatus: 503,
    observedSha256: null,
    previousSha256: null,
    metadata: null,
    errorCode: "HTTP_503",
    errorMessage: "service unavailable",
    nextCheckAt: new Date("2026-09-02T02:00:00.000Z"),
    attemptCount: 2,
    correlationId: "corr",
    ...overrides,
  };
}

describe("LCGPA regulatory :: alert engine (§23)", () => {
  it("raises a MINIMUM_LC_CHANGED alert carrying artifact evidence", () => {
    const alerts = buildDiffAlerts({ source: SOURCE, diff: LC_DIFF, impact: null, clock: CLOCK });
    const lcAlert = alerts.find((a) => a.category === "MINIMUM_LC_CHANGED");
    expect(lcAlert).toBeDefined();
    expect(lcAlert?.severity).toBe("CRITICAL");
    expect(lcAlert?.effectiveDate?.toISOString()).toBe("2026-10-01T00:00:00.000Z");
    expect(lcAlert?.evidence.join(" ")).toMatch(/artifactAfter=/);
    expect(lcAlert?.recommendedAction).toMatch(/Re-run affected calculations/);
    expect(lcAlert?.status).toBe("OPEN");
  });

  it("suppresses LOW-severity noise below the threshold", () => {
    const renameDiff = computeSemanticDiff({
      before: makeDataset("v1", [product("P-001", { productNameAr: "أ" })]),
      after: makeDataset("v2", [product("P-001", { productNameAr: "ب" })]),
      clock: CLOCK,
    });
    expect(buildDiffAlerts({ source: SOURCE, diff: renameDiff, impact: null, clock: CLOCK })).toHaveLength(0);
    expect(
      buildDiffAlerts({
        source: SOURCE,
        diff: renameDiff,
        impact: null,
        clock: CLOCK,
        minSeverity: "LOW",
      }),
    ).toHaveLength(1);
  });

  it("adds an IMPACT_HIGH alert when impact is HIGH or CRITICAL", async () => {
    const impact = await analyzeImpact({
      diff: LC_DIFF,
      resolver: resolverReturning({ calculationIds: ids("C", 14), tenderIds: ids("T", 3) }),
      clock: CLOCK,
    });
    const alerts = buildDiffAlerts({ source: SOURCE, diff: LC_DIFF, impact, clock: CLOCK });
    const high = alerts.find((a) => a.category === "IMPACT_HIGH");
    expect(high).toBeDefined();
    expect(high?.summary).toMatch(/14 calculation\(s\)/);
  });

  it("reduces a THIRD-PARTY source to POSSIBLE_CHANGE_DETECTED only (§30)", () => {
    const alerts = buildDiffAlerts({
      source: tier4Source(),
      diff: LC_DIFF,
      impact: null,
      clock: CLOCK,
    });
    expect(alerts).toHaveLength(1);
    expect(alerts[0].category).toBe("POSSIBLE_CHANGE_DETECTED");
    expect(alerts[0].severity).toBe("LOW");
    expect(alerts[0].recommendedAction).toMatch(/Do NOT update any registry/);
  });

  it("raises SOURCE_UNAVAILABLE without invalidating the active dataset (§26)", () => {
    const alert = buildSourceFailureAlert(SOURCE, checkResult(), CLOCK);
    expect(alert?.category).toBe("SOURCE_UNAVAILABLE");
    expect(alert?.summary).toMatch(/Active dataset remains in force/);
    expect(alert?.recommendedAction).toMatch(/must not be invalidated/);
  });

  it("distinguishes an authentication failure", () => {
    const alert = buildSourceFailureAlert(SOURCE, checkResult({ httpStatus: 403 }), CLOCK);
    expect(alert?.category).toBe("SOURCE_AUTHENTICATION_FAILURE");
  });

  it("returns null for a successful check", () => {
    expect(buildSourceFailureAlert(SOURCE, checkResult({ outcome: "NO_CHANGE" }), CLOCK)).toBeNull();
  });

  it("raises a PARSING_FAILURE that explicitly states the dataset was NOT updated (§28)", () => {
    const alert = buildParserFailureAlert(
      SOURCE,
      "b".repeat(64),
      "mandatory-list.xlsx",
      "MISSING_COLUMNS: code",
      CLOCK,
    );
    expect(alert.category).toBe("PARSING_FAILURE");
    expect(alert.summary).toMatch(/REGULATORY_DATA_PIPELINE_FAILURE/);
    expect(alert.evidence).toContain("datasetUpdated=false");
    expect(alert.evidence.join(" ")).toMatch(/b{64}/);
  });

  it("raises a DATA_VALIDATION_FAILURE for a quarantined artifact", () => {
    const alert = buildValidationFailureAlert(SOURCE, "c".repeat(64), ["MACRO_DETECTED"], CLOCK);
    expect(alert.category).toBe("DATA_VALIDATION_FAILURE");
    expect(alert.summary).toMatch(/QUARANTINED/);
  });
});

describe("LCGPA regulatory :: conflict detection (§29)", () => {
  const sourceB = { ...verifiedTier1Source(), id: "lcgpa-circulars", name: "LCGPA circulars" };

  it("records a conflict between two official sources without choosing", () => {
    const conflicts = detectConflicts({
      sourceA: SOURCE,
      datasetA: makeDataset("a", [product("P-00421", { minimumLcPct: 40 })]),
      sourceB,
      datasetB: makeDataset("b", [product("P-00421", { minimumLcPct: 50 })], {
        sourceId: "lcgpa-circulars",
      }),
      clock: CLOCK,
    });
    expect(conflicts).toHaveLength(1);
    expect(conflicts[0].resolution).toBe("PENDING_HUMAN_REVIEW");
    expect(conflicts[0].conflictingFields[0].field).toBe("minimumLcPct");
    expect(conflicts[0].conflictingFields[0].valueA).toBe("40");
    expect(conflicts[0].conflictingFields[0].valueB).toBe("50");
  });

  it("treats silence as silence, not disagreement", () => {
    const conflicts = detectConflicts({
      sourceA: SOURCE,
      datasetA: makeDataset("a", [product("P-1", { minimumLcPct: 40 })]),
      sourceB,
      datasetB: makeDataset("b", [product("P-1", { minimumLcPct: null })], {
        sourceId: "lcgpa-circulars",
      }),
      clock: CLOCK,
    });
    expect(conflicts).toHaveLength(0);
  });

  it("ignores products absent from one source", () => {
    const conflicts = detectConflicts({
      sourceA: SOURCE,
      datasetA: makeDataset("a", [product("P-1"), product("P-2")]),
      sourceB,
      datasetB: makeDataset("b", [product("P-1")], { sourceId: "lcgpa-circulars" }),
      clock: CLOCK,
    });
    expect(conflicts).toHaveLength(0);
  });

  it("NEVER treats third-party disagreement as a regulatory conflict (§30)", () => {
    const conflicts = detectConflicts({
      sourceA: SOURCE,
      datasetA: makeDataset("a", [product("P-1", { minimumLcPct: 40 })]),
      sourceB: tier4Source(),
      datasetB: makeDataset("b", [product("P-1", { minimumLcPct: 99 })], {
        sourceId: "third-party-tracker",
      }),
      clock: CLOCK,
    });
    expect(conflicts).toHaveLength(0);
  });

  it("builds a CRITICAL conflict alert with both artifacts", () => {
    const conflict = detectConflicts({
      sourceA: SOURCE,
      datasetA: makeDataset("a", [product("P-1", { minimumLcPct: 40 })]),
      sourceB,
      datasetB: makeDataset("b", [product("P-1", { minimumLcPct: 50 })], {
        sourceId: "lcgpa-circulars",
      }),
      clock: CLOCK,
    })[0];
    const alert = buildConflictAlert(conflict, CLOCK);
    expect(alert.severity).toBe("CRITICAL");
    expect(alert.recommendedAction).toMatch(/Do not select one/);
    expect(alert.evidence.join(" ")).toMatch(/artifactA=/);
  });
});

describe("LCGPA regulatory :: third-party discovery signals (§30)", () => {
  it("creates a signal that can never mutate authoritative state", () => {
    const signal = createDiscoverySignal(
      tier4Source(),
      "Reports 1,749 products on the mandatory list",
      ["lcgpa-mandatory-list-documents"],
      CLOCK,
    );
    expect(signal.canMutateAuthoritativeState).toBe(false);
    expect(signal.status).toBe("AWAITING_OFFICIAL_CONFIRMATION");
    expect(signal.requiresConfirmationFrom).toEqual(["lcgpa-mandatory-list-documents"]);
  });

  it("REFUSES to create a discovery signal from an official source", () => {
    expect(() => createDiscoverySignal(tier2Source(), "claim", [], CLOCK)).toThrow(
      /NOT_A_THIRD_PARTY_SOURCE/,
    );
  });
});

describe("LCGPA regulatory :: change journal (§34)", () => {
  const artifact = {
    sha256: "d".repeat(64),
    filename: "mandatory-list-2026-08.xlsx",
  } as RegulatoryArtifact;

  function journalInput(clock = steppingClock("2026-09-01T02:00:00.000Z", 1000)) {
    return {
      source: SOURCE,
      artifact,
      datasetVersion: "LCGPA_MANDATORY_LIST_2026-08",
      diff: LC_DIFF,
      impact: null,
      governanceCase: createGovernanceCase(
        {
          sourceId: SOURCE.id,
          artifactSha256: artifact.sha256,
          datasetVersion: "LCGPA_MANDATORY_LIST_2026-08",
          correlationId: "corr",
        },
        clock,
      ),
      correlationId: "corr",
      clock,
    };
  }

  it("assigns sequential CHANGE-YYYY-NNNNN identities", () => {
    const journal = createChangeJournal();
    const event = journal.append(journalInput());
    expect(event.eventId).toBe("CHANGE-2026-00001");
    expect(event.artifactSha256).toBe("d".repeat(64));
    expect(event.changeIds).toEqual(LC_DIFF.changes.map((c) => c.changeId));
  });

  it("is IDEMPOTENT for the same artifact and dataset (§32)", () => {
    const journal = createChangeJournal();
    const a = journal.append(journalInput());
    const b = journal.append(journalInput());
    expect(a.eventId).toBe(b.eventId);
    expect(journal.size()).toBe(1);
  });

  it("records a lifecycle update without losing the event", () => {
    const journal = createChangeJournal();
    const event = journal.append(journalInput());
    const updated = journal.update(event.eventId, {
      governanceState: "ACTIVE",
      activatedAt: new Date("2026-09-03T00:00:00.000Z"),
      impactLevel: "HIGH",
    });
    expect(updated?.governanceState).toBe("ACTIVE");
    expect(journal.get(event.eventId)?.activatedAt?.toISOString()).toBe(
      "2026-09-03T00:00:00.000Z",
    );
    expect(journal.size()).toBe(1);
  });

  it("lists scheduled future changes (§19)", () => {
    const journal = createChangeJournal();
    journal.append(journalInput());
    expect(journal.scheduled(new Date("2026-09-01T00:00:00.000Z"))).toHaveLength(1);
    expect(journal.scheduled(new Date("2027-01-01T00:00:00.000Z"))).toHaveLength(0);
  });

  it("renders the §34 operator view", () => {
    const journal = createChangeJournal();
    const rendered = renderChangeEvent(journal.append(journalInput()));
    expect(rendered).toMatch(/CHANGE-2026-00001/);
    expect(rendered).toMatch(/SHA: {8}d{64}/);
    expect(rendered).toMatch(/Effective: {2}2026-10-01/);
    expect(rendered).toMatch(/Activated: {2}\(not activated\)/);
  });
});

describe("LCGPA regulatory :: audit trail (§49)", () => {
  it("records actor, timestamp, entity, before, after, reason and correlation id", () => {
    const trail = createAuditTrail();
    const event = trail.record({
      action: "DATASET_ACTIVATED",
      actorId: "user-1",
      actorName: "Reg Officer",
      sourceId: SOURCE.id,
      entityType: "RegulatoryDataset",
      entityId: "DS-1",
      before: { status: "PUBLISHED" },
      after: { status: "ACTIVE" },
      reason: "Effective date reached",
      correlationId: "corr-9",
      clock: CLOCK,
    });
    expect(event.action).toBe("DATASET_ACTIVATED");
    expect(event.actorId).toBe("user-1");
    expect(event.before).toBe('{"status":"PUBLISHED"}');
    expect(event.after).toBe('{"status":"ACTIVE"}');
    expect(trail.byCorrelation("corr-9")).toHaveLength(1);
    expect(trail.byEntity("RegulatoryDataset", "DS-1")).toHaveLength(1);
  });

  it("REFUSES to record an unattributed operation", () => {
    const trail = createAuditTrail();
    expect(() =>
      trail.record({
        action: "DATASET_ACTIVATED",
        actorId: "",
        entityType: "x",
        entityId: "y",
        reason: "r",
        correlationId: "c",
        clock: CLOCK,
      }),
    ).toThrow(/AUDIT_ACTOR_REQUIRED/);
  });
});

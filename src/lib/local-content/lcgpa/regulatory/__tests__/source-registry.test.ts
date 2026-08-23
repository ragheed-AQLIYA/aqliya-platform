import {
  CHECK_INTERVAL_MS,
  FAILURE_TOLERANCE,
  SEED_SOURCE_INPUTS,
  applyCheckResult,
  assertCanUpdateAuthority,
  backoffMultiplier,
  buildSeedRegistry,
  buildSourceHealth,
  canUpdateAuthoritativeState,
  computeNextCheckAt,
  createSource,
  createSourceRegistry,
  isCorroborating,
  isDiscoveryOnly,
  isDueForCheck,
  quarantineSource,
  releaseQuarantine,
  selectDueSources,
  verifySource,
} from "../source-registry";
import type { SourceCheckResult } from "../types";
import { clockAt, tier1Source, tier2Source, tier4Source, verifiedTier1Source } from "./fixtures";

function checkResult(
  overrides: Partial<SourceCheckResult> & Pick<SourceCheckResult, "sourceId" | "outcome">,
): SourceCheckResult {
  return {
    checkId: "CHK-test",
    checkedAt: new Date("2026-08-21T02:00:00.000Z"),
    httpStatus: 200,
    observedSha256: null,
    previousSha256: null,
    metadata: null,
    errorCode: null,
    errorMessage: null,
    nextCheckAt: null,
    attemptCount: 1,
    correlationId: "corr-1",
    ...overrides,
  };
}

describe("LCGPA regulatory :: authority tiers (§4)", () => {
  it("registers every new source as UNVERIFIED", () => {
    expect(tier1Source().status).toBe("UNVERIFIED");
    expect(tier1Source().verification).toBeNull();
  });

  it("BLOCKS an unverified TIER 1 source from updating authoritative state", () => {
    const gate = canUpdateAuthoritativeState(tier1Source());
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/SOURCE_UNVERIFIED/);
  });

  it("ALLOWS a verified TIER 1 source", () => {
    const gate = canUpdateAuthoritativeState(verifiedTier1Source());
    expect(gate.allowed).toBe(true);
  });

  it("BLOCKS TIER 2 from updating authoritative state, however verified", () => {
    const verified = verifySource(tier2Source(), {
      verifiedById: "user-1",
      verifiedAt: new Date("2026-01-02T00:00:00.000Z"),
      evidence: "confirmed",
      confirmedUrl: "https://www.spa.gov.sa/en/N2514218",
    });
    const gate = canUpdateAuthoritativeState(verified);
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/TIER_2_NOT_AUTHORITATIVE/);
  });

  it("BLOCKS TIER 4 third-party sources entirely (§30)", () => {
    const gate = canUpdateAuthoritativeState(tier4Source());
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/TIER_4_NOT_AUTHORITATIVE/);
    expect(isDiscoveryOnly(tier4Source())).toBe(true);
  });

  it("classifies TIER 2 and TIER 3 as corroborating", () => {
    expect(isCorroborating(tier2Source())).toBe(true);
    expect(isCorroborating(tier1Source())).toBe(false);
  });

  it("BLOCKS a disabled TIER 1 source", () => {
    const gate = canUpdateAuthoritativeState(
      verifiedTier1Source({ enabled: false }),
    );
    expect(gate.reason).toMatch(/SOURCE_DISABLED/);
  });

  it("BLOCKS a quarantined TIER 1 source", () => {
    const gate = canUpdateAuthoritativeState(
      verifiedTier1Source({ status: "QUARANTINED" }),
    );
    expect(gate.reason).toMatch(/SOURCE_QUARANTINED/);
  });

  it("assertCanUpdateAuthority throws with the blocking reason", () => {
    expect(() => assertCanUpdateAuthority(tier1Source())).toThrow(
      /AUTHORITATIVE_INGESTION_BLOCKED.*SOURCE_UNVERIFIED/,
    );
    expect(() => assertCanUpdateAuthority(verifiedTier1Source())).not.toThrow();
  });
});

describe("LCGPA regulatory :: operator verification", () => {
  it("requires an authenticated verifier, evidence and a confirmed URL", () => {
    const base = {
      verifiedById: "user-1",
      verifiedAt: new Date("2026-01-02T00:00:00.000Z"),
      evidence: "e",
      confirmedUrl: "https://lcgpa.gov.sa/x.csv",
    };
    expect(() => verifySource(tier1Source(), { ...base, verifiedById: "" })).toThrow(
      /VERIFIER_MISSING/,
    );
    expect(() => verifySource(tier1Source(), { ...base, evidence: "" })).toThrow(
      /VERIFICATION_EVIDENCE_MISSING/,
    );
    expect(() => verifySource(tier1Source(), { ...base, confirmedUrl: "" })).toThrow(
      /CONFIRMED_URL_MISSING/,
    );
  });

  it("adopts the operator-confirmed URL as the monitored URL", () => {
    const verified = verifySource(tier1Source(), {
      verifiedById: "user-1",
      verifiedAt: new Date("2026-01-02T00:00:00.000Z"),
      evidence: "screenshot-123",
      confirmedUrl: "https://lcgpa.gov.sa/real/list-2026-08.xlsx",
    });
    expect(verified.url).toBe("https://lcgpa.gov.sa/real/list-2026-08.xlsx");
    expect(verified.status).toBe("HEALTHY");
  });
});

describe("LCGPA regulatory :: scheduling (§31)", () => {
  it("supports configurable frequencies and never hardcodes one interval", () => {
    expect(CHECK_INTERVAL_MS.HOURLY).toBe(3600_000);
    expect(CHECK_INTERVAL_MS.DAILY).toBe(86_400_000);
    expect(CHECK_INTERVAL_MS.WEEKLY).toBe(604_800_000);
    expect(CHECK_INTERVAL_MS.ON_DEMAND).toBeNull();
  });

  it("checks a never-checked source immediately", () => {
    expect(isDueForCheck(tier1Source(), new Date("2026-08-21T00:00:00Z"))).toBe(true);
  });

  it("does not schedule ON_DEMAND sources", () => {
    const onDemand = tier1Source({ checkFrequency: "ON_DEMAND" });
    expect(isDueForCheck(onDemand, new Date("2030-01-01T00:00:00Z"))).toBe(false);
    expect(computeNextCheckAt(onDemand, new Date())).toBeNull();
  });

  it("waits a full interval before the next check", () => {
    const checked = tier1Source({ lastCheckedAt: new Date("2026-08-21T02:00:00Z") });
    expect(isDueForCheck(checked, new Date("2026-08-21T12:00:00Z"))).toBe(false);
    expect(isDueForCheck(checked, new Date("2026-08-22T02:00:00Z"))).toBe(true);
  });

  it("applies exponential backoff while failing", () => {
    expect(backoffMultiplier(0)).toBe(1);
    expect(backoffMultiplier(1)).toBe(2);
    expect(backoffMultiplier(3)).toBe(8);
    expect(backoffMultiplier(10)).toBe(16);
  });

  it("selects due sources in deterministic id order", () => {
    const a = tier1Source({ id: "b-source" });
    const b = tier1Source({ id: "a-source" });
    expect(selectDueSources([a, b], new Date("2026-08-21T02:00:00Z")).map((s) => s.id)).toEqual([
      "a-source",
      "b-source",
    ]);
  });
});

describe("LCGPA regulatory :: check result application (§26, §27)", () => {
  it("records a first observation and keeps the hash", () => {
    const next = applyCheckResult(
      verifiedTier1Source(),
      checkResult({
        sourceId: "lcgpa-mandatory-list-documents",
        outcome: "FIRST_OBSERVATION",
        observedSha256: "a".repeat(64),
      }),
    );
    expect(next.lastArtifactHash).toBe("a".repeat(64));
    expect(next.status).toBe("HEALTHY");
    expect(next.consecutiveFailures).toBe(0);
  });

  it("NEVER clears the last known hash when a check fails (§26)", () => {
    const withHash = verifiedTier1Source({ lastArtifactHash: "a".repeat(64) });
    const next = applyCheckResult(
      withHash,
      checkResult({
        sourceId: withHash.id,
        outcome: "SOURCE_UNAVAILABLE",
        httpStatus: 503,
        errorCode: "HTTP_503",
      }),
    );
    expect(next.lastArtifactHash).toBe("a".repeat(64));
    expect(next.status).toBe("DEGRADED");
    expect(next.consecutiveFailures).toBe(1);
  });

  it("marks a source UNAVAILABLE only after the failure tolerance is exceeded", () => {
    let source = verifiedTier1Source();
    for (let i = 0; i < FAILURE_TOLERANCE; i++) {
      source = applyCheckResult(
        source,
        checkResult({ sourceId: source.id, outcome: "SOURCE_UNAVAILABLE" }),
      );
    }
    expect(source.consecutiveFailures).toBe(FAILURE_TOLERANCE);
    expect(source.status).toBe("UNAVAILABLE");
  });

  it("quarantines on an integrity failure (§27)", () => {
    const next = applyCheckResult(
      verifiedTier1Source(),
      checkResult({ sourceId: "x", outcome: "INTEGRITY_FAILURE" }),
    );
    expect(next.status).toBe("QUARANTINED");
  });

  it("keeps a source UNVERIFIED even after successful checks", () => {
    const next = applyCheckResult(
      tier1Source(),
      checkResult({
        sourceId: "x",
        outcome: "FIRST_OBSERVATION",
        observedSha256: "b".repeat(64),
      }),
    );
    expect(next.status).toBe("UNVERIFIED");
  });

  it("supports explicit quarantine and release", () => {
    const at = new Date("2026-08-22T00:00:00Z");
    const q = quarantineSource(verifiedTier1Source(), at);
    expect(q.status).toBe("QUARANTINED");
    expect(releaseQuarantine(q, at).status).toBe("HEALTHY");
  });
});

describe("LCGPA regulatory :: health read model (§39)", () => {
  it("reports status, last check, last change and next check", () => {
    const source = verifiedTier1Source({
      lastCheckedAt: new Date("2026-08-21T02:00:00Z"),
      lastSuccessfulCheckAt: new Date("2026-08-21T02:00:00Z"),
      lastArtifactHash: "c".repeat(64),
      status: "HEALTHY",
    });
    const health = buildSourceHealth(
      source,
      new Date("2026-08-10T02:00:00Z"),
      new Date("2026-08-21T03:00:00Z"),
    );
    expect(health.status).toBe("HEALTHY");
    expect(health.lastChangeAt?.toISOString()).toBe("2026-08-10T02:00:00.000Z");
    expect(health.nextCheckAt?.toISOString()).toBe("2026-08-22T02:00:00.000Z");
    expect(health.lastArtifactSha256).toBe("c".repeat(64));
  });
});

describe("LCGPA regulatory :: seed registry (evidence boundary)", () => {
  const registry = buildSeedRegistry(clockAt("2026-08-21T00:00:00.000Z"));

  it("registers the LCGPA mandatory-list source as TIER 1", () => {
    const source = registry.get("lcgpa-mandatory-list-documents");
    expect(source?.authorityTier).toBe(1);
    expect(source?.authority).toBe("LCGPA");
  });

  it("leaves EVERY TIER 1 source UNVERIFIED until an operator confirms it", () => {
    for (const source of registry.byTier(1)) {
      expect(source.status).toBe("UNVERIFIED");
      expect(canUpdateAuthoritativeState(source).allowed).toBe(false);
    }
  });

  it("exposes no authoritative sources before verification", () => {
    expect(registry.authoritative()).toHaveLength(0);
  });

  it("registers third-party sources as TIER 4 discovery-only", () => {
    for (const source of registry.byTier(4)) {
      expect(isDiscoveryOnly(source)).toBe(true);
    }
    expect(registry.byTier(4).length).toBeGreaterThan(0);
  });

  it("seeds only official LCGPA URLs at TIER 1", () => {
    for (const input of SEED_SOURCE_INPUTS.filter((s) => s.authorityTier === 1)) {
      expect(input.url).toMatch(/^https:\/\/lcgpa\.gov\.sa\//);
    }
  });

  it("seeds the three verified regulatory datasets as fingerprinted artifacts", () => {
    for (const id of [
      "lcgpa-mandatory-list-government",
      "lcgpa-mandatory-list-state-owned",
      "lcgpa-minimum-lc-schedule",
    ]) {
      const source = registry.get(id);
      expect(source).toBeDefined();
      expect(source?.authorityTier).toBe(1);
      expect(source?.sourceType).toBe("XLSX");
      expect(source?.monitoringMethod).toBe("FILE_FINGERPRINT");
      expect(source?.url).toMatch(/^https:\/\/lcgpa\.gov\.sa\/file\?guid=\d+&changedDate=\d+$/);
    }
  });

  it("no longer seeds the retired SharePoint paths", () => {
    for (const input of SEED_SOURCE_INPUTS) {
      expect(input.url).not.toMatch(/Pages\/default\.aspx|Docs-Lists|eservices/);
    }
  });
});

describe("LCGPA regulatory :: registry container", () => {
  it("lists sources in deterministic id order and upserts by id", () => {
    const registry = createSourceRegistry([tier1Source({ id: "z" }), tier1Source({ id: "a" })]);
    expect(registry.list().map((s) => s.id)).toEqual(["a", "z"]);
    registry.upsert(
      createSource(
        {
          id: "a",
          authority: "LCGPA",
          name: "renamed",
          description: "d",
          url: "https://lcgpa.gov.sa/a",
          sourceType: "CSV",
          authorityTier: 1,
          monitoringMethod: "HTTP_FETCH",
          checkFrequency: "DAILY",
        },
        clockAt("2026-08-21T00:00:00.000Z"),
      ),
    );
    expect(registry.list()).toHaveLength(2);
    expect(registry.get("a")?.name).toBe("renamed");
  });
});

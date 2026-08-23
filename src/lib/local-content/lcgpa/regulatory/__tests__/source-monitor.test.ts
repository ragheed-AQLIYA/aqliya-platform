import { checkSource, extractMetadata, runMonitorCycle, toFailureRecord } from "../source-monitor";
import { sha256 } from "../integrity";
import {
  clockAt,
  csvArtifact,
  csvRow,
  failedResource,
  okResource,
  sequenceFetcher,
  steppingClock,
  throwingFetcher,
  tier1Source,
  tier4Source,
  verifiedTier1Source,
} from "./fixtures";

const BODY_V1 = csvArtifact([csvRow("P-001")]);
const BODY_V2 = csvArtifact([csvRow("P-001", { minLc: "50" })]);

describe("LCGPA regulatory :: source check (§7)", () => {
  it("reports FIRST_OBSERVATION on the first successful check", async () => {
    const out = await checkSource({
      source: verifiedTier1Source(),
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("FIRST_OBSERVATION");
    expect(out.result.observedSha256).toBe(sha256(BODY_V1));
    expect(out.result.previousSha256).toBeNull();
    expect(out.source.lastArtifactHash).toBe(sha256(BODY_V1));
  });

  it("reports NO_CHANGE when the artifact is byte-identical", async () => {
    const source = verifiedTier1Source({
      lastArtifactHash: sha256(BODY_V1),
      lastCheckedAt: new Date("2026-08-20T02:00:00.000Z"),
    });
    const out = await checkSource({
      source,
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("NO_CHANGE");
    expect(out.result.observedSha256).toBe(out.result.previousSha256);
  });

  it("reports CHANGE_DETECTED when the content hash differs", async () => {
    const source = verifiedTier1Source({
      lastArtifactHash: sha256(BODY_V1),
      lastCheckedAt: new Date("2026-08-20T02:00:00.000Z"),
    });
    const out = await checkSource({
      source,
      fetcher: sequenceFetcher([okResource(BODY_V2)]),
      clock: clockAt("2026-09-01T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("CHANGE_DETECTED");
    expect(out.result.previousSha256).toBe(sha256(BODY_V1));
    expect(out.result.observedSha256).toBe(sha256(BODY_V2));
    expect(out.resource).not.toBeNull();
  });

  it("reports SOURCE_UNAVAILABLE on an HTTP failure and preserves the last hash", async () => {
    const source = verifiedTier1Source({
      lastArtifactHash: sha256(BODY_V1),
      lastCheckedAt: new Date("2026-08-20T02:00:00.000Z"),
    });
    const out = await checkSource({
      source,
      fetcher: sequenceFetcher([failedResource(503, "HTTP_503")]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("SOURCE_UNAVAILABLE");
    expect(out.result.errorCode).toBe("HTTP_503");
    expect(out.source.lastArtifactHash).toBe(sha256(BODY_V1));
    expect(out.source.status).toBe("DEGRADED");
  });

  it("reports SOURCE_UNAVAILABLE when the fetcher throws", async () => {
    const out = await checkSource({
      source: verifiedTier1Source(),
      fetcher: throwingFetcher("ECONNRESET"),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("SOURCE_UNAVAILABLE");
    expect(out.result.errorCode).toBe("FETCH_THREW");
    expect(out.result.errorMessage).toBe("ECONNRESET");
  });

  it("treats an empty body as unavailable, not as a change", async () => {
    const out = await checkSource({
      source: verifiedTier1Source({ lastArtifactHash: sha256(BODY_V1) }),
      fetcher: sequenceFetcher([okResource(Buffer.alloc(0))]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("SOURCE_UNAVAILABLE");
    expect(out.result.errorCode).toBe("EMPTY_BODY");
  });

  it("skips a disabled source", async () => {
    const out = await checkSource({
      source: verifiedTier1Source({ enabled: false }),
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(out.result.outcome).toBe("SKIPPED_DISABLED");
  });

  it("skips a source that is not yet due, unless forced", async () => {
    const source = verifiedTier1Source({
      lastCheckedAt: new Date("2026-08-21T01:00:00.000Z"),
    });
    const notDue = await checkSource({
      source,
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
    });
    expect(notDue.result.outcome).toBe("SKIPPED_NOT_DUE");

    const forced = await checkSource({
      source,
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr-1",
      force: true,
    });
    expect(forced.result.outcome).toBe("FIRST_OBSERVATION");
  });

  it("records response metadata but never uses it for identity (§6)", () => {
    const meta = extractMetadata(
      okResource(BODY_V1, {
        etag: 'W/"abc"',
        "last-modified": "Wed, 20 Aug 2026 00:00:00 GMT",
        "content-length": "123",
      }),
    );
    expect(meta.etag).toBe('W/"abc"');
    expect(meta.lastModified).toBe("Wed, 20 Aug 2026 00:00:00 GMT");
    expect(meta.contentLength).toBe(123);
  });
});

describe("LCGPA regulatory :: idempotency (§32)", () => {
  it("produces NO change event when the same artifact is fetched repeatedly", async () => {
    const fetcher = sequenceFetcher([okResource(BODY_V1)]);
    let source = verifiedTier1Source();
    const outcomes: string[] = [];
    for (let i = 0; i < 4; i++) {
      const out = await checkSource({
        source,
        fetcher,
        clock: clockAt(`2026-08-2${i + 1}T02:00:00.000Z`),
        correlationId: "corr",
        force: true,
      });
      outcomes.push(out.result.outcome);
      source = out.source;
    }
    expect(outcomes).toEqual([
      "FIRST_OBSERVATION",
      "NO_CHANGE",
      "NO_CHANGE",
      "NO_CHANGE",
    ]);
  });
});

describe("LCGPA regulatory :: monitor cycle", () => {
  it("processes only due sources and returns every source in id order", async () => {
    const sources = [
      verifiedTier1Source({ id: "b-src" }),
      verifiedTier1Source({
        id: "a-src",
        lastCheckedAt: new Date("2026-08-21T01:00:00.000Z"),
      }),
    ];
    const cycle = await runMonitorCycle({
      sources,
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: steppingClock("2026-08-21T02:00:00.000Z", 0),
      correlationId: "cycle-1",
    });
    expect(cycle.results.map((r) => r.sourceId)).toEqual(["b-src"]);
    expect(cycle.sources.map((s) => s.id)).toEqual(["a-src", "b-src"]);
    expect(cycle.changed).toHaveLength(1);
  });

  it("does not mark a TIER 4 source as authoritative even when it changes", async () => {
    const cycle = await runMonitorCycle({
      sources: [tier4Source()],
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: steppingClock("2026-08-21T02:00:00.000Z", 0),
      correlationId: "cycle-2",
    });
    expect(cycle.changed).toHaveLength(1);
    expect(cycle.sources[0].authorityTier).toBe(4);
  });

  it("keeps unverified sources monitorable but non-authoritative", async () => {
    const cycle = await runMonitorCycle({
      sources: [tier1Source()],
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: steppingClock("2026-08-21T02:00:00.000Z", 0),
      correlationId: "cycle-3",
    });
    expect(cycle.results[0].outcome).toBe("FIRST_OBSERVATION");
    expect(cycle.sources[0].status).toBe("UNVERIFIED");
  });
});

describe("LCGPA regulatory :: failure records (§26)", () => {
  it("builds a retryable failure record", async () => {
    const out = await checkSource({
      source: verifiedTier1Source(),
      fetcher: sequenceFetcher([failedResource(500, "HTTP_500", "boom")]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr",
    });
    const record = toFailureRecord(out.result);
    expect(record).not.toBeNull();
    expect(record?.errorCode).toBe("HTTP_500");
    expect(record?.attemptCount).toBe(1);
    expect(record?.retryAt).not.toBeNull();
  });

  it("returns null for a successful check", async () => {
    const out = await checkSource({
      source: verifiedTier1Source(),
      fetcher: sequenceFetcher([okResource(BODY_V1)]),
      clock: clockAt("2026-08-21T02:00:00.000Z"),
      correlationId: "corr",
    });
    expect(toFailureRecord(out.result)).toBeNull();
  });
});

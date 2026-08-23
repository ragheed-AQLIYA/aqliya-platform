import {
  createRegulatoryEngineContext,
  ingestChangedSource,
  runRegulatoryCycle,
} from "../pipeline";
import { createDelimitedParser, createParserRegistry } from "../parser";
import { DEFAULT_AUTO_APPROVAL_POLICY } from "../governance";
import { datasetFingerprint } from "../versioning";
import { sha256 } from "../integrity";
import type { Clock, RegulatorySource } from "../types";
import {
  CSV_MAPPING,
  csvArtifact,
  csvRow,
  failedResource,
  ids,
  makeZip,
  okResource,
  resolverReturning,
  sequenceFetcher,
  steppingClock,
  tier1Source,
  tier4Source,
  verifiedTier1Source,
} from "./fixtures";

const V1 = csvArtifact([csvRow("P-00421", { minLc: "40" }), csvRow("P-00422")]);
const V2 = csvArtifact([
  csvRow("P-00421", { minLc: "50", from: "2026-10-01" }),
  csvRow("P-00422"),
  csvRow("P-00423"),
]);

const DOCUMENT = {
  titleAr: "القائمة الإلزامية للمنتجات الوطنية",
  titleEn: "Mandatory List of National Products",
  documentType: "MANDATORY_LIST" as const,
};

function ctxWith(options: {
  bodies: Parameters<typeof okResource>[0][];
  clock?: Clock;
  affected?: Parameters<typeof resolverReturning>[0];
  registerParser?: boolean;
  sourceId?: string;
}) {
  const parsers = createParserRegistry();
  if (options.registerParser !== false) {
    parsers.register(
      options.sourceId ?? "lcgpa-mandatory-list-documents",
      createDelimitedParser({ mapping: CSV_MAPPING }),
    );
  }
  return createRegulatoryEngineContext({
    fetcher: sequenceFetcher(options.bodies.map((b) => okResource(b))),
    clock: options.clock ?? steppingClock("2026-09-01T02:00:00.000Z", 1000),
    impactResolver: resolverReturning(options.affected ?? {}),
    parsers,
    autoApprovalPolicy: DEFAULT_AUTO_APPROVAL_POLICY,
  });
}

async function firstCycle(source: RegulatorySource, bodies: Buffer[], affected = {}) {
  const ctx = ctxWith({ bodies, affected, sourceId: source.id });
  const out = await runRegulatoryCycle({
    ctx,
    sources: [source],
    correlationId: "cycle-1",
    datasetKey: "LCGPA_MANDATORY_LIST",
    document: DOCUMENT,
    force: true,
  });
  return { ctx, out };
}

describe("LCGPA regulatory :: end-to-end pipeline (§53)", () => {
  it("stops at PENDING_REVIEW — it NEVER activates on its own (§25)", async () => {
    const { out } = await firstCycle(verifiedTier1Source(), [V1], {
      calculationIds: ids("C", 14),
      tenderIds: ids("T", 3),
      supplierIds: ids("S", 7),
    });
    expect(out.results).toHaveLength(1);
    const result = out.results[0];
    expect(result.outcome).toBe("PENDING_REVIEW");
    expect(result.governanceCase?.state).toBe("PENDING_REVIEW");
    expect(result.dataset?.status).toBe("DRAFT");
    expect(result.dataset?.activatedAt).toBeNull();
  });

  it("captures the artifact with a SHA-256 and complete provenance (§10, §11)", async () => {
    const { out } = await firstCycle(verifiedTier1Source(), [V1]);
    const result = out.results[0];
    expect(result.artifact?.sha256).toBe(sha256(V1));
    expect(result.dataset?.provenance.artifactSha256).toBe(sha256(V1));
    expect(result.dataset?.provenance.sourceAuthority).toBe("LCGPA");
    expect(result.dataset?.provenance.ruleVersion).toBe("2026-01");
    expect(result.dataset?.provenance.parserVersion).toBeTruthy();
  });

  it("produces a full diff, impact assessment, alerts and journal entry", async () => {
    const ctx = ctxWith({
      bodies: [V1, V2],
      affected: { calculationIds: ids("C", 14), tenderIds: ids("T", 3) },
    });
    let sources = [verifiedTier1Source()];

    const first = await runRegulatoryCycle({
      ctx,
      sources,
      correlationId: "c1",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
      force: true,
    });
    sources = first.sources;
    // Approve + activate the first dataset so the second diff has a baseline.
    const firstDataset = first.results[0].dataset!;
    ctx.datasets.update({ ...firstDataset, status: "ACTIVE", activatedAt: new Date() });

    const second = await runRegulatoryCycle({
      ctx,
      sources,
      correlationId: "c2",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
      force: true,
    });

    const result = second.results[0];
    expect(result.diff?.summary.added).toBe(1);
    expect(
      result.diff?.changes.some((c) => c.changeType === "MINIMUM_LC_CHANGED"),
    ).toBe(true);
    expect(result.impact?.estimatedScope.calculations).toBe(14);
    expect(result.impact?.impactLevel).toBe("HIGH");
    expect(result.alerts.some((a) => a.category === "MINIMUM_LC_CHANGED")).toBe(true);
    expect(result.changeEvent?.eventId).toMatch(/^CHANGE-\d{4}-\d{5}$/);
  });

  it("is IDEMPOTENT: re-running against unchanged bytes produces no new work (§32)", async () => {
    const ctx = ctxWith({ bodies: [V1] });
    let sources = [verifiedTier1Source()];
    for (let i = 0; i < 3; i++) {
      const out = await runRegulatoryCycle({
        ctx,
        sources,
        correlationId: `c${i}`,
        datasetKey: "LCGPA_MANDATORY_LIST",
        document: DOCUMENT,
        force: true,
      });
      sources = out.sources;
    }
    expect(ctx.artifacts.size()).toBe(1);
    expect(ctx.datasets.list()).toHaveLength(1);
    expect(ctx.journal.size()).toBe(1);
  });
});

describe("LCGPA regulatory :: pipeline blockers", () => {
  it("BLOCKS an unverified TIER 1 source at the authority gate", async () => {
    const { out } = await firstCycle(tier1Source(), [V1]);
    expect(out.results[0].outcome).toBe("AUTHORITATIVE_INGESTION_BLOCKED");
    expect(out.results[0].blocker).toMatch(/SOURCE_UNVERIFIED/);
    expect(out.results[0].dataset).toBeNull();
  });

  it("BLOCKS a third-party source as DISCOVERY_SIGNAL_ONLY (§30)", async () => {
    const { out } = await firstCycle(tier4Source(), [V1]);
    expect(out.results[0].outcome).toBe("DISCOVERY_SIGNAL_ONLY");
    expect(out.results[0].dataset).toBeNull();
  });

  it("QUARANTINES a macro-enabled artifact and creates no dataset (§27, §41)", async () => {
    const macroZip = makeZip([
      { name: "[Content_Types].xml", content: "<Types/>" },
      { name: "xl/vbaProject.bin", content: "payload" },
    ]);
    const parsers = createParserRegistry();
    parsers.register(
      "lcgpa-mandatory-list-documents",
      createDelimitedParser({ mapping: CSV_MAPPING }),
    );
    const ctx = createRegulatoryEngineContext({
      fetcher: sequenceFetcher([
        okResource(
          macroZip,
          {
            "content-type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          },
          "https://lcgpa.gov.sa/list.xlsx",
        ),
      ]),
      clock: steppingClock("2026-09-01T02:00:00.000Z", 1000),
      impactResolver: resolverReturning({}),
      parsers,
    });
    const out = await runRegulatoryCycle({
      ctx,
      sources: [verifiedTier1Source()],
      correlationId: "c",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
      force: true,
    });
    expect(out.results[0].outcome).toBe("ARTIFACT_QUARANTINED");
    expect(out.results[0].alerts[0].category).toBe("DATA_VALIDATION_FAILURE");
    expect(ctx.datasets.list()).toHaveLength(0);
  });

  it("REPORTS a parser failure without marking the dataset updated (§28)", async () => {
    const { out } = await firstCycle(verifiedTier1Source(), [
      Buffer.from("wrong,headers\n1,2", "utf8"),
    ]);
    const result = out.results[0];
    expect(result.outcome).toBe("PARSER_FAILED");
    expect(result.blocker).toMatch(/REGULATORY_DATA_PIPELINE_FAILURE/);
    expect(result.blocker).toMatch(/MISSING_COLUMNS/);
    expect(result.dataset).toBeNull();
    expect(result.governanceCase?.state).toBe("FAILED");
    expect(result.alerts[0].evidence).toContain("datasetUpdated=false");
  });

  it("FAILS CLOSED when no parser is registered (evidence boundary, §45)", async () => {
    const ctx = ctxWith({ bodies: [V1], registerParser: false });
    const out = await runRegulatoryCycle({
      ctx,
      sources: [verifiedTier1Source()],
      correlationId: "c",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
      force: true,
    });
    expect(out.results[0].outcome).toBe("PARSER_FAILED");
    expect(out.results[0].blocker).toMatch(/EVIDENCE_BOUNDARY/);
  });

  it("raises a source-failure alert and keeps the active dataset (§26)", async () => {
    const parsers = createParserRegistry();
    parsers.register(
      "lcgpa-mandatory-list-documents",
      createDelimitedParser({ mapping: CSV_MAPPING }),
    );
    const ctx = createRegulatoryEngineContext({
      fetcher: sequenceFetcher([failedResource(503, "HTTP_503")]),
      clock: steppingClock("2026-09-01T02:00:00.000Z", 1000),
      impactResolver: resolverReturning({}),
      parsers,
    });
    const source = verifiedTier1Source({ lastArtifactHash: sha256(V1) });
    const out = await runRegulatoryCycle({
      ctx,
      sources: [source],
      correlationId: "c",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
      force: true,
    });
    expect(out.checks[0].outcome).toBe("SOURCE_UNAVAILABLE");
    expect(out.alerts.some((a) => a.category === "SOURCE_UNAVAILABLE")).toBe(true);
    expect(out.sources[0].lastArtifactHash).toBe(sha256(V1));
  });
});

describe("LCGPA regulatory :: audit and observability wiring (§40, §49)", () => {
  it("emits an auditable event for every pipeline stage", async () => {
    const { ctx } = await firstCycle(verifiedTier1Source(), [V1]);
    const actions = ctx.audit.list().map((e) => e.action);
    expect(actions).toEqual(
      expect.arrayContaining([
        "SOURCE_CHECKED",
        "ARTIFACT_ACQUIRED",
        "ARTIFACT_VERIFIED",
        "DATASET_CREATED",
        "CHANGE_DETECTED",
        "CHANGE_CLASSIFIED",
        "IMPACT_ANALYZED",
        "REVIEW_REQUESTED",
      ]),
    );
    for (const event of ctx.audit.list()) {
      expect(event.actorId).toBeTruthy();
      expect(event.correlationId).toBeTruthy();
      expect(event.timestamp).toBeInstanceOf(Date);
    }
  });

  it("records the §40 metric counters", async () => {
    const { ctx } = await firstCycle(verifiedTier1Source(), [V1]);
    const snapshot = ctx.metrics.snapshot();
    const keys = Object.keys(snapshot).join(" ");
    expect(keys).toMatch(/source_check_total/);
    expect(keys).toMatch(/artifact_acquired_total/);
    expect(keys).toMatch(/regulatory_change_total/);
  });
});

describe("LCGPA regulatory :: reproducibility (§33)", () => {
  it("the same artifact + parser + rule + schema produces an identical dataset fingerprint", async () => {
    const a = await firstCycle(verifiedTier1Source(), [V1]);
    const b = await firstCycle(verifiedTier1Source(), [V1]);
    const fpA = datasetFingerprint(a.out.results[0].dataset!);
    const fpB = datasetFingerprint(b.out.results[0].dataset!);
    expect(fpA).toBe(fpB);
    expect(a.out.results[0].dataset?.datasetId).toBe(
      b.out.results[0].dataset?.datasetId,
    );
  });

  it("a different artifact produces a different fingerprint", async () => {
    const a = await firstCycle(verifiedTier1Source(), [V1]);
    const b = await firstCycle(verifiedTier1Source(), [V2]);
    expect(datasetFingerprint(a.out.results[0].dataset!)).not.toBe(
      datasetFingerprint(b.out.results[0].dataset!),
    );
  });

  it("derives a content-fingerprint dataset version when LCGPA states none (§45)", async () => {
    const { out } = await firstCycle(verifiedTier1Source(), [V1]);
    expect(out.results[0].dataset?.datasetVersion).toBe(
      `LCGPA_MANDATORY_LIST_sha-${sha256(V1).slice(0, 12)}`,
    );
    expect(out.results[0].dataset?.effectiveFrom).toBeNull();
  });
});

describe("LCGPA regulatory :: direct ingestion entry point", () => {
  it("can ingest a single changed source outside a full cycle", async () => {
    const ctx = ctxWith({ bodies: [V1] });
    const source = verifiedTier1Source();
    const result = await ingestChangedSource({
      ctx,
      source,
      resource: okResource(V1),
      check: {
        checkId: "CHK",
        sourceId: source.id,
        checkedAt: new Date("2026-09-01T02:00:00.000Z"),
        outcome: "CHANGE_DETECTED",
        httpStatus: 200,
        observedSha256: sha256(V1),
        previousSha256: null,
        metadata: null,
        errorCode: null,
        errorMessage: null,
        nextCheckAt: null,
        attemptCount: 1,
        correlationId: "corr",
      },
      correlationId: "corr",
      datasetKey: "LCGPA_MANDATORY_LIST",
      document: DOCUMENT,
    });
    expect(result.outcome).toBe("PENDING_REVIEW");
    expect(result.dataset?.products).toHaveLength(2);
  });
});

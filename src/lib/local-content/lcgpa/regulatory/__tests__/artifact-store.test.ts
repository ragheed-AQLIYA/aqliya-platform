import {
  acquireArtifact,
  buildProvenance,
  canArtifactUpdateAuthority,
  createArtifactStore,
  deriveFilename,
  filenameFromContentDisposition,
  header,
  validateProvenance,
} from "../artifact-store";
import { sha256 } from "../integrity";
import { ACTIVE_RULE_VERSION } from "../versioning";
import {
  clockAt,
  cleanXlsx,
  csvArtifact,
  csvRow,
  failedResource,
  makeZip,
  okResource,
  tier1Source,
  tier4Source,
  verifiedTier1Source,
} from "./fixtures";

const BODY = csvArtifact([csvRow("P-001")]);
const CLOCK = clockAt("2026-08-21T02:00:00.000Z");

function acquire(body = BODY, source = verifiedTier1Source()) {
  return acquireArtifact({
    source,
    resource: okResource(body),
    acquiredBy: "system:lcgpa-regulatory-monitor",
    clock: CLOCK,
  });
}

describe("LCGPA regulatory :: artifact acquisition (§9, §10)", () => {
  it("hashes the RAW body and records size, filename and URLs", () => {
    const result = acquire();
    expect(result.ok).toBe(true);
    expect(result.artifact?.sha256).toBe(sha256(BODY));
    expect(result.artifact?.size).toBe(BODY.length);
    expect(result.artifact?.filename).toBe("mandatory-list.csv");
    expect(result.artifact?.directUrl).toBe("https://lcgpa.gov.sa/mandatory-list.csv");
    expect(result.artifact?.status).toBe("VERIFIED");
  });

  it("requires an attributable acquirer", () => {
    const result = acquireArtifact({
      source: verifiedTier1Source(),
      resource: okResource(BODY),
      acquiredBy: "",
      clock: CLOCK,
    });
    expect(result.ok).toBe(false);
    expect(result.blockedReason).toMatch(/ACQUIRER_MISSING/);
  });

  it("BLOCKS third-party artifacts entirely (§30)", () => {
    const result = acquireArtifact({
      source: tier4Source(),
      resource: okResource(BODY),
      acquiredBy: "system:x",
      clock: CLOCK,
    });
    expect(result.ok).toBe(false);
    expect(result.blockedReason).toMatch(/THIRD_PARTY_INGESTION_BLOCKED/);
    expect(result.artifact).toBeNull();
  });

  it("reports a failed fetch without creating an artifact", () => {
    const result = acquireArtifact({
      source: verifiedTier1Source(),
      resource: failedResource(404, "HTTP_404"),
      acquiredBy: "system:x",
      clock: CLOCK,
    });
    expect(result.ok).toBe(false);
    expect(result.blockedReason).toMatch(/SOURCE_FETCH_FAILED.*HTTP_404/);
  });

  it("QUARANTINES an artifact that fails integrity validation (§27)", () => {
    const macroZip = makeZip([
      { name: "[Content_Types].xml", content: "<Types/>" },
      { name: "xl/vbaProject.bin", content: "payload" },
    ]);
    const result = acquireArtifact({
      source: verifiedTier1Source(),
      resource: okResource(macroZip, {
        "content-type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }, "https://lcgpa.gov.sa/list.xlsx"),
      acquiredBy: "system:x",
      clock: CLOCK,
    });
    expect(result.artifact?.status).toBe("QUARANTINED");
    expect(result.blockedReason).toMatch(/ARTIFACT_QUARANTINED.*MACRO_DETECTED/);
  });

  it("never states a publication or effective date the source did not declare (§45)", () => {
    const result = acquire();
    expect(result.artifact?.publishedAt).toBeNull();
    expect(result.artifact?.effectiveFrom).toBeNull();
    expect(result.artifact?.version).toBeNull();
  });

  it("records declared metadata when the authority states it", () => {
    const result = acquireArtifact({
      source: verifiedTier1Source(),
      resource: okResource(BODY),
      acquiredBy: "system:x",
      clock: CLOCK,
      declared: {
        publishedAt: new Date("2026-08-20T00:00:00.000Z"),
        effectiveFrom: new Date("2027-01-01T00:00:00.000Z"),
        version: "2026-08",
      },
    });
    expect(result.artifact?.version).toBe("2026-08");
    expect(result.artifact?.effectiveFrom?.toISOString()).toBe(
      "2027-01-01T00:00:00.000Z",
    );
  });

  it("derives a filename from the URL and falls back to the source id", () => {
    expect(deriveFilename("https://x.sa/a/b/list-2026.xlsx", "src")).toBe(
      "list-2026.xlsx",
    );
    expect(deriveFilename("https://x.sa/", "src-1")).toBe("src-1");
    expect(deriveFilename("not a url", "src-2")).toBe("src-2");
  });

  it("prefers the filename the server states in Content-Disposition", () => {
    expect(
      deriveFilename("https://lcgpa.gov.sa/file?guid=1&changedDate=2", "src", {
        "Content-Disposition": 'attachment; filename="mandatory-list.xlsx"',
      }),
    ).toBe("mandatory-list.xlsx");
  });

  it("decodes an RFC 5987 filename*, including Arabic", () => {
    const encoded = encodeURIComponent("القائمة الإلزامية.xlsx");
    expect(
      deriveFilename("https://lcgpa.gov.sa/file?guid=1", "src", {
        "content-disposition": `attachment; filename*=UTF-8''${encoded}`,
      }),
    ).toBe("القائمة الإلزامية.xlsx");
  });

  it("falls back to the name= query parameter on an extensionless URL", () => {
    const doubled = encodeURIComponent(encodeURIComponent("list (July 2026).xlsx"));
    expect(
      deriveFilename(`https://lcgpa.gov.sa/file?guid=1&name=${doubled}`, "src"),
    ).toBe("list (July 2026).xlsx");
  });

  it("never lets a served filename escape its directory", () => {
    expect(
      deriveFilename("https://x.sa/file", "src", {
        "content-disposition": 'attachment; filename="../../etc/passwd"',
      }),
    ).toBe(".._.._etc_passwd");
  });

  it("parses Content-Disposition directly", () => {
    expect(filenameFromContentDisposition(undefined)).toBeNull();
    expect(filenameFromContentDisposition("inline")).toBeNull();
    expect(filenameFromContentDisposition('attachment; filename="a.pdf"')).toBe("a.pdf");
  });

  it("reads headers case-insensitively", () => {
    expect(header({ "Content-Type": "text/csv" }, "content-type")).toBe("text/csv");
    expect(header({}, "etag")).toBeUndefined();
  });
});

describe("LCGPA regulatory :: authority gate on artifacts (§4)", () => {
  it("BLOCKS an artifact from an unverified TIER 1 source", () => {
    const source = tier1Source();
    const result = acquireArtifact({
      source,
      resource: okResource(BODY),
      acquiredBy: "system:x",
      clock: CLOCK,
    });
    const gate = canArtifactUpdateAuthority(source, result.artifact!);
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/SOURCE_UNVERIFIED/);
  });

  it("BLOCKS a quarantined artifact", () => {
    const source = verifiedTier1Source();
    const artifact = acquire().artifact!;
    const gate = canArtifactUpdateAuthority(source, {
      ...artifact,
      status: "QUARANTINED",
      blockedReason: "MACRO_DETECTED",
    });
    expect(gate.allowed).toBe(false);
    expect(gate.reason).toMatch(/ARTIFACT_QUARANTINED/);
  });

  it("BLOCKS an artifact acquired from a different source", () => {
    const artifact = acquire().artifact!;
    const other = verifiedTier1Source({ id: "other-source" });
    expect(canArtifactUpdateAuthority(other, artifact).reason).toMatch(
      /ARTIFACT_SOURCE_MISMATCH/,
    );
  });

  it("ALLOWS a clean artifact from a verified TIER 1 source", () => {
    const source = verifiedTier1Source();
    const gate = canArtifactUpdateAuthority(source, acquire().artifact!);
    expect(gate.allowed).toBe(true);
  });
});

describe("LCGPA regulatory :: append-only artifact store (§8, §32)", () => {
  it("stores a new artifact once and reports duplicates as not-new", () => {
    const store = createArtifactStore();
    const artifact = acquire().artifact!;
    expect(store.put(artifact).isNew).toBe(true);
    expect(store.put(artifact).isNew).toBe(false);
    expect(store.size()).toBe(1);
  });

  it("keeps every historical version when content changes", () => {
    const store = createArtifactStore();
    const v1 = acquire(csvArtifact([csvRow("P-001")])).artifact!;
    const v2 = acquire(csvArtifact([csvRow("P-001", { minLc: "50" })])).artifact!;
    store.put(v1);
    store.put(v2);
    expect(store.size()).toBe(2);
    expect(store.listBySource(v1.sourceId)).toHaveLength(2);
    expect(store.latestBySource(v1.sourceId)?.sha256).toBe(v2.sha256);
    expect(store.getByHash(v1.sourceId, v1.sha256)?.sha256).toBe(v1.sha256);
  });

  it("supersedes without deleting", () => {
    const store = createArtifactStore();
    const artifact = acquire().artifact!;
    store.put(artifact);
    const superseded = store.supersede(artifact.artifactId, new Date());
    expect(superseded?.status).toBe("SUPERSEDED");
    expect(store.get(artifact.artifactId)).toBeDefined();
  });

  it("quarantines while preserving the evidence (§50)", () => {
    const store = createArtifactStore();
    const artifact = acquire().artifact!;
    store.put(artifact);
    const q = store.quarantine(artifact.artifactId, "invalid after activation");
    expect(q?.status).toBe("QUARANTINED");
    expect(q?.blockedReason).toBe("invalid after activation");
    expect(store.get(artifact.artifactId)?.sha256).toBe(artifact.sha256);
  });

  it("records parse outcomes without destroying quarantine state", () => {
    const store = createArtifactStore();
    const artifact = acquire().artifact!;
    store.put(artifact);
    expect(store.markParsed(artifact.artifactId)?.status).toBe("PARSED");
    expect(store.markParseFailed(artifact.artifactId, "bad columns")?.status).toBe(
      "PARSE_FAILED",
    );
    store.quarantine(artifact.artifactId, "q");
    expect(store.markParsed(artifact.artifactId)?.status).toBe("QUARANTINED");
  });

  it("accepts a clean xlsx artifact", () => {
    const result = acquireArtifact({
      source: verifiedTier1Source(),
      resource: okResource(
        cleanXlsx(),
        {
          "content-type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
        "https://lcgpa.gov.sa/list.xlsx",
      ),
      acquiredBy: "system:x",
      clock: CLOCK,
    });
    expect(result.artifact?.status).toBe("VERIFIED");
    expect(result.artifact?.filename).toBe("list.xlsx");
  });
});

describe("LCGPA regulatory :: provenance (§11)", () => {
  const artifact = acquire().artifact!;
  const source = verifiedTier1Source();

  it("assembles a complete provenance chain", () => {
    const provenance = buildProvenance({
      artifact,
      source,
      datasetVersion: "LCGPA_MANDATORY_LIST_2026-08",
      documentVersion: "2026-08",
      ruleVersion: ACTIVE_RULE_VERSION,
    });
    expect(validateProvenance(provenance)).toEqual([]);
    expect(provenance.sourceAuthority).toBe("LCGPA");
    expect(provenance.artifactSha256).toBe(artifact.sha256);
    expect(provenance.ruleVersion).toBe(ACTIVE_RULE_VERSION);
    expect(provenance.parserVersion).toBeTruthy();
    expect(provenance.schemaVersion).toBeTruthy();
  });

  it("reports every missing provenance field", () => {
    const provenance = buildProvenance({
      artifact,
      source,
      datasetVersion: "",
      documentVersion: "",
      ruleVersion: "",
    });
    const errors = validateProvenance(provenance);
    expect(errors.join(" ")).toMatch(/datasetVersion/);
    expect(errors.join(" ")).toMatch(/documentVersion/);
    expect(errors.join(" ")).toMatch(/ruleVersion/);
  });

  it("rejects an invalid SHA-256 in provenance", () => {
    const provenance = buildProvenance({
      artifact: { ...artifact, sha256: "short" },
      source,
      datasetVersion: "v",
      documentVersion: "d",
      ruleVersion: ACTIVE_RULE_VERSION,
    });
    expect(validateProvenance(provenance).join(" ")).toMatch(
      /PROVENANCE_HASH_INVALID/,
    );
  });
});

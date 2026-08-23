/**
 * LCGPA Regulatory Intelligence — operator ingestion entry point.
 *
 * Runs the full pipeline over an official LCGPA artifact:
 *   verify source → acquire → SHA-256 + integrity → parse → dataset
 *   → semantic diff → classify → impact → governance gate
 *
 * It STOPS at PENDING_REVIEW. It never activates anything. Activation is a
 * separate, deliberate operator action (see docs/regulatory/LCGPA_RUNBOOK.md §7).
 *
 * Usage:
 *   npm run lc:regulatory:ingest -- --source lcgpa-mandatory-list-government \
 *       --verified-by <user-id> --evidence "<what you checked>"
 *   npm run lc:regulatory:ingest -- --source lcgpa-minimum-lc-schedule --year 2026
 *   npm run lc:regulatory:ingest -- --live        # retrieve from lcgpa.gov.sa
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildSeedRegistry,
  canUpdateAuthoritativeState,
  createBufferFetcher,
  createHttpFetcher,
  createMandatoryListParser,
  createMinimumLcParser,
  createParserRegistry,
  createRegulatoryEngineContext,
  describeChange,
  nullImpactResolver,
  renderChangeEvent,
  renderImpactSummary,
  runRegulatoryCycle,
  sha256,
  systemClock,
  verifySource,
  type RegulatorySource,
} from "@/lib/local-content/lcgpa/regulatory";

const ARTIFACT_STORE = join(process.cwd(), "uploads", "lcgpa-sources", "2026-07");

const DOCUMENTS = {
  "lcgpa-mandatory-list-government": {
    titleAr: "القائمة الإلزامية للجهات الحكومية (يوليو 2026)",
    titleEn: "Mandatory List of National Products — government entities (July 2026)",
    documentType: "MANDATORY_LIST" as const,
    datasetKey: "LCGPA_MANDATORY_LIST_GOV",
  },
  "lcgpa-mandatory-list-state-owned": {
    titleAr: "القائمة الإلزامية للشركات المملوكة للدولة (يوليو 2026)",
    titleEn: "Mandatory List of National Products — state-owned companies (July 2026)",
    documentType: "MANDATORY_LIST" as const,
    datasetKey: "LCGPA_MANDATORY_LIST_SOC",
  },
  "lcgpa-minimum-lc-schedule": {
    titleAr: "الحد الأدنى لنسبة المحتوى المحلي على منتجات القائمة الإلزامية (يوليو 2026)",
    titleEn: "Minimum local content schedule for mandatory-list products (July 2026)",
    documentType: "REGULATION" as const,
    datasetKey: "LCGPA_MINIMUM_LC",
  },
};

function arg(name: string, fallback?: string): string | undefined {
  const i = process.argv.indexOf(`--${name}`);
  if (i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")) {
    return process.argv[i + 1];
  }
  return process.argv.includes(`--${name}`) ? "true" : fallback;
}

function loadPreservedArtifacts(): Record<string, { body: Buffer; filename: string }> {
  if (!existsSync(ARTIFACT_STORE)) return {};
  const byHash: Record<string, { body: Buffer; filename: string }> = {};
  for (const name of readdirSync(ARTIFACT_STORE)) {
    try {
      const body = readFileSync(join(ARTIFACT_STORE, name));
      byHash[sha256(body)] = { body, filename: name };
    } catch {
      /* skip unreadable entries */
    }
  }
  return byHash;
}

/** SHA-256 of each artifact as retrieved from lcgpa.gov.sa on 2026-08-22. */
const KNOWN_HASHES: Record<string, string> = {
  "lcgpa-mandatory-list-government":
    "93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632",
  "lcgpa-mandatory-list-state-owned":
    "f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc",
  "lcgpa-minimum-lc-schedule":
    "acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f",
};

async function main(): Promise<void> {
  const sourceId = arg("source", "lcgpa-mandatory-list-government") as string;
  const live = arg("live") === "true";
  const year = Number(arg("year", "2026"));
  const verifiedBy = arg("verified-by", "operator:cli");
  const evidence = arg(
    "evidence",
    "Artifact retrieved from the LCGPA documents page and fingerprinted; see uploads/lcgpa-sources/.",
  ) as string;

  const doc = DOCUMENTS[sourceId as keyof typeof DOCUMENTS];
  if (!doc) {
    console.error(`Unknown source "${sourceId}". Known: ${Object.keys(DOCUMENTS).join(", ")}`);
    process.exit(2);
  }

  const clock = systemClock;
  const registry = buildSeedRegistry(clock);
  const seeded = registry.get(sourceId);
  if (!seeded) {
    console.error(`Source ${sourceId} is not in the seed registry.`);
    process.exit(2);
  }

  // ── Operator verification of the canonical URL (runbook §1) ──
  const source: RegulatorySource = verifySource(seeded, {
    verifiedById: verifiedBy as string,
    verifiedAt: clock.now(),
    evidence,
    confirmedUrl: seeded.url,
  });
  const gate = canUpdateAuthoritativeState(source);
  console.log(`SOURCE      ${source.id}`);
  console.log(`URL         ${source.url}`);
  console.log(`AUTHORITY   TIER ${source.authorityTier} — ${gate.reason}`);
  if (!gate.allowed) process.exit(1);

  // ── Parser (runbook §2) ──
  const parsers = createParserRegistry();
  parsers.register(
    sourceId,
    sourceId === "lcgpa-minimum-lc-schedule"
      ? createMinimumLcParser({ effectiveYear: year })
      : createMandatoryListParser({
          variant:
            sourceId === "lcgpa-mandatory-list-state-owned"
              ? "STATE_OWNED_COMPANIES"
              : "GOVERNMENT_ENTITIES",
        }),
  );

  // ── Fetcher: live, or replay of the preserved raw artifact ──
  let fetcher;
  if (live) {
    console.log("FETCH       live retrieval from lcgpa.gov.sa");
    fetcher = createHttpFetcher();
  } else {
    const preserved = loadPreservedArtifacts();
    const expected = KNOWN_HASHES[sourceId];
    const entry = expected ? preserved[expected] : undefined;
    if (!entry) {
      console.error(
        `No preserved artifact with sha256 ${expected} under ${ARTIFACT_STORE}.\n` +
          "Run with --live to retrieve it from the official source.",
      );
      process.exit(1);
    }
    console.log(
      `FETCH       replay of preserved artifact (${entry.body.length} bytes, ${entry.filename})`,
    );
    fetcher = createBufferFetcher({
      [source.url]: {
        body: entry.body,
        headers: {
          "content-type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(entry.filename)}`,
        },
        finalUrl: source.url,
      },
    });
  }

  const ctx = createRegulatoryEngineContext({
    fetcher,
    clock,
    impactResolver: nullImpactResolver,
    parsers,
  });

  const out = await runRegulatoryCycle({
    ctx,
    sources: [source],
    correlationId: `ingest-${Date.now()}`,
    datasetKey: doc.datasetKey,
    document: { titleAr: doc.titleAr, titleEn: doc.titleEn, documentType: doc.documentType },
    force: true,
  });

  const result = out.results[0];
  if (!result) {
    console.log(`CHECK       ${out.checks[0]?.outcome ?? "NO_CHECK"}`);
    console.log(`ERROR       ${out.checks[0]?.errorMessage ?? "no result produced"}`);
    process.exit(1);
  }

  console.log("");
  console.log(`OUTCOME     ${result.outcome}`);
  if (result.blocker) console.log(`BLOCKER     ${result.blocker}`);

  if (result.artifact) {
    const a = result.artifact;
    console.log("");
    console.log("── ARTIFACT ──");
    console.log(`filename    ${a.filename}`);
    console.log(`sha256      ${a.sha256}`);
    console.log(`size        ${a.size} bytes`);
    console.log(`status      ${a.status}`);
    console.log(`integrity   ${a.integrity.errors.length} error(s), ${a.integrity.warnings.length} warning(s)`);
    for (const w of a.integrity.warnings) console.log(`  warn      ${w}`);
    if (expectedHashMismatch(sourceId, a.sha256)) {
      console.log("  NOTE      SHA-256 differs from the artifact verified on 2026-08-22 — LCGPA has republished this document.");
    }
  }

  if (result.dataset) {
    const d = result.dataset;
    console.log("");
    console.log("── DATASET ──");
    console.log(`version     ${d.datasetVersion}`);
    console.log(`products    ${d.products.length}`);
    console.log(`parser      ${d.parserVersion}`);
    console.log(`rule        ${d.ruleVersion}`);
    console.log(`effective   ${d.effectiveFrom ? d.effectiveFrom.toISOString().slice(0, 10) : "(not stated by the artifact)"}`);
    console.log(`status      ${d.status}`);
    console.log("");
    console.log("── PROVENANCE ──");
    for (const [k, v] of Object.entries(d.provenance)) {
      console.log(`${k.padEnd(20)} ${v instanceof Date ? v.toISOString() : String(v)}`);
    }
  }

  if (result.diff) {
    console.log("");
    console.log("── SEMANTIC DIFF ──");
    console.log(JSON.stringify(result.diff.summary, null, 1));
    for (const c of result.diff.changes.slice(0, 10)) console.log(`  ${describeChange(c)}`);
    if (result.diff.changes.length > 10) {
      console.log(`  … ${result.diff.changes.length - 10} more`);
    }
  }

  if (result.impact) {
    console.log("");
    console.log("── IMPACT ──");
    console.log(renderImpactSummary(result.impact));
  }

  if (result.governanceCase) {
    console.log("");
    console.log("── GOVERNANCE ──");
    console.log(`case        ${result.governanceCase.caseId}`);
    console.log(`state       ${result.governanceCase.state}`);
    console.log(
      `history     ${result.governanceCase.history.map((h) => h.to).join(" → ")}`,
    );
  }

  if (result.changeEvent) {
    console.log("");
    console.log("── CHANGE JOURNAL ──");
    console.log(renderChangeEvent(result.changeEvent));
  }

  console.log("");
  console.log(`alerts      ${result.alerts.length}`);
  for (const a of result.alerts.slice(0, 8)) {
    console.log(`  [${a.severity}] ${a.category}: ${a.summary}`);
  }
  console.log(`audit       ${ctx.audit.size()} event(s)`);
  console.log(`metrics     ${JSON.stringify(ctx.metrics.snapshot())}`);
  console.log("");
  console.log("This run did NOT activate anything. Activation requires review, approval");
  console.log("and the arrival of the effective date — see LCGPA_RUNBOOK.md §6-§7.");
}

function expectedHashMismatch(sourceId: string, actual: string): boolean {
  const expected = KNOWN_HASHES[sourceId];
  return Boolean(expected && expected !== actual);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * LCGPA Regulatory Intelligence — P0 bootstrap.
 *
 * Runs the complete first-ingestion chain over the preserved official artifacts:
 *
 *   verify source → acquire → SHA-256 → integrity → provenance → parse
 *   → normalized dataset → semantic diff → impact → governance (PENDING_REVIEW)
 *   → effective-date evidence → cross-artifact conflict detection
 *
 * It APPROVES NOTHING and ACTIVATES NOTHING. Conflicts are recorded, never
 * resolved. Effective dates are recorded as evidence, never assumed.
 *
 * Usage:
 *   npm run lc:regulatory:bootstrap                 # dry run
 *   npm run lc:regulatory:bootstrap -- --commit     # persist everything
 *   npm run lc:regulatory:bootstrap -- --year 2026  # schedule year to bind
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildSeedRegistry,
  createBufferFetcher,
  createMandatoryListParser,
  createMinimumLcParser,
  createParserRegistry,
  createRegulatoryEngineContext,
  createEffectiveDateEvidence,
  deriveEvidenceFromDataset,
  detectEvidenceConflicts,
  detectMembershipConflicts,
  nullImpactResolver,
  renderConflict,
  renderEvidence,
  renderImpactSummary,
  runRegulatoryCycle,
  sha256,
  systemClock,
  verifySource,
  type EffectiveDateEvidence,
  type RegulatoryConflict,
  type RegulatoryDataset,
  type RegulatorySource,
} from "@/lib/local-content/lcgpa/regulatory";
import {
  createPrismaImpactResolver,
  ensureSources,
  loadEvidence,
  persistConflicts,
  persistCycle,
  persistEvidence,
  persistImpact,
  unresolvableEntities,
} from "@/lib/local-content/lcgpa/regulatory/persistence";

import { db, disconnect } from "./lcgpa-regulatory-db";

const STORE = join(process.cwd(), "uploads", "lcgpa-sources", "2026-07");

/** SHA-256 as retrieved from lcgpa.gov.sa on 2026-08-22. */
const ARTIFACTS = {
  "lcgpa-mandatory-list-government": {
    sha256: "93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632",
    datasetKey: "LCGPA_MANDATORY_LIST_GOV",
    // تاريخ التطبيق — when the product became subject to the list.
    dateKind: "MANDATORY_LIST_INCLUSION" as const,
    regime: "GOVERNMENT_ENTITIES" as const,
    titleAr: "القائمة الإلزامية للجهات الحكومية (يوليو 2026)",
    titleEn: "Mandatory List — government entities (July 2026)",
    documentType: "MANDATORY_LIST" as const,
  },
  "lcgpa-mandatory-list-state-owned": {
    sha256: "f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc",
    datasetKey: "LCGPA_MANDATORY_LIST_SOC",
    dateKind: "MANDATORY_LIST_INCLUSION" as const,
    regime: "STATE_OWNED_COMPANIES" as const,
    titleAr: "القائمة الإلزامية للشركات المملوكة للدولة (يوليو 2026)",
    titleEn: "Mandatory List — state-owned companies (July 2026)",
    documentType: "MANDATORY_LIST" as const,
  },
  "lcgpa-minimum-lc-schedule": {
    sha256: "acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f",
    datasetKey: "LCGPA_MINIMUM_LC",
    // تاريخ بدء إشتراط الحد الأدنى — when the minimum percentage starts binding.
    dateKind: "MINIMUM_LC_REQUIREMENT" as const,
    regime: "ALL" as const,
    titleAr: "الحد الأدنى لنسبة المحتوى المحلي على منتجات القائمة الإلزامية (يوليو 2026)",
    titleEn: "Minimum local content schedule (July 2026)",
    documentType: "REGULATION" as const,
  },
};

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}
function value(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : fallback;
}
function rule(title: string): void {
  console.log("");
  console.log(`── ${title} ${"─".repeat(Math.max(0, 66 - title.length))}`);
}

function preserved(): Record<string, { body: Buffer; filename: string }> {
  if (!existsSync(STORE)) return {};
  const out: Record<string, { body: Buffer; filename: string }> = {};
  for (const name of readdirSync(STORE)) {
    try {
      const body = readFileSync(join(STORE, name));
      out[sha256(body)] = { body, filename: name };
    } catch {
      /* skip */
    }
  }
  return out;
}

async function main(): Promise<void> {
  const commit = flag("commit");
  const year = Number(value("year", "2026"));
  const operator = value("verified-by", "operator:bootstrap");
  const clock = systemClock;
  const now = clock.now();
  const correlationId = `bootstrap-${now.toISOString()}`;

  console.log(`LCGPA regulatory bootstrap — ${now.toISOString()}`);
  console.log(`mode        ${commit ? "COMMIT" : "DRY RUN (no writes)"}`);
  console.log(`schedule    binding minimum-LC year ${year}`);

  const archive = preserved();
  const registry = buildSeedRegistry(clock);

  // P1.1 — the Source Registry holds EVERY monitored source, not only the ones
  // this run ingests. Registering a source is not the same as trusting it: §30
  // still keeps third-party artifacts out of the Product Registry, the
  // Regulatory Dataset and the Computation Engine, and their evidence can never
  // rise above CORROBORATED. But an evidence row has to point at a registered
  // source, and the RESTRICT foreign key is what enforces that.
  if (commit) {
    const registered = await ensureSources(db(), registry.list());
    rule("source registry");
    console.log(`registered  ${registered.created.length} new, ${registered.existing.length} already on record`);
    for (const id of registered.created) {
      const s = registry.get(id);
      console.log(`  + ${id}  TIER ${s?.authorityTier ?? "?"}  ${s?.sourceType ?? ""}`);
    }
  }

  const datasets = new Map<string, RegulatoryDataset>();
  const sources = new Map<string, RegulatorySource>();
  const allEvidence: EffectiveDateEvidence[] = [];
  const allConflicts: RegulatoryConflict[] = [];

  // ── P0.3-P0.5: acquire, verify, parse, normalize, provenance ──
  for (const [sourceId, meta] of Object.entries(ARTIFACTS)) {
    rule(sourceId);
    const seeded = registry.get(sourceId);
    if (!seeded) {
      console.log("  NOT IN REGISTRY — skipped");
      continue;
    }
    const entry = archive[meta.sha256];
    if (!entry) {
      console.log(`  MISSING ARTIFACT sha256 ${meta.sha256}`);
      console.log(`  expected under ${STORE}`);
      continue;
    }

    const source = verifySource(seeded, {
      verifiedById: operator,
      verifiedAt: now,
      evidence:
        "Retrieved from the LCGPA documents page on 2026-08-22 and fingerprinted; see docs/regulatory/LCGPA_ARTIFACT_CATALOGUE.md.",
      confirmedUrl: seeded.url,
    });
    sources.set(sourceId, source);

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

    const ctx = createRegulatoryEngineContext({
      fetcher: createBufferFetcher({
        [source.url]: {
          body: entry.body,
          headers: {
            "content-type":
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(entry.filename)}`,
          },
          finalUrl: source.url,
        },
      }),
      clock,
      // A dry run resolves no impact from the database — it has none to read.
      impactResolver: commit ? createPrismaImpactResolver(await db()) : nullImpactResolver,
      parsers,
    });

    const out = await runRegulatoryCycle({
      ctx,
      sources: [source],
      correlationId,
      datasetKey: meta.datasetKey,
      document: {
        titleAr: meta.titleAr,
        titleEn: meta.titleEn,
        documentType: meta.documentType,
      },
      force: true,
    });

    const result = out.results[0];
    if (!result) {
      console.log(`  no result — check outcome ${out.checks[0]?.outcome}`);
      continue;
    }
    console.log(`  outcome     ${result.outcome}`);
    if (result.blocker) console.log(`  blocker     ${result.blocker}`);
    if (!result.dataset || !result.artifact) continue;

    console.log(`  artifact    ${result.artifact.sha256}  ${result.artifact.status}`);
    console.log(`  integrity   ${result.artifact.integrity.errors.length} error(s), ${result.artifact.integrity.warnings.length} warning(s)`);
    console.log(`  dataset     ${result.dataset.datasetVersion}`);
    console.log(`  products    ${result.dataset.products.length}`);
    console.log(`  provenance  ${Object.keys(result.dataset.provenance).length} fields, artifact ${result.dataset.provenance.artifactSha256.slice(0, 12)}…`);
    console.log(`  diff        ${result.diff?.changes.length ?? 0} change(s)${result.diff?.isBaseline ? " (baseline)" : ""}`);
    console.log(`  case        ${result.governanceCase?.state}`);
    if (result.impact) console.log(`  impact      ${result.impact.impactLevel}`);

    datasets.set(sourceId, result.dataset);

    // ── P0.7: what the artifact itself states about effective dates ──
    const derived = deriveEvidenceFromDataset(result.dataset, clock, {
      dateKind: meta.dateKind,
      regime: meta.regime,
    });
    allEvidence.push(...derived);
    console.log(
      `  evidence    ${derived.length} VERIFIED ${meta.dateKind} record(s) derived (${meta.regime})`,
    );
    for (const e of derived.slice(0, 6)) {
      console.log(
        `    ${e.effectiveFrom.toISOString().slice(0, 10)}  ${(e.productCodes ?? []).length} product(s)`,
      );
    }
    if (derived.length > 6) console.log(`    … ${derived.length - 6} more cohort(s)`);

    if (commit) {
      const summary = await persistCycle(await db(), {
        sources: out.sources,
        checks: out.checks,
        results: out.results,
        alerts: out.alerts,
        correlationId,
        document: {
          titleAr: meta.titleAr,
          titleEn: meta.titleEn,
          documentType: meta.documentType,
        },
      });
      console.log(`  persisted   ${JSON.stringify(summary)}`);
      if (result.impact) {
        await persistImpact(
          await db(),
          result.impact,
          result.dataset.datasetId,
          unresolvableEntities(),
        );
      }
    }
  }

  // ── The announcement is a separate claim, not a fact about products ──
  rule("effective-date evidence from corroborating sources");
  const spa = registry.get("spa-lcgpa-announcements");
  if (spa) {
    const spaClaim = createEffectiveDateEvidence(
      {
        sourceId: spa.id,
        dateKind: "MINIMUM_LC_REQUIREMENT",
        regime: "ALL",
        scope: "COHORT",
        cohortLabel: "SPA-N2514218-first-tranche",
        effectiveFrom: new Date("2026-08-01T00:00:00.000Z"),
        confidence: "CORROBORATED",
        evidence:
          "SPA announcement N2514218 (2026-02-17): 233 products subject to minimum local content from 1 August 2026. The announcement states the percentages are published on the LCGPA website; it does not enumerate the products.",
        note: "Recorded as a cohort claim. It is NOT applied to any product the announcement does not name.",
        recordedById: operator,
      },
      clock,
    );
    allEvidence.push(spaClaim);
    console.log(renderEvidence(spaClaim));
  }

  rule("effective-date disagreements");
  const evidenceConflicts = detectEvidenceConflicts(allEvidence);
  console.log(`${evidenceConflicts.length} disagreement(s) between effective-date claims`);
  for (const c of evidenceConflicts.slice(0, 10)) {
    console.log(`  ${c.scopeKey}: ${c.detail}`);
  }

  // ── P0.6: cross-artifact membership conflicts ──
  rule("cross-artifact conflicts (§29)");
  const listDataset = datasets.get("lcgpa-mandatory-list-government");
  const scheduleDataset = datasets.get("lcgpa-minimum-lc-schedule");
  const listSource = sources.get("lcgpa-mandatory-list-government");
  const scheduleSource = sources.get("lcgpa-minimum-lc-schedule");

  if (listDataset && scheduleDataset && listSource && scheduleSource) {
    const membership = detectMembershipConflicts({
      obligationSource: scheduleSource,
      obligationDataset: scheduleDataset,
      listSource,
      listDataset,
      clock,
    });
    allConflicts.push(...membership);
    console.log(
      `${membership.length} product(s) carry a published minimum but are absent from the Mandatory List`,
    );
    for (const c of membership) console.log("\n" + renderConflict(c));
    if (membership.length > 0) {
      console.log("");
      console.log("These are NOT resolved. Two TIER 1 artifacts disagree; LCGPA must say which governs.");
    }
  } else {
    console.log("Both the Mandatory List and the schedule are required — skipped.");
  }

  // ── Persist evidence and conflicts ──
  if (commit) {
    rule("persisting evidence and conflicts");
    const ev = await persistEvidence(await db(), allEvidence);
    const cf = await persistConflicts(await db(), allConflicts);
    console.log(`evidence    created=${ev.created} superseded=${ev.superseded}`);
    console.log(`conflicts   created=${cf.created} existing=${cf.existing}`);
    const live = await loadEvidence(await db());
    console.log(`on record   ${live.length} live effective-date claim(s)`);
  }

  rule("summary");
  console.log(`datasets    ${datasets.size}`);
  for (const [id, d] of datasets) {
    console.log(`  ${id.padEnd(34)} ${d.datasetVersion.padEnd(46)} ${d.products.length} products`);
  }
  console.log(`evidence    ${allEvidence.length} claim(s)`);
  console.log(`conflicts   ${allConflicts.length} open, all PENDING_HUMAN_REVIEW`);
  console.log("");
  console.log("Nothing was approved. Nothing was activated. No conflict was resolved.");
  if (!commit) console.log("DRY RUN — nothing was written. Re-run with --commit.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => disconnect());

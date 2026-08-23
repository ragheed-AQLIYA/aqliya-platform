/**
 * LCGPA Regulatory Intelligence — scheduled monitoring cycle.
 *
 * Fetches every DUE source, fingerprints it, and — when the content changed —
 * runs the full detection pipeline and persists the result.
 *
 * It NEVER approves and NEVER activates. The furthest any change gets here is
 * PENDING_REVIEW. Activation is a separate job (lcgpa-regulatory-activate.ts)
 * and only ever acts on what a human has already approved.
 *
 * Usage:
 *   npm run lc:regulatory:monitor                 # dry run — detects, writes nothing
 *   npm run lc:regulatory:monitor -- --commit     # persist the cycle
 *   npm run lc:regulatory:monitor -- --commit --force   # ignore the schedule
 *   npm run lc:regulatory:monitor -- --seed       # register seed sources (once)
 */
import {
  buildSeedRegistry,
  createHttpFetcher,
  createMandatoryListParser,
  createMinimumLcParser,
  createParserRegistry,
  createRegulatoryEngineContext,
  describeChange,
  isDueForCheck,
  nullImpactResolver,
  runRegulatoryCycle,
  systemClock,
  type RegulatorySource,
} from "@/lib/local-content/lcgpa/regulatory";
import {
  createPrismaImpactResolver,
  ensureSources,
  loadEngineState,
  persistCycle,
} from "@/lib/local-content/lcgpa/regulatory/persistence";

import { db, disconnect } from "./lcgpa-regulatory-db";

const DATASET_KEYS: Record<string, string> = {
  "lcgpa-mandatory-list-government": "LCGPA_MANDATORY_LIST_GOV",
  "lcgpa-mandatory-list-state-owned": "LCGPA_MANDATORY_LIST_SOC",
  "lcgpa-minimum-lc-schedule": "LCGPA_MINIMUM_LC",
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

function registerParsers(scheduleYear: number) {
  const parsers = createParserRegistry();
  parsers.register(
    "lcgpa-mandatory-list-government",
    createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" }),
  );
  parsers.register(
    "lcgpa-mandatory-list-state-owned",
    createMandatoryListParser({ variant: "STATE_OWNED_COMPANIES" }),
  );
  parsers.register(
    "lcgpa-minimum-lc-schedule",
    createMinimumLcParser({ effectiveYear: scheduleYear }),
  );
  return parsers;
}

async function main(): Promise<void> {
  const commit = flag("commit");
  const force = flag("force");
  const scheduleYear = Number(value("year", String(new Date().getUTCFullYear())));
  const clock = systemClock;
  const now = clock.now();

  console.log(`LCGPA regulatory monitor — ${now.toISOString()}`);
  console.log(`mode        ${commit ? "COMMIT (persisting)" : "DRY RUN (no writes)"}`);

  if (flag("seed") && !commit) {
    console.log("seed        --seed requires --commit (it writes source rows)");
  }
  if (flag("seed") && commit) {
    const seeded = buildSeedRegistry(clock).list();
    const { created, existing } = await ensureSources(await db(), seeded);
    console.log(`seed        created=${created.length} existing=${existing.length}`);
    if (created.length) console.log(`            ${created.join(", ")}`);
  }

  if (!commit) {
    console.log("");
    console.log("DRY RUN needs a database to know which sources are due.");
    console.log("Use --commit to run a real cycle, or lc:regulatory:bootstrap for an offline preview.");
    return;
  }
  const state = await loadEngineState(await db());
  if (state.sources.length === 0) {
    console.log("No sources registered. Run once with --seed.");
    return;
  }

  const due = state.sources.filter((s) => force || isDueForCheck(s, now));
  console.log(`sources     ${state.sources.length} registered, ${due.length} due`);
  for (const s of state.sources) {
    const mark = due.includes(s) ? "→" : " ";
    console.log(
      `  ${mark} ${s.id.padEnd(34)} ${s.status.padEnd(12)} tier ${s.authorityTier} ` +
        `${s.verification ? "verified" : "UNVERIFIED"} last=${s.lastCheckedAt?.toISOString().slice(0, 16) ?? "never"}`,
    );
  }
  if (due.length === 0) {
    console.log("Nothing due.");
    return;
  }

  const ctx = createRegulatoryEngineContext({
    fetcher: createHttpFetcher(),
    clock,
    impactResolver: commit ? createPrismaImpactResolver(await db()) : nullImpactResolver,
    parsers: registerParsers(scheduleYear),
  });

  const out = await runRegulatoryCycle({
    ctx,
    sources: due as RegulatorySource[],
    correlationId: `monitor-${now.toISOString()}`,
    datasetKey: "LCGPA",
    document: {
      titleAr: "مستندات القائمة الإلزامية للمنتجات الوطنية",
      titleEn: "Mandatory List of National Products — documents",
      documentType: "MANDATORY_LIST",
    },
    force,
  });

  console.log("");
  for (const check of out.checks) {
    console.log(
      `CHECK  ${check.sourceId.padEnd(34)} ${check.outcome.padEnd(20)} ` +
        `${check.errorCode ?? ""} ${check.observedSha256?.slice(0, 12) ?? ""}`,
    );
  }

  for (const result of out.results) {
    // Each changed source gets the dataset key its document family uses.
    const key = DATASET_KEYS[result.sourceId] ?? "LCGPA";
    console.log("");
    console.log(`RESULT ${result.sourceId} (${key})`);
    console.log(`  outcome   ${result.outcome}`);
    if (result.blocker) console.log(`  blocker   ${result.blocker}`);
    if (result.dataset) {
      console.log(`  dataset   ${result.dataset.datasetVersion} (${result.dataset.products.length} products)`);
    }
    if (result.diff) {
      console.log(`  changes   ${result.diff.changes.length}${result.diff.isBaseline ? " (baseline)" : ""}`);
      for (const c of result.diff.changes.slice(0, 5)) console.log(`    ${describeChange(c)}`);
      if (result.diff.changes.length > 5) {
        console.log(`    … ${result.diff.changes.length - 5} more`);
      }
    }
    if (result.impact) console.log(`  impact    ${result.impact.impactLevel}`);
    if (result.governanceCase) console.log(`  case      ${result.governanceCase.state}`);
  }

  console.log("");
  console.log(`alerts      ${out.alerts.length}`);
  for (const a of out.alerts.slice(0, 10)) {
    console.log(`  [${a.severity}] ${a.category}: ${a.summary}`);
  }

  if (!commit) {
    console.log("");
    console.log("DRY RUN — nothing was written. Re-run with --commit to persist.");
    return;
  }

  const summary = await persistCycle(await db(), {
    sources: out.sources,
    checks: out.checks,
    results: out.results,
    alerts: out.alerts,
    correlationId: `monitor-${now.toISOString()}`,
  });
  console.log("");
  console.log(`PERSISTED   ${JSON.stringify(summary)}`);
  console.log("No dataset was approved or activated by this run.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => disconnect());

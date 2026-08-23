/**
 * LCGPA Regulatory Intelligence — activation + expiry sweep.
 *
 * Two sweeps in one run:
 *
 * 1. ACTIVATION: Approves nothing, rejects nothing, parses nothing.
 *    A published dataset sits inactive until its effective date. This sweep
 *    notices the date has passed and flips it to ACTIVE, superseding the
 *    dataset it replaces.
 *
 * 2. EXPIRY: Active datasets whose `effectiveTo` date has passed are
 *    quarantined with evidence preserved. The governance case transitions
 *    from ACTIVE → ROLLED_BACK with an audit trail.
 *
 * Usage:
 *   npm run lc:regulatory:activate                # dry run — reports only
 *   npm run lc:regulatory:activate -- --commit    # perform the activations/expiries
 */
import {
  activateDataset,
  evaluateActivation,
  evaluateExpiry,
  expireDataset,
  findExpiredDatasets,
  systemClock,
  type GovernanceCase,
  type RegulatoryDataset,
} from "@/lib/local-content/lcgpa/regulatory";

import { loadEngineState, persistCase, persistDataset } from "@/lib/local-content/lcgpa/regulatory/persistence";

import { db, disconnect } from "./lcgpa-regulatory-db";

function flag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

function value(name: string, fallback: string): string {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] && !process.argv[i + 1].startsWith("--")
    ? process.argv[i + 1]
    : fallback;
}

async function main(): Promise<void> {
  const commit = flag("commit");
  const actorId = value("actor", "system:lcgpa-activation-sweep");
  const clock = systemClock;
  const now = clock.now();

  console.log(`LCGPA activation sweep — ${now.toISOString()}`);
  console.log(`mode        ${commit ? "COMMIT" : "DRY RUN (no writes)"}`);

  const state = await loadEngineState(await db());
  const casesByVersion = new Map<string, GovernanceCase>(
    state.cases.map((c) => [c.datasetVersion, c]),
  );

  const candidates = state.datasets.filter(
    (d) => d.status === "PUBLISHED" || d.status === "APPROVED",
  );
  console.log(`candidates  ${candidates.length} published/approved dataset(s)`);

  let activated = 0;
  let waiting = 0;
  let blocked = 0;

  for (const dataset of candidates) {
    const decision = evaluateActivation(dataset, now);
    const governanceCase = casesByVersion.get(dataset.datasetVersion);

    if (!decision.eligible) {
      if (decision.reason.startsWith("NOT_YET_EFFECTIVE")) {
        waiting++;
        console.log(
          `  WAIT  ${dataset.datasetVersion.padEnd(44)} effective ${decision.activateAt?.toISOString().slice(0, 10)}`,
        );
      } else {
        blocked++;
        console.log(`  BLOCK ${dataset.datasetVersion.padEnd(44)} ${decision.reason}`);
      }
      continue;
    }
    if (!governanceCase) {
      blocked++;
      console.log(
        `  BLOCK ${dataset.datasetVersion.padEnd(44)} NO_GOVERNANCE_CASE: refusing to activate a dataset with no approval record`,
      );
      continue;
    }

    const currentActive: RegulatoryDataset | null =
      state.datasets.find(
        (d) => d.sourceId === dataset.sourceId && d.status === "ACTIVE",
      ) ?? null;

    const result = activateDataset(dataset, governanceCase, {
      actorId,
      correlationId: `activation-${now.toISOString()}`,
      clock,
      currentActive,
    });

    if (!result.ok || !result.activated) {
      blocked++;
      console.log(`  BLOCK ${dataset.datasetVersion.padEnd(44)} ${result.reason}`);
      continue;
    }

    activated++;
    console.log(`  ACTIVATE ${dataset.datasetVersion} — ${result.reason}`);
    if (result.superseded) {
      console.log(`           supersedes ${result.superseded.datasetVersion}`);
    }

    if (commit) {
      await persistDataset(await db(), {
        dataset: result.activated,
        artifactId: `${result.activated.sourceId}:${result.activated.artifactSha256}`,
      });
      if (result.superseded) {
        await persistDataset(await db(), {
          dataset: result.superseded,
          artifactId: `${result.superseded.sourceId}:${result.superseded.artifactSha256}`,
        });
      }
      await persistCase(await db(), result.case, `activation-${now.toISOString()}`);
      const client = await db();
      await client.lcRegulatoryChangeEvent.updateMany({
        where: { datasetVersion: result.activated.datasetVersion },
        data: { governanceState: "ACTIVE", activatedAt: result.activated.activatedAt },
      });
    }
  }

  console.log("");
  console.log(`activated=${activated} waiting=${waiting} blocked=${blocked}`);
  if (!commit && activated > 0) {
    console.log("DRY RUN — nothing was written. Re-run with --commit to activate.");
  }

  // ─── Expiry sweep ───────────────────────────────────────────────────────
  console.log("");
  console.log("── EXPIRY SWEEP ──");

  const expiredDatasets = findExpiredDatasets(state.datasets, now);
  console.log(`expired-candidates  ${expiredDatasets.length} ACTIVE dataset(s) past their effectiveTo`);

  let expiredCount = 0;
  let expiryBlocked = 0;

  for (const dataset of expiredDatasets) {
    const expiry = evaluateExpiry(dataset, now);
    const governanceCase = casesByVersion.get(dataset.datasetVersion);

    if (!expiry.expired) {
      continue; // evaluateExpiry already confirmed, but defensive check
    }

    if (!governanceCase) {
      expiryBlocked++;
      console.log(
        `  BLOCK ${dataset.datasetVersion.padEnd(44)} NO_GOVERNANCE_CASE: cannot expire a dataset with no governance record`,
      );
      continue;
    }

    const result = expireDataset(dataset, governanceCase, {
      actorId,
      correlationId: `expiry-${now.toISOString()}`,
      clock,
      reason: expiry.reason,
    });

    expiredCount++;
    console.log(`  EXPIRE  ${dataset.datasetVersion} — ${result.reason}`);

    if (commit) {
      await persistDataset(await db(), {
        dataset: result.expired,
        artifactId: `${result.expired.sourceId}:${result.expired.artifactSha256}`,
      });
      await persistCase(await db(), result.case, `expiry-${now.toISOString()}`);
    }
  }

  console.log("");
  console.log(`expired=${expiredCount} expiry-blocked=${expiryBlocked}`);
  if (!commit && expiredCount > 0) {
    console.log("DRY RUN — nothing was written. Re-run with --commit to expire.");
  }
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => disconnect());

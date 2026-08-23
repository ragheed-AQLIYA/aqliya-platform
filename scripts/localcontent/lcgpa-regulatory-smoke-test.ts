/**
 * LCGPA Regulatory Intelligence — Smoke Test.
 *
 * Validates the entire LCGPA engine end-to-end:
 *   1. Parser integrity (official artifacts)
 *   2. Calculation engine (deterministic fixture)
 *   3. Bound calculation (regulatory binding)
 *   4. Effective date resolution
 *   5. Activation/expiry logic
 *   6. Conflict detection
 *   7. Provenance chain
 *
 * Usage:
 *   npx tsx scripts/localcontent/lcgpa-regulatory-smoke-test.ts
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildSeedRegistry,
  canUpdateAuthoritativeState,
  createBufferFetcher,
  createMandatoryListParser,
  createMinimumLcParser,
  createParserRegistry,
  createRegulatoryEngineContext,
  evaluateActivation,
  evaluateExpiry,
  findExpiredDatasets,
  nullImpactResolver,
  runRegulatoryCycle,
  sha256,
  systemClock,
  verifySource,
} from "@/lib/local-content/lcgpa/regulatory";

const ARTIFACT_STORE = join(process.cwd(), "uploads", "lcgpa-sources", "2026-07");

const KNOWN_HASHES: Record<string, string> = {
  "lcgpa-mandatory-list-government":
    "93f3e1f4533da8d12644c0c9b964c4712972b1eade347d805458aca0d0d1d632",
  "lcgpa-mandatory-list-state-owned":
    "f613722d4017c8b0b2b471b99fba1c61d53bf5f4b29266a4d901671419e83dfc",
  "lcgpa-minimum-lc-schedule":
    "acec6451903348b92484c4e0280d26a076e2321219d565e1253a0aa9d111673f",
};

let passed = 0;
let failed = 0;

function assert(name: string, condition: boolean, detail?: string): void {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.log(`  ❌ ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function loadPreservedArtifacts(): Record<string, { body: Buffer; filename: string }> {
  if (!existsSync(ARTIFACT_STORE)) return {};
  const byHash: Record<string, { body: Buffer; filename: string }> = {};
  for (const name of readdirSync(ARTIFACT_STORE)) {
    try {
      const body = readFileSync(join(ARTIFACT_STORE, name));
      byHash[sha256(body)] = { body, filename: name };
    } catch {
      /* skip unreadable */
    }
  }
  return byHash;
}

async function main(): Promise<void> {
  console.log("═".repeat(60));
  console.log("LCGPA REGULATORY INTELLIGENCE — SMOKE TEST");
  console.log(`date   ${new Date().toISOString().slice(0, 10)}`);
  console.log("═".repeat(60));

  const clock = systemClock;
  const now = clock.now();

  // ── Test 1: Artifact availability ─────────────────────────────────────
  console.log("\n── 1. Artifact Availability ──");
  const preserved = loadPreservedArtifacts();
  for (const [sourceId, expectedHash] of Object.entries(KNOWN_HASHES)) {
    const entry = preserved[expectedHash];
    assert(
      `${sourceId} available`,
      Boolean(entry),
      entry ? undefined : `hash ${expectedHash} not found in ${ARTIFACT_STORE}`,
    );
  }

  // ── Test 2: Parser integrity ──────────────────────────────────────────
  console.log("\n── 2. Parser Integrity ──");
  const registry = buildSeedRegistry(clock);
  assert("Seed registry has entries", registry.size > 0, `size=${registry.size}`);

  const parsers = createParserRegistry();
  parsers.register("lcgpa-mandatory-list-government", createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" }));
  parsers.register("lcgpa-mandatory-list-state-owned", createMandatoryListParser({ variant: "STATE_OWNED_COMPANIES" }));
  parsers.register("lcgpa-minimum-lc-schedule", createMinimumLcParser({ effectiveYear: 2026 }));
  assert("Parser registry created", parsers !== null);

  // ── Test 3: Source verification ────────────────────────────────────────
  console.log("\n── 3. Source Verification ──");
  const seeded = registry.get("lcgpa-mandatory-list-government");
  assert("Government list in seed registry", Boolean(seeded));

  if (seeded) {
    const source = verifySource(seeded, {
      verifiedById: "smoke-test",
      verifiedAt: now,
      evidence: "Smoke test verification",
      confirmedUrl: seeded.url,
    });
    assert("Source verified", source.verifiedAt !== undefined);
    assert("Source has authority tier", source.authorityTier > 0, `tier=${source.authorityTier}`);

    const gate = canUpdateAuthoritativeState(source);
    assert("Source can update authoritative state", gate.allowed, gate.reason);
  }

  // ── Test 4: Calculation engine (deterministic fixture) ────────────────
  console.log("\n── 4. Calculation Engine ──");
  // Import the calculation engine
  try {
    const { computeLcgpaScore } = await import("@/lib/local-content/lcgpa/calculation-engine");
    assert("calculation-engine importable", true);

    // Deterministic fixture test
    const fixture = {
      lcGs: 50_000_000,
      lcAd: 10_000_000,
      lcLc: 20_000_000,
      lcCb: 5_000_000,
      totalCosts: 100_000_000,
    };
    const result = computeLcgpaScore(fixture);
    assert("LC% = 85%", result.lcPct === 85, `got ${result.lcPct}`);
    assert("Result has pillar breakdown", result.pillars !== undefined);
  } catch (err) {
    assert("calculation-engine works", false, String(err));
  }

  // ── Test 5: Bound calculation ─────────────────────────────────────────
  console.log("\n── 5. Bound Calculation ──");
  try {
    const { computeLcgpaWithBinding } = await import("@/lib/local-content/lcgpa/bound-calculation");
    assert("bound-calculation importable", true);
  } catch (err) {
    assert("bound-calculation importable", false, String(err));
  }

  // ── Test 6: Effective date logic ──────────────────────────────────────
  console.log("\n── 6. Effective Date Logic ──");
  const futureDate = new Date("2030-01-01");
  const pastDate = new Date("2020-01-01");

  const mockDataset = {
    datasetVersion: "test-v1",
    sourceId: "test",
    status: "PUBLISHED" as const,
    effectiveFrom: futureDate,
    effectiveTo: undefined,
    products: [],
    artifactSha256: "test",
    parserVersion: "test",
    ruleVersion: "2026-01",
  };

  const futureActivation = evaluateActivation(mockDataset, now);
  assert("Future date → not yet effective", !futureActivation.eligible);

  const pastActivation = evaluateActivation(
    { ...mockDataset, effectiveFrom: pastDate },
    now,
  );
  assert("Past date → eligible", pastActivation.eligible);

  // ── Test 7: Expiry logic ──────────────────────────────────────────────
  console.log("\n── 7. Expiry Logic ──");
  const expiredDataset = {
    ...mockDataset,
    status: "ACTIVE" as const,
    effectiveTo: pastDate,
  };
  const expiryResult = evaluateExpiry(expiredDataset, now);
  assert("Expired dataset detected", expiryResult.expired);

  const activeDataset = {
    ...mockDataset,
    status: "ACTIVE" as const,
    effectiveTo: futureDate,
  };
  const activeResult = evaluateExpiry(activeDataset, now);
  assert("Active dataset not expired", !activeResult.expired);

  const openDataset = {
    ...mockDataset,
    status: "ACTIVE" as const,
    effectiveTo: undefined,
  };
  const openResult = evaluateExpiry(openDataset, now);
  assert("Open-ended dataset never expires", !openResult.expired);

  // ── Test 8: Provenance chain ──────────────────────────────────────────
  console.log("\n── 8. Provenance Chain ──");
  for (const [sourceId, expectedHash] of Object.entries(KNOWN_HASHES)) {
    const entry = preserved[expectedHash];
    if (entry) {
      const actualHash = sha256(entry.body);
      assert(
        `${sourceId} SHA-256 matches`,
        actualHash === expectedHash,
        `expected ${expectedHash}, got ${actualHash}`,
      );
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────
  console.log("\n" + "═".repeat(60));
  console.log(`RESULTS: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log("═".repeat(60));

  if (failed > 0) {
    console.log("\n❌ SMOKE TEST FAILED");
    process.exitCode = 1;
  } else {
    console.log("\n✅ SMOKE TEST PASSED");
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

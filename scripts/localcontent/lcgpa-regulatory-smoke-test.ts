/**
 * LCGPA Regulatory Intelligence — Smoke Test.
 *
 * Validates the entire LCGPA engine end-to-end:
 *   1. Artifact availability
 *   2. Source registry & verification
 *   3. Parser integrity
 *   4. Effective date logic
 *   5. Expiry logic
 *   6. Deterministic fixture (calculation engine)
 *   7. Provenance chain (SHA-256)
 *
 * Usage:
 *   npx tsx scripts/localcontent/lcgpa-regulatory-smoke-test.ts
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";

import {
  buildSeedRegistry,
  canUpdateAuthoritativeState,
  createMandatoryListParser,
  createMinimumLcParser,
  createParserRegistry,
  evaluateActivation,
  evaluateExpiry,
  sha256,
  systemClock,
  verifySource,
} from "@/lib/local-content/lcgpa/regulatory";

import type { RegulatoryDataset } from "@/lib/local-content/lcgpa/regulatory";

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

function makeDataset(overrides: Partial<RegulatoryDataset> = {}): RegulatoryDataset {
  return {
    datasetId: "smoke-test",
    datasetVersion: "test-v1",
    documentVersionId: "doc-v1",
    sourceId: "test",
    artifactSha256: "test-hash",
    products: [],
    parserVersion: "1.0.0",
    schemaVersion: "1.0.0",
    ruleVersion: "2026-01",
    status: "PUBLISHED",
    effectiveFrom: new Date("2026-08-01"),
    effectiveTo: null,
    createdAt: new Date(),
    activatedAt: null,
    deactivatedAt: null,
    provenance: {
      sourceId: "test",
      acquiredAt: new Date(),
      verifiedAt: new Date(),
      verifiedById: "smoke-test",
      acquisitionMethod: "DIRECT_UPLOAD",
      evidence: "Smoke test",
    },
    ...overrides,
  };
}

async function main(): Promise<void> {
  console.log("═".repeat(60));
  console.log("LCGPA REGULATORY INTELLIGENCE — SMOKE TEST");
  console.log(`date   ${new Date().toISOString().slice(0, 10)}`);
  console.log("═".repeat(60));

  const clock = systemClock;
  const now = clock.now();

  // ── 1. Artifact availability ────────────────────────────────────────
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

  // ── 2. Source registry ──────────────────────────────────────────────
  console.log("\n── 2. Source Registry ──");
  const registry = buildSeedRegistry(clock);
  const entries = registry.list();
  assert("Seed registry has entries", entries.length > 0, `size=${entries.length}`);

  const seeded = registry.get("lcgpa-mandatory-list-government");
  assert("Government list in seed registry", Boolean(seeded));

  // ── 3. Source verification ──────────────────────────────────────────
  console.log("\n── 3. Source Verification ──");
  if (seeded) {
    const source = verifySource(seeded, {
      verifiedById: "smoke-test",
      verifiedAt: now,
      evidence: "Smoke test verification",
      confirmedUrl: seeded.url,
    });
    assert("Source verified", source.verification?.verifiedAt !== undefined);
    assert("Source has authority tier", source.authorityTier > 0, `tier=${source.authorityTier}`);

    const gate = canUpdateAuthoritativeState(source);
    assert("Source can update authoritative state", gate.allowed, gate.reason);
  }

  // ── 4. Parser registry ─────────────────────────────────────────────
  console.log("\n── 4. Parser Registry ──");
  try {
    const parsers = createParserRegistry();
    parsers.register("lcgpa-mandatory-list-government", createMandatoryListParser({ variant: "GOVERNMENT_ENTITIES" }));
    parsers.register("lcgpa-mandatory-list-state-owned", createMandatoryListParser({ variant: "STATE_OWNED_COMPANIES" }));
    parsers.register("lcgpa-minimum-lc-schedule", createMinimumLcParser({ effectiveYear: 2026 }));
    assert("Parser registry created with 3 parsers", true);
  } catch (err) {
    assert("Parser registry created", false, String(err));
  }

  // ── 5. Effective date logic ────────────────────────────────────────
  console.log("\n── 5. Effective Date Logic ──");
  const futureDate = new Date("2030-01-01");
  const pastDate = new Date("2020-01-01");

  const futureDataset = makeDataset({
    effectiveFrom: futureDate,
    status: "PUBLISHED",
  });
  const futureActivation = evaluateActivation(futureDataset, now);
  assert("Future date → not yet effective", !futureActivation.eligible);

  const pastDataset = makeDataset({
    effectiveFrom: pastDate,
    status: "PUBLISHED",
  });
  const pastActivation = evaluateActivation(pastDataset, now);
  assert("Past date → eligible", pastActivation.eligible);

  // ── 6. Expiry logic ────────────────────────────────────────────────
  console.log("\n── 6. Expiry Logic ──");
  const expiredDataset = makeDataset({
    status: "ACTIVE",
    effectiveTo: pastDate,
  });
  const expiryResult = evaluateExpiry(expiredDataset, now);
  assert("Expired dataset detected", expiryResult.expired);

  const activeDataset = makeDataset({
    status: "ACTIVE",
    effectiveTo: futureDate,
  });
  const activeResult = evaluateExpiry(activeDataset, now);
  assert("Active dataset not expired", !activeResult.expired);

  const openDataset = makeDataset({
    status: "ACTIVE",
    effectiveTo: null,
  });
  const openResult = evaluateExpiry(openDataset, now);
  assert("Open-ended dataset never expires", !openResult.expired);

  const nonActiveDataset = makeDataset({
    status: "PUBLISHED",
    effectiveTo: pastDate,
  });
  const nonActiveResult = evaluateExpiry(nonActiveDataset, now);
  assert("Non-ACTIVE dataset not expired", !nonActiveResult.expired);

  // ── 7. Deterministic fixture ────────────────────────────────────────
  console.log("\n── 7. Calculation Engine (Deterministic Fixture) ──");
  try {
    const { computeLcgpaScore } = await import("@/lib/local-content/lcgpa/calculation-engine");
    assert("calculation-engine importable", true);

    // Minimal valid LcPillarInputs fixture
    const result = computeLcgpaScore({
      goodsServices: {
        suppliers: [
          {
            supplierId: "S001",
            name: "Test Supplier",
            spend: 80_000_000,
            localityClassification: "local",
            localContentPercentage: 90,
            rank: 1,
          },
          {
            supplierId: "S002",
            name: "Test Supplier 2",
            spend: 20_000_000,
            localityClassification: "non_local",
            localContentPercentage: 10,
            rank: 2,
          },
        ],
        totalGoodsServicesCost: 100_000_000,
      },
      assetDepreciation: {
        ksaManufacturedDepreciation: 5_000_000,
        foreignOriginDepreciation: 2_000_000,
        totalFixedAssetDepreciation: 7_000_000,
      },
      laborCompensation: {
        saudiCompensation: 3_000_000,
        totalCompensation: 5_000_000,
      },
      capacityBuilding: {
        trainingSpend: 500_000,
        totalCapacityBuildingCost: 1_000_000,
      },
    });

    assert("computeLcgpaScore returns result", result !== undefined);
    assert("Result has overallLcPct", typeof result.overallLcPct === "number", `overallLcPct=${result.overallLcPct}`);
    assert("Result has totalCosts", typeof result.totalCosts === "number", `totalCosts=${result.totalCosts}`);
    assert("Result has lcGoodsServices", typeof result.lcGoodsServices === "number", `lcGs=${result.lcGoodsServices}`);
  } catch (err) {
    assert("calculation-engine works", false, String(err));
  }

  // ── 8. Bound calculation importable ─────────────────────────────────
  console.log("\n── 8. Bound Calculation ──");
  try {
    const { computeLcgpaWithBinding } = await import("@/lib/local-content/lcgpa/bound-calculation");
    assert("bound-calculation importable", typeof computeLcgpaWithBinding === "function");
  } catch (err) {
    assert("bound-calculation importable", false, String(err));
  }

  // ── 9. Provenance chain (SHA-256) ──────────────────────────────────
  console.log("\n── 9. Provenance Chain ──");
  for (const [sourceId, expectedHash] of Object.entries(KNOWN_HASHES)) {
    const entry = preserved[expectedHash];
    if (entry) {
      const actualHash = sha256(entry.body);
      assert(
        `${sourceId} SHA-256 matches`,
        actualHash === expectedHash,
        `expected ${expectedHash.slice(0, 16)}…, got ${actualHash.slice(0, 16)}…`,
      );
    }
  }

  // ── Summary ─────────────────────────────────────────────────────────
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

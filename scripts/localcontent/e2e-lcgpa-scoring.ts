// ─── E2E Verification: LCGPA Workbook Scoring — Full Pipeline ───
//
// Seeds a fixture project with suppliers + spend + workbook lines, runs the
// real computeLcgpaWorkbookScore service (auto-load path), verifies the
// LcCalculationRun persistence with regulatory binding, then cleans up.
//
// Run: npx tsx scripts/localcontent/e2e-lcgpa-scoring.ts
import { prisma } from "../db-utils/prisma.mjs";

// Import real service (relative chain is script-safe: no @/ aliases, no server-only)
import { computeLcgpaWorkbookScore } from "../../src/lib/local-content/lcgpa/workbook-scoring-lcgpa";

const FIXTURE_TAG = `e2e-lcgpa-${Date.now()}`;

async function main() {
  const orgId = "cmqhcenx40000fopq7rpt4o31";

  // ── 0. Defensive cleanup of orphans from previous failed runs ──
  const orphans = await prisma.localContentProject.findMany({
    where: { name: { startsWith: "e2e-lcgpa-" } },
    select: { id: true },
  });
  for (const o of orphans) {
    await prisma.lcCalculationRun.deleteMany({ where: { projectId: o.id } });
    const wbs = await prisma.lcWorkbook.findMany({
      where: { projectId: o.id },
      select: { id: true },
    });
    for (const w of wbs) {
      await prisma.lcWorkbookLine.deleteMany({ where: { workbookId: w.id } });
      await prisma.lcWorkbook.delete({ where: { id: w.id } });
    }
    await prisma.localContentSpendRecord.deleteMany({ where: { projectId: o.id } });
    await prisma.localContentSupplier.deleteMany({ where: { projectId: o.id } });
    await prisma.localContentProject.delete({ where: { id: o.id } });
  }
  if (orphans.length > 0) console.log(`[cleanup] removed ${orphans.length} orphan(s)`);

  // ── 1. Seed fixture project ──
  const project = await prisma.localContentProject.create({
    data: {
      organizationId: orgId,
      name: FIXTURE_TAG,
      reportingPeriod: "2026-H1",
      status: "DataCollection",
      calculationMethod: "lcgpa_v1",
      ruleVersion: "2026-01",
    },
  });
  console.log(`[seed] project ${project.id}`);

  // Suppliers: IDs are CUIDs; regulatory product codes live on spend metadata.
  // Codes 1 and 10 are verified active products in the local regulatory DB.
  const supLocal = await prisma.localContentSupplier.create({
    data: {
      projectId: project.id,
      name: `${FIXTURE_TAG}-local`,
      localityClassification: "local",
      localContentPercentage: 90,
    },
  });
  const supForeign = await prisma.localContentSupplier.create({
    data: {
      projectId: project.id,
      name: `${FIXTURE_TAG}-foreign`,
      localityClassification: "non_local",
    },
  });

  // Spend records: local 6,000,000 / foreign 4,000,000 → total 10M
  await prisma.localContentSpendRecord.createMany({
    data: [
      {
        projectId: project.id,
        supplierId: supLocal.id,
        amount: 6_000_000,
        category: "goods",
        period: "2026-H1",
        metadata: { lcgpaProductCode: "0001", codeSource: "e2e-official-fixture" },
      },
      {
        projectId: project.id,
        supplierId: supLocal.id,
        amount: 2_000_000,
        category: "services",
        period: "2026-H1",
        metadata: { lcgpaProductCode: "0001", codeSource: "e2e-official-fixture" },
      },
      {
        projectId: project.id,
        supplierId: supForeign.id,
        amount: 4_000_000,
        category: "goods",
        period: "2026-H1",
        metadata: { lcgpaProductCode: "0010", codeSource: "e2e-official-fixture" },
      },
    ],
  });
  console.log("[seed] suppliers=2 spendRecords=3 (total 12M SAR)");

  // ── 2. Seed workbook with pillar lines ──
  const wb = await prisma.lcWorkbook.create({
    data: {
      projectId: project.id,
      title: `${FIXTURE_TAG}-wb`,
      reportingPeriod: "2026-H1",
      status: "populated",
      calculationMethod: "lcgpa_v1",
    },
  });
  await prisma.lcWorkbookLine.createMany({
    data: [
      { workbookId: wb.id, code: "AST-01", name: "ast_local_dep", section: "assets", manualValue: 500_000 },
      { workbookId: wb.id, code: "AST-03", name: "ast_foreign_dep", section: "assets", manualValue: 500_000 },
      { workbookId: wb.id, code: "AST-02", name: "ast_total_dep", section: "assets", manualValue: 1_000_000 },
      { workbookId: wb.id, code: "WRK-05", name: "wrk_saudi_comp", section: "workforce", manualValue: 3_000_000 },
      { workbookId: wb.id, code: "WRK-06", name: "wrk_expat_comp", section: "workforce", manualValue: 2_000_000 },
      { workbookId: wb.id, code: "WRK-04", name: "wrk_total_comp", section: "workforce", manualValue: 5_000_000 },
      { workbookId: wb.id, code: "CAP-01", name: "cap_saudi_training", section: "assets", manualValue: 100_000 },
      { workbookId: wb.id, code: "CAP-04", name: "cap_total", section: "assets", manualValue: 100_000 },
    ],
  });
  console.log(`[seed] workbook ${wb.id} lines=8`);

  // ── 3. Run the REAL service (auto-load path — no explicit suppliers) ──
  const result = await computeLcgpaWorkbookScore(prisma as never, {
    workbookId: wb.id,
    projectId: project.id,
    computedById: null,
  });

  console.log("\n═══ LCGPA RESULT ═══");
  console.log(`overallLcPct:              ${result.overallLcPct}`);
  console.log(`totalCosts:                ${result.totalCosts.toLocaleString()}`);
  console.log(`lcGoodsServices:           ${result.lcGoodsServices.toLocaleString()}`);
  console.log(`lcAssetDepreciation:       ${result.lcAssetDepreciation.toLocaleString()}`);
  console.log(`lcLaborCompensation:       ${result.lcLaborCompensation.toLocaleString()}`);
  console.log(`lcCapacityBuilding:        ${result.lcCapacityBuilding.toLocaleString()}`);
  console.log(`recordable:                ${result.recordable}`);
  console.log(`gateReason:                ${result.gateReason}`);
  console.log(`regulatoryDatasetVersion:  ${result.regulatoryDatasetVersion}`);
  console.log(`artifactSha256:            ${result.regulatoryArtifactSha256?.slice(0, 24)}…`);
  console.log(`ruleVersion:               ${result.ruleVersion}`);

  // Expected values (deterministic):
  //   G&S: auto-loaded → local supplier 8M at 100% = 8M; foreign 4M at 0%
  //   AD:  500k×1.0 + 500k×0.2 = 600k
  //   LC:  3M×1.0 + 2M×0.37 = 3.74M
  //   CB:  100k
  //   Total costs: 12M (G&S base) + 1M (AD) + 5M (LC) + 100k (CB) = 18.1M
  //   LC% = (8M + 0.6M + 3.74M + 0.1M) / 18.1M × 100 = 68.73…%
  const EXPECT_GS = 8_000_000;
  const EXPECT_AD = 600_000;
  const EXPECT_LC = 3_740_000;
  const EXPECT_CB = 100_000;
  const EXPECT_TOTAL = 18_100_000;
  const EXPECT_PCT = ((EXPECT_GS + EXPECT_AD + EXPECT_LC + EXPECT_CB) / EXPECT_TOTAL) * 100;

  const checks: Array<[string, boolean]> = [
    ["G&S pillar = 8,000,000", result.lcGoodsServices === EXPECT_GS],
    ["Asset pillar = 600,000", result.lcAssetDepreciation === EXPECT_AD],
    ["Labor pillar = 3,740,000", result.lcLaborCompensation === EXPECT_LC],
    ["Capacity pillar = 100,000", result.lcCapacityBuilding === EXPECT_CB],
    [`Total costs = 18,100,000 (got ${result.totalCosts})`, result.totalCosts === EXPECT_TOTAL],
    [`Overall LC% ≈ ${EXPECT_PCT.toFixed(2)}`, Math.abs(result.overallLcPct - EXPECT_PCT) < 0.01],
  ];

  console.log("\n═══ DETERMINISM CHECKS ═══");
  for (const [label, ok] of checks) {
    console.log(`  ${ok ? "✅" : "❌"} ${label}`);
  }

  // ── 4. Verify persistence in LcCalculationRun (T8 — recordable path) ──
  // Per DR-2026-08-23-01, codes 0001/0010 resolve via the in-force mandatory
  // lists (GOV/SOC precedence over the future-dated MIN_LC schedule), so the
  // strict gate must now ALLOW recording with full binding provenance.
  const runs = await prisma.lcCalculationRun.findMany({
    where: { workbookId: wb.id },
    orderBy: { createdAt: "desc" },
    take: 1,
  });
  const run = runs[0];
  const runOk =
    !!run &&
    typeof run.overallLcPct === "number" &&
    Math.abs(run.overallLcPct - result.overallLcPct) < 1e-9 &&
    !!run.regulatoryDatasetVersion &&
    !!run.regulatoryArtifactSha256 &&
    run.regulatoryAsOf instanceof Date &&
    !Number.isNaN(run.regulatoryAsOf.getTime());
  checks.push([
    "Recordable: LcCalculationRun persisted with datasetVersion+sha256+asOf",
    runOk && result.recordable === true,
  ]);
  if (run) {
    console.log("\n[db] LcCalculationRun:", {
      id: run.id,
      overallLcPct: run.overallLcPct,
      datasetVersion: run.regulatoryDatasetVersion,
      artifactSha256: run.regulatoryArtifactSha256?.slice(0, 16),
      asOf: run.regulatoryAsOf?.toISOString(),
    });
  }

  // Binding check: product codes come from explicit spend-line metadata, never
  // from supplier CUIDs. Both fixture codes are official-dataset resolvable.
  console.log(
    `\n[gate] recordable=${result.recordable} reason=${result.gateReason}`,
  );

  const allPass = checks.every(([, ok]) => ok);
  console.log(`\n${allPass ? "🟢 E2E PASS" : "🔴 E2E FAIL"}`);

  // ── 5. Cleanup fixture ──
  await prisma.lcCalculationRun.deleteMany({ where: { projectId: project.id } });
  await prisma.lcWorkbookLine.deleteMany({ where: { workbookId: wb.id } });
  await prisma.lcWorkbook.delete({ where: { id: wb.id } });
  await prisma.localContentSpendRecord.deleteMany({ where: { projectId: project.id } });
  await prisma.localContentSupplier.deleteMany({ where: { projectId: project.id } });
  await prisma.localContentProject.delete({ where: { id: project.id } });
  console.log("[cleanup] fixture removed");

  process.exit(allPass ? 0 : 1);
}

main()
  .catch((e) => {
    console.error("E2E_FAILED:", e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

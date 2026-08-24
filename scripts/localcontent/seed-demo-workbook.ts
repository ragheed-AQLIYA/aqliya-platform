// ─── Seed a persistent demo workbook for UI smoke testing ───
// Creates project + suppliers + spend (with official product codes) +
// workbook + pillar lines. NOT auto-cleaned — for manual/browser testing.
// Idempotent: removes previous demo project (fixed name) first.
// Run: npx tsx scripts/localcontent/seed-demo-workbook.ts
import { prisma } from "../db-utils/prisma.mjs";

const DEMO_NAME = "عرض تجريبي LCGPA";

async function main() {
  const orgId = "cmt4y0wuc00014cpqvu091rhy"; // AQLIYA Demo Organization — admin@aqliya.com session org

  // Remove previous demo if present
  const prev = await prisma.localContentProject.findFirst({
    where: { name: DEMO_NAME },
    select: { id: true },
  });
  if (prev) {
    await prisma.lcCalculationRun.deleteMany({ where: { projectId: prev.id } });
    const wbs = await prisma.lcWorkbook.findMany({ where: { projectId: prev.id }, select: { id: true } });
    for (const w of wbs) {
      await prisma.lcWorkbookLine.deleteMany({ where: { workbookId: w.id } });
      await prisma.lcWorkbook.delete({ where: { id: w.id } });
    }
    await prisma.localContentSpendRecord.deleteMany({ where: { projectId: prev.id } });
    await prisma.localContentSupplier.deleteMany({ where: { projectId: prev.id } });
    await prisma.localContentProject.delete({ where: { id: prev.id } });
    console.log("[reset] previous demo removed");
  }

  const project = await prisma.localContentProject.create({
    data: {
      organizationId: orgId,
      name: DEMO_NAME,
      reportingPeriod: "2026-H1",
      status: "DataCollection",
      calculationMethod: "lcgpa_v1",
      ruleVersion: "2026-01",
    },
  });

  const supLocal = await prisma.localContentSupplier.create({
    data: {
      projectId: project.id,
      name: "مصنع الصناعات الوطنية",
      localityClassification: "local",
      localContentPercentage: 90,
    },
  });
  const supForeign = await prisma.localContentSupplier.create({
    data: {
      projectId: project.id,
      name: "GlobalTech Solutions Ltd",
      localityClassification: "non_local",
    },
  });

  await prisma.localContentSpendRecord.createMany({
    data: [
      { projectId: project.id, supplierId: supLocal.id, amount: 6_000_000, category: "goods", period: "2026-H1", metadata: { lcgpaProductCode: "0001", lcgpaCodeSource: "demo_seed" } },
      { projectId: project.id, supplierId: supLocal.id, amount: 2_000_000, category: "services", period: "2026-H1", metadata: { lcgpaProductCode: "0001", lcgpaCodeSource: "demo_seed" } },
      { projectId: project.id, supplierId: supForeign.id, amount: 4_000_000, category: "goods", period: "2026-H1", metadata: { lcgpaProductCode: "0010", lcgpaCodeSource: "demo_seed" } },
    ],
  });

  const wb = await prisma.lcWorkbook.create({
    data: {
      projectId: project.id,
      title: `${DEMO_NAME} — دفتر`,
      reportingPeriod: "2026-H1",
      status: "populated",
      calculationMethod: "lcgpa_v1",
      totalLines: 8,
      autoFilledLines: 8,
    },
  });
  await prisma.lcWorkbookLine.createMany({
    data: [
      { workbookId: wb.id, code: "AST-01", name: "ast_local_dep", section: "assets", autoFillValue: 500_000, source: "manual" },
      { workbookId: wb.id, code: "AST-03", name: "ast_foreign_dep", section: "assets", autoFillValue: 500_000, source: "manual" },
      { workbookId: wb.id, code: "AST-02", name: "ast_total_dep", section: "assets", autoFillValue: 1_000_000, source: "manual" },
      { workbookId: wb.id, code: "WRK-05", name: "wrk_saudi_comp", section: "workforce", autoFillValue: 3_000_000, source: "manual" },
      { workbookId: wb.id, code: "WRK-06", name: "wrk_expat_comp", section: "workforce", autoFillValue: 2_000_000, source: "manual" },
      { workbookId: wb.id, code: "WRK-04", name: "wrk_total_comp", section: "workforce", autoFillValue: 5_000_000, source: "manual" },
      { workbookId: wb.id, code: "CAP-01", name: "cap_saudi_training", section: "assets", autoFillValue: 100_000, source: "manual" },
      { workbookId: wb.id, code: "CAP-04", name: "cap_total", section: "assets", autoFillValue: 100_000, source: "manual" },
    ],
  });

  console.log(`PROJECT_ID=${project.id}`);
  console.log(`WORKBOOK_ID=${wb.id}`);
}

main()
  .catch((e) => {
    console.error("SEED_FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

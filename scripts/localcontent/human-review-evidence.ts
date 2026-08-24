// ─── Human-Review Evidence Collection (RV pass) ───
// Independent reviewer evidence pack: cross-examines DB state against the
// claims embedded in DR-2026-08-23-01 / DR-2026-08-23-02.
// Run: npx tsx scripts/localcontent/human-review-evidence.ts
import { prisma } from "../db-utils/prisma.mjs";

async function main() {
  console.log("═══ R-1 CHECK: product-level date distribution (MIN_LC) ═══");
  const minLc = await prisma.lcRegulatoryDataset.findFirst({
    where: { datasetVersion: { contains: "MINIMUM_LC" } },
    include: { products: { select: { productCode: true, effectiveFrom: true } } },
  });
  if (!minLc) throw new Error("MIN_LC dataset missing");
  const byDate = new Map<string, number>();
  for (const p of minLc.products) {
    const key = p.effectiveFrom ? p.effectiveFrom.toISOString().slice(0, 10) : "NULL";
    byDate.set(key, (byDate.get(key) ?? 0) + 1);
  }
  console.log(`dataset=${minLc.datasetVersion}`);
  console.log(`products=${minLc.products.length}`);
  for (const [d, n] of [...byDate.entries()].sort()) {
    console.log(`  effectiveFrom=${d} → ${n} products`);
  }
  console.log(`claim under review: "2 @ 2026-08-01, 231 @ 2027-08-01, 965 @ 2028-06-01"`);
  const c26 = byDate.get("2026-08-01") ?? 0;
  const c27 = byDate.get("2027-08-01") ?? 0;
  const c28 = byDate.get("2028-06-01") ?? 0;
  console.log(
    `R-1 VERDICT INPUTS: 2026 cohort=${c26} (claim: 2), 2027 cohort=${c27} (claim: 231), 2028 cohort=${c28} (claim: 965), total=${minLc.products.length}`,
  );

  console.log("\n═══ R-2 CHECK: six conflict codes across all datasets ═══");
  const SIX = ["2802", "2804", "2805", "2808", "2809", "2814"];
  for (const code of SIX) {
    const rows = await prisma.lcRegulatoryProduct.findMany({
      where: { productCode: code },
      select: {
        productCode: true,
        minimumLcPct: true,
        effectiveFrom: true,
        dataset: { select: { datasetVersion: true, status: true } },
      },
    });
    console.log(`code ${code}:`);
    for (const r of rows) {
      console.log(
        `    ${r.dataset.datasetVersion.slice(0, 44)} status=${r.dataset.status} minLcPct=${r.minimumLcPct} effFrom=${r.effectiveFrom?.toISOString().slice(0, 10) ?? "null"}`,
      );
    }
    if (rows.length === 0) console.log("    (absent from ALL datasets)");
  }
  console.log(`claim under review (DR-02): Min-LC=YES but Mandatory=ABSENT for all six`);

  console.log("\n═══ R-3 CHECK: governance ledger state ═══");
  const cases = await prisma.lcRegulatoryCase.findMany({
    where: { correlationId: { startsWith: "DR-2026-08-23" } },
    select: { id: true, state: true, approvedByName: true, approvalNote: true, history: true },
  });
  for (const c of cases) {
    console.log(`${c.id}: state=${c.state} approver=${c.approvedByName} noteLen=${c.approvalNote?.length ?? 0} transitions=${Array.isArray(c.history) ? c.history.length : "?"}`);
  }

  console.log("\n═══ R-4 CHECK: binding determinism spot-check via live resolver inputs ═══");
  const active = await prisma.lcRegulatoryDataset.findMany({
    where: { status: "ACTIVE" },
    select: { datasetVersion: true, effectiveFrom: true, createdAt: true, _count: { select: { products: true } } },
    orderBy: { createdAt: "asc" },
  });
  for (const d of active) {
    const tier = /MANDATORY_LIST/i.test(d.datasetVersion) ? "MANDATORY(tier-0)" : "MIN_LC(tier-1)";
    console.log(
      `  ${d.datasetVersion.slice(0, 46)} eff=${d.effectiveFrom?.toISOString().slice(0, 10)} products=${d._count.products} ${tier}`,
    );
  }
}

main()
  .catch((e) => {
    console.error("EVIDENCE_FAILED:", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

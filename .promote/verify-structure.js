// Structural verification after promotion. READ ONLY.
const { Client } = require("pg")
const DB = process.argv[2]
if (!/^aqliya(_[a-z_]+)?$/.test(DB || "")) throw new Error("bad database name")

const REGULATORY = [
  "LcRegulatorySource", "LcRegulatoryCheck", "LcRegulatoryArtifact", "LcRegulatoryDataset",
  "LcRegulatoryProduct", "LcRegulatoryChange", "LcRegulatoryCase", "LcRegulatoryAlert",
  "LcRegulatoryChangeEvent", "LcRegulatoryConflict", "LcRegulatoryImpactAssessment",
  "LcRegulatoryEffectiveDateEvidence",
]
const OPERATIONAL = [
  "LcCalculationRun", "LcMandatoryList", "LcMandatoryListItem", "LcGradualPlan",
  "LcGradualPlanMilestone", "LcPenaltyAssessment", "LcFinancialEvaluation",
]
const ADDED_COLUMNS = {
  LcWorkbook: ["calculationMethod", "lcgpaComputedAt", "lcgpaOverallLcPct", "lcgpaPillars", "ruleVersion"],
  LocalContentProject: ["baselineDate", "baselineLcPct", "calculationMethod", "gradualPlanStatus",
    "listedCompanyStatus", "ruleVersion", "targetDate", "targetedLcPct"],
  LocalContentSupplier: ["isSme", "ownershipEvidenceUrl", "saudiOwnershipPct", "smeEvidenceUrl"],
}

async function main() {
  const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${DB}` })
  await c.connect()
  await c.query("BEGIN READ ONLY")
  let fail = 0

  const { rows: t } = await c.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_type='BASE TABLE'`)
  const present = new Set(t.map((r) => r.table_name))
  const missing = [...REGULATORY, ...OPERATIONAL].filter((x) => !present.has(x))
  console.log(`  tables total            : ${t.length}`)
  console.log(`  19 expected new present : ${19 - missing.length}/19 ${missing.length ? "MISSING " + missing.join(", ") : ""}`)
  if (missing.length) fail++

  const { rows: fk } = await c.query(
    `SELECT c.conname, c.confdeltype FROM pg_constraint c
       JOIN pg_class ch ON ch.oid=c.conrelid JOIN pg_class p ON p.oid=c.confrelid
      WHERE c.contype='f' AND (ch.relname LIKE 'LcRegulatory%' OR p.relname LIKE 'LcRegulatory%')`)
  const notRestrict = fk.filter((f) => f.confdeltype !== "r")
  console.log(`  regulatory FKs          : ${fk.length}, ON DELETE RESTRICT: ${fk.length - notRestrict.length}`)
  if (notRestrict.length) { fail++; for (const n of notRestrict) console.log(`    NOT RESTRICT: ${n.conname}`) }

  const { rows: idx } = await c.query(
    `SELECT count(*)::int AS n FROM pg_indexes WHERE schemaname='public' AND tablename LIKE 'LcRegulatory%'`)
  console.log(`  indexes on LcRegulatory*: ${idx[0].n}`)

  let colCount = 0, unsafe = []
  for (const [table, cols] of Object.entries(ADDED_COLUMNS)) {
    const { rows } = await c.query(
      `SELECT column_name, is_nullable, column_default FROM information_schema.columns
        WHERE table_schema='public' AND table_name=$1 AND column_name = ANY($2)`, [table, cols])
    colCount += rows.length
    if (rows.length !== cols.length) { fail++; console.log(`    ${table}: expected ${cols.length}, found ${rows.length}`) }
    for (const r of rows) if (r.is_nullable === "NO" && r.column_default === null) unsafe.push(`${table}.${r.column_name}`)
  }
  console.log(`  added columns           : ${colCount}/17, all nullable-or-defaulted: ${unsafe.length === 0}`)
  if (unsafe.length) { fail++; for (const u of unsafe) console.log(`    UNSAFE NOT NULL: ${u}`) }

  const { rows: hist } = await c.query(
    `SELECT migration_name, count(*)::int AS n FROM "_prisma_migrations"
      WHERE finished_at IS NOT NULL AND rolled_back_at IS NULL
      GROUP BY migration_name HAVING count(*) > 1`)
  console.log(`  migrations applied more than once: ${hist.length}`)
  if (hist.length) { fail++; for (const h of hist) console.log(`    ${h.migration_name} x${h.n}`) }

  const { rows: lcgpa } = await c.query(
    `SELECT applied_steps_count, finished_at FROM "_prisma_migrations"
      WHERE migration_name = '20260822000000_lcgpa_regulatory_intelligence'`)
  console.log(`  LCGPA history rows      : ${lcgpa.length}, steps=${lcgpa.map((r) => r.applied_steps_count).join(",")}`)
  if (lcgpa.length !== 1) fail++

  await c.query("ROLLBACK")
  await c.end()
  console.log(fail === 0 ? "  STRUCTURAL VERIFICATION: PASS" : `  STRUCTURAL VERIFICATION: ${fail} FAILURE(S)`)
  if (fail) process.exit(1)
}
main().catch((e) => { console.error(e.message); process.exit(1) })

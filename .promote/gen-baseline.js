// Generates the baseline list from live history: every migration that is NOT
// already recorded as finished and is NOT one of the two new migrations.
// Their effects are proven present by the two Prisma diff checks in p4-prove.
const { readdirSync, existsSync, writeFileSync } = require("fs")
const { join } = require("path")
const { Client } = require("pg")

const DB = process.argv[2]
if (!/^aqliya(_[a-z_]+)?$/.test(DB || "")) throw new Error("bad database name")

const NEW_MIGRATIONS = new Set([
  "20260822000000_lcgpa_regulatory_intelligence",
  "20260822010000_repair_schema_drift",
])

const dir = join(__dirname, "..", "prisma", "migrations")
const all = readdirSync(dir)
  .filter((d) => /^\d{14}_/.test(d))
  .filter((d) => existsSync(join(dir, d, "migration.sql")))
  .sort()

async function main() {
  const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${DB}` })
  await c.connect()
  await c.query("BEGIN READ ONLY")
  const { rows } = await c.query(
    `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations"`)
  await c.query("ROLLBACK")
  await c.end()

  const finished = new Set(rows.filter((r) => r.finished_at && !r.rolled_back_at).map((r) => r.migration_name))
  const failed = new Set(rows.filter((r) => !r.finished_at && !r.rolled_back_at).map((r) => r.migration_name))

  const toBaseline = all.filter((m) => !NEW_MIGRATIONS.has(m) && !finished.has(m))

  console.log(`repository migrations : ${all.length}`)
  console.log(`already finished      : ${finished.size}`)
  console.log(`failed rows           : ${failed.size} ${[...failed].join(", ")}`)
  console.log(`new, to be deployed   : ${NEW_MIGRATIONS.size}`)
  console.log(`to baseline           : ${toBaseline.length}`)
  console.log(`  of which failed     : ${toBaseline.filter((m) => failed.has(m)).length}`)
  console.log(`  of which unrecorded : ${toBaseline.filter((m) => !failed.has(m)).length}`)

  if (finished.size + toBaseline.length + NEW_MIGRATIONS.size !== all.length) {
    throw new Error("accounting mismatch: every migration must fall into exactly one bucket")
  }

  writeFileSync(join(__dirname, "baseline-list.txt"), toBaseline.join("\n") + "\n")
  console.log(`\nwrote baseline-list.txt`)
}
main().catch((e) => { console.error(e.message); process.exit(1) })

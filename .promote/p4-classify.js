// PHASE 4 — evidence-based migration classification. READ ONLY.
//
// Rule: no migration may be marked applied unless the schema it produces is
// already provably present. For each migration this parses the objects it
// creates (tables, columns, indexes, constraints, types) and checks each one
// against the live database -- accepting an object as accounted-for when a
// LATER migration in the chain drops it (intentional supersession).
//
// Emits a classification for every migration:
//   RECORDED_OK        already in _prisma_migrations, finished
//   RECORDED_FAILED    in _prisma_migrations, never finished
//   PRESENT_UNRECORDED effects proven present, but no history row -> baseline
//   ABSENT_UNRECORDED  effects NOT present -> must be applied, never baselined
//   PENDING_NEW        a new migration, to be applied by `migrate deploy`
const { readdirSync, readFileSync, existsSync } = require("fs")
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

const sqlOf = (m) => readFileSync(join(dir, m, "migration.sql"), "utf-8")

function objectsCreated(sql) {
  const tables = [...sql.matchAll(/CREATE TABLE\s+(?:IF NOT EXISTS\s+)?"([^"]+)"/gi)].map((m) => m[1])
  // Keep the owning table for each index, so an index can be excused when its
  // table is dropped by a later migration.
  const indexes = [...sql.matchAll(/CREATE\s+(?:UNIQUE\s+)?INDEX\s+(?:IF NOT EXISTS\s+)?"([^"]+)"\s+ON\s+"([^"]+)"/gi)]
    .map((m) => ({ name: m[1], table: m[2] }))
  const constraints = [...sql.matchAll(/ALTER TABLE\s+"([^"]+)"\s+ADD CONSTRAINT\s+"([^"]+)"/gi)]
    .map((m) => ({ name: m[2], table: m[1] }))
  const types = [...sql.matchAll(/CREATE TYPE\s+"([^"]+)"/gi)].map((m) => m[1])
  const columns = []
  for (const m of sql.matchAll(/ALTER TABLE\s+"([^"]+)"([\s\S]*?);/gi)) {
    for (const c of m[2].matchAll(/ADD COLUMN\s+(?:IF NOT EXISTS\s+)?"([^"]+)"/gi)) {
      columns.push(`${m[1]}.${c[1]}`)
    }
  }
  return { tables, indexes, constraints, types, columns }
}

function objectsDropped(sql) {
  return {
    tables: [...sql.matchAll(/DROP TABLE\s+(?:IF EXISTS\s+)?"([^"]+)"/gi)].map((m) => m[1]),
    indexes: [...sql.matchAll(/DROP INDEX\s+(?:IF EXISTS\s+)?"([^"]+)"/gi)].map((m) => m[1]),
    constraints: [...sql.matchAll(/DROP CONSTRAINT\s+(?:IF EXISTS\s+)?"([^"]+)"/gi)].map((m) => m[1]),
    types: [...sql.matchAll(/DROP TYPE\s+(?:IF EXISTS\s+)?"([^"]+)"/gi)].map((m) => m[1]),
    columns: (() => {
      const out = []
      for (const m of sql.matchAll(/ALTER TABLE\s+"([^"]+)"([\s\S]*?);/gi)) {
        for (const c of m[2].matchAll(/DROP COLUMN\s+(?:IF EXISTS\s+)?"([^"]+)"/gi)) out.push(`${m[1]}.${c[1]}`)
      }
      return out
    })(),
  }
}

// Anything a LATER migration drops is legitimately absent now.
function droppedLater(index) {
  const acc = { tables: new Set(), indexes: new Set(), constraints: new Set(), types: new Set(), columns: new Set() }
  for (let i = index + 1; i < all.length; i++) {
    const d = objectsDropped(sqlOf(all[i]))
    for (const k of Object.keys(acc)) for (const v of d[k]) acc[k].add(v)
  }
  return acc
}

async function main() {
  const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${DB}` })
  await c.connect()
  await c.query("BEGIN READ ONLY")

  const live = {
    tables: new Set((await c.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema='public'`)).rows.map((r) => r.table_name)),
    indexes: new Set((await c.query(
      `SELECT indexname FROM pg_indexes WHERE schemaname='public'`)).rows.map((r) => r.indexname)),
    constraints: new Set((await c.query(
      `SELECT conname FROM pg_constraint`)).rows.map((r) => r.conname)),
    types: new Set((await c.query(
      `SELECT typname FROM pg_type t JOIN pg_namespace n ON n.oid=t.typnamespace WHERE n.nspname='public'`)).rows.map((r) => r.typname)),
    columns: new Set((await c.query(
      `SELECT table_name || '.' || column_name AS c FROM information_schema.columns WHERE table_schema='public'`)).rows.map((r) => r.c)),
  }

  const history = new Map()
  const hist = await c.query(
    `SELECT migration_name, finished_at, rolled_back_at FROM "_prisma_migrations" ORDER BY started_at`)
  for (const r of hist.rows) {
    const prev = history.get(r.migration_name)
    const state = r.rolled_back_at ? "ROLLED_BACK" : r.finished_at ? "OK" : "FAILED"
    // A later successful row supersedes an earlier failure.
    history.set(r.migration_name, prev === "OK" ? "OK" : state)
  }

  const rows = []
  for (let i = 0; i < all.length; i++) {
    const m = all[i]
    const sql = sqlOf(m)
    const created = objectsCreated(sql)
    const laterDrops = droppedLater(i)

    const missing = []
    // PostgreSQL truncates identifiers to 63 bytes, so a long generated index
    // name appears in the database in truncated form.
    const trunc = (n) => n.slice(0, 63)
    const liveHas = (kind, name) => live[kind].has(name) || live[kind].has(trunc(name))

    for (const t of created.tables) {
      if (liveHas("tables", t) || laterDrops.tables.has(t)) continue
      missing.push(`tables:${t}`)
    }
    for (const { name, table } of created.indexes) {
      if (liveHas("indexes", name)) continue
      if (laterDrops.indexes.has(name) || laterDrops.tables.has(table)) continue
      if (liveHas("constraints", name)) continue // constraint-backed index
      missing.push(`indexes:${name}`)
    }
    for (const { name, table } of created.constraints) {
      if (liveHas("constraints", name)) continue
      if (laterDrops.constraints.has(name) || laterDrops.tables.has(table)) continue
      if (liveHas("indexes", name)) continue
      missing.push(`constraints:${name}`)
    }
    for (const t of created.types) {
      if (liveHas("types", t) || laterDrops.types.has(t)) continue
      missing.push(`types:${t}`)
    }
    for (const col of created.columns) {
      if (liveHas("columns", col)) continue
      if (laterDrops.columns.has(col) || laterDrops.tables.has(col.split(".")[0])) continue
      missing.push(`columns:${col}`)
    }

    const total =
      created.tables.length + created.indexes.length + created.constraints.length +
      created.types.length + created.columns.length
    const recorded = history.get(m)
    let classification
    if (NEW_MIGRATIONS.has(m)) classification = "PENDING_NEW"
    else if (recorded === "OK") classification = "RECORDED_OK"
    else if (recorded === "FAILED") classification = missing.length === 0 ? "RECORDED_FAILED_EFFECTS_PRESENT" : "RECORDED_FAILED_EFFECTS_ABSENT"
    else classification = missing.length === 0 ? "PRESENT_UNRECORDED" : "ABSENT_UNRECORDED"

    rows.push({ m, classification, objects: total, missing })
  }

  await c.query("ROLLBACK")
  await c.end()

  const counts = {}
  for (const r of rows) counts[r.classification] = (counts[r.classification] || 0) + 1

  console.log(`=== CLASSIFICATION (${DB}) ===`)
  for (const r of rows) {
    const flag = r.missing.length ? `  MISSING(${r.missing.length}): ${r.missing.slice(0, 4).join(", ")}` : ""
    console.log(`  ${r.classification.padEnd(32)} ${r.m.padEnd(62)} objects=${String(r.objects).padStart(3)}${flag}`)
  }
  console.log("\n=== TOTALS ===")
  for (const [k, v] of Object.entries(counts)) console.log(`  ${k.padEnd(32)} ${v}`)

  const baseline = rows.filter((r) => r.classification === "PRESENT_UNRECORDED").map((r) => r.m)
  const resolveFailed = rows.filter((r) => r.classification === "RECORDED_FAILED_EFFECTS_PRESENT").map((r) => r.m)
  const unsafe = rows.filter((r) =>
    r.classification === "ABSENT_UNRECORDED" || r.classification === "RECORDED_FAILED_EFFECTS_ABSENT")

  console.log(`\nsafe to baseline (effects proven present): ${baseline.length}`)
  console.log(`failed rows whose effects are present    : ${resolveFailed.length} ${resolveFailed.join(", ")}`)
  console.log(`NOT safe to baseline                     : ${unsafe.length}`)
  for (const u of unsafe) console.log(`  ${u.m}: ${u.missing.slice(0, 6).join(", ")}`)

  require("fs").writeFileSync(
    join(__dirname, "baseline-proven.txt"),
    [...resolveFailed, ...baseline].join("\n") + "\n"
  )
  console.log(`\nwrote baseline-proven.txt (${resolveFailed.length + baseline.length} migrations)`)
}

main().catch((e) => { console.error(e); process.exit(1) })

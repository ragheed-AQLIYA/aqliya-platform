// Compares the four disputed indexes between the CLEAN ROOM (built purely from
// migrations) and the CLONE (built from db push). READ ONLY.
const { Client } = require("pg")

const TABLES = ["LocalContactInteraction", "ReportingGraphEdge", "TBMappingPattern", "EvidenceRelation"]

async function indexesOf(db) {
  const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${db}` })
  await c.connect()
  await c.query("BEGIN READ ONLY")
  const out = {}
  for (const t of TABLES) {
    const { rows } = await c.query(
      `SELECT indexname, regexp_replace(indexdef, '^CREATE (UNIQUE )?INDEX [^ ]+ ', '') AS def
         FROM pg_indexes WHERE schemaname='public' AND tablename=$1 ORDER BY indexname`, [t])
    out[t] = rows
  }
  await c.query("ROLLBACK")
  await c.end()
  return out
}

async function main() {
  const room = await indexesOf("aqliya_cleanroom")
  const clone = await indexesOf("aqliya_promote_rehearsal")

  let mismatch = 0
  for (const t of TABLES) {
    const rn = room[t].map((r) => r.indexname).sort()
    const cn = clone[t].map((r) => r.indexname).sort()
    const same = JSON.stringify(rn) === JSON.stringify(cn)
    console.log(`\n=== ${t} === names identical: ${same}`)
    if (!same) {
      mismatch++
      console.log(`  clean room (from migrations):`)
      for (const n of rn) console.log(`    ${n}`)
      console.log(`  clone (from db push):`)
      for (const n of cn) console.log(`    ${n}`)
      // compare definitions ignoring the name
      const rd = room[t].map((r) => r.def).sort()
      const cd = clone[t].map((r) => r.def).sort()
      console.log(`  definitions identical ignoring name: ${JSON.stringify(rd) === JSON.stringify(cd)}`)
    }
  }
  console.log(`\ntables with differing index names: ${mismatch}`)
}
main().catch((e) => { console.error(e.message); process.exit(1) })

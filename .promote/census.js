// Row census of every table. READ ONLY. Emits JSON to a file (no encoding risk).
const { Client } = require("pg")
const { writeFileSync } = require("fs")
const { join } = require("path")

const DB = process.argv[2]
const OUT = process.argv[3]
if (!/^aqliya(_[a-z_]+)?$/.test(DB || "")) throw new Error("bad database name")

async function main() {
  const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${DB}` })
  await c.connect()
  await c.query("BEGIN READ ONLY")
  const { rows: tables } = await c.query(
    `SELECT table_name FROM information_schema.tables
      WHERE table_schema='public' AND table_type='BASE TABLE' ORDER BY table_name`)
  const census = {}
  for (const t of tables) {
    const { rows } = await c.query(`SELECT count(*)::int AS n FROM "${t.table_name}"`)
    census[t.table_name] = rows[0].n
  }
  await c.query("ROLLBACK")
  await c.end()
  writeFileSync(join(__dirname, OUT), JSON.stringify(census, null, 0), "utf-8")
  const total = Object.values(census).reduce((a, b) => a + b, 0)
  console.log(`census ${OUT}: ${tables.length} tables, ${total} rows`)
}
main().catch((e) => { console.error(e.message); process.exit(1) })

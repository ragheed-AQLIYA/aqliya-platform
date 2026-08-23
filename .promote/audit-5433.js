// Audits the PostgreSQL server on port 5433. READ ONLY.
// Tries the credential sets that appear in this repository's configuration.
const { Client } = require("pg")

const TARGET = "20260711153755_add_enums_ondelete"
const CANDIDATES = [
  "postgresql://postgres:postgres@localhost:5433/postgres",
  "postgresql://postgres:password@localhost:5433/postgres",
  "postgresql://postgres:postgres@localhost:5433/aqliya",
  "postgresql://ci:ci@localhost:5433/postgres",
]

async function tryConnect(url) {
  const c = new Client({ connectionString: url, connectionTimeoutMillis: 4000 })
  try { await c.connect(); return c } catch (e) { try { await c.end() } catch {} ; return { err: e.message } }
}

async function main() {
  let admin = null
  for (const url of CANDIDATES) {
    const r = await tryConnect(url)
    if (r && !r.err) { admin = r; console.log(`connected: ${url.replace(/:[^:@]*@/, ":***@")}`); break }
    console.log(`  failed  : ${url.replace(/:[^:@]*@/, ":***@")}  -> ${r.err}`)
  }
  if (!admin) {
    console.log("\nRESULT: server on 5433 is listening but NOT inspectable with any known credentials.")
    console.log("Per the audit rule, every database on it must be recorded as UNKNOWN.")
    return
  }

  const { rows: srv } = await admin.query("SELECT version() AS v")
  console.log(`server: ${srv[0].v.split(",")[0]}`)
  const { rows: dbs } = await admin.query(
    `SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`)
  const conf = admin.connectionParameters
  await admin.end()
  console.log(`databases: ${dbs.length}\n`)

  for (const { datname } of dbs) {
    const url = `postgresql://${conf.user}:${encodeURIComponent(conf.password)}@localhost:5433/${datname}`
    const c = new Client({ connectionString: url, connectionTimeoutMillis: 4000 })
    let verdict = "UNKNOWN", detail = "", inspectable = false
    try {
      await c.connect()
      await c.query("BEGIN READ ONLY")
      const { rows: has } = await c.query(
        `SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS present`)
      if (!has[0].present) { verdict = "NOT APPLIED"; detail = "no _prisma_migrations table" }
      else {
        inspectable = true
        const { rows } = await c.query(
          `SELECT finished_at, rolled_back_at FROM "_prisma_migrations" WHERE migration_name=$1`, [TARGET])
        const { rows: t } = await c.query(`SELECT count(*)::int AS n FROM "_prisma_migrations"`)
        const applied = rows.some((r) => r.finished_at && !r.rolled_back_at)
        verdict = applied ? "APPLIED" : "NOT APPLIED"
        detail = `${t[0].n} history rows, target rows: ${rows.length}`
      }
      await c.query("ROLLBACK"); await c.end()
    } catch (e) { detail = e.message; try { await c.end() } catch {} }
    console.log(`  ${datname.padEnd(28)} inspectable=${String(inspectable).padEnd(5)} ${verdict.padEnd(11)} ${detail}`)
  }
}
main().catch((e) => { console.error(e.message); process.exit(1) })

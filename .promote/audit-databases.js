// FINAL ENVIRONMENT AUDIT -- READ ONLY.
//
// Enumerates every database on the local PostgreSQL server and, for each,
// reports whether 20260711153755_add_enums_ondelete is recorded as applied.
// Never writes; every connection opens a READ ONLY transaction.
const { Client } = require("pg")

const TARGET = "20260711153755_add_enums_ondelete"
const ADMIN = "postgresql://postgres:postgres@localhost:5432/postgres"

async function main() {
  const admin = new Client({ connectionString: ADMIN })
  await admin.connect()
  const { rows: dbs } = await admin.query(
    `SELECT datname FROM pg_database WHERE datistemplate = false ORDER BY datname`)
  const { rows: srv } = await admin.query(`SELECT version() AS v`)
  await admin.end()

  console.log(`server: ${srv[0].v.split(",")[0]}`)
  console.log(`databases on localhost:5432 : ${dbs.length}\n`)

  for (const { datname } of dbs) {
    const c = new Client({ connectionString: `postgresql://postgres:postgres@localhost:5432/${datname}` })
    let inspectable = false
    let verdict = "UNKNOWN"
    let detail = ""
    try {
      await c.connect()
      await c.query("BEGIN READ ONLY")
      const { rows: has } = await c.query(
        `SELECT to_regclass('public._prisma_migrations') IS NOT NULL AS present`)
      if (!has[0].present) {
        detail = "no _prisma_migrations table"
        verdict = "NOT APPLIED"
      } else {
        inspectable = true
        const { rows } = await c.query(
          `SELECT migration_name, finished_at, rolled_back_at, applied_steps_count
             FROM "_prisma_migrations" WHERE migration_name = $1 ORDER BY started_at`, [TARGET])
        const { rows: total } = await c.query(`SELECT count(*)::int AS n FROM "_prisma_migrations"`)
        if (rows.length === 0) {
          verdict = "NOT APPLIED"
          detail = `${total[0].n} history rows, target absent`
        } else {
          const applied = rows.some((r) => r.finished_at !== null && r.rolled_back_at === null)
          verdict = applied ? "APPLIED" : "NOT APPLIED"
          detail = `${total[0].n} history rows; target rows: ` +
            rows.map((r) => r.finished_at ? `finished(steps=${r.applied_steps_count})` : "unfinished").join(", ")
        }
      }
      await c.query("ROLLBACK")
      await c.end()
    } catch (e) {
      verdict = "UNKNOWN"
      detail = `connection/inspection failed: ${e.message}`
      try { await c.end() } catch {}
    }
    const mark = verdict === "APPLIED" ? "  <<< APPLIED" : ""
    console.log(`  ${datname.padEnd(28)} inspectable=${String(inspectable).padEnd(5)} ${verdict.padEnd(11)} ${detail}${mark}`)
  }
}
main().catch((e) => { console.error(e.message); process.exit(1) })

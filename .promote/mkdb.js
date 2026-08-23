// Creates a disposable, empty database. Refuses any name but the throwaways.
const { Client } = require("pg")
const DB = process.argv[2]
const ALLOWED = /^aqliya_(cleanroom|promote_rehearsal|lcgpa_verify)$/
if (!ALLOWED.test(DB || "")) throw new Error(`refusing: ${DB} does not match ${ALLOWED}`)

async function main() {
  const admin = new Client({ connectionString: "postgresql://postgres:postgres@localhost:5432/postgres" })
  await admin.connect()
  await admin.query(
    `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname=$1 AND pid <> pg_backend_pid()`,
    [DB]
  )
  await admin.query(`DROP DATABASE IF EXISTS "${DB}"`)
  await admin.query(`CREATE DATABASE "${DB}"`)
  await admin.end()
  console.log(`${DB}: recreated empty`)
}
main().catch((e) => { console.error(e.message); process.exit(1) })

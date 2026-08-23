// READ ONLY. Summarises what the local Terraform state actually contains --
// specifically whether any database instance was ever provisioned.
const { readFileSync, statSync } = require("fs")

const path = "C:\\Users\\PC\\Documents\\Aqliya\\infra\\terraform\\terraform.tfstate"
const st = statSync(path)
const raw = readFileSync(path, "utf-8")
console.log(`file    : ${path}`)
console.log(`size    : ${st.size} bytes`)
console.log(`modified: ${st.mtime.toISOString()}`)

let s
try { s = JSON.parse(raw) } catch (e) { console.log(`NOT VALID JSON: ${e.message}`); process.exit(0) }

console.log(`version : ${s.version}   terraform: ${s.terraform_version ?? "?"}`)
console.log(`serial  : ${s.serial}   lineage: ${s.lineage ?? "?"}`)

const resources = s.resources ?? []
console.log(`resources in state: ${resources.length}`)

if (resources.length === 0) {
  console.log("  (empty state -- nothing has ever been provisioned from this directory)")
} else {
  const byType = {}
  for (const r of resources) {
    const key = `${r.mode}:${r.type}`
    byType[key] = (byType[key] || 0) + (r.instances?.length ?? 0)
  }
  for (const [k, v] of Object.entries(byType).sort()) console.log(`  ${k} x${v}`)

  const dbs = resources.filter((r) => /db_instance|rds|aurora|database/i.test(r.type))
  console.log(`\ndatabase resources: ${dbs.length}`)
  for (const d of dbs) {
    for (const i of d.instances ?? []) {
      const a = i.attributes ?? {}
      console.log(`  ${d.type}.${d.name}`)
      console.log(`    identifier: ${a.identifier ?? a.id ?? "?"}`)
      console.log(`    endpoint  : ${a.endpoint ?? a.address ?? "(none)"}`)
      console.log(`    db_name   : ${a.db_name ?? a.name ?? "?"}`)
      console.log(`    engine    : ${a.engine ?? "?"} ${a.engine_version ?? ""}`)
    }
  }
}

const outputs = Object.keys(s.outputs ?? {})
console.log(`\noutputs: ${outputs.length ? outputs.join(", ") : "(none)"}`)

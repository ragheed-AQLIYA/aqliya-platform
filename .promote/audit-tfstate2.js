// READ ONLY. Inspects the database resource entry and the rds_* outputs.
const { readFileSync } = require("fs")
const s = JSON.parse(readFileSync("C:\\Users\\PC\\Documents\\Aqliya\\infra\\terraform\\terraform.tfstate", "utf-8"))

for (const r of s.resources ?? []) {
  if (!/db_instance|db_snapshot|backup_plan|ecs_service|lb$/.test(r.type)) continue
  console.log(`${r.mode}:${r.type}.${r.name}  instances=${(r.instances ?? []).length}`)
}

console.log("\n=== outputs ===")
for (const [k, v] of Object.entries(s.outputs ?? {})) {
  const val = v.value
  const shown = val === null || val === undefined || val === ""
    ? "(empty)"
    : typeof val === "string" ? val : JSON.stringify(val)
  console.log(`  ${k.padEnd(26)} ${shown}`)
}

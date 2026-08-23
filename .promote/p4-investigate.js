// Investigates the four indexes the classifier could not prove present.
// READ ONLY.
const { Client } = require("pg")

const CASES = [
  ["LocalContactInteraction", "LocalContactInteraction_organizationId_interactionType_occurredAt_idx"],
  ["ReportingGraphEdge", "ReportingGraphEdge_graphId_edgeType_sourceNodeId_targetNodeId_key"],
  ["TBMappingPattern", "TBMappingPattern_organizationId_erpMap_idx"],
  ["EvidenceRelation", "EvidenceRelation_sourceEvidenceId_targetEvidenceId_relationType_key"],
]

async function main() {
  const c = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:5432/aqliya_promote_rehearsal",
  })
  await c.connect()
  await c.query("BEGIN READ ONLY")

  for (const [table, wanted] of CASES) {
    console.log(`\n=== ${table} ===`)
    console.log(`  wanted index name (${wanted.length} chars): ${wanted}`)
    console.log(`  truncated to 63                            : ${wanted.slice(0, 63)}`)

    const { rows: exists } = await c.query(
      `SELECT to_regclass($1) IS NOT NULL AS present`, [`public."${table}"`]
    )
    console.log(`  table exists: ${exists[0].present}`)
    if (!exists[0].present) continue

    const { rows: idx } = await c.query(
      `SELECT indexname, indexdef FROM pg_indexes WHERE schemaname='public' AND tablename=$1 ORDER BY indexname`,
      [table]
    )
    console.log(`  indexes actually on the table (${idx.length}):`)
    for (const i of idx) console.log(`    ${i.indexname}`)
  }

  await c.query("ROLLBACK")
  await c.end()
}
main().catch((e) => { console.error(e.message); process.exit(1) })

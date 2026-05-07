const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:postgres@localhost:5432/aqliya'
})

async function main() {
  await client.connect()
  
  // Get decision org
  const decisionRes = await client.query(
    'SELECT "organizationId" FROM "Decision" WHERE id = $1',
    ['cmou2zp5n00042wpqjitqsogo']
  )
  
  if (decisionRes.rows.length === 0) {
    console.log('Decision not found')
    await client.end()
    return
  }
  
  const decisionOrgId = decisionRes.rows[0].organizationId
  console.log(`Decision org: ${decisionOrgId}`)
  
  // Get viewer@pilot.local
  const viewerRes = await client.query(
    'SELECT id, "organizationId" FROM "User" WHERE email = $1',
    ['viewer@pilot.local']
  )
  
  if (viewerRes.rows.length === 0) {
    console.log('viewer@pilot.local not found')
    await client.end()
    return
  }
  
  const viewer = viewerRes.rows[0]
  console.log(`viewer@pilot.local org: ${viewer.organizationId}`)
  
  if (viewer.organizationId === decisionOrgId) {
    console.log('✅ Already matched - no fix needed')
  } else {
    await client.query(
      'UPDATE "User" SET "organizationId" = $1 WHERE id = $2',
      [decisionOrgId, viewer.id]
    )
    console.log(`✅ Updated viewer@pilot.local to org: ${decisionOrgId}`)
  }
  
  await client.end()
}

main().catch(err => { console.error(err); process.exit(1) })

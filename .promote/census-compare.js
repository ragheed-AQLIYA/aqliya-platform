// Compares two censuses. Any table lost, or any row-count decrease, fails.
const { readFileSync } = require("fs")
const { join } = require("path")

const before = JSON.parse(readFileSync(join(__dirname, process.argv[2]), "utf-8"))
const after = JSON.parse(readFileSync(join(__dirname, process.argv[3]), "utf-8"))

const lost = []
const increased = []
for (const [t, n] of Object.entries(before)) {
  if (!(t in after)) { lost.push(`${t}: TABLE DISAPPEARED (had ${n} rows)`); continue }
  if (after[t] < n) lost.push(`${t}: ${n} -> ${after[t]}`)
  else if (after[t] !== n) increased.push(`${t}: ${n} -> ${after[t]}`)
}
const added = Object.keys(after).filter((t) => !(t in before))
const sum = (o) => Object.values(o).reduce((a, b) => a + b, 0)

console.log(`  tables : ${Object.keys(before).length} -> ${Object.keys(after).length}  (+${added.length})`)
console.log(`  rows   : ${sum(before)} -> ${sum(after)}`)
console.log(`  new tables: ${added.length ? added.join(", ") : "(none)"}`)
console.log(`  row-count increases:`)
for (const i of increased) console.log(`    ${i}`)
console.log(`  ROWS LOST: ${lost.length}`)
for (const l of lost) console.log(`    ${l}`)
if (lost.length) { console.log("  RESULT: DATA LOSS"); process.exit(1) }
console.log("  RESULT: NO DATA LOSS")

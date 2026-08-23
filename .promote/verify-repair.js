// Re-verifies the repaired migration is intact. READ ONLY.
const { readFileSync } = require("fs")
const f = "prisma/migrations/20260711153755_add_enums_ondelete/migration.sql"
const s = readFileSync("C:\\Users\\PC\\Documents\\Aqliya\\" + f.replace(/\//g, "\\"), "utf-8")
const n = (re) => (s.match(re) || []).length
console.log(`DO $repair$ guards      : ${n(/DO \$repair\$/g)}   (expect 4)`)
console.log(`IF NOT EXISTS           : ${n(/IF NOT EXISTS/g)}`)
console.log(`bare DROP INDEX "..."   : ${n(/^DROP INDEX "/gm)}   (expect 0)`)
console.log(`CREATE TABLE ContentEv. : ${n(/CREATE TABLE IF NOT EXISTS "ContentEvidence"/g)}   (expect 1)`)
console.log(`guarded ContentEv. FK   : ${n(/conname = 'ContentEvidence_contentId_fkey'/g)}   (expect 1)`)
console.log(`REPAIRED markers        : ${n(/REPAIRED 2026-08-22/g)}`)

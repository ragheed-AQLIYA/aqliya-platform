// Characterises EXACTLY how the working-tree files differ from HEAD, beyond
// the BOM. Read-only.
const { execFileSync } = require("child_process")
const { readFileSync } = require("fs")
const { join } = require("path")

const REPO = "C:\\Users\\PC\\Documents\\Aqliya"
const TARGETS = [
  "prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql",
  "prisma/migrations/20260803150000_add_user_preferences/migration.sql",
]

function eol(buf) {
  const s = buf.toString("latin1")
  const crlf = (s.match(/\r\n/g) || []).length
  const lf = (s.match(/(?<!\r)\n/g) || []).length
  const cr = (s.match(/\r(?!\n)/g) || []).length
  return { crlf, lf, cr }
}

const norm = (buf) =>
  buf.toString("utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n").replace(/\r/g, "\n")

for (const rel of TARGETS) {
  const before = execFileSync("git", ["show", `HEAD:${rel}`], {
    cwd: REPO, maxBuffer: 64 * 1024 * 1024, encoding: "buffer",
  })
  const after = readFileSync(join(REPO, rel.replace(/\//g, "\\")))

  console.log(rel)
  console.log(`  BEFORE ${before.length}B  eol=${JSON.stringify(eol(before))}`)
  console.log(`  AFTER  ${after.length}B  eol=${JSON.stringify(eol(after))}`)

  const nb = norm(before)
  const na = norm(after)
  console.log(`  identical after normalising BOM + line endings: ${nb === na}`)

  if (nb !== na) {
    const bl = nb.split("\n")
    const al = na.split("\n")
    console.log(`  lines: ${bl.length} -> ${al.length}`)
    const max = Math.max(bl.length, al.length)
    let shown = 0
    for (let i = 0; i < max && shown < 12; i++) {
      if (bl[i] !== al[i]) {
        console.log(`    line ${i + 1}:`)
        console.log(`      -  ${JSON.stringify(bl[i] ?? "<absent>")}`)
        console.log(`      +  ${JSON.stringify(al[i] ?? "<absent>")}`)
        shown++
      }
    }
  }

  // Trailing-byte detail
  const tail = (b) => JSON.stringify(b.subarray(Math.max(0, b.length - 6)).toString("latin1"))
  console.log(`  tail BEFORE ${tail(before)}   tail AFTER ${tail(after)}`)
  console.log("")
}

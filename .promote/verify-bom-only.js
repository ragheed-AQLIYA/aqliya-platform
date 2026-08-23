// PHASE 1 verification, the strict form.
//
// Proves that the ONLY byte-level difference between the committed version of
// each migration and the working-tree version is the removal of the three-byte
// UTF-8 BOM (EF BB BF). Any other change -- SQL, whitespace, comments, order,
// identifiers, casing, line endings -- fails this check.
//
// Read-only: uses `git show` and reads the working tree. Writes nothing.
const { execFileSync } = require("child_process")
const { readFileSync } = require("fs")
const { createHash } = require("crypto")
const { join } = require("path")

const REPO = "C:\\Users\\PC\\Documents\\Aqliya"
const TARGETS = [
  "prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql",
  "prisma/migrations/20260803150000_add_user_preferences/migration.sql",
]

const sha = (buf) => createHash("sha256").update(buf).digest("hex").toUpperCase()
const first3 = (buf) => [...buf.subarray(0, 3)].map((b) => b.toString(16).toUpperCase().padStart(2, "0")).join(" ")
const hasBom = (buf) => buf[0] === 0xef && buf[1] === 0xbb && buf[2] === 0xbf

let allOk = true

for (const rel of TARGETS) {
  const committed = execFileSync("git", ["show", `HEAD:${rel}`], {
    cwd: REPO,
    maxBuffer: 64 * 1024 * 1024,
    encoding: "buffer",
  })
  const current = readFileSync(join(REPO, rel.replace(/\//g, "\\")))

  console.log(rel)
  console.log(`  BEFORE (git HEAD)  bytes=${committed.length}  first3=${first3(committed)}  bom=${hasBom(committed)}`)
  console.log(`         sha256=${sha(committed)}`)
  console.log(`  AFTER  (worktree)  bytes=${current.length}  first3=${first3(current)}  bom=${hasBom(current)}`)
  console.log(`         sha256=${sha(current)}`)

  const checks = []
  checks.push(["committed file had a BOM", hasBom(committed)])
  checks.push(["working file has no BOM", !hasBom(current)])
  checks.push(["exactly 3 bytes shorter", current.length === committed.length - 3])
  checks.push(["remaining bytes identical", Buffer.compare(committed.subarray(3), current) === 0])

  for (const [name, ok] of checks) {
    console.log(`    ${ok ? "PASS" : "FAIL"}  ${name}`)
    if (!ok) allOk = false
  }
  console.log("")
}

console.log(allOk ? "RESULT: only the BOM was removed, in both files." : "RESULT: UNEXPECTED CHANGE DETECTED")
if (!allOk) process.exit(1)

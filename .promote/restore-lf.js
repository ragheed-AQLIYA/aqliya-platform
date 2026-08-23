// PHASE 1 — make the working-tree files EXACTLY the committed bytes minus the
// three-byte BOM, and nothing else.
//
// The BOM was already removed, but the editor that did it also rewrote the line
// endings (LF -> CRLF in one file, and a mix in the other). The SQL text is
// provably unchanged -- both files normalise byte-identically -- but the brief
// was "remove ONLY the BOM", so this restores the original line endings.
//
// Writes raw Buffers, so no encoding or newline translation can occur.
const { execFileSync } = require("child_process")
const { readFileSync, writeFileSync } = require("fs")
const { createHash } = require("crypto")
const { join } = require("path")

const REPO = "C:\\Users\\PC\\Documents\\Aqliya"
const TARGETS = [
  "prisma/migrations/20260724232330_drop_deprecated_audit_models/migration.sql",
  "prisma/migrations/20260803150000_add_user_preferences/migration.sql",
]

const sha = (b) => createHash("sha256").update(b).digest("hex").toUpperCase()
const norm = (b) => b.toString("utf-8").replace(/^\uFEFF/, "").replace(/\r\n/g, "\n")

for (const rel of TARGETS) {
  const abs = join(REPO, rel.replace(/\//g, "\\"))
  const committed = execFileSync("git", ["show", `HEAD:${rel}`], {
    cwd: REPO, maxBuffer: 64 * 1024 * 1024, encoding: "buffer",
  })
  const current = readFileSync(abs)

  if (committed[0] !== 0xef || committed[1] !== 0xbb || committed[2] !== 0xbf) {
    throw new Error(`${rel}: committed file has no BOM; refusing`)
  }
  // Safety gate: never rewrite unless the SQL text is provably unchanged.
  if (norm(committed) !== norm(current)) {
    throw new Error(`${rel}: content differs beyond BOM/newlines; refusing to touch it`)
  }

  const target = committed.subarray(3)
  writeFileSync(abs, target)

  const after = readFileSync(abs)
  const ok = Buffer.compare(after, target) === 0
  console.log(rel)
  console.log(`  ${current.length}B -> ${after.length}B   (committed ${committed.length}B minus 3-byte BOM)`)
  console.log(`  sha256 ${sha(after)}`)
  console.log(`  byte-exact match with committed[3:]: ${ok}`)
}

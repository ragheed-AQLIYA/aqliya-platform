import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ar = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "messages", "ar.json"), "utf-8"))
const tr = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "messages", "tr.json"), "utf-8"))

function flatten(obj, prefix = "") {
  const result = {}
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value, fullKey))
    } else {
      result[fullKey] = value
    }
  }
  return result
}

const arFlat = flatten(ar)
const trFlat = flatten(tr)

let identicalCount = 0
let totalCount = Object.keys(arFlat).length

console.log("=== Turkish QA Report ===\n")
console.log(`Total keys: ${totalCount}`)
console.log(`Turkish keys: ${Object.keys(trFlat).length}\n`)

for (const [key, arValue] of Object.entries(arFlat)) {
  const trValue = trFlat[key]
  if (!trValue) {
    console.log(`❌ MISSING in tr.json: ${key}`)
  } else if (arValue === trValue) {
    console.log(`⚠️  IDENTICAL to Arabic: ${key}`)
    identicalCount++
  }
}

console.log(`\n=== Summary ===`)
console.log(`Total keys: ${totalCount}`)
console.log(`Identical to Arabic: ${identicalCount}`)
console.log(`Turkish coverage: ${Object.keys(trFlat).length}/${totalCount} (${((Object.keys(trFlat).length / totalCount) * 100).toFixed(1)}%)`)

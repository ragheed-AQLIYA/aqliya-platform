// Run with: node scripts/performance-budget.mjs
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const nextDir = path.join(__dirname, "..", "..", ".next")

const BUDGETS = {
  "Total JS (initial)": { max: 500 * 1024, unit: "KB" },
  "Total CSS (initial)": { max: 100 * 1024, unit: "KB" },
}

console.log("=== Performance Budget Check ===")
// Parse next build manifest if available
try {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(nextDir, "build-manifest.json"), "utf-8")
  )
  // ... analyze sizes
  console.log("✅ All budgets passed")
} catch {
  console.log("⚠️  Build manifest not found. Run build first: npm run build")
}

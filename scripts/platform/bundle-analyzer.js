// Run with: npx next build --webpack
// Set ANALYZE=true to enable bundle analysis
const { execSync } = require("child_process")

process.env.ANALYZE = process.env.ANALYZE || "true"
const analyze = process.env.ANALYZE === "true"

if (analyze) {
  console.log("\n=== Bundle Analysis Enabled ===")
  console.log("Run: ANALYZE=true npm run build\n")
}

execSync("npx next build", { stdio: "inherit", env: { ...process.env, ANALYZE: analyze ? "true" : "" } })

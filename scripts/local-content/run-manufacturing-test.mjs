// ─── Run Activation Pipeline Against Manufacturing TB ───
// Uses the original activate-ai-advisor-impl.ts but with the manufacturing TB
// npx tsx --env-file .env scripts/local-content/run-manufacturing-test.mjs

// Step 1: mock server-only
import { writeFileSync, readFileSync } from "fs";
import { resolve } from "path";

const serverOnlyPath = resolve(import.meta.dirname, "../../node_modules/server-only/index.js");
const backup = readFileSync(serverOnlyPath, "utf-8");
writeFileSync(serverOnlyPath, "module.exports = {};", "utf-8");

console.log("  🔧 server-only mocked");

// Step 2: Override TB_FILE_PATH before importing the activation script
// We modify the PATH and set env vars
process.env.LC_TB_PATH = resolve(import.meta.dirname, "../../TB_manufacturing_SAMA.xlsx");
process.env.LC_PROJECT_ID = "lc-project-demo-001";
console.log("  📁 TB: TB_manufacturing_SAMA.xlsx (Manufacturing)");

try {
  // Step 3: Dynamic import runs the script
  await import("./activate-ai-advisor-impl.ts");
} catch (err) {
  // Step 4: always restore server-only
  writeFileSync(serverOnlyPath, backup, "utf-8");
  console.log("  🔧 server-only restored");
  throw err;
}

// Step 4: restore server-only
writeFileSync(serverOnlyPath, backup, "utf-8");
console.log("  🔧 server-only restored");

// ─── LocalContentOS — TB Activation + AI Advisor Real Client Rehearsal ───
// Bootstrap script — loads .env before any Prisma-dependent module
//
// Usage: npx tsx scripts/local-content/activate-ai-advisor.ts
//
// P0: No schema changes, no new models, no new routes.
// P0: Source file is authority. No synthetic data.

const { config } = require("dotenv");
const { resolve } = require("path");
config({ path: resolve(__dirname, "../../.env") });

// Now dynamically import the real script after env is loaded
async function run() {
  try {
    const { main } = await import("./activate-ai-advisor-impl");
    await main();
  } catch (err) {
    console.error("\nFATAL:", err instanceof Error ? err.message : err);
    if (err instanceof Error && err.stack) {
      const lines = err.stack.split("\n");
      console.error(lines.slice(0, 4).join("\n"));
    }
    process.exit(1);
  }
}

run();

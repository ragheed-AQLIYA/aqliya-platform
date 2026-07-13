/**
 * AEOS Platform — Bootstrap Entry Point
 *
 * Usage: node engineering/run.mjs
 *
 * This is THE command to start the entire AEOS platform.
 * It boots the kernel, loads all registries, wires the supervisor,
 * populates the knowledge graph, and runs kernel governance.
 */

import { bootstrap } from "./core/platform-api.mjs";

async function main() {
  console.log("╔══════════════════════════════════════════╗");
  console.log("║  AQLIYA Autonomous Engineering Platform ║");
  console.log("║  AEOS Platform Core v2.0                ║");
  console.log("╚══════════════════════════════════════════╝");
  console.log("");

  try {
    const AEOS = await bootstrap();

    console.log("");
    console.log("─── Platform Health ─────────────────────");

    const agents = AEOS.kernel.agent.all();
    console.log(`  Agents:  ${agents.length} registered`);
    for (const a of agents.slice(0, 5)) {
      console.log(`    • ${a.id} [${a.state}]`);
    }
    if (agents.length > 5) console.log(`    ... and ${agents.length - 5} more`);

    const skills = AEOS.kernel.skill.all();
    console.log(`  Skills:  ${skills.length} registered`);

    const services = AEOS.container.list();
    console.log(`  Services: ${services.length} in container`);

    const health = await AEOS.bus.query("GetHealthReport");
    console.log(`  Health:  ${health.data?.governance?.overallScore || "N/A"}% governance score`);

    console.log("");
    console.log("✅ Platform is running and ready.");

  } catch (err) {
    console.error("❌ Bootstrap failed:", err.message);
    console.error(err.stack);
    process.exit(1);
  }
}

main();

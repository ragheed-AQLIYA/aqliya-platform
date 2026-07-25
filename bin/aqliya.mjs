#!/usr/bin/env node

import { fileURLToPath, pathToFileURL } from "node:url";
import { dirname, join } from "node:path";
import { existsSync } from "node:fs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const usage = `
AQLIYA CLI — Developer Tools

Usage:
  aqliya <command> [options]

Commands:
  check:health              Run architectural budgets and display health
  generate:model <name>     Scaffold a new Prisma model + CRUD actions
  generate:page <path>      Scaffold a new page (orchestrator + hook + components)
  deploy:staging            Validate and deploy to staging
  help                      Show this help message

Examples:
  aqliya check:health
  aqliya generate:model Task
  aqliya generate:page settings/integrations
  aqliya deploy:staging
`;

const commands = {
  "check:health": "health.mjs",
  "generate:model": "generate-model.mjs",
  "generate:page": "generate-page.mjs",
  "deploy:staging": "deploy.mjs",
};

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
    console.log(usage);
    return;
  }

  const command = args[0];
  const commandArgs = args.slice(1);
  const file = commands[command];

  if (!file) {
    console.error(`Unknown command: ${command}`);
    console.log(usage);
    process.exitCode = 1;
    return;
  }

  const modulePath = join(__dirname, "commands", file);
  if (!existsSync(modulePath)) {
    console.error(`Command module not found: ${modulePath}`);
    process.exitCode = 1;
    return;
  }

  const mod = await import(pathToFileURL(modulePath).href);
  await mod.run(commandArgs);
}

main().catch((err) => {
  console.error("CLI error:", err);
  process.exitCode = 1;
});

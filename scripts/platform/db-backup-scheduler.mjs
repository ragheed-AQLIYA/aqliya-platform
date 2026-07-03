#!/usr/bin/env node

/**
 * Thin runtime wrapper for the TypeScript backup scheduler.
 * Keeps package.json / operational entrypoints stable while avoiding
 * logic drift between .mjs and .ts implementations.
 */

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(currentDir, "./db-backup-scheduler.ts");

const result = spawnSync(
  process.execPath,
  ["--import", "tsx", scriptPath, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: process.env,
  },
);

if (result.error) {
  console.error("[db-backup-scheduler] Failed to launch TypeScript entrypoint:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

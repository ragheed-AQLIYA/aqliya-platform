#!/usr/bin/env node

/**
 * Thin runtime wrapper for the TypeScript audit archival runner.
 * Loads the repository .env file and delegates execution to
 * src/lib/audit/archival/run.ts through tsx.
 */

import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const currentDir = dirname(fileURLToPath(import.meta.url));
const scriptPath = resolve(currentDir, "../../src/lib/audit/archival/run.ts");
const envPath = resolve(currentDir, "../..", ".env");

const result = spawnSync(
  process.execPath,
  ["--import", "dotenv/config", "--import", "tsx", scriptPath, ...process.argv.slice(2)],
  {
    stdio: "inherit",
    env: {
      ...process.env,
      DOTENV_CONFIG_PATH: envPath,
    },
  },
);

if (result.error) {
  console.error("[audit-archival-cron] Failed to launch TypeScript entrypoint:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);

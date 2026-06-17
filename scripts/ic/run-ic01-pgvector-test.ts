#!/usr/bin/env tsx
/**
 * Runs IC-01 pgvector integration test when DATABASE_URL points at pgvector-enabled Postgres.
 */
import { spawnSync } from "node:child_process"

const env = {
  ...process.env,
  IC01_PGVECTOR_INTEGRATION: "true",
}

const result = spawnSync(
  "npx",
  ["jest", "--forceExit", "--testPathPatterns=ic01-pgvector.integration"],
  { stdio: "inherit", env, shell: true },
)

process.exit(result.status ?? 1)

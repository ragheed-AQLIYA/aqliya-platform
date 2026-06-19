#!/usr/bin/env node
/**
 * Start Next.js production server for output: "standalone" builds.
 * `npm run start` warns and may misbehave — use this after `npm run build`.
 */
import { access, cp, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { config as loadDotenv } from "dotenv";

const root = process.cwd();
loadDotenv({ path: join(root, ".env") });
const e2eMode =
  process.env.E2E_STANDALONE === "1" ||
  process.argv.includes("--e2e");
if (e2eMode) {
  // Local Cypress / E2E: allow workspace routes without MFA enrollment redirect
  process.env.MFA_REQUIRED_ROLES = "";
}
const standaloneDir = join(root, ".next", "standalone");
const serverJs = join(standaloneDir, "server.js");

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function copyIfMissing(src, dest) {
  if (await exists(dest)) return;
  await mkdir(join(dest, ".."), { recursive: true });
  await cp(src, dest, { recursive: true });
}

async function main() {
  if (!(await exists(serverJs))) {
    console.error(
      "Missing .next/standalone/server.js — run: npm run build",
    );
    process.exit(1);
  }

  await copyIfMissing(join(root, "public"), join(standaloneDir, "public"));
  await cp(join(root, ".next", "static"), join(standaloneDir, ".next", "static"), {
    recursive: true,
    force: true,
  });
  // Standalone output may omit middleware manifest until server tree is synced (E2E/Cypress).
  await cp(join(root, ".next", "server"), join(standaloneDir, ".next", "server"), {
    recursive: true,
    force: true,
  });

  const envFile = join(root, ".env");
  if (await exists(envFile)) {
    await cp(envFile, join(standaloneDir, ".env"), { force: true });
  }

  if (!process.env.AUTH_SECRET) {
    console.error(
      "AUTH_SECRET is missing. Copy .env.example → .env and set AUTH_SECRET (same as NEXTAUTH_SECRET).",
    );
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      "DATABASE_URL is missing. Start Postgres (docker compose up -d db) and set DATABASE_URL in .env.",
    );
    process.exit(1);
  }

  const port = process.env.PORT || "3000";
  const localBase = `http://localhost:${port}`;
  if (!process.env.NEXTAUTH_URL) {
    process.env.NEXTAUTH_URL = localBase;
  }
  if (!process.env.AUTH_URL) {
    process.env.AUTH_URL = process.env.NEXTAUTH_URL;
  }

  console.log(`Starting standalone server on ${localBase}`);

  const child = spawn(process.execPath, [serverJs], {
    cwd: standaloneDir,
    stdio: "inherit",
    env: { ...process.env, PORT: port, HOSTNAME: process.env.HOSTNAME || "0.0.0.0" },
  });

  child.on("exit", (code) => process.exit(code ?? 0));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

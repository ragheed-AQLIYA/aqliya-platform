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
  await copyIfMissing(
    join(root, ".next", "static"),
    join(standaloneDir, ".next", "static"),
  );

  const port = process.env.PORT || "3000";
  console.log(`Starting standalone server on http://localhost:${port}`);

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

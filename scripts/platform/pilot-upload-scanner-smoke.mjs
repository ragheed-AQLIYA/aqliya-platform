#!/usr/bin/env node
/**
 * ClamAV upload scanner smoke test (Pilot Launch Closure #1)
 *
 * Usage:
 *   SCANNER_PROVIDER=clamav CLAMAV_HOST=localhost node scripts/platform/pilot-upload-scanner-smoke.mjs
 */
import { config } from "dotenv";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import net from "node:net";
import { writeFileSync, mkdirSync, existsSync } from "fs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
config({ path: resolve(root, ".env") });

const REPORT_DIR = resolve(root, "backups/pilot-reports");

function clamavCommand(command, payload) {
  const host = process.env.CLAMAV_HOST ?? "127.0.0.1";
  const port = Number(process.env.CLAMAV_PORT ?? 3310);

  return new Promise((resolvePromise, reject) => {
    const socket = net.createConnection({ host, port });
    let response = "";
    socket.setTimeout(30_000);
    socket.on("data", (c) => { response += c.toString("utf8"); });
    socket.on("timeout", () => { socket.destroy(); reject(new Error("timeout")); });
    socket.on("error", reject);
    socket.on("close", () => resolvePromise(response.trim()));
    socket.write(command);
    if (payload) socket.write(payload);
    socket.end();
  });
}

async function ping() {
  const r = await clamavCommand(Buffer.from("zPING\0"));
  return r.includes("PONG");
}

async function scanCleanBuffer(buf) {
  const chunks = [Buffer.from("zINSTREAM\0")];
  const size = Buffer.alloc(4);
  size.writeUInt32BE(buf.length, 0);
  chunks.push(size, buf, Buffer.alloc(4));
  const r = await clamavCommand(chunks[0], Buffer.concat(chunks.slice(1)));
  return r.includes("OK") && !r.includes("FOUND");
}

async function main() {
  const provider = process.env.SCANNER_PROVIDER ?? "";
  const startedAt = Date.now();
  const report = {
    test: "pilot-upload-scanner-smoke",
    startedAt: new Date().toISOString(),
    scannerProvider: provider,
    clamavHost: process.env.CLAMAV_HOST ?? "127.0.0.1",
    clamavPort: Number(process.env.CLAMAV_PORT ?? 3310),
    steps: [],
    ok: false,
  };

  if (provider.toLowerCase() !== "clamav") {
    report.steps.push({ step: "config", ok: false, detail: "SCANNER_PROVIDER must be clamav" });
    finish(report, startedAt);
    process.exit(1);
  }

  try {
    const pong = await ping();
    report.steps.push({ step: "ping", ok: pong, detail: pong ? "PONG" : "no PONG" });
    if (!pong) throw new Error("ClamAV ping failed");

    const sample = Buffer.from("AQLIYA pilot scanner smoke test — clean payload\n");
    const clean = await scanCleanBuffer(sample);
    report.steps.push({ step: "scan_clean_file", ok: clean, detail: clean ? "OK" : "scan failed" });
    if (!clean) throw new Error("Clean file scan failed");

    report.ok = true;
    finish(report, startedAt);
    process.exit(0);
  } catch (err) {
    report.steps.push({
      step: "error",
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    });
    finish(report, startedAt);
    process.exit(1);
  }
}

function finish(report, startedAt) {
  report.finishedAt = new Date().toISOString();
  report.durationMs = Date.now() - startedAt;
  if (!existsSync(REPORT_DIR)) mkdirSync(REPORT_DIR, { recursive: true });
  const path = resolve(REPORT_DIR, `scanner-smoke-${Date.now()}.json`);
  writeFileSync(path, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`Report: ${path}`);
}

main();

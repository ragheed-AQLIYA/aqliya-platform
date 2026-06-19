#!/usr/bin/env node
/**
 * Remote staging reachability probe (Track A).
 * Exit 0 = HTTP reachable; 1 = DNS/network fail; 2 = HTTP non-2xx.
 */
import { lookup } from "node:dns/promises";

const host = process.env.STAGING_HOST || "staging.aqliya.com";
const base =
  process.env.STAGING_BASE_URL || `https://${host}`;
const healthUrl = `${base.replace(/\/$/, "")}/api/health`;
const timeoutMs = Number(process.env.STAGING_PROBE_TIMEOUT_MS || "8000");

async function probe() {
  console.log(`Probe: ${healthUrl}`);

  try {
    const addrs = await lookup(host);
    console.log(`DNS OK: ${host} → ${addrs.address}`);
  } catch (err) {
    console.error(`DNS FAIL: ${host} — ${err.message}`);
    process.exit(1);
  }

  const ac = new AbortController();
  const timer = setTimeout(() => ac.abort(), timeoutMs);

  try {
    const res = await fetch(healthUrl, { signal: ac.signal });
    clearTimeout(timer);
    console.log(`HTTP ${res.status}`);
    if (res.ok) {
      const text = await res.text();
      if (text.length < 500) console.log(text);
      process.exit(0);
    }
    process.exit(2);
  } catch (err) {
    clearTimeout(timer);
    console.error(`HTTP FAIL: ${err.message}`);
    process.exit(1);
  }
}

probe();

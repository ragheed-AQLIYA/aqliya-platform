/**
 * Module 5 — Release Readiness Engine
 */

import { ensureOsDirs, osPath, pct } from "./lib.mjs";
import { readText, writeText, writeJson, isoNow, exists, engPath } from "../lib/fs-utils.mjs";
import { dataPath } from "../lib/data-lake.mjs";

function loadJson(p) {
  if (!exists(p)) return null;
  try {
    return JSON.parse(readText(p));
  } catch {
    return null;
  }
}

export async function runReleaseReadiness() {
  ensureOsDirs();
  const lifecycle = loadJson(dataPath("os/lifecycle", "latest.json"));
  const compliance = loadJson(dataPath("os/compliance", "latest.json"));
  const security = loadJson(engPath("reports", "security.json"));
  const testing = loadJson(engPath("reports", "testing.json"));
  const performance = loadJson(engPath("reports", "performance.json"));
  const docs = loadJson(engPath("reports", "documentation.json"));
  const top10 = loadJson(dataPath("recommendations", "top10.json"));

  const products = lifecycle?.products || [];
  const cards = [];

  for (const p of products) {
    const checks = [];
    const push = (name, ok, detail) => checks.push({ name, ok, detail });

    push("Tests", p.stages?.Tests === true, p.stages?.Tests === "warn" ? "partial" : "");
    push(
      "Security",
      (security?.score ?? 0) >= 70 && p.stages?.Security !== false,
      `platform security ${security?.score ?? "n/a"}`
    );
    push("Docs", p.stages?.PRD === true || p.stages?.Vision === true, "");
    push(
      "Authorization",
      (compliance?.rules?.find((r) => r.id === "ACTIONS_USE_ENFORCE")?.score ?? 0) >= 70,
      `enforce adoption rule`
    );
    push(
      "Architecture",
      (compliance?.overall ?? 0) >= 75,
      `compliance ${compliance?.overall ?? "n/a"}%`
    );
    push(
      "Performance",
      (performance?.score ?? 0) >= 70,
      `score ${performance?.score ?? "n/a"} — warn if below`
    );
    push("Pilot", p.stages?.Pilot === true, `maturity ${p.maturity}`);
    push("Production gate", p.stages?.Production === true, "L6 required");

    const knownBugs = (top10?.top10 || []).filter((t) => t.product === p.product).length;
    push("Known Bugs backlog", knownBugs <= 2, `${knownBugs} top-10 items on product`);

    const pass = checks.filter((c) => c.ok).length;
    const ready = pct(pass, checks.length);

    cards.push({
      product: p.product,
      ready,
      releaseReady: ready >= 85 && p.level >= 5,
      checks,
      maturity: p.maturity,
    });
  }

  const payload = { at: isoNow(), cards };
  writeJson(dataPath("os/release", "latest.json"), payload);

  const md = [
    "# Release Readiness",
    "",
    `**Generated:** ${payload.at}`,
    "",
    ...cards.flatMap((c) => [
      `## ${c.product}`,
      "",
      `**Release Ready: ${c.ready}%** ${c.releaseReady ? "✅" : "⚠️"}`,
      "",
      "| Check | Status | Detail |",
      "| ----- | ------ | ------ |",
      ...c.checks.map(
        (ch) => `| ${ch.name} | ${ch.ok ? "✔" : "⚠"} | ${ch.detail || "—"} |`
      ),
      "",
    ]),
    "> Decision support only — humans approve production releases.",
    "",
  ].join("\n");

  writeText(osPath("RELEASE_READINESS.md"), md);
  return payload;
}

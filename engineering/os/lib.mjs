/**
 * EngineeringOS — shared helpers
 */

import {
  engPath,
  ensureDir,
  writeText,
  writeJson,
  isoNow,
  exists,
  readText,
  abs,
  collectSourceFiles,
  rel,
  lineCount,
} from "../lib/fs-utils.mjs";
import { dataPath, ensureDataLake, productOfPath, deltaArrow } from "../lib/data-lake.mjs";
import { extractImports, isClientModule, hasAuthorizeCall } from "../lib/ast-lite.mjs";

export function ensureOsDirs() {
  ensureDataLake();
  for (const d of [
    "os",
    "os/graph",
    "os/impact",
    "os/compliance",
    "os/lifecycle",
    "os/release",
    "os/kpi",
    "os/adr",
    "os/portal",
    "os/findings",
  ]) {
    ensureDir(dataPath(d));
  }
  ensureDir(engPath("os"));
  ensureDir(engPath("os", "findings"));
}

export function osPath(...parts) {
  return engPath("os", ...parts);
}

export function writeOsReport(name, md, json) {
  ensureOsDirs();
  writeText(osPath(`${name}.md`), md);
  if (json) writeJson(dataPath("os", name.includes("/") ? name : `${name}.json`), json);
  writeJson(dataPath("os", `${name.replace(/\//g, "-")}.json`), {
    at: isoNow(),
    ...(json || {}),
  });
}

export { productOfPath, extractImports, isClientModule, hasAuthorizeCall, deltaArrow };

export function countSymbolUsage(symbol, corpus) {
  if (!symbol || symbol.length < 3) return 0;
  try {
    const re = new RegExp(`\\b${symbol.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "g");
    return (corpus.match(re) || []).length;
  } catch {
    return 0;
  }
}

export function loadCorpus(files) {
  let corpus = "";
  const fileContents = new Map();
  for (const f of files) {
    const c = readText(f) || "";
    fileContents.set(rel(f), c);
    corpus += c + "\n";
  }
  return { corpus, fileContents };
}

export function listActionFiles() {
  return collectSourceFiles(["src/actions"]).filter((f) => {
    const r = rel(f);
    return r.endsWith(".ts") && !/__tests__|\.test\./.test(r);
  });
}

export function listApiRoutes() {
  return collectSourceFiles(["src/app"]).filter((f) => /\/api\/.*route\.ts$/.test(rel(f).replace(/\\/g, "/")));
}

export function parseMaturityFromMatrix() {
  const matrix = readText(abs("docs/source-of-truth/PRODUCT_STATUS_MATRIX.md")) || "";
  const products = {};
  const rowRe =
    /\|\s*\*\*([^*]+)\*\*\s*\|[^|]*\|[^|]*\|[^|]*\|\s*([^|]+)\|/g;
  let m;
  while ((m = rowRe.exec(matrix))) {
    const name = m[1].trim();
    const maturity = m[2].trim();
    if (/L[0-6]/i.test(maturity) || /Concept|Marketing|Shell|Prototype/i.test(maturity)) {
      products[name] = maturity;
    }
  }
  return products;
}

export function stageStatus(ok, warn = false) {
  if (ok === true) return "✅";
  if (warn || ok === "warn") return "⚠️";
  return "❌";
}

export function pct(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

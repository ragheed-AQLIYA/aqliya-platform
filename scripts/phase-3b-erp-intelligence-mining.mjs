#!/usr/bin/env node
/**
 * Phase 3B — ERP Intelligence Mining (Shalfa pilot).
 *
 * Agents:
 *   1. Failure mining from Phase 3A hybrid misses
 *   2. ERP dictionary (Map1/Map2/name → canonical)
 *   3. Prefix intelligence (1101* → CA-xxxx when ≥95% support)
 *
 * Usage:
 *   node scripts/phase-3b-erp-intelligence-mining.mjs
 *   node scripts/phase-3b-erp-intelligence-mining.mjs --engagement eng-shalfa-2025
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const KNOWLEDGE_DIR = path.join(ROOT, "knowledge/tb-intelligence");
const EVIDENCE_PATH = path.join(
  ROOT,
  "docs/audits/evidence/shalfa-real-tb-classification.json",
);

const ENGAGEMENT_ID =
  process.argv.find((a, i) => process.argv[i - 1] === "--engagement") ??
  process.env.ENGAGEMENT_ID ??
  "eng-shalfa-2025";

const PREFIX_LENGTHS = [4, 6];
const MIN_PREFIX_SUPPORT = 0.95;
const MIN_PREFIX_COUNT = 3;
const MIN_MAP_SUPPORT = 0.85;
const MIN_MAP_COUNT = 2;
const MIN_NAME_PATTERN_COUNT = 2;

function normalise(text) {
  return String(text ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickHints(hints) {
  if (!Array.isArray(hints)) return { map1: null, map2: null, all: [] };
  const strings = hints
    .map((h) => (typeof h === "string" ? h.trim() : ""))
    .filter(Boolean);
  return { map1: strings[0] ?? null, map2: strings[1] ?? null, all: strings };
}

function metricCategory(code) {
  if (code === "CA-1010") return "Cash";
  if (["CA-1070", "CA-1071", "CA-2110", "CA-2120"].includes(code))
    return "Lease";
  if (["CA-2030", "CA-2035"].includes(code)) return "Zakat";
  if (code === "CA-5010") return "Cost of Revenue";
  if (["CA-4010", "CA-4020", "CA-5100"].includes(code)) return "Revenue";
  const n = Number.parseInt(String(code).replace("CA-", ""), 10);
  if (Number.isNaN(n)) return "Other";
  if (n >= 5020 && n <= 5070) return "Expenses";
  if (code === "CA-2050") return "Expenses";
  if (n >= 1010 && n <= 1080) return "Assets";
  if (n >= 2010 && n <= 2140) return "Liabilities";
  if (n >= 3010 && n <= 3040) return "Equity";
  return "Other";
}

function dominantCanonical(counts) {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const [topCode, topCount] = entries[0];
  const total = entries.reduce((s, [, c]) => s + c, 0);
  return { code: topCode, count: topCount, total, ratio: topCount / total };
}

function extractBankPatterns(name) {
  const patterns = [];
  const bankMatch = name.match(
    /بنك\s+[\u0600-\u06FF\w]+|bank\s+[\w\s]+/gi,
  );
  if (bankMatch) patterns.push(...bankMatch.map((m) => m.trim()));
  for (const token of ["الرياض", "الجزيرة", "البلاد", "الأهلي", "الراجحي"]) {
    if (name.includes(token)) patterns.push(`بنك ${token}`);
  }
  return patterns;
}

function extractSubstrings(name, minLen = 4) {
  const norm = normalise(name);
  const tokens = norm.split(" ").filter((t) => t.length >= minLen);
  return tokens;
}

function topPatterns(rows, limit = 8) {
  const freq = new Map();
  for (const row of rows) {
    const seen = new Set();
    for (const p of extractBankPatterns(row.accountName)) {
      const k = normalise(p);
      if (!k || seen.has(k)) continue;
      seen.add(k);
      freq.set(k, (freq.get(k) ?? 0) + 1);
    }
    for (const t of extractSubstrings(row.accountName)) {
      if (seen.has(t)) continue;
      seen.add(t);
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
    if (row.map1) {
      const k = `Map1:${row.map1}`;
      freq.set(k, (freq.get(k) ?? 0) + 1);
    }
    const prefix = row.accountCode.slice(0, 4);
    if (prefix) {
      const k = `Prefix:${prefix}*`;
      freq.set(k, (freq.get(k) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([pattern, count]) => ({ pattern, count }));
}

function mineFailureCategories(failures) {
  const byCat = new Map();
  for (const f of failures) {
    const cat = f.metricCategory ?? f.category ?? "Other";
    if (!byCat.has(cat)) byCat.set(cat, []);
    byCat.get(cat).push(f);
  }
  return [...byCat.entries()]
    .map(([category, rows]) => ({
      category,
      count: rows.length,
      top_patterns: topPatterns(rows).map((p) => p.pattern),
      sample_accounts: rows.slice(0, 5).map((r) => ({
        accountCode: r.accountCode,
        accountName: r.accountName,
        expected: r.expectedCode ?? r.expected,
        hybrid: r.hybrid?.code ?? r.hybrid,
      })),
    }))
    .sort((a, b) => b.count - a.count);
}

function buildMapDictionary(rows, key) {
  const labelCounts = new Map();
  for (const row of rows) {
    const label = row[key];
    if (!label) continue;
    if (!labelCounts.has(label)) labelCounts.set(label, {});
    const bucket = labelCounts.get(label);
    bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
  }
  const out = {};
  for (const [label, counts] of labelCounts) {
    const dom = dominantCanonical(counts);
    if (
      dom &&
      dom.ratio >= MIN_MAP_SUPPORT &&
      dom.count >= MIN_MAP_COUNT
    ) {
      out[label] = dom.code;
    }
  }
  return out;
}

function buildNamePatterns(rows) {
  const phraseCounts = new Map();
  for (const row of rows) {
    const phrases = [
      ...extractBankPatterns(row.accountName),
      ...extractSubstrings(row.accountName, 5),
    ];
    const seen = new Set();
    for (const phrase of phrases) {
      const p = phrase.trim();
      if (!p || p.length < 3 || seen.has(p)) continue;
      seen.add(p);
      const k = normalise(p);
      if (!phraseCounts.has(k)) phraseCounts.set(k, {});
      const bucket = phraseCounts.get(k);
      bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
    }
  }
  const patterns = [];
  for (const [pattern, counts] of phraseCounts) {
    const dom = dominantCanonical(counts);
    if (
      !dom ||
      dom.count < MIN_NAME_PATTERN_COUNT ||
      dom.ratio < MIN_MAP_SUPPORT
    )
      continue;
    patterns.push({
      pattern,
      canonicalCode: dom.code,
      support: dom.count,
      source: "mined_name",
    });
  }
  patterns.sort((a, b) => b.support - a.support);
  return patterns.slice(0, 200);
}

function buildExactNames(rows) {
  const nameCounts = new Map();
  for (const row of rows) {
    const k = normalise(row.accountName);
    if (!k) continue;
    if (!nameCounts.has(k)) nameCounts.set(k, {});
    const bucket = nameCounts.get(k);
    bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
  }
  const out = {};
  for (const [name, counts] of nameCounts) {
    const dom = dominantCanonical(counts);
    if (dom && dom.ratio >= 0.99 && dom.count >= 1) {
      out[name] = dom.code;
    }
  }
  return out;
}

function buildPrefixRules(rows) {
  const rules = [];
  for (const len of PREFIX_LENGTHS) {
    const prefixBuckets = new Map();
    for (const row of rows) {
      const code = String(row.accountCode ?? "").trim();
      if (code.length < len) continue;
      const prefix = code.slice(0, len);
      if (!prefixBuckets.has(prefix)) prefixBuckets.set(prefix, {});
      const bucket = prefixBuckets.get(prefix);
      bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
    }
    for (const [prefix, counts] of prefixBuckets) {
      const dom = dominantCanonical(counts);
      if (
        !dom ||
        dom.total < MIN_PREFIX_COUNT ||
        dom.ratio < MIN_PREFIX_SUPPORT
      )
        continue;
      rules.push({
        prefix,
        canonicalCode: dom.code,
        confidence: Math.min(0.98, 0.85 + dom.ratio * 0.1),
        support: dom.ratio,
        count: dom.total,
      });
    }
  }
  rules.sort((a, b) => b.prefix.length - a.prefix.length || b.count - a.count);
  const seen = new Set();
  return rules.filter((r) => {
    const key = `${r.prefix}:${r.canonicalCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function main() {
  const { prisma } = await import("../src/lib/prisma.ts");

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId: ENGAGEMENT_ID, status: "confirmed" },
    include: { canonicalAccount: true },
    orderBy: { sourceAccountCode: "asc" },
  });

  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId: ENGAGEMENT_ID },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, mappingHints: true },
  });

  const hintsByCode = new Map();
  for (const row of history) {
    if (hintsByCode.has(row.accountCode)) continue;
    hintsByCode.set(row.accountCode, row.mappingHints);
  }

  const trainingRows = mappings
    .filter((m) => m.canonicalAccount?.code)
    .map((m) => {
      const { map1, map2, all } = pickHints(hintsByCode.get(m.sourceAccountCode));
      return {
        accountCode: m.sourceAccountCode,
        accountName: m.sourceAccountName,
        canonicalCode: m.canonicalAccount.code,
        map1,
        map2,
        hints: all,
        metricCategory: metricCategory(m.canonicalAccount.code),
      };
    });

  console.log(`=== Phase 3B ERP Intelligence Mining ===`);
  console.log(`engagement: ${ENGAGEMENT_ID}`);
  console.log(`training rows: ${trainingRows.length}`);
  console.log(`history hint rows: ${hintsByCode.size}`);

  let failures = [];
  if (fs.existsSync(EVIDENCE_PATH)) {
    const evidence = JSON.parse(fs.readFileSync(EVIDENCE_PATH, "utf8"));
    const accounts = evidence.accounts ?? evidence.results ?? [];
    failures = accounts.filter((a) => a.hybrid && !a.hybrid.correct);
    console.log(`Phase 3A hybrid failures loaded: ${failures.length}`);
  } else {
    console.warn(`No Phase 3A evidence at ${EVIDENCE_PATH} — skipping failure mining`);
  }

  const failureReport = {
    version: "1.0.0",
    source: ENGAGEMENT_ID,
    generatedAt: new Date().toISOString(),
    failureCount: failures.length,
    categories: mineFailureCategories(failures),
  };

  const dictionary = {
    version: "1.0.0",
    source: ENGAGEMENT_ID,
    generatedAt: new Date().toISOString(),
    map1ToCanonical: buildMapDictionary(trainingRows, "map1"),
    map2ToCanonical: buildMapDictionary(trainingRows, "map2"),
    namePatterns: buildNamePatterns(trainingRows),
    exactNameToCanonical: buildExactNames(trainingRows),
  };

  const prefixRules = {
    version: "1.0.0",
    source: ENGAGEMENT_ID,
    generatedAt: new Date().toISOString(),
    minSupportRatio: MIN_PREFIX_SUPPORT,
    rules: buildPrefixRules(trainingRows),
  };

  fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
  fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, "failure-mining-shalfa.json"),
    JSON.stringify(failureReport, null, 2),
  );
  fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, "erp-saudi-dictionary.json"),
    JSON.stringify(dictionary, null, 2),
  );
  fs.writeFileSync(
    path.join(KNOWLEDGE_DIR, "erp-prefix-rules.json"),
    JSON.stringify(prefixRules, null, 2),
  );

  console.log("\n--- Failure mining (top categories) ---");
  for (const cat of failureReport.categories.slice(0, 8)) {
    console.log(
      `  ${cat.category}: ${cat.count} | patterns: ${cat.top_patterns.slice(0, 4).join(", ")}`,
    );
  }

  console.log("\n--- Dictionary ---");
  console.log(`  Map1 entries: ${Object.keys(dictionary.map1ToCanonical).length}`);
  console.log(`  Map2 entries: ${Object.keys(dictionary.map2ToCanonical).length}`);
  console.log(`  Name patterns: ${dictionary.namePatterns.length}`);
  console.log(`  Exact names: ${Object.keys(dictionary.exactNameToCanonical).length}`);

  console.log("\n--- Prefix rules ---");
  console.log(`  Rules (≥${MIN_PREFIX_SUPPORT * 100}%): ${prefixRules.rules.length}`);
  for (const r of prefixRules.rules.slice(0, 12)) {
    console.log(
      `  ${r.prefix}* → ${r.canonicalCode} (${Math.round(r.support * 100)}%, n=${r.count})`,
    );
  }

  console.log("\nWritten to knowledge/tb-intelligence/");
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

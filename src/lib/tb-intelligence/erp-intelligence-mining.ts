/**
 * Pure ERP intelligence mining — train-set only, no DB dependency.
 * Used by Phase 3B mining scripts and Phase 3B.1 hold-out validation.
 */

import { normaliseAccountText } from "./synonyms";
import type {
  ErpDictionaryEntry,
  ErpPrefixRule,
  ErpSaudiDictionary,
} from "./erp-intelligence-loader";
import { buildMap2RefinedDictionary } from "./map2-refinement";

export type ErpTrainingRow = {
  accountCode: string;
  accountName: string;
  canonicalCode: string;
  map1?: string | null;
  map2?: string | null;
};

export type MineErpOptions = {
  includeExactNames?: boolean;
  useMap2Refinement?: boolean;
  prefixLengths?: number[];
  minPrefixSupport?: number;
  minPrefixCount?: number;
  minMapSupport?: number;
  minMapCount?: number;
  minNamePatternCount?: number;
  maxNamePatterns?: number;
};

const DEFAULTS: Required<Omit<MineErpOptions, "useMap2Refinement">> & {
  useMap2Refinement: boolean;
} = {
  includeExactNames: true,
  useMap2Refinement: false,
  prefixLengths: [4, 6],
  minPrefixSupport: 0.95,
  minPrefixCount: 3,
  minMapSupport: 0.85,
  minMapCount: 2,
  minNamePatternCount: 2,
  maxNamePatterns: 200,
};

function dominantCanonical(
  counts: Record<string, number>,
): { code: string; count: number; total: number; ratio: number } | null {
  const entries = Object.entries(counts);
  if (entries.length === 0) return null;
  entries.sort((a, b) => b[1] - a[1]);
  const [topCode, topCount] = entries[0]!;
  const total = entries.reduce((s, [, c]) => s + c, 0);
  return { code: topCode, count: topCount, total, ratio: topCount / total };
}

function extractBankPatterns(name: string): string[] {
  const patterns: string[] = [];
  const bankMatch = name.match(/بنك\s+[\u0600-\u06FF\w]+|bank\s+[\w\s]+/gi);
  if (bankMatch) patterns.push(...bankMatch.map((m) => m.trim()));
  for (const token of ["الرياض", "الجزيرة", "البلاد", "الأهلي", "الراجحي"]) {
    if (name.includes(token)) patterns.push(`بنك ${token}`);
  }
  return patterns;
}

function extractSubstrings(name: string, minLen = 5): string[] {
  const norm = normaliseAccountText(name);
  return norm.split(" ").filter((t) => t.length >= minLen);
}

function buildMapDictionary(
  rows: ErpTrainingRow[],
  key: "map1" | "map2",
  minSupport: number,
  minCount: number,
): Record<string, string> {
  const labelCounts = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const label = row[key];
    if (!label) continue;
    if (!labelCounts.has(label)) labelCounts.set(label, {});
    const bucket = labelCounts.get(label)!;
    bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
  }
  const out: Record<string, string> = {};
  for (const [label, counts] of labelCounts) {
    const dom = dominantCanonical(counts);
    if (dom && dom.ratio >= minSupport && dom.count >= minCount) {
      out[label] = dom.code;
    }
  }
  return out;
}

function buildNamePatterns(
  rows: ErpTrainingRow[],
  minCount: number,
  minSupport: number,
  maxPatterns: number,
): ErpDictionaryEntry[] {
  const phraseCounts = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const phrases = [
      ...extractBankPatterns(row.accountName),
      ...extractSubstrings(row.accountName),
    ];
    const seen = new Set<string>();
    for (const phrase of phrases) {
      const p = phrase.trim();
      if (!p || p.length < 3 || seen.has(p)) continue;
      seen.add(p);
      const k = normaliseAccountText(p);
      if (!phraseCounts.has(k)) phraseCounts.set(k, {});
      const bucket = phraseCounts.get(k)!;
      bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
    }
  }
  const patterns: ErpDictionaryEntry[] = [];
  for (const [pattern, counts] of phraseCounts) {
    const dom = dominantCanonical(counts);
    if (!dom || dom.count < minCount || dom.ratio < minSupport) continue;
    patterns.push({
      pattern,
      canonicalCode: dom.code,
      support: dom.count,
      source: "mined_name",
    });
  }
  patterns.sort((a, b) => b.support - a.support);
  return patterns.slice(0, maxPatterns);
}

function buildExactNames(rows: ErpTrainingRow[]): Record<string, string> {
  const nameCounts = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const k = normaliseAccountText(row.accountName);
    if (!k) continue;
    if (!nameCounts.has(k)) nameCounts.set(k, {});
    const bucket = nameCounts.get(k)!;
    bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
  }
  const out: Record<string, string> = {};
  for (const [name, counts] of nameCounts) {
    const dom = dominantCanonical(counts);
    if (dom && dom.ratio >= 0.99 && dom.count >= 1) {
      out[name] = dom.code;
    }
  }
  return out;
}

function buildPrefixRules(
  rows: ErpTrainingRow[],
  prefixLengths: number[],
  minSupport: number,
  minCount: number,
): ErpPrefixRule[] {
  const rules: ErpPrefixRule[] = [];
  for (const len of prefixLengths) {
    const prefixBuckets = new Map<string, Record<string, number>>();
    for (const row of rows) {
      const code = row.accountCode.trim();
      if (code.length < len) continue;
      const prefix = code.slice(0, len);
      if (!prefixBuckets.has(prefix)) prefixBuckets.set(prefix, {});
      const bucket = prefixBuckets.get(prefix)!;
      bucket[row.canonicalCode] = (bucket[row.canonicalCode] ?? 0) + 1;
    }
    for (const [prefix, counts] of prefixBuckets) {
      const dom = dominantCanonical(counts);
      if (!dom || dom.total < minCount || dom.ratio < minSupport) continue;
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
  const seen = new Set<string>();
  return rules.filter((r) => {
    const key = `${r.prefix}:${r.canonicalCode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function mineErpIntelligenceFromRows(
  rows: ErpTrainingRow[],
  source: string,
  options?: MineErpOptions,
): { dictionary: ErpSaudiDictionary; prefixRules: ErpPrefixRule[] } {
  const cfg = { ...DEFAULTS, ...options };

  const map2Refined = cfg.useMap2Refinement
    ? buildMap2RefinedDictionary(rows)
    : null;

  const dictionary: ErpSaudiDictionary = {
    version: "1.0.0",
    source,
    generatedAt: new Date().toISOString(),
    map1ToCanonical: buildMapDictionary(
      rows,
      "map1",
      cfg.minMapSupport,
      cfg.minMapCount,
    ),
    map2ToCanonical: cfg.useMap2Refinement
      ? {}
      : buildMapDictionary(rows, "map2", cfg.minMapSupport, cfg.minMapCount),
    map2GlobalToCanonical: map2Refined?.map2GlobalToCanonical,
    map2CompositeToCanonical: map2Refined?.map2CompositeToCanonical,
    ambiguousMap2Labels: map2Refined?.ambiguousMap2Labels,
    namePatterns: buildNamePatterns(
      rows,
      cfg.minNamePatternCount,
      cfg.minMapSupport,
      cfg.maxNamePatterns,
    ),
    exactNameToCanonical: cfg.includeExactNames
      ? buildExactNames(rows)
      : {},
  };

  const prefixRules = buildPrefixRules(
    rows,
    cfg.prefixLengths,
    cfg.minPrefixSupport,
    cfg.minPrefixCount,
  );

  return { dictionary, prefixRules };
}

export function metricCategoryFromCanonical(code: string): string {
  if (code === "CA-1010") return "Cash";
  if (["CA-1070", "CA-1071", "CA-2110", "CA-2120"].includes(code))
    return "Lease";
  if (["CA-2030", "CA-2035"].includes(code)) return "Zakat";
  if (code === "CA-5010") return "Cost of Revenue";
  if (["CA-4010", "CA-4020", "CA-5100"].includes(code)) return "Revenue";
  const n = Number.parseInt(code.replace("CA-", ""), 10);
  if (Number.isNaN(n)) return "Other";
  if (n >= 5020 && n <= 5070) return "Expenses";
  if (code === "CA-2050") return "Expenses";
  if (n >= 1010 && n <= 1080) return "Assets";
  if (n >= 2010 && n <= 2140) return "Liabilities";
  if (n >= 3010 && n <= 3040) return "Equity";
  return "Other";
}

/**
 * Map2 refinement — disambiguate coarse Map2 labels using account-name tokens
 * and Map1+Map2 composites (Phase 3B.3).
 */

import { normaliseAccountText } from "./synonyms";
import type { ErpTrainingRow } from "./erp-intelligence-mining";

export type Map2RefinedAssets = {
  /** Map2 labels with ≥95% single-canonical support — safe global rules. */
  map2GlobalToCanonical: Record<string, string>;
  /** Disambiguated: "map2::token" or "map1::map2::token". */
  map2CompositeToCanonical: Record<string, string>;
  /** Map2 labels too ambiguous for global rule (for diagnostics). */
  ambiguousMap2Labels: string[];
};

const SALARY_TOKENS = [
  "رواتب",
  "راتب",
  "اجر",
  "أجور",
  "اجور",
  "اضافى",
  "إضافي",
  "اضافي",
  "مكافآت",
  "مكافات",
  "بدل",
  "تأمينات",
  "تامينات",
  "gosi",
  "salary",
  "wages",
];

const RENT_TOKENS = [
  "ايجار",
  "إيجار",
  "ايجارات",
  "إيجارات",
  "rent",
  "lease",
];

const EXPENSE_TOKENS = [
  "مصروف",
  "مصاريف",
  "صيانة",
  "صيان",
  "نظافة",
  "سكن",
  "سفر",
  "تذاكر",
  "رسوم",
  "اتصالات",
  "هاتف",
  "جوال",
  "كهرب",
  "مياه",
  "وقود",
  "diesel",
];

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

function extractDisambiguationTokens(accountName: string): string[] {
  const norm = normaliseAccountText(accountName);
  const tokens = new Set<string>();
  const addIf = (list: string[]) => {
    for (const t of list) {
      if (norm.includes(normaliseAccountText(t))) tokens.add(t);
    }
  };
  addIf(SALARY_TOKENS);
  addIf(RENT_TOKENS);
  addIf(EXPENSE_TOKENS);
  for (const word of norm.split(" ").filter((w) => w.length >= 4)) {
    tokens.add(word);
  }
  return [...tokens];
}

function compositeKey(map2: string, token: string, map1?: string | null): string {
  const m2 = map2.trim();
  const tok = normaliseAccountText(token);
  if (map1?.trim()) {
    return `${map1.trim()}::${m2}::${tok}`;
  }
  return `${m2}::${tok}`;
}

export function buildMap2RefinedDictionary(
  rows: ErpTrainingRow[],
  options?: {
    globalMinSupport?: number;
    compositeMinSupport?: number;
    compositeMinCount?: number;
  },
): Map2RefinedAssets {
  const globalMin = options?.globalMinSupport ?? 0.95;
  const compMin = options?.compositeMinSupport ?? 0.85;
  const compCount = options?.compositeMinCount ?? 2;

  const byMap2 = new Map<string, ErpTrainingRow[]>();
  for (const row of rows) {
    if (!row.map2?.trim()) continue;
    const key = row.map2.trim();
    const list = byMap2.get(key) ?? [];
    list.push(row);
    byMap2.set(key, list);
  }

  const map2GlobalToCanonical: Record<string, string> = {};
  const map2CompositeToCanonical: Record<string, string> = {};
  const ambiguousMap2Labels: string[] = [];

  for (const [map2, group] of byMap2) {
    const globalCounts: Record<string, number> = {};
    for (const row of group) {
      globalCounts[row.canonicalCode] =
        (globalCounts[row.canonicalCode] ?? 0) + 1;
    }
    const globalDom = dominantCanonical(globalCounts);

    if (globalDom && globalDom.ratio >= globalMin) {
      map2GlobalToCanonical[map2] = globalDom.code;
      continue;
    }

    ambiguousMap2Labels.push(map2);

    const compositeCounts = new Map<string, Record<string, number>>();
    for (const row of group) {
      const tokens = extractDisambiguationTokens(row.accountName);
      for (const token of tokens) {
        const k1 = compositeKey(map2, token, row.map1);
        if (!compositeCounts.has(k1)) compositeCounts.set(k1, {});
        const b1 = compositeCounts.get(k1)!;
        b1[row.canonicalCode] = (b1[row.canonicalCode] ?? 0) + 1;

        const k2 = compositeKey(map2, token, null);
        if (k2 !== k1) {
          if (!compositeCounts.has(k2)) compositeCounts.set(k2, {});
          const b2 = compositeCounts.get(k2)!;
          b2[row.canonicalCode] = (b2[row.canonicalCode] ?? 0) + 1;
        }
      }
    }

    for (const [key, counts] of compositeCounts) {
      const dom = dominantCanonical(counts);
      if (dom && dom.ratio >= compMin && dom.count >= compCount) {
        map2CompositeToCanonical[key] = dom.code;
      }
    }
  }

  return {
    map2GlobalToCanonical,
    map2CompositeToCanonical,
    ambiguousMap2Labels,
  };
}

export function resolveMap2Refined(
  map2: string | undefined,
  map1: string | undefined,
  accountName: string,
  assets: Map2RefinedAssets,
): { canonicalCode: string; evidence: string } | null {
  if (!map2?.trim()) return null;
  const label = map2.trim();
  const tokens = extractDisambiguationTokens(accountName);

  for (const token of tokens) {
    const k1 = map1?.trim()
      ? compositeKey(label, token, map1)
      : null;
    if (k1 && assets.map2CompositeToCanonical[k1]) {
      return {
        canonicalCode: assets.map2CompositeToCanonical[k1],
        evidence: `ERP Map2 composite (Map1+Map2+name): "${k1}"`,
      };
    }
    const k2 = compositeKey(label, token, null);
    if (assets.map2CompositeToCanonical[k2]) {
      return {
        canonicalCode: assets.map2CompositeToCanonical[k2],
        evidence: `ERP Map2 composite (Map2+name): "${k2}"`,
      };
    }
  }

  const global = assets.map2GlobalToCanonical[label];
  if (global) {
    return {
      canonicalCode: global,
      evidence: `ERP Map2 global (unambiguous): "${label}"`,
    };
  }

  return null;
}

export type Map2ErrorAnalysis = {
  map2Label: string;
  count: number;
  topConfusions: Array<{
    accountName: string;
    expectedCode: string;
    predictedCode: string;
    expectedCategory: string;
    predictedCategory: string;
  }>;
};

export function analyzeMap2Errors(
  failures: Array<{
    accountName: string;
    expectedCode: string;
    predicted: string | null;
    map2: string | null;
    layer: string | null;
    metricCategory: string;
  }>,
  predictedCategory: (code: string) => string,
): Map2ErrorAnalysis[] {
  const map2Fails = failures.filter((f) => f.layer === "map2" && f.map2);
  const byMap2 = new Map<string, typeof map2Fails>();
  for (const f of map2Fails) {
    const k = f.map2!;
    const list = byMap2.get(k) ?? [];
    list.push(f);
    byMap2.set(k, list);
  }

  return [...byMap2.entries()]
    .map(([map2Label, rows]) => ({
      map2Label,
      count: rows.length,
      topConfusions: rows.slice(0, 8).map((r) => ({
        accountName: r.accountName,
        expectedCode: r.expectedCode,
        predictedCode: r.predicted ?? "—",
        expectedCategory: r.metricCategory,
        predictedCategory: r.predicted
          ? predictedCategory(r.predicted)
          : "none",
      })),
    }))
    .sort((a, b) => b.count - a.count);
}

export { extractDisambiguationTokens, SALARY_TOKENS, RENT_TOKENS };

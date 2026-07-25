/**
 * Build name patterns and exact name dictionary.
 */

import type { ErpDictionaryEntry } from "../erp-intelligence-loader";
import type { ErpTrainingRow } from "./types";
import { normaliseAccountText } from "../synonyms";
import { dominantCanonical, extractBankPatterns, extractSubstrings } from "./common";

export function buildNamePatterns(
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

export function buildExactNames(rows: ErpTrainingRow[]): Record<string, string> {
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

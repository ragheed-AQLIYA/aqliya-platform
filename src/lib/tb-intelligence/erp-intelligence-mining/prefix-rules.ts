/**
 * Build prefix rules from account codes.
 */

import type { ErpPrefixRule } from "../erp-intelligence-loader";
import type { ErpTrainingRow } from "./types";
import { dominantCanonical } from "./common";

export function buildPrefixRules(
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

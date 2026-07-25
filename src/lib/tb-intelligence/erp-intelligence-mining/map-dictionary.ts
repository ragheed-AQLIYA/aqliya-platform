/**
 * Build map1/map2 to canonical dictionaries.
 */

import type { ErpTrainingRow } from "./types";
import { dominantCanonical } from "./common";

export function buildMapDictionary(
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

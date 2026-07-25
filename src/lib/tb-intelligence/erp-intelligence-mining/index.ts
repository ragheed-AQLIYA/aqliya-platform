/**
 * ERP intelligence mining — barrel.
 */
import { buildMap2RefinedDictionary } from "../map2-refinement";
import type { ErpDictionaryEntry, ErpPrefixRule, ErpSaudiDictionary } from "../erp-intelligence-loader";
import type { ErpTrainingRow, MineErpOptions } from "./types";
import { buildMapDictionary } from "./map-dictionary";
import { buildNamePatterns, buildExactNames } from "./name-patterns";
import { buildPrefixRules } from "./prefix-rules";
import { metricCategoryFromCanonical } from "./metrics";

export type { ErpTrainingRow, MineErpOptions } from "./types";

export { metricCategoryFromCanonical };

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

import erpDictionary from "../../../knowledge/tb-intelligence/erp-saudi-dictionary.json";
import erpPrefixRules from "../../../knowledge/tb-intelligence/erp-prefix-rules.json";

export type ErpDictionaryEntry = {
  pattern: string;
  canonicalCode: string;
  support: number;
  source?: string;
};

export type ErpPrefixRule = {
  prefix: string;
  canonicalCode: string;
  confidence: number;
  support: number;
  count: number;
};

export type ErpSaudiDictionary = {
  version: string;
  source: string;
  generatedAt?: string | null;
  map1ToCanonical: Record<string, string>;
  map2ToCanonical: Record<string, string>;
  /** Phase 3B.3 — unambiguous Map2 only (≥95% support). */
  map2GlobalToCanonical?: Record<string, string>;
  /** Phase 3B.3 — Map2 + name token / Map1+Map2 composites. */
  map2CompositeToCanonical?: Record<string, string>;
  ambiguousMap2Labels?: string[];
  namePatterns: ErpDictionaryEntry[];
  exactNameToCanonical: Record<string, string>;
};

export type ErpPrefixRulesFile = {
  version: string;
  source: string;
  generatedAt?: string | null;
  minSupportRatio: number;
  rules: ErpPrefixRule[];
};

const dictionary = erpDictionary as ErpSaudiDictionary;
const prefixFile = erpPrefixRules as ErpPrefixRulesFile;

export function getErpDictionary(): ErpSaudiDictionary {
  return dictionary;
}

export function getErpPrefixRules(): ErpPrefixRule[] {
  return prefixFile.rules ?? [];
}

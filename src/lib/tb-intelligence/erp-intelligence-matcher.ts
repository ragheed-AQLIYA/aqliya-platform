import type { ClassificationResult } from "./types";
import { normaliseAccountText } from "./synonyms";
import {
  getErpDictionary,
  getErpPrefixRules,
  type ErpPrefixRule,
  type ErpSaudiDictionary,
} from "./erp-intelligence-loader";
import { resolveMap2Refined } from "./map2-refinement";

export type ErpMatchLayer =
  | "prefix"
  | "map1"
  | "map2"
  | "map2_composite"
  | "map2_global"
  | "exact_name"
  | "name_pattern";

export type ErpMatchOptions = {
  /** When false, exact-name dictionary entries are skipped (hold-out eval). */
  allowExactName?: boolean;
  /** Phase 3B.3 — use Map2 composite/global refinement instead of coarse map2ToCanonical. */
  useMap2Refinement?: boolean;
};

export type ErpMatchOutcome = {
  result: ClassificationResult;
  layer: ErpMatchLayer;
};

function resolvePrefixRule(
  accountCode: string,
  rules: ErpPrefixRule[],
): ErpPrefixRule | null {
  const code = accountCode.trim();
  if (!code) return null;
  let best: ErpPrefixRule | null = null;
  for (const rule of rules) {
    if (!code.startsWith(rule.prefix)) continue;
    if (!best || rule.prefix.length > best.prefix.length) best = rule;
  }
  return best;
}

function pickMapHints(hints?: string[]): { map1?: string; map2?: string } {
  if (!hints?.length) return {};
  return { map1: hints[0], map2: hints[1] };
}

export function matchErpIntelligenceWithAssets(
  accountCode: string,
  accountName: string,
  hints: string[] | undefined,
  candidates: Array<{ id: string; code: string; name: string; category: string }>,
  dictionary: ErpSaudiDictionary,
  prefixRules: ErpPrefixRule[],
  options?: ErpMatchOptions,
): ErpMatchOutcome | null {
  const allowExactName = options?.allowExactName !== false;
  const { map1, map2 } = pickMapHints(hints);
  const normName = normaliseAccountText(accountName);

  const tryResolve = (
    canonicalCode: string,
    confidence: number,
    evidence: string,
    layer: ErpMatchLayer,
  ): ErpMatchOutcome | null => {
    const canonical = candidates.find((c) => c.code === canonicalCode);
    if (!canonical) return null;
    return {
      layer,
      result: {
        canonicalAccountId: canonical.id,
        canonicalCode: canonical.code,
        canonicalName: canonical.name,
        category: canonical.category,
        confidence,
        source: "rule",
        evidence,
        sourceDetail: { tier: layer },
        evidenceDetail: {
          erpMap1: map1,
          erpMap2: map2,
          matchedBy: layer,
          detail: evidence,
        },
      },
    };
  };

  const prefixRule = resolvePrefixRule(accountCode, prefixRules);
  if (prefixRule) {
    const matched = tryResolve(
      prefixRule.canonicalCode,
      prefixRule.confidence,
      `ERP prefix ${prefixRule.prefix}* → ${prefixRule.canonicalCode} (${Math.round(prefixRule.support * 100)}% support, n=${prefixRule.count})`,
      "prefix",
    );
    if (matched) return matched;
  }

  if (map1 && dictionary.map1ToCanonical[map1]) {
    const matched = tryResolve(
      dictionary.map1ToCanonical[map1],
      0.9,
      `ERP Map1 dictionary: "${map1}"`,
      "map1",
    );
    if (matched) return matched;
  }

  const useMap2Refinement = options?.useMap2Refinement === true;
  if (useMap2Refinement && map2) {
    const refined = resolveMap2Refined(map2, map1, accountName, {
      map2GlobalToCanonical: dictionary.map2GlobalToCanonical ?? {},
      map2CompositeToCanonical: dictionary.map2CompositeToCanonical ?? {},
      ambiguousMap2Labels: dictionary.ambiguousMap2Labels ?? [],
    });
    if (refined) {
      const layer: ErpMatchLayer = refined.evidence.includes("composite")
        ? "map2_composite"
        : "map2_global";
      const matched = tryResolve(
        refined.canonicalCode,
        layer === "map2_composite" ? 0.9 : 0.88,
        refined.evidence,
        layer,
      );
      if (matched) return matched;
    }
  } else if (map2 && dictionary.map2ToCanonical[map2]) {
    const matched = tryResolve(
      dictionary.map2ToCanonical[map2],
      0.88,
      `ERP Map2 dictionary: "${map2}"`,
      "map2",
    );
    if (matched) return matched;
  }

  if (allowExactName) {
    const exact = dictionary.exactNameToCanonical[normName];
    if (exact) {
      const matched = tryResolve(
        exact,
        0.92,
        "ERP exact name dictionary match",
        "exact_name",
      );
      if (matched) return matched;
    }
  }

  for (const entry of dictionary.namePatterns) {
    const normPattern = normaliseAccountText(entry.pattern);
    if (!normPattern) continue;
    if (normName.includes(normPattern) || normPattern.includes(normName)) {
      const matched = tryResolve(
        entry.canonicalCode,
        Math.min(0.91, 0.75 + Math.min(entry.support, 20) * 0.01),
        `ERP name pattern: "${entry.pattern}" (${entry.source ?? "mined"})`,
        "name_pattern",
      );
      if (matched) return matched;
    }
  }

  return null;
}

export function matchErpIntelligence(
  accountCode: string,
  accountName: string,
  hints?: string[],
  candidates?: Array<{ id: string; code: string; name: string; category: string }>,
  options?: ErpMatchOptions,
): ClassificationResult | null {
  if (!candidates?.length) return null;
  const outcome = matchErpIntelligenceWithAssets(
    accountCode,
    accountName,
    hints,
    candidates,
    getErpDictionary(),
    getErpPrefixRules(),
    options,
  );
  return outcome?.result ?? null;
}

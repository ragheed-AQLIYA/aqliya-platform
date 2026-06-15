/**
 * Shared hold-out evaluation utilities — Phase 3B.1 / 3B.2 / 3B.3.
 */

import type { ErpPrefixRule, ErpSaudiDictionary } from "./erp-intelligence-loader";
import {
  mineErpIntelligenceFromRows,
  metricCategoryFromCanonical,
  type ErpTrainingRow,
} from "./erp-intelligence-mining";
import {
  matchErpIntelligenceWithAssets,
  type ErpMatchLayer,
} from "./erp-intelligence-matcher";
import type { CanonicalCandidate } from "./types";

export type LabeledAccountRow = ErpTrainingRow & {
  hints: string[];
  metricCategory: string;
};

export type HoldoutEvalRow = {
  accountCode: string;
  accountName: string;
  expectedCode: string;
  hints: string[];
  map1: string | null;
  map2: string | null;
  metricCategory: string;
  predicted: string | null;
  layer: ErpMatchLayer | null;
  correct: boolean;
  evidence?: string;
};

export type HoldoutSummary = {
  total: number;
  exact: number;
  accuracy: number;
  byCategory: Record<string, { total: number; exact: number }>;
  byLayer: Record<string, number>;
  layerPrecision: Record<
    string,
    { hits: number; correct: number; precision: number }
  >;
};

export type StratifiedSplit = {
  train: LabeledAccountRow[];
  test: LabeledAccountRow[];
  splitByCategory: Record<
    string,
    { train: number; test: number; total: number }
  >;
};

const TEST_RATIO = 0.2;

/** Deterministic 80/20 stratified split within each metric category. */
export function stratifiedSplit80_20(
  rows: LabeledAccountRow[],
): StratifiedSplit {
  const byCat = new Map<string, LabeledAccountRow[]>();
  for (const row of rows) {
    const list = byCat.get(row.metricCategory) ?? [];
    list.push(row);
    byCat.set(row.metricCategory, list);
  }

  const train: LabeledAccountRow[] = [];
  const test: LabeledAccountRow[] = [];
  const splitByCategory: StratifiedSplit["splitByCategory"] = {};

  for (const [cat, items] of [...byCat.entries()].sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    const sorted = [...items].sort((a, b) =>
      a.accountCode.localeCompare(b.accountCode),
    );
    let testCount =
      sorted.length <= 1
        ? 0
        : Math.max(1, Math.round(sorted.length * TEST_RATIO));
    if (testCount >= sorted.length) testCount = Math.max(0, sorted.length - 1);

    const trainSlice = sorted.slice(0, sorted.length - testCount);
    const testSlice = sorted.slice(sorted.length - testCount);

    train.push(...trainSlice);
    test.push(...testSlice);
    splitByCategory[cat] = {
      total: sorted.length,
      train: trainSlice.length,
      test: testSlice.length,
    };
  }

  return { train, test, splitByCategory };
}

export function summarizeHoldout(rows: HoldoutEvalRow[]): HoldoutSummary {
  const total = rows.length;
  const exact = rows.filter((r) => r.correct).length;
  const byCat: Record<string, { total: number; exact: number }> = {};
  const byLayer: Record<string, number> = {};
  const layerCorrect: Record<string, number> = {};

  for (const r of rows) {
    byCat[r.metricCategory] ??= { total: 0, exact: 0 };
    byCat[r.metricCategory].total++;
    if (r.correct) byCat[r.metricCategory].exact++;
    if (r.layer) {
      byLayer[r.layer] = (byLayer[r.layer] ?? 0) + 1;
      if (r.correct) layerCorrect[r.layer] = (layerCorrect[r.layer] ?? 0) + 1;
    }
  }

  const layerPrecision: HoldoutSummary["layerPrecision"] = {};
  for (const [layer, hits] of Object.entries(byLayer)) {
    const correct = layerCorrect[layer] ?? 0;
    layerPrecision[layer] = {
      hits,
      correct,
      precision: hits > 0 ? correct / hits : 0,
    };
  }

  return {
    total,
    exact,
    accuracy: total > 0 ? exact / total : 0,
    byCategory: byCat,
    byLayer,
    layerPrecision,
  };
}

export type MineAndEvalOptions = {
  includeExactNames?: boolean;
  useMap2Refinement?: boolean;
  allowExactName?: boolean;
};

export function mineAndEvalHoldout(
  train: ErpTrainingRow[],
  test: LabeledAccountRow[],
  candidates: CanonicalCandidate[],
  source: string,
  options?: MineAndEvalOptions,
): {
  dictionary: ErpSaudiDictionary;
  prefixRules: ErpPrefixRule[];
  results: HoldoutEvalRow[];
  summary: HoldoutSummary;
} {
  const mined = mineErpIntelligenceFromRows(train, source, {
    includeExactNames: options?.includeExactNames ?? false,
    useMap2Refinement: options?.useMap2Refinement ?? false,
  });

  const results: HoldoutEvalRow[] = [];
  for (const row of test) {
    const outcome = matchErpIntelligenceWithAssets(
      row.accountCode,
      row.accountName,
      row.hints,
      candidates,
      mined.dictionary,
      mined.prefixRules,
      {
        allowExactName: options?.allowExactName ?? false,
        useMap2Refinement: options?.useMap2Refinement ?? false,
      },
    );
    const predicted = outcome?.result.canonicalCode ?? null;
    results.push({
      accountCode: row.accountCode,
      accountName: row.accountName,
      expectedCode: row.canonicalCode,
      hints: row.hints,
      map1: row.map1 ?? null,
      map2: row.map2 ?? null,
      metricCategory: row.metricCategory,
      predicted,
      layer: outcome?.layer ?? null,
      correct: predicted === row.canonicalCode,
      evidence: outcome?.result.evidence,
    });
  }

  return {
    ...mined,
    results,
    summary: summarizeHoldout(results),
  };
}

export function labelRows(
  rows: Array<{
    accountCode: string;
    accountName: string;
    canonicalCode: string;
    map1?: string | null;
    map2?: string | null;
    hints: string[];
  }>,
): LabeledAccountRow[] {
  return rows.map((r) => ({
    accountCode: r.accountCode,
    accountName: r.accountName,
    canonicalCode: r.canonicalCode,
    map1: r.map1 ?? null,
    map2: r.map2 ?? null,
    hints: r.hints,
    metricCategory: metricCategoryFromCanonical(r.canonicalCode),
  }));
}

export { metricCategoryFromCanonical };

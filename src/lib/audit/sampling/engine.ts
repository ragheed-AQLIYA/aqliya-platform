// A1-02 — deterministic sampling engine v0.2 (statistical formulas, stratified, systematic)
// BONUS: confidence intervals, standard error, z-scores, recommended sample size, stratified sampling with proportional allocation, systematic interval sampling

import { createHash } from "crypto";
import type {
  SamplingPopulationItem,
  SamplingRequest,
  SamplingResult,
  SamplingStatistics,
  StratifiedSamplingStratum,
} from "./types";

const DISCLAIMER_AR =
  "عينة مساعدة للمراجعة — ليست قراراً تدقيقياً نهائياً. المراجع البشري يحدد الاعتماد.";

export function deriveSamplingSeed(
  engagementId: string,
  request: SamplingRequest,
): string {
  if (request.seed?.trim()) return request.seed.trim();
  const payload = `${engagementId}:${request.method}:${request.sampleSize}:${request.materialityThreshold ?? ""}`;
  return createHash("sha256").update(payload).digest("hex").slice(0, 16);
}

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seedToInt(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i);
  }
  return h >>> 0;
}

function absBalance(item: SamplingPopulationItem): number {
  return Math.abs(item.balance);
}

function shuffleDeterministic<T>(items: T[], seed: string): T[] {
  const rng = mulberry32(seedToInt(seed));
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function takeSample(
  ranked: SamplingPopulationItem[],
  sampleSize: number,
): SamplingPopulationItem[] {
  const size = Math.max(1, Math.min(sampleSize, ranked.length));
  return ranked.slice(0, size);
}

function zScore(confidenceLevel: number): number {
  if (confidenceLevel >= 0.99) return 2.576;
  if (confidenceLevel >= 0.95) return 1.96;
  if (confidenceLevel >= 0.90) return 1.645;
  return 1.96;
}

function calculateStandardDeviation(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  const sqDiffs = values.map((v) => (v - mean) ** 2);
  const variance = sqDiffs.reduce((s, d) => s + d, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

function calculateStandardError(stdDev: number, populationSize: number, sampleSize: number): number {
  const fpc = Math.sqrt((populationSize - sampleSize) / (populationSize - 1));
  return (stdDev / Math.sqrt(sampleSize)) * fpc;
}

function calculateConfidenceInterval(
  sampleMean: number,
  standardError: number,
  z: number,
): [number, number] {
  const moe = z * standardError;
  return [sampleMean - moe, sampleMean + moe];
}

function calculateRecommendedSampleSize(
  populationSize: number,
  confidenceLevel: number,
  marginOfError: number,
  estimatedStdDev?: number,
): number {
  const z = zScore(confidenceLevel);
  const p = 0.5;
  const n0 = (z ** 2 * p * (1 - p)) / (marginOfError ** 2);
  const n = n0 / (1 + (n0 - 1) / populationSize);
  return Math.max(1, Math.ceil(n));
}

function computeStatistics(
  selectedItems: SamplingPopulationItem[],
  populationSize: number,
  confidenceLevel: number,
  marginOfError: number,
): SamplingStatistics {
  const balances = selectedItems.map((i) => absBalance(i));
  const standardDeviation = calculateStandardDeviation(balances);
  const sampleSize = selectedItems.length;
  const standardError = calculateStandardError(standardDeviation, populationSize, sampleSize);
  const z = zScore(confidenceLevel);
  const [ciLower, ciUpper] = calculateConfidenceInterval(
    balances.reduce((s, v) => s + v, 0) / sampleSize,
    standardError,
    z,
  );
  const recommendedMinSampleSize = calculateRecommendedSampleSize(populationSize, confidenceLevel, marginOfError);

  return {
    confidenceLevel,
    confidenceInterval: ciUpper - ciLower,
    marginOfError: z * standardError,
    standardDeviation,
    standardError,
    sampleSize,
    populationSize,
    recommendedMinSampleSize,
  };
}

export function runSamplingEngine(
  engagementId: string,
  population: SamplingPopulationItem[],
  request: SamplingRequest,
): SamplingResult {
  if (population.length === 0) {
    throw new Error("لا توجد بنود في ميزان المراجعة للعينة.");
  }

  const sampleSize = Math.max(
    1,
    Math.min(request.sampleSize, population.length),
  );
  const seed = deriveSamplingSeed(engagementId, request);
  const totalAbsoluteBalance = population.reduce(
    (sum, item) => sum + absBalance(item),
    0,
  );
  const confidenceLevel = request.confidenceLevel ?? 0.95;
  const marginOfError = request.marginOfError ?? 0.05;

  let selectedItems: SamplingPopulationItem[];
  let strata: StratifiedSamplingStratum[] | undefined;
  let interval: number | undefined;
  let randomStart: number | undefined;

  switch (request.method) {
    case "high_value": {
      const threshold =
        request.materialityThreshold ??
        Math.max(1, totalAbsoluteBalance * 0.05);
      const ranked = [...population]
        .filter((item) => absBalance(item) >= threshold)
        .sort((a, b) => absBalance(b) - absBalance(a));
      selectedItems = ranked.length > 0
        ? takeSample(ranked, sampleSize)
        : takeSample(
            [...population].sort((a, b) => absBalance(b) - absBalance(a)),
            sampleSize,
          );
      break;
    }
    case "monetary_unit": {
      const ranked = [...population].sort((a, b) => absBalance(b) - absBalance(a));
      selectedItems = takeSample(ranked, sampleSize);
      break;
    }
    case "stratified": {
      const strataLabels = request.strataLabels ?? ["low", "medium", "high"];
      const numStrata = strataLabels.length;
      const itemsPerStratum = Math.max(1, Math.floor(population.length / numStrata));
      strata = [];
      selectedItems = [];

      for (let s = 0; s < numStrata; s++) {
        const start = s * itemsPerStratum;
        const end = s === numStrata - 1 ? population.length : (s + 1) * itemsPerStratum;
        const stratumItems = population.slice(start, end);
        const stratumBalance = stratumItems.reduce((sum, item) => sum + absBalance(item), 0);
        const proportion = stratumItems.length / population.length;
        const stratumSampleSize = Math.max(1, Math.round(sampleSize * proportion));
        const shuffled = shuffleDeterministic(stratumItems, `${seed}-stratum-${s}`);

        strata.push({
          label: strataLabels[s] ?? `Stratum ${s + 1}`,
          populationItems: stratumItems.length,
          sampleItems: Math.min(stratumSampleSize, stratumItems.length),
          totalBalance: stratumBalance,
          proportion,
        });

        selectedItems.push(...takeSample(shuffled, stratumSampleSize));
      }
      break;
    }
    case "systematic": {
      interval = request.interval ?? Math.max(1, Math.floor(population.length / sampleSize));
      randomStart = request.randomStart ?? (seedToInt(seed) % interval);
      const sorted = [...population].sort((a, b) => a.accountCode.localeCompare(b.accountCode));
      selectedItems = [];
      for (let i = randomStart; i < sorted.length && selectedItems.length < sampleSize; i += interval) {
        selectedItems.push(sorted[i]);
      }
      if (selectedItems.length < sampleSize) {
        const remaining = takeSample(
          sorted.filter((item) => !selectedItems.includes(item)),
          sampleSize - selectedItems.length,
        );
        selectedItems.push(...remaining);
      }
      break;
    }
    case "random":
    default: {
      const ranked = shuffleDeterministic(population, seed);
      selectedItems = takeSample(ranked, sampleSize);
      break;
    }
  }

  const statistics = computeStatistics(selectedItems, population.length, confidenceLevel, marginOfError);

  return {
    method: request.method,
    populationCount: population.length,
    sampleSize: selectedItems.length,
    seed,
    selectedIds: selectedItems.map((i) => i.id),
    selectedItems,
    parameters: {
      materialityThreshold: request.materialityThreshold,
      totalAbsoluteBalance,
      confidenceLevel,
      marginOfError,
    },
    statistics,
    strata,
    interval,
    randomStart,
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER_AR,
  };
}

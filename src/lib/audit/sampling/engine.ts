// A1-02 — deterministic sampling engine v0.1 (no AI, reproducible seed)

import { createHash } from "crypto";
import { calculateSamplingThreshold, calculatePerformanceMateriality } from "../materiality";
import type {
  SamplingPopulationItem,
  SamplingRequest,
  SamplingResult,
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

  let ranked: SamplingPopulationItem[];

  switch (request.method) {
    case "high_value": {
      let threshold = request.materialityThreshold;
      if (threshold == null) {
        const perf = calculatePerformanceMateriality({
          totalAssets: totalAbsoluteBalance,
          performancePct: 5,
        });
        threshold =
          calculateSamplingThreshold(perf) ||
          Math.max(1, totalAbsoluteBalance * 0.05);
      }
      ranked = [...population]
        .filter((item) => absBalance(item) >= threshold)
        .sort((a, b) => absBalance(b) - absBalance(a));
      if (ranked.length === 0) {
        ranked = [...population].sort((a, b) => absBalance(b) - absBalance(a));
      }
      break;
    }
    case "monetary_unit": {
      ranked = [...population].sort((a, b) => absBalance(b) - absBalance(a));
      break;
    }
    case "random":
    default: {
      ranked = shuffleDeterministic(population, seed);
      break;
    }
  }

  const selectedItems = takeSample(ranked, sampleSize);

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
    },
    generatedAt: new Date().toISOString(),
    disclaimer: DISCLAIMER_AR,
  };
}

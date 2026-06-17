// ─── LocalContentOS — Simulation Engine ───
// Phase 3: Answers "what if" questions for local content score.
// V3.5: Enhanced with driver explainability — every result now explains
// what changed, why the score changed, and the biggest contributors.
// Scenarios: Supplier, Workforce, Asset, Mixed.
// Uses existing scoring engine — no duplicated formulas.
// P0: Results are informational, not final decisions.

import "server-only";

import { prisma } from "@/lib/prisma";
import { computeLcScore, getLineValue } from "./scoring";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";
import type { LcWorkbookLine } from "@prisma/client";
import type { LcScoreResult, LcMetricResult } from "./types";

// ─── Types ───

export type SimulationScenarioType = "supplier" | "workforce" | "asset" | "mixed";

export interface SimulationParameter {
  /** Workbook line code to modify (e.g., "SPN-01") */
  lineCode: string;
  /** New value to simulate */
  newValue: number;
  /** Human-readable label for this parameter */
  label: string;
}

export interface SimulationScenario {
  type: SimulationScenarioType;
  label: string;
  parameters: SimulationParameter[];
  assumptions: string[];
}

// V3.5: Explainability driver
export interface SimulationDriver {
  factor: string;       // e.g., "Supplier Localization"
  impact: number;       // Absolute score contribution (e.g., 4.2 points)
  contributionPct: number; // Percentage of total delta (e.g., 50.6)
  metricCode: string;   // e.g., "SPN"
}

export interface SimulationResult {
  id?: string;
  workbookId: string;
  organizationId: string;
  scenarioType: SimulationScenarioType;
  scenarioLabel: string;
  currentScore: LcScoreResult;
  projectedScore: LcScoreResult;
  delta: number | null;
  confidence: number;
  parameters: SimulationParameter[];
  assumptions: string[];
  // V3.5: Explainability
  drivers: SimulationDriver[];
  generatedAt: string;
}

// ─── Pre-built scenarios ───

export function createSupplierOptimizationScenario(
  localSpendIncrease: number,
  totalSpendLine?: LcWorkbookLine,
): SimulationScenario {
  return {
    type: "supplier",
    label: `تحسين المشتريات المحلية (+${localSpendIncrease.toLocaleString("ar-SA")})`,
    parameters: [
      { lineCode: "SPN-01", newValue: 0, label: "المشتريات المحلية (يحسب تلقائياً)" },
    ],
    assumptions: [
      "يفترض أن زيادة المشتريات المحلية لا تقلل من إجمالي المشتريات",
      "يفترض أن الموردين المحليين متاحون بنفس الجودة والتكلفة",
    ],
  };
}

export function createWorkforceLocalizationScenario(
  saudiHireCount: number,
): SimulationScenario {
  return {
    type: "workforce",
    label: `توطين ${saudiHireCount} وظيفة`,
    parameters: [
      { lineCode: "WRK-01", newValue: 0, label: "الموظفون السعوديون" },
    ],
    assumptions: [
      "يفترض توفر كوادر سعودية مؤهلة",
      "لا يشمل تكاليف التوظيف والتدريب",
    ],
  };
}

export function createAssetLocalizationScenario(
  localAssetIncrease: number,
): SimulationScenario {
  return {
    type: "asset",
    label: `زيادة الأصول المحلية (+${localAssetIncrease.toLocaleString("ar-SA")})`,
    parameters: [
      { lineCode: "AST-01", newValue: 0, label: "الأصول المحلية" },
    ],
    assumptions: [
      "يفترض توفر فرص استثمارية محلية مناسبة",
      "لا يشمل تكاليف التمويل أو التشغيل",
    ],
  };
}

export function createMixedScenario(
  supplierDelta: number,
  workforceDelta: number,
  saudiTotalWorkforce: number,
  totalWorkforce: number,
  localAssetDelta: number,
  totalAsset: number,
): SimulationScenario {
  return {
    type: "mixed",
    label: "سيناريو متكامل (تحسين المشتريات + التوطين + الأصول)",
    parameters: [
      { lineCode: "SPN-01", newValue: 0, label: "المشتريات المحلية" },
      { lineCode: "WRK-01", newValue: saudiTotalWorkforce, label: "الموظفون السعوديون" },
      { lineCode: "WRK-02", newValue: totalWorkforce, label: "إجمالي الموظفين" },
      { lineCode: "AST-01", newValue: 0, label: "الأصول المحلية" },
    ],
    assumptions: [
      "سيناريو متكامل يجمع تحسين المشتريات والتوطين والأصول",
      "النتائج تقديرية وتعتمد على دقة البيانات المدخلة",
      "يرجى مراجعة النتائج مع مختص",
    ],
  };
}

// ─── Run Simulation ───

/**
 * Run a "what-if" simulation on a workbook.
 * Uses the existing scoring engine with modified line values.
 * P0: Results are informational, not final decisions.
 */
export async function runSimulation(
  organizationId: string,
  workbookId: string,
  scenario: SimulationScenario,
): Promise<SimulationResult> {
  const startedAt = Date.now();

  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  });

  if (!workbook) {
    throw new Error("Workbook not found");
  }

  const lines = workbook.lines;

  // Create a deep copy of lines with modified values
  const modifiedLines: LcWorkbookLine[] = lines.map((line) => {
    const param = scenario.parameters.find((p) => p.lineCode === line.code);
    if (!param) return line;

    // Create a copy with modified value
    return {
      ...line,
      autoFillValue: param.newValue,
      manualValue: null,
      autoFilled: true,
      source: "simulation",
    };
  });

  // Compute current score (original lines)
  const currentScore = computeLcScore(lines);

  // Compute projected score (modified lines)
  const projectedScore = computeLcScore(modifiedLines);

  // Calculate delta
  const delta =
    currentScore.overallScore !== null && projectedScore.overallScore !== null
      ? Math.round((projectedScore.overallScore - currentScore.overallScore) * 100) / 100
      : null;

  // Confidence: based on data completeness
  const missingCount = lines.filter(
    (l) => !l.autoFilled && l.manualValue === null,
  ).length;
  const totalCount = lines.length;
  const confidence = totalCount > 0
    ? Math.round((1 - missingCount / totalCount) * 100)
    : 50;

  // V3.5: Compute driver explainability by comparing metric-level deltas
  const drivers = computeDrivers(currentScore, projectedScore);

  const durationMs = Date.now() - startedAt;

  // Persist simulation result with drivers
  const saved = await prisma.lcSimulationResult.create({
    data: {
      organizationId,
      workbookId,
      scenarioType: scenario.type,
      scenarioLabel: scenario.label,
      parameters: JSON.parse(JSON.stringify(scenario.parameters)),
      currentScore: currentScore.overallScore,
      projectedScore: projectedScore.overallScore,
      delta,
      confidence,
      assumptions: JSON.parse(JSON.stringify(scenario.assumptions)),
      drivers: JSON.parse(JSON.stringify(drivers)),
    },
  });

  // Audit event
  await createAiAuditEvent({
    organizationId,
    workbookId,
    action: AuditActions.AI_SIMULATION_RUN,
    providerId: "deterministic",
    status: "success",
    inputSummary: {
      scenarioType: scenario.type,
      parameterCount: scenario.parameters.length,
    },
    outputSummary: {
      currentScore: currentScore.overallScore,
      projectedScore: projectedScore.overallScore,
      delta,
      driversCount: drivers.length,
    },
    durationMs,
  }).catch(() => {});

  return {
    id: saved.id,
    workbookId,
    organizationId,
    scenarioType: scenario.type,
    scenarioLabel: scenario.label,
    currentScore,
    projectedScore,
    delta,
    confidence,
    parameters: scenario.parameters,
    assumptions: scenario.assumptions,
    drivers,
    generatedAt: new Date().toISOString(),
  };
}

// ─── V3.5 Driver Explainability ───

/**
 * Compute driver decomposition by comparing each metric's contribution
 * to the overall delta. This explains what changed and why.
 */
function computeDrivers(
  currentScore: LcScoreResult,
  projectedScore: LcScoreResult,
): SimulationDriver[] {
  const totalDelta =
    currentScore.overallScore !== null && projectedScore.overallScore !== null
      ? projectedScore.overallScore - currentScore.overallScore
      : 0;

  const currentMetrics = currentScore.metrics;
  const projectedMetrics = projectedScore.metrics;

  // Map metrics by code
  const currentMap = new Map(currentMetrics.map((m) => [m.code, m]));
  const projectedMap = new Map(projectedMetrics.map((m) => [m.code, m]));

  const drivers: SimulationDriver[] = [];

  for (const [code, proj] of projectedMap) {
    const curr = currentMap.get(code);
    if (!curr) continue;

    // Weighted contribution: (proj.score - curr.score) * weight
    const metricDelta = (proj.score ?? 0) - (curr.score ?? 0);
    const weightedImpact = metricDelta * proj.weight;

    // Contribution percentage of total delta
    const contributionPct =
      Math.abs(totalDelta) > 0.001
        ? Math.round((Math.abs(weightedImpact) / Math.abs(totalDelta)) * 100 * 10) / 10
        : 0;

    drivers.push({
      factor: proj.labelAr || proj.label || code,
      impact: Math.round(weightedImpact * 100) / 100,
      contributionPct,
      metricCode: code,
    });
  }

  // Sort by absolute impact descending
  drivers.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return drivers;
}

// ─── Listing stored simulations ───

export async function listWorkbookSimulations(
  organizationId: string,
  workbookId: string,
  limit = 10,
): Promise<Array<{
  id: string;
  scenarioType: string;
  scenarioLabel: string;
  currentScore: number | null;
  projectedScore: number | null;
  delta: number | null;
  confidence: number | null;
  drivers: SimulationDriver[];
  createdAt: Date;
}>> {
  const results = await prisma.lcSimulationResult.findMany({
    where: { organizationId, workbookId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return results.map((r) => ({
    id: r.id,
    scenarioType: r.scenarioType,
    scenarioLabel: r.scenarioLabel,
    currentScore: r.currentScore,
    projectedScore: r.projectedScore,
    delta: r.delta,
    confidence: r.confidence,
    drivers: (r.drivers as SimulationDriver[] | null) ?? [],
    createdAt: r.createdAt,
  }));
}

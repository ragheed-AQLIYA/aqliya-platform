// ─── LocalContentOS — LCGPA Baseline / Target / Actual Tracking ───
// Tracks LC% progress over time with deterministic snapshots.
// Every number traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor.

import type {
  LcPillarInputs,
  LcPillarResult,
  CalculationMethod,
} from "./types";
import { LCGPA_RULE_VERSION } from "./types";
import { computeLcgpaScore } from "./calculation-engine";

// ─── Baseline Snapshot ───

/**
 * A point-in-time snapshot of LC% calculation.
 * Used for baseline, target tracking, and actual measurement.
 */
export interface LcSnapshot {
  /** Unique snapshot identifier */
  id: string;
  /** Project identifier */
  projectId: string;
  /** Snapshot type */
  type: "baseline" | "target" | "actual" | "periodic";
  /** LC percentage at this point */
  lcPct: number;
  /** Calculation method used */
  method: CalculationMethod;
  /** Regulatory rule version */
  ruleVersion: string;
  /** Timestamp of snapshot */
  capturedAt: string;
  /** User who captured the snapshot */
  capturedById: string | null;
  /** Complete input snapshot (for reproducibility) */
  inputs: LcPillarInputs;
  /** Calculation result */
  result: LcPillarResult;
  /** Evidence references */
  evidenceRefs: string[];
  /** Human-readable note */
  note: string | null;
}

// ─── Target Tracking ───

/**
 * Progress toward an LC% target.
 */
export interface TargetProgress {
  /** Target LC% to achieve */
  targetLcPct: number;
  /** Baseline LC% at start */
  baselineLcPct: number;
  /** Current (most recent actual) LC% */
  currentLcPct: number;
  /** Progress: (current - baseline) / (target - baseline) × 100 */
  progressPct: number;
  /** Whether target has been met or exceeded */
  targetMet: boolean;
  /** Remaining gap to target (negative = exceeded) */
  gapPct: number;
  /** Days since baseline was captured */
  daysSinceBaseline: number | null;
  /** Days until target deadline */
  daysUntilTarget: number | null;
  /** Whether deadline has passed */
  deadlinePassed: boolean;
}

// ─── Period Comparison ───

/**
 * Comparison between two LC% snapshots.
 */
export interface PeriodComparison {
  /** Earlier snapshot */
  earlier: LcSnapshot;
  /** Later snapshot */
  later: LcSnapshot;
  /** LC% change: later - earlier */
  lcPctChange: number;
  /** Whether LC% improved */
  improved: boolean;
  /** Days between snapshots */
  daysBetween: number;
  /** Rate of change per month (LC% change / months) */
  monthlyRate: number;
}

// ─── Snapshot Functions ───

let snapshotCounter = 0;

/**
 * Generate a unique snapshot ID.
 * Deterministic within a process (monotonic counter).
 */
function generateSnapshotId(): string {
  snapshotCounter++;
  return `SNAP-${Date.now()}-${snapshotCounter}`;
}

/**
 * Create a baseline snapshot from LCGPA calculation inputs.
 *
 * This captures the LC% at a specific point in time and stores
 * the complete input/output for reproducibility.
 *
 * Deterministic: same inputs always produce same output.
 * Versioned: tied to LCGPA_RULE_VERSION.
 *
 * @param projectId - Project identifier
 * @param inputs - LCGPA pillar inputs
 * @param capturedById - User who captured the snapshot
 * @param note - Optional human-readable note
 * @returns Complete baseline snapshot
 */
export function createBaselineSnapshot(
  projectId: string,
  inputs: LcPillarInputs,
  capturedById: string | null = null,
  note: string | null = null,
): LcSnapshot {
  const result = computeLcgpaScore(inputs);

  return {
    id: generateSnapshotId(),
    projectId,
    type: "baseline",
    lcPct: result.overallLcPct,
    method: "lcgpa_v1",
    ruleVersion: LCGPA_RULE_VERSION,
    capturedAt: new Date().toISOString(),
    capturedById,
    inputs,
    result,
    evidenceRefs: [],
    note,
  };
}

/**
 * Create an actual (measured) snapshot from LCGPA calculation inputs.
 *
 * Used to record the current LC% for comparison against baseline and target.
 *
 * @param projectId - Project identifier
 * @param inputs - LCGPA pillar inputs
 * @param capturedById - User who captured the snapshot
 * @param note - Optional human-readable note
 * @returns Complete actual snapshot
 */
export function createActualSnapshot(
  projectId: string,
  inputs: LcPillarInputs,
  capturedById: string | null = null,
  note: string | null = null,
): LcSnapshot {
  const result = computeLcgpaScore(inputs);

  return {
    id: generateSnapshotId(),
    projectId,
    type: "actual",
    lcPct: result.overallLcPct,
    method: "lcgpa_v1",
    ruleVersion: LCGPA_RULE_VERSION,
    capturedAt: new Date().toISOString(),
    capturedById,
    inputs,
    result,
    evidenceRefs: [],
    note,
  };
}

/**
 * Create a periodic snapshot for trend tracking.
 *
 * @param projectId - Project identifier
 * @param inputs - LCGPA pillar inputs
 * @param capturedById - User who captured the snapshot
 * @param note - Optional human-readable note
 * @returns Complete periodic snapshot
 */
export function createPeriodicSnapshot(
  projectId: string,
  inputs: LcPillarInputs,
  capturedById: string | null = null,
  note: string | null = null,
): LcSnapshot {
  const result = computeLcgpaScore(inputs);

  return {
    id: generateSnapshotId(),
    projectId,
    type: "periodic",
    lcPct: result.overallLcPct,
    method: "lcgpa_v1",
    ruleVersion: LCGPA_RULE_VERSION,
    capturedAt: new Date().toISOString(),
    capturedById,
    inputs,
    result,
    evidenceRefs: [],
    note,
  };
}

// ─── Target Tracking Functions ───

/**
 * Compute progress toward an LC% target.
 *
 * Deterministic: linear formula, no branching.
 *
 * @param baselineLcPct - Baseline LC% at start
 * @param targetLcPct - Target LC% to achieve
 * @param currentLcPct - Current (most recent actual) LC%
 * @param baselineDate - When baseline was captured
 * @param targetDate - When target must be achieved
 * @returns Target progress details
 */
export function computeTargetProgress(
  baselineLcPct: number,
  targetLcPct: number,
  currentLcPct: number,
  baselineDate: Date | null = null,
  targetDate: Date | null = null,
): TargetProgress {
  // Compute progress percentage
  const targetDelta = targetLcPct - baselineLcPct;
  const currentDelta = currentLcPct - baselineLcPct;
  const progressPct =
    targetDelta !== 0
      ? Math.round((currentDelta / targetDelta) * 10000) / 100
      : currentLcPct >= targetLcPct
        ? 100
        : 0;

  // Check if target is met
  const targetMet = currentLcPct >= targetLcPct;

  // Compute remaining gap
  const gapPct = Math.round((targetLcPct - currentLcPct) * 100) / 100;

  // Compute time metrics
  const now = new Date();
  const daysSinceBaseline = baselineDate
    ? Math.floor((now.getTime() - baselineDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const daysUntilTarget = targetDate
    ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const deadlinePassed = targetDate ? now > targetDate : false;

  return {
    targetLcPct,
    baselineLcPct,
    currentLcPct,
    progressPct,
    targetMet,
    gapPct,
    daysSinceBaseline,
    daysUntilTarget,
    deadlinePassed,
  };
}

/**
 * Compare two LC% snapshots to measure period-over-period change.
 *
 * Deterministic: linear formula, no branching.
 *
 * @param earlier - Earlier snapshot
 * @param later - Later snapshot
 * @returns Period comparison details
 */
export function compareSnapshots(
  earlier: LcSnapshot,
  later: LcSnapshot,
): PeriodComparison {
  const lcPctChange = Math.round((later.lcPct - earlier.lcPct) * 100) / 100;
  const improved = lcPctChange > 0;

  const earlierTime = new Date(earlier.capturedAt).getTime();
  const laterTime = new Date(later.capturedAt).getTime();
  const daysBetween = Math.max(
    0,
    Math.floor((laterTime - earlierTime) / (1000 * 60 * 60 * 24)),
  );

  // Monthly rate: LC% change per month (30 days)
  const monthsBetween = daysBetween / 30;
  const monthlyRate =
    monthsBetween > 0
      ? Math.round((lcPctChange / monthsBetween) * 100) / 100
      : 0;

  return {
    earlier,
    later,
    lcPctChange,
    improved,
    daysBetween,
    monthlyRate,
  };
}

/**
 * Find the most recent actual snapshot from a list of snapshots.
 *
 * @param snapshots - List of snapshots
 * @returns Most recent actual snapshot, or null if none found
 */
export function findMostRecentActual(
  snapshots: LcSnapshot[],
): LcSnapshot | null {
  const actuals = snapshots.filter((s) => s.type === "actual");
  if (actuals.length === 0) return null;

  return actuals.reduce((latest, current) =>
    new Date(current.capturedAt) > new Date(latest.capturedAt) ? current : latest,
  );
}

/**
 * Find the baseline snapshot from a list of snapshots.
 *
 * @param snapshots - List of snapshots
 * @returns Baseline snapshot, or null if none found
 */
export function findBaselineSnapshot(
  snapshots: LcSnapshot[],
): LcSnapshot | null {
  return snapshots.find((s) => s.type === "baseline") ?? null;
}

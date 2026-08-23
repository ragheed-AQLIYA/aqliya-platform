// ─── LocalContentOS — LCGPA Workbook Scoring Service ───
//
// Bridges the workbook line data to the LCGPA bound calculation engine.
// Queries ACTIVE/SUPERSEDED regulatory datasets from DB, extracts pillar
// inputs from workbook lines, runs the bound calculation, and persists
// the result with full regulatory provenance.
//
// This is the ONLY path by which LCGPA calculations should be performed
// in production. The old `computeLcScore` (IKTVA-style) remains for
// legacy compatibility but does NOT carry regulatory binding.

import type { PrismaClient } from "@prisma/client";
import { randomBytes } from "crypto";
import { extractLcgpaInputs } from "./workbook-mapper";
import {
  computeLcgpaWithBinding,
  createBoundCalculationTrace,
  recordBoundCalculationRun,
  type ComputeLcgpaWithBindingInput,
} from "./bound-calculation";
import type { RankedSupplier } from "./types";
import { loadResolvableDatasets } from "./regulatory/persistence";

// ─── Input ───

export interface LcgpaWorkbookScoreInput {
  /** Workbook ID to score. */
  workbookId: string;
  /** Project ID that owns the workbook. */
  projectId: string;
  /** Ranked suppliers for the G&S pillar. */
  suppliers: RankedSupplier[];
  /** Total goods & services cost for the G&S pillar. */
  totalGoodsServicesCost: number;
  /** User who triggered the calculation. */
  computedById?: string | null;
  /** Binding policy override (default: strict). */
  policy?: ComputeLcgpaWithBindingInput["policy"];
}

// ─── Result ───

export interface LcgpaWorkbookScoreResult {
  /** The overall LC% from the LCGPA 4-pillar calculation. */
  overallLcPct: number;
  /** Total costs across all four pillars. */
  totalCosts: number;
  /** LC amount of goods & services. */
  lcGoodsServices: number;
  /** LC amount of asset depreciation. */
  lcAssetDepreciation: number;
  /** LC amount of labor compensation. */
  lcLaborCompensation: number;
  /** LC amount of capacity building. */
  lcCapacityBuilding: number;
  /** Whether the result was recordable under the binding policy. */
  recordable: boolean;
  /** Gate reason if not recordable. */
  gateReason: string;
  /** Regulatory binding version. */
  regulatoryDatasetVersion: string | null;
  /** Regulatory artifact SHA-256. */
  regulatoryArtifactSha256: string | null;
  /** Rule version used. */
  ruleVersion: string;
  /** Calculation method. */
  method: string;
  /** Full calculation trace (for audit/reproducibility). */
  trace: ReturnType<typeof createBoundCalculationTrace>;
}

// ─── Core Service ───

/**
 * Compute the LCGPA score for a workbook with full regulatory binding.
 *
 * Flow:
 * 1. Query active regulatory datasets from DB
 * 2. Extract LCGPA pillar inputs from workbook lines (via extractLcgpaInputs)
 * 3. Run bound calculation (resolves regulatory binding BEFORE computing)
 * 4. Persist the result with full provenance (if recordable)
 * 5. Return result with binding information
 */
export async function computeLcgpaWorkbookScore(
  db: PrismaClient,
  input: LcgpaWorkbookScoreInput,
): Promise<LcgpaWorkbookScoreResult> {
  const {
    workbookId,
    projectId,
    suppliers,
    totalGoodsServicesCost,
    computedById,
    policy,
  } = input;

  // 1. Load workbook lines
  const lines = await db.lcWorkbookLine.findMany({
    where: { workbookId },
  });

  // 2. Extract LCGPA pillar inputs from workbook lines
  const pillarInputs = extractLcgpaInputs(lines, suppliers, totalGoodsServicesCost);

  // 3. Load resolvable regulatory datasets from DB
  const datasets = await loadResolvableDatasets(db);

  // 4. Collect product codes from suppliers (for binding resolution)
  const productCodes = suppliers
    .map((s) => s.supplierId)
    .filter((id): id is string => Boolean(id));

  // 5. Run bound calculation (binding resolves BEFORE computation)
  const calculationDate = new Date();
  const bound = computeLcgpaWithBinding({
    datasets,
    calculationDate,
    productCodes,
    pillarInputs,
    method: "lcgpa_v1",
    computedById,
    policy,
  });

  // 6. Create audit-grade trace
  const trace = createBoundCalculationTrace(
    {
      datasets,
      calculationDate,
      productCodes,
      pillarInputs,
      method: "lcgpa_v1",
      computedById,
    },
    bound,
  );

  // 7. Persist if recordable
  if (bound.recordable) {
    await recordBoundCalculationRun(db, {
      projectId,
      workbookId,
      bound,
      trace,
      policy,
    });
  }

  return {
    overallLcPct: bound.result.overallLcPct,
    totalCosts: bound.result.totalCosts,
    lcGoodsServices: bound.result.lcGoodsServices,
    lcAssetDepreciation: bound.result.lcAssetDepreciation,
    lcLaborCompensation: bound.result.lcLaborCompensation,
    lcCapacityBuilding: bound.result.lcCapacityBuilding,
    recordable: bound.recordable,
    gateReason: bound.gateReason,
    regulatoryDatasetVersion: bound.binding.regulatoryDatasetVersion,
    regulatoryArtifactSha256: bound.binding.regulatoryArtifactSha256,
    ruleVersion: bound.ruleVersion,
    method: bound.method,
    trace,
  };
}

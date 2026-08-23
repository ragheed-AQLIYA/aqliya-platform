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
import { canonicalEtimadCode } from "./regulatory/parsers/lcgpa-mandatory-list";

// ─── Input ───

export interface LcgpaWorkbookScoreInput {
  /** Workbook ID to score. */
  workbookId: string;
  /** Project ID that owns the workbook. */
  projectId: string;
  /**
   * Ranked suppliers for the G&S pillar.
   * When omitted, suppliers are auto-loaded from the project's spend records
   * via loadProjectSuppliersFromSpend (DB-backed, ranked by descending spend).
   */
  suppliers?: RankedSupplier[];
  /** Total goods & services cost for the G&S pillar. Defaults to auto-loaded sum. */
  totalGoodsServicesCost?: number;
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

// ─── Project Supplier Loader ───

/**
 * Load ranked suppliers from the project's real spend records.
 *
 * Aggregates LocalContentSpendRecord amounts grouped by supplierId, joins
 * supplier classification data (locality + declared LC%), ranks by
 * descending spend with lexicographic tie-break, and returns the grand
 * total as totalGoodsServicesCost.
 *
 * Deterministic rule: totalGoodsServicesCost equals the sum of exactly the
 * same spend records used for supplier aggregation, keeping LC%_GS
 * internally consistent.
 */
export async function loadProjectSuppliersFromSpend(
  db: PrismaClient,
  projectId: string,
): Promise<{
  suppliers: RankedSupplier[];
  totalGoodsServicesCost: number;
  regulatoryProductCodes: string[];
}> {
  // Load the actual project-scoped spend rows. Product identity belongs to
  // each procurement line, not to the supplier (one supplier may provide
  // multiple regulated products).
  const spendRows = await db.localContentSpendRecord.findMany({
    where: { projectId, category: { in: ["goods", "services"] } },
    select: { supplierId: true, amount: true, metadata: true },
  });

  if (spendRows.length === 0) {
    return { suppliers: [], totalGoodsServicesCost: 0, regulatoryProductCodes: [] };
  }

  const grouped = new Map<string, { spend: number; productCodes: Set<string> }>();
  for (const row of spendRows) {
    const amount = row.amount;
    if (!Number.isFinite(amount) || amount <= 0) continue;
    const current = grouped.get(row.supplierId) ?? {
      spend: 0,
      productCodes: new Set<string>(),
    };
    current.spend += amount;
    const metadata = row.metadata;
    if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
      const rawCode = (metadata as { lcgpaProductCode?: unknown }).lcgpaProductCode;
      if (typeof rawCode === "string") {
        const code = canonicalEtimadCode(rawCode);
        if (code) current.productCodes.add(code);
      }
    }
    grouped.set(row.supplierId, current);
  }

  const supplierIds = [...grouped.keys()];
  if (supplierIds.length === 0) {
    return { suppliers: [], totalGoodsServicesCost: 0, regulatoryProductCodes: [] };
  }

  // Fetch classification data for the referenced suppliers
  const supplierRows = await db.localContentSupplier.findMany({
    where: { id: { in: supplierIds }, projectId },
    select: {
      id: true,
      name: true,
      localityClassification: true,
      localContentPercentage: true,
    },
  });

  const byId = new Map(supplierRows.map((s) => [s.id, s]));

  const VALID_LOCALITY = new Set<string>(["local", "non_local", "mixed"]);

  const enriched = supplierIds
    .map((supplierId) => {
      const aggregate = grouped.get(supplierId)!;
      const row = byId.get(supplierId);
      const rawLocality = row?.localityClassification ?? null;
      const locality = (
        rawLocality && VALID_LOCALITY.has(rawLocality)
          ? rawLocality
          : "unclassified"
      ) as RankedSupplier["localityClassification"];
      return {
        supplierId,
        name: row?.name ?? supplierId,
        spend: aggregate.spend,
        localityClassification: locality,
        localContentPercentage: row?.localContentPercentage ?? null,
        regulatoryProductCodes: [...aggregate.productCodes].sort(),
      };
    })
    .filter((s) => s.spend > 0);

  // Rank by descending spend, tie-break by supplierId lexicographic
  const sorted = [...enriched].sort(
    (a, b) => b.spend - a.spend || a.supplierId.localeCompare(b.supplierId),
  );

  const suppliers: RankedSupplier[] = sorted.map((s, i) => ({
    ...s,
    rank: i + 1,
  }));

  const totalGoodsServicesCost = suppliers.reduce((sum, s) => sum + s.spend, 0);

  const regulatoryProductCodes = [
    ...new Set(suppliers.flatMap((s) => s.regulatoryProductCodes ?? [])),
  ].sort();

  return { suppliers, totalGoodsServicesCost, regulatoryProductCodes };
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
    computedById,
    policy,
  } = input;

  // 1. Load workbook lines
  const lines = await db.lcWorkbookLine.findMany({
    where: { workbookId },
  });

  // 2. Resolve G&S inputs — explicit suppliers take precedence; otherwise
  //    auto-load ranked suppliers from the project's real spend records.
  const explicitSuppliers = input.suppliers;
  let suppliers: RankedSupplier[];
  let totalGoodsServicesCost: number;
  let productCodes: string[];
  if (explicitSuppliers && explicitSuppliers.length > 0) {
    suppliers = explicitSuppliers;
    totalGoodsServicesCost =
      input.totalGoodsServicesCost ??
      explicitSuppliers.reduce((sum, s) => sum + s.spend, 0);
    productCodes = [
      ...new Set(explicitSuppliers.flatMap((s) => s.regulatoryProductCodes ?? [s.supplierId])),
    ];
  } else {
    const loaded = await loadProjectSuppliersFromSpend(db, projectId);
    suppliers = loaded.suppliers;
    totalGoodsServicesCost = loaded.totalGoodsServicesCost;
    productCodes = loaded.regulatoryProductCodes;
    // Preserve unresolved supplier identity as an UNKNOWN sentinel for every
    // spend-bearing supplier without an explicit product mapping. This keeps
    // strict binding fail-closed rather than silently dropping spend.
    productCodes.push(
      ...suppliers
        .filter((s) => !s.regulatoryProductCodes?.length)
        .map((s) => s.supplierId),
    );
  }

  // 3. Extract LCGPA pillar inputs from workbook lines
  const pillarInputs = extractLcgpaInputs(lines, suppliers, totalGoodsServicesCost);

  // 4. Load resolvable regulatory datasets from DB
  const datasets = await loadResolvableDatasets(db);

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

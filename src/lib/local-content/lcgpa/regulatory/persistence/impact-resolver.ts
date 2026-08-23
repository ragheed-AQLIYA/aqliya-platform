// ─── LCGPA Regulatory Intelligence :: Prisma ImpactResolver (§21, §22, §45) ───
//
// Resolves what a regulatory change actually touches in LocalContentOS.
//
// HONESTY ABOUT COVERAGE. A count of zero can mean two very different things:
//   (a) the link exists in the schema and nothing matched, or
//   (b) no link exists in the schema, so the question cannot be answered.
//
// This resolver reports which is which through `describeCoverage()`. It NEVER
// closes the gap by guessing — matching a spend record to an LCGPA product by
// fuzzy name similarity would manufacture a regulatory fact, so it is not done.

import type { PrismaClient } from "@prisma/client";

import type { AffectedEntities, ImpactResolver } from "../types";
import { EMPTY_AFFECTED } from "../impact-analysis";

export const COVERAGE_STATES = ["RESOLVED", "DERIVED", "NOT_LINKED"] as const;
export type CoverageState = (typeof COVERAGE_STATES)[number];

export interface CoverageEntry {
  entity: keyof AffectedEntities;
  state: CoverageState;
  explanation: string;
}

/**
 * What this resolver can and cannot answer against the current schema.
 *
 *   RESOLVED   a direct link from the product code exists and was queried
 *   DERIVED    reached indirectly (through the affected calculations' projects)
 *   NOT_LINKED no link exists; an empty result is "unknown", not "none"
 */
export const IMPACT_COVERAGE: CoverageEntry[] = [
  {
    entity: "calculationIds",
    state: "RESOLVED",
    explanation:
      "LcCalculationRun.regulatoryDatasetVersion binds a calculation to the dataset that produced it; datasets are matched on the affected product codes.",
  },
  {
    entity: "projectIds",
    state: "DERIVED",
    explanation: "Projects owning an affected calculation.",
  },
  {
    entity: "supplierIds",
    state: "DERIVED",
    explanation:
      "Suppliers belonging to an affected project. LocalContentSupplier carries no LCGPA product code, so supplier-to-product precision is not available.",
  },
  {
    entity: "tenderIds",
    state: "DERIVED",
    explanation:
      "LcFinancialEvaluation rows for affected projects. The model carries a tenderReference but no product code.",
  },
  {
    entity: "reportIds",
    state: "DERIVED",
    explanation: "LocalContentReport rows for affected projects.",
  },
  {
    entity: "complianceAssessmentIds",
    state: "DERIVED",
    explanation: "LcPenaltyAssessment rows for affected projects.",
  },
  {
    entity: "contractIds",
    state: "NOT_LINKED",
    explanation:
      "No contract model exists in the schema. An empty result here means UNKNOWN, not zero.",
  },
];

export function describeCoverage(): CoverageEntry[] {
  return IMPACT_COVERAGE.slice();
}

/** Entity classes whose emptiness must not be read as «nothing affected». */
export function unresolvableEntities(): (keyof AffectedEntities)[] {
  return IMPACT_COVERAGE.filter((c) => c.state === "NOT_LINKED").map((c) => c.entity);
}

export interface PrismaImpactResolverOptions {
  /** Restrict resolution to one organisation's projects. */
  platformOrganizationId?: string;
  /** Safety ceiling on ids returned per entity class. */
  limit?: number;
}

export interface RegulatoryImpactResolver extends ImpactResolver {
  describeCoverage(): CoverageEntry[];
}

const DEFAULT_LIMIT = 5000;

/**
 * Resolve affected LocalContentOS entities for a set of product codes.
 * Every id returned came from a query; none is estimated.
 */
export function createPrismaImpactResolver(
  db: PrismaClient,
  options: PrismaImpactResolverOptions = {},
): RegulatoryImpactResolver {
  const take = options.limit ?? DEFAULT_LIMIT;

  return {
    describeCoverage,

    async findAffected(productCodes: string[]): Promise<AffectedEntities> {
      if (productCodes.length === 0) return { ...EMPTY_AFFECTED };

      // 1. Datasets that state any of these products.
      const datasetRows = await db.lcRegulatoryProduct.findMany({
        where: { productCode: { in: productCodes } },
        select: { dataset: { select: { datasetVersion: true } } },
        distinct: ["datasetId"],
        take,
      });
      const datasetVersions: string[] = Array.from(
        new Set(datasetRows.map((r) => String(r.dataset.datasetVersion))),
      );
      if (datasetVersions.length === 0) return { ...EMPTY_AFFECTED };

      // 2. Calculations bound to those dataset versions — a direct link.
      const calculations = await db.lcCalculationRun.findMany({
        where: { regulatoryDatasetVersion: { in: datasetVersions } },
        select: { id: true, projectId: true },
        take,
      });
      // Element types are stated explicitly rather than inferred from the query
      // result, so the contract holds whatever the client generates.
      const calculationIds: string[] = calculations.map((c) => String(c.id));
      const projectIds: string[] = Array.from(
        new Set(calculations.map((c) => String(c.projectId))),
      );

      if (projectIds.length === 0) {
        return { ...EMPTY_AFFECTED, calculationIds };
      }

      // 3. Everything else is derived from the affected projects.
      const [suppliers, tenders, reports, assessments] = await Promise.all([
        db.localContentSupplier.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
          take,
        }),
        db.lcFinancialEvaluation.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
          take,
        }),
        db.localContentReport.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
          take,
        }),
        db.lcPenaltyAssessment.findMany({
          where: { projectId: { in: projectIds } },
          select: { id: true },
          take,
        }),
      ]);

      return {
        calculationIds,
        projectIds,
        tenderIds: tenders.map((t) => String(t.id)),
        supplierIds: suppliers.map((s) => String(s.id)),
        // No contract model exists; see IMPACT_COVERAGE.
        contractIds: [],
        reportIds: reports.map((r) => String(r.id)),
        complianceAssessmentIds: assessments.map((a) => String(a.id)),
      };
    },
  };
}

/** Human-readable coverage note for reports and the reviewer UI. */
export function renderCoverage(entries: CoverageEntry[] = IMPACT_COVERAGE): string {
  return entries
    .map((c) => `${c.state.padEnd(11)} ${String(c.entity).padEnd(26)} ${c.explanation}`)
    .join("\n");
}

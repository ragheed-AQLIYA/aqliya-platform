// ─── LCGPA Regulatory Intelligence :: Calculation ↔ regulatory version binding (§20, §36) ───
//
// Every stored calculation must be able to answer, years later:
//   "Which exact regulatory version produced this number?"
//
// This module is the gate. A calculation run cannot be recorded without a
// resolved regulatory binding, and the binding is resolved AS OF the
// calculation date — never against "the latest dataset".

import type { PrismaClient } from "@prisma/client";

import { LCGPA_RULE_VERSION } from "../types";
import {
  resolveForCalculation,
  type CalculationResolution,
  type ProductStateResolution,
} from "./effective-date";
import type { RegulatoryDataset } from "./types";

export interface RegulatoryBinding {
  /** The instant the calculation was resolved against. */
  regulatoryAsOf: Date;
  regulatoryDatasetVersion: string | null;
  regulatoryArtifactSha256: string | null;
  regulatoryParserVersion: string | null;
  regulatorySchemaVersion: string | null;
  ruleVersion: string;
  /** Per-product outcomes, including UNKNOWNs, exactly as resolved. */
  resolution: {
    productCode: string;
    outcome: "RESOLVED" | "UNKNOWN";
    minimumLcPct: number | null;
    sectorCode: string | null;
    datasetVersion: string | null;
    rationale: string;
  }[];
  complete: boolean;
  unresolved: string[];
}

export interface BindCalculationInput {
  /** Datasets available to resolve against. */
  datasets: RegulatoryDataset[];
  /** The date the calculation is performed FOR. Required. */
  calculationDate: Date;
  /** Product codes the calculation depends on. May be empty. */
  productCodes: string[];
}

function toResolutionRow(r: ProductStateResolution) {
  return {
    productCode: r.productCode,
    outcome: r.outcome,
    minimumLcPct: r.product?.minimumLcPct ?? null,
    sectorCode: r.product?.sectorCode ?? null,
    datasetVersion: r.datasetVersion,
    rationale: r.rationale,
  };
}

/**
 * Resolve the regulatory binding for a calculation.
 * Throws when no calculation date is supplied — there is no implicit "now".
 */
export function bindCalculation(input: BindCalculationInput): RegulatoryBinding {
  const resolution: CalculationResolution = resolveForCalculation(input.datasets, {
    calculationDate: input.calculationDate,
    productCodes: input.productCodes,
  });

  const dataset = resolution.datasetVersion
    ? input.datasets.find((d) => d.datasetVersion === resolution.datasetVersion)
    : undefined;

  return {
    regulatoryAsOf: input.calculationDate,
    regulatoryDatasetVersion: resolution.datasetVersion,
    regulatoryArtifactSha256: dataset?.artifactSha256 ?? null,
    regulatoryParserVersion: dataset?.parserVersion ?? null,
    regulatorySchemaVersion: dataset?.schemaVersion ?? null,
    ruleVersion: resolution.ruleVersion ?? LCGPA_RULE_VERSION,
    resolution: resolution.products.map(toResolutionRow),
    complete: resolution.complete,
    unresolved: resolution.unresolved,
  };
}

// ─── Gate ───

export interface BindingGate {
  allowed: boolean;
  reason: string;
}

export interface BindingPolicy {
  /**
   * Permit recording a calculation whose product codes did not all resolve.
   * The unresolved codes are still recorded as UNKNOWN — never substituted.
   */
  allowIncompleteResolution?: boolean;
  /** Permit recording when no dataset was in force at the calculation date. */
  allowUnboundDataset?: boolean;
}

/**
 * May this calculation be recorded?
 *
 * Refuses by default when the regulatory state could not be resolved, because
 * an unbound calculation cannot later be explained or reproduced.
 */
export function canRecordCalculation(
  binding: RegulatoryBinding,
  policy: BindingPolicy = {},
): BindingGate {
  if (binding.regulatoryDatasetVersion === null && !policy.allowUnboundDataset) {
    return {
      allowed: false,
      reason:
        "REGULATORY_STATE_UNRESOLVED: no dataset was in force at the calculation date, so this result could not be explained or reproduced later.",
    };
  }
  if (!binding.complete && !policy.allowIncompleteResolution) {
    return {
      allowed: false,
      reason: `PRODUCTS_UNRESOLVED: ${binding.unresolved.length} product code(s) did not resolve (${binding.unresolved.slice(0, 5).join(", ")}${binding.unresolved.length > 5 ? " …" : ""}).`,
    };
  }
  return {
    allowed: true,
    reason: binding.regulatoryDatasetVersion
      ? `BOUND: ${binding.regulatoryDatasetVersion} (rule ${binding.ruleVersion})`
      : `BOUND_WITHOUT_DATASET: rule ${binding.ruleVersion}, policy-permitted`,
  };
}

// ─── Persistence ───

export interface RecordCalculationInput {
  projectId: string;
  workbookId?: string | null;
  method: string;
  inputs: unknown;
  result: unknown;
  lcPillars: unknown;
  overallLcPct: number;
  totalCosts: number;
  computedById?: string | null;
  evidence?: unknown;
  binding: RegulatoryBinding;
  policy?: BindingPolicy;
}

/**
 * Record a calculation run WITH its regulatory binding.
 * Refuses to write an unbound calculation.
 */
export async function recordCalculationRun(
  db: PrismaClient,
  input: RecordCalculationInput,
): Promise<{ id: string }> {
  const gate = canRecordCalculation(input.binding, input.policy);
  if (!gate.allowed) {
    throw new Error(`CALCULATION_NOT_RECORDABLE: ${gate.reason}`);
  }

  const run = await db.lcCalculationRun.create({
    data: {
      projectId: input.projectId,
      workbookId: input.workbookId ?? null,
      method: input.method,
      ruleVersion: input.binding.ruleVersion,
      inputs: input.inputs as object,
      result: input.result as object,
      lcPillars: input.lcPillars as object,
      overallLcPct: input.overallLcPct,
      totalCosts: input.totalCosts,
      computedById: input.computedById ?? null,
      evidence: (input.evidence ?? undefined) as object | undefined,
      regulatoryDatasetVersion: input.binding.regulatoryDatasetVersion,
      regulatoryArtifactSha256: input.binding.regulatoryArtifactSha256,
      regulatoryParserVersion: input.binding.regulatoryParserVersion,
      regulatorySchemaVersion: input.binding.regulatorySchemaVersion,
      regulatoryAsOf: input.binding.regulatoryAsOf,
      regulatoryResolution: input.binding.resolution as unknown as object,
    },
    select: { id: true },
  });
  return run;
}

/** Operator-facing rendering of a binding. */
export function renderBinding(binding: RegulatoryBinding): string {
  return [
    `As of:            ${binding.regulatoryAsOf.toISOString().slice(0, 10)}`,
    `Dataset:          ${binding.regulatoryDatasetVersion ?? "(none in force)"}`,
    `Artifact SHA-256: ${binding.regulatoryArtifactSha256 ?? "(none)"}`,
    `Rule version:     ${binding.ruleVersion}`,
    `Parser version:   ${binding.regulatoryParserVersion ?? "(none)"}`,
    `Resolved:         ${binding.resolution.filter((r) => r.outcome === "RESOLVED").length}/${binding.resolution.length}`,
    `Unresolved:       ${binding.unresolved.length ? binding.unresolved.join(", ") : "(none)"}`,
  ].join("\n");
}

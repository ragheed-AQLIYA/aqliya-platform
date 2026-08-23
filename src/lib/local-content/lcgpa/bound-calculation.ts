// ─── LocalContentOS — LCGPA Bound Calculation ───
//
// Every stored calculation must answer: "Which exact regulatory version produced this number?"
//
// This module is the GATE. A calculation cannot be recorded without a
// resolved regulatory binding, and the binding is resolved AS OF the
// calculation date — never against "the latest dataset".
//
// The binding resolves BEFORE the calculation runs, ensuring every result
// carries its full regulatory provenance: dataset version, artifact SHA-256,
// parser version, schema version, rule version, and per-product resolution.

import { randomBytes } from "crypto";
import type { PrismaClient } from "@prisma/client";
import type {
  LcPillarInputs,
  LcPillarResult,
  LcCalculationTrace,
  EvidenceReference,
  CalculationMethod,
} from "./types";
import { computeLcgpaScore, applyGsSelectionRule } from "./calculation-engine";
import {
  bindCalculation,
  canRecordCalculation,
  recordCalculationRun,
  type RegulatoryBinding,
  type BindingPolicy,
} from "./regulatory/calculation-binding";
import type { RegulatoryDataset } from "./regulatory/types";

// ─── Bound Calculation Result ───

/**
 * The complete result of a regulatory-bound calculation.
 * Carries the calculation result AND the regulatory binding that produced it.
 */
export interface BoundCalculationResult {
  /** The regulatory binding — which exact versions were in force. */
  binding: RegulatoryBinding;
  /** The LCGPA pillar calculation result. */
  result: LcPillarResult;
  /** The G&S selection result for this calculation. */
  gsSelection: ReturnType<typeof applyGsSelectionRule>;
  /** Calculation method used. */
  method: CalculationMethod;
  /** Rule version from the binding (authoritative, not static). */
  ruleVersion: string;
  /** Whether the binding gate permits recording. */
  recordable: boolean;
  /** Gate reason if not recordable. */
  gateReason: string;
}

// ─── Bound Calculation Trace ───

/**
 * A calculation trace that carries its regulatory binding.
 * This is the audit-grade record: it alone must be sufficient to
 * reproduce the result and explain which regulatory version produced it.
 */
export interface BoundCalculationTrace extends LcCalculationTrace {
  /** The regulatory binding that was in force when this calculation was performed. */
  regulatoryBinding: {
    regulatoryAsOf: string;
    regulatoryDatasetVersion: string | null;
    regulatoryArtifactSha256: string | null;
    regulatoryParserVersion: string | null;
    regulatorySchemaVersion: string | null;
    ruleVersion: string;
    resolution: RegulatoryBinding["resolution"];
    complete: boolean;
    unresolved: string[];
  };
}

// ─── Core Bound Calculation ───

export interface ComputeLcgpaWithBindingInput {
  /** Regulatory datasets to resolve against. */
  datasets: RegulatoryDataset[];
  /** The date the calculation is performed FOR. Required — no implicit "latest". */
  calculationDate: Date;
  /** Product codes the calculation depends on. May be empty. */
  productCodes: string[];
  /** Pillar inputs for the LCGPA calculation. */
  pillarInputs: LcPillarInputs;
  /** Calculation method (default: "lcgpa_v1"). */
  method?: CalculationMethod;
  /** User who triggered the calculation. */
  computedById?: string | null;
  /** Optional evidence references. */
  evidenceRefs?: EvidenceReference[];
  /** Binding policy (allows incomplete/unbound under explicit policy). */
  policy?: BindingPolicy;
}

/**
 * Perform an LCGPA calculation WITH regulatory binding.
 *
 * The binding is resolved FIRST (as of calculationDate), then the
 * calculation runs against the same inputs. The result carries the
 * full regulatory provenance.
 *
 * @throws when calculationDate is missing or invalid.
 */
export function computeLcgpaWithBinding(
  input: ComputeLcgpaWithBindingInput,
): BoundCalculationResult {
  // 1. Resolve regulatory binding FIRST
  const binding = bindCalculation({
    datasets: input.datasets,
    calculationDate: input.calculationDate,
    productCodes: input.productCodes,
  });

  // 2. Check recording gate
  const gate = canRecordCalculation(binding, input.policy);

  // 3. Perform the actual calculation
  const result = computeLcgpaScore(input.pillarInputs);
  const gsSelection = applyGsSelectionRule(input.pillarInputs.goodsServices);

  return {
    binding,
    result,
    gsSelection,
    method: input.method ?? "lcgpa_v1",
    ruleVersion: binding.ruleVersion,
    recordable: gate.allowed,
    gateReason: gate.reason,
  };
}

// ─── Bound Trace Creation ───

/**
 * Generate a unique calculation run ID.
 * Format: lcr_{timestamp}_{random8}
 */
function generateCalculationRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  return `lcr_${timestamp}_${random}`;
}

/**
 * Create an audit-grade calculation trace that carries its regulatory binding.
 *
 * The rule version in the trace comes FROM THE BINDING — not from a static constant.
 * This ensures the trace is self-explanatory years later.
 */
export function createBoundCalculationTrace(
  input: ComputeLcgpaWithBindingInput,
  bound: BoundCalculationResult,
): BoundCalculationTrace {
  const refs: EvidenceReference[] =
    input.evidenceRefs && input.evidenceRefs.length > 0
      ? input.evidenceRefs
      : buildEvidenceReferences(input.pillarInputs);

  return {
    calculationRunId: generateCalculationRunId(),
    method: bound.method,
    // RULE VERSION FROM BINDING — not static constant
    ruleVersion: bound.ruleVersion,
    computedAt: new Date().toISOString(),
    computedById: input.computedById ?? null,
    inputs: input.pillarInputs,
    gsSelection: bound.gsSelection,
    result: bound.result,
    evidenceRefs: refs,
    // Regulatory binding travels with the trace
    regulatoryBinding: {
      regulatoryAsOf: bound.binding.regulatoryAsOf.toISOString(),
      regulatoryDatasetVersion: bound.binding.regulatoryDatasetVersion,
      regulatoryArtifactSha256: bound.binding.regulatoryArtifactSha256,
      regulatoryParserVersion: bound.binding.regulatoryParserVersion,
      regulatorySchemaVersion: bound.binding.regulatorySchemaVersion,
      ruleVersion: bound.binding.ruleVersion,
      resolution: bound.binding.resolution,
      complete: bound.binding.complete,
      unresolved: bound.binding.unresolved,
    },
  };
}

/**
 * Build evidence references from pillar inputs.
 */
function buildEvidenceReferences(inputs: LcPillarInputs): EvidenceReference[] {
  const refs: EvidenceReference[] = [];

  for (const supplier of inputs.goodsServices.suppliers) {
    refs.push({
      type: "supplier_declaration",
      referenceId: supplier.supplierId,
      description: `Supplier ${supplier.name} spend: ${supplier.spend} SAR, locality: ${supplier.localityClassification}`,
      value: supplier.spend,
    });
  }

  refs.push({
    type: "financial_statement",
    referenceId: "AST-KSA",
    description: `KSA-manufactured asset depreciation: ${inputs.assetDepreciation.ksaManufacturedDepreciation} SAR`,
    value: inputs.assetDepreciation.ksaManufacturedDepreciation,
  });
  refs.push({
    type: "financial_statement",
    referenceId: "AST-FOREIGN",
    description: `Foreign asset depreciation: ${inputs.assetDepreciation.foreignAssetDepreciation} SAR`,
    value: inputs.assetDepreciation.foreignAssetDepreciation,
  });

  refs.push({
    type: "financial_statement",
    referenceId: "LAB-SAUDI",
    description: `Saudi employee compensation: ${inputs.laborCompensation.saudiCompensation} SAR`,
    value: inputs.laborCompensation.saudiCompensation,
  });
  refs.push({
    type: "financial_statement",
    referenceId: "LAB-EXPAT",
    description: `Expat employee compensation: ${inputs.laborCompensation.expatCompensation} SAR`,
    value: inputs.laborCompensation.expatCompensation,
  });

  refs.push({
    type: "manual_entry",
    referenceId: "CB-TRAINING",
    description: `Saudi training cost: ${inputs.capacityBuilding.saudiTrainingCost} SAR`,
    value: inputs.capacityBuilding.saudiTrainingCost,
  });
  refs.push({
    type: "manual_entry",
    referenceId: "CB-DEV",
    description: `Supplier development cost: ${inputs.capacityBuilding.supplierDevelopmentCost} SAR`,
    value: inputs.capacityBuilding.supplierDevelopmentCost,
  });
  refs.push({
    type: "manual_entry",
    referenceId: "CB-RND",
    description: `R&D cost in KSA: ${inputs.capacityBuilding.rdCostInKsa} SAR`,
    value: inputs.capacityBuilding.rdCostInKsa,
  });

  return refs;
}

// ─── Persistence ───

export interface RecordBoundCalculationInput {
  projectId: string;
  workbookId?: string | null;
  bound: BoundCalculationResult;
  trace: BoundCalculationTrace;
  policy?: BindingPolicy;
}

/**
 * Record a bound calculation run to the database.
 * Refuses to write if the binding gate does not permit it.
 */
export async function recordBoundCalculationRun(
  db: PrismaClient,
  input: RecordBoundCalculationInput,
): Promise<{ id: string }> {
  return recordCalculationRun(db, {
    projectId: input.projectId,
    workbookId: input.workbookId ?? null,
    method: input.bound.method,
    inputs: input.trace.inputs,
    result: input.bound.result,
    lcPillars: input.bound.result,
    overallLcPct: input.bound.result.overallLcPct,
    totalCosts: input.bound.result.totalCosts,
    computedById: input.trace.computedById,
    evidence: input.trace.evidenceRefs,
    binding: input.bound.binding,
    policy: input.policy,
  });
}

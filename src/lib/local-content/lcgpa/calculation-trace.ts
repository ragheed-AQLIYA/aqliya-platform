// ─── LocalContentOS — LCGPA Calculation Trace ───
// Ensures every calculation is reproducible from its trace record alone.
// Stores inputs, selection results, outputs, evidence references.

import { randomBytes } from "crypto";
import type {
  LcPillarInputs,
  LcPillarResult,
  GsSelectionResult,
  LcCalculationTrace,
  FinancialEvaluationTrace,
  FinancialEvaluationInputs,
  EvidenceReference,
  CalculationMethod,
} from "./types";
import { LCGPA_RULE_VERSION } from "./types";
import {
  computeLcgpaScore,
  applyGsSelectionRule,
  computeFinancialEvaluation,
} from "./calculation-engine";

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
 * Create a full calculation trace record.
 *
 * This function:
 * 1. Computes the LCGPA score
 * 2. Records the G&S selection result
 * 3. Builds evidence references from inputs
 * 4. Returns a complete trace that can reproduce the result
 *
 * @param inputs - All pillar inputs
 * @param method - Calculation method (default: "lcgpa_v1")
 * @param computedById - User who triggered the calculation
 * @param evidenceRefs - Optional evidence references
 * @returns Complete calculation trace
 */
export function createCalculationTrace(
  inputs: LcPillarInputs,
  method: CalculationMethod = "lcgpa_v1",
  computedById: string | null = null,
  evidenceRefs: EvidenceReference[] = [],
): LcCalculationTrace {
  // Compute the score
  const result = computeLcgpaScore(inputs);

  // Compute G&S selection
  const gsSelection = applyGsSelectionRule(inputs.goodsServices);

  // Build evidence references from inputs if none provided
  const allEvidenceRefs =
    evidenceRefs.length > 0
      ? evidenceRefs
      : buildEvidenceReferences(inputs);

  return {
    calculationRunId: generateCalculationRunId(),
    method,
    ruleVersion: LCGPA_RULE_VERSION,
    computedAt: new Date().toISOString(),
    computedById,
    inputs,
    gsSelection,
    result,
    evidenceRefs: allEvidenceRefs,
  };
}

/**
 * Build evidence references from input data.
 * These trace each value back to its source.
 */
function buildEvidenceReferences(inputs: LcPillarInputs): EvidenceReference[] {
  const refs: EvidenceReference[] = [];

  // G&S evidence
  for (const supplier of inputs.goodsServices.suppliers) {
    refs.push({
      type: "supplier_declaration",
      referenceId: supplier.supplierId,
      description: `Supplier ${supplier.name} spend: ${supplier.spend} SAR, locality: ${supplier.localityClassification}`,
      value: supplier.spend,
    });
  }

  // Asset evidence
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

  // Labor evidence
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

  // Capacity Building evidence
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

/**
 * Serialize a calculation trace to JSON for storage.
 * Ensures all dates are ISO strings and all numbers are preserved exactly.
 */
export function serializeTrace(trace: LcCalculationTrace): string {
  return JSON.stringify(trace, null, 2);
}

/**
 * Deserialize a calculation trace from JSON storage.
 * Validates the basic structure.
 */
export function deserializeTrace(json: string): LcCalculationTrace {
  const parsed = JSON.parse(json) as LcCalculationTrace;

  if (!parsed.calculationRunId || !parsed.method || !parsed.result) {
    throw new Error("Invalid calculation trace: missing required fields");
  }

  return parsed;
}

/**
 * Verify that a trace's result matches a fresh computation from its inputs.
 * Used for audit verification.
 *
 * @param trace - The stored trace to verify
 * @returns true if the result is reproducible
 */
export function verifyTrace(trace: LcCalculationTrace): boolean {
  const freshResult = computeLcgpaScore(trace.inputs);

  // Compare all fields with exact equality
  return (
    trace.result.overallLcPct === freshResult.overallLcPct &&
    trace.result.lcGoodsServices === freshResult.lcGoodsServices &&
    trace.result.lcAssetDepreciation === freshResult.lcAssetDepreciation &&
    trace.result.lcLaborCompensation === freshResult.lcLaborCompensation &&
    trace.result.lcCapacityBuilding === freshResult.lcCapacityBuilding &&
    trace.result.totalCosts === freshResult.totalCosts
  );
}

/**
 * Generate a unique financial evaluation run ID.
 * Format: fev_{timestamp}_{random8}
 */
function generateFinancialEvaluationRunId(): string {
  const timestamp = Date.now().toString(36);
  const random = randomBytes(4).toString("hex");
  return `fev_${timestamp}_${random}`;
}

/**
 * Create a full financial evaluation trace record.
 *
 * This function:
 * 1. Validates inputs
 * 2. Computes the financial evaluation score
 * 3. Records intermediate calculations
 * 4. Builds evidence references from inputs
 * 5. Returns a complete trace that can reproduce the result
 *
 * @param inputs - Financial evaluation inputs
 * @param evaluatedById - User who triggered the evaluation
 * @param evidenceRefs - Optional evidence references
 * @returns Complete financial evaluation trace
 */
export function createFinancialEvaluationTrace(
  inputs: FinancialEvaluationInputs,
  evaluatedById: string | null = null,
  evidenceRefs: EvidenceReference[] = [],
): FinancialEvaluationTrace {
  // Compute the evaluation
  const evalOutput = computeFinancialEvaluation(inputs);

  // Build intermediate values for traceability
  const priceRatio =
    inputs.lowestBidPrice > 0 ? inputs.lowestBidPrice / inputs.bidPrice : 0;
  const lcBlendRaw = inputs.targetedLcPct * 0.5 + inputs.baselineLcPct * 0.5;
  const lcNormalized = lcBlendRaw / 100;
  const listedBonusRaw = inputs.isListedCompany ? 5 : 0;
  const listedBonusNormalized = listedBonusRaw / 100;

  // Build evidence references from inputs if none provided
  const allEvidenceRefs =
    evidenceRefs.length > 0
      ? evidenceRefs
      : buildFinancialEvaluationEvidenceReferences(inputs);

  return {
    evaluationRunId: generateFinancialEvaluationRunId(),
    method: "lcgpa_v1",
    ruleVersion: LCGPA_RULE_VERSION,
    evaluatedAt: new Date().toISOString(),
    evaluatedById,
    inputs,
    intermediates: {
      priceRatio,
      lcBlendRaw,
      lcNormalized,
      listedBonusRaw,
      listedBonusNormalized,
    },
    result: evalOutput.result ?? {
      priceScore: 0,
      lcScore: 0,
      listedCompanyBonus: 0,
      overallScore: 0,
      rank: null,
    },
    evidenceRefs: allEvidenceRefs,
  };
}

/**
 * Build evidence references from financial evaluation input data.
 * These trace each value back to its source.
 */
function buildFinancialEvaluationEvidenceReferences(
  inputs: FinancialEvaluationInputs,
): EvidenceReference[] {
  const refs: EvidenceReference[] = [];

  refs.push({
    type: "tender_document",
    referenceId: inputs.tenderReference,
    description: `Tender ${inputs.tenderReference}: bid price ${inputs.bidPrice} SAR`,
    value: inputs.bidPrice,
  });

  refs.push({
    type: "supplier_declaration",
    referenceId: inputs.supplierId,
    description: `Supplier ${inputs.supplierName}: baseline LC% = ${inputs.baselineLcPct}%, target LC% = ${inputs.targetedLcPct}%`,
    value: inputs.baselineLcPct,
  });

  return refs;
}

/**
 * Verify that a financial evaluation trace matches a fresh computation from its inputs.
 * Used for audit verification.
 *
 * @param trace - The stored trace to verify
 * @returns true if the result is reproducible
 */
export function verifyFinancialEvaluationTrace(
  trace: FinancialEvaluationTrace,
): boolean {
  const freshOutput = computeFinancialEvaluation(trace.inputs);

  if (!freshOutput.success || !trace.result) {
    return freshOutput.success === false && trace.result === null;
  }

  return (
    trace.result.priceScore === freshOutput.result!.priceScore &&
    trace.result.lcScore === freshOutput.result!.lcScore &&
    trace.result.listedCompanyBonus ===
      freshOutput.result!.listedCompanyBonus &&
    trace.result.overallScore === freshOutput.result!.overallScore
  );
}

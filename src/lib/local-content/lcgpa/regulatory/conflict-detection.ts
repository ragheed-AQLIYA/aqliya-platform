// ─── LCGPA Regulatory Intelligence :: Conflict Detection (§29, §51) ───
//
// When two OFFICIAL sources disagree, the engine does NOT choose. It records
// the contradiction with both artifacts and routes it to human review.
//
// Monitoring detects. Interpretation is a human act (§51).

import type {
  Clock,
  RegulatoryConflict,
  RegulatoryDataset,
  RegulatoryProduct,
  RegulatorySource,
} from "./types";
import { deterministicId } from "./ids";
import { normalizeValue } from "./semantic-diff";
import { isDiscoveryOnly } from "./source-registry";

/** Fields whose disagreement between official sources is a regulatory conflict. */
export const CONFLICT_FIELDS: (keyof RegulatoryProduct)[] = [
  "minimumLcPct",
  "sectorCode",
  "category",
  "hsCode",
  "regulatoryStatus",
  "effectiveFrom",
  "effectiveTo",
  "applicability",
];

export interface DetectConflictsInput {
  sourceA: RegulatorySource;
  datasetA: RegulatoryDataset;
  sourceB: RegulatorySource;
  datasetB: RegulatoryDataset;
  clock: Clock;
}

/**
 * Compare two datasets originating from DIFFERENT official sources.
 *
 * Third-party (TIER 4) input can never produce a conflict — it produces a
 * discovery signal instead, handled by the alert engine (§30).
 */
export function detectConflicts(input: DetectConflictsInput): RegulatoryConflict[] {
  const { sourceA, datasetA, sourceB, datasetB, clock } = input;

  if (isDiscoveryOnly(sourceA) || isDiscoveryOnly(sourceB)) {
    // A third-party disagreement is not a regulatory conflict.
    return [];
  }
  if (sourceA.id === sourceB.id) {
    return [];
  }

  const detectedAt = clock.now();
  const bMap = new Map(datasetB.products.map((p) => [p.productCode, p]));
  const conflicts: RegulatoryConflict[] = [];

  for (const a of datasetA.products.slice().sort((x, y) => x.productCode.localeCompare(y.productCode))) {
    const b = bMap.get(a.productCode);
    if (!b) continue;

    const conflictingFields: RegulatoryConflict["conflictingFields"] = [];
    for (const field of CONFLICT_FIELDS) {
      const valueA = normalizeValue(a[field]);
      const valueB = normalizeValue(b[field]);
      // Silence is not disagreement: one source not stating a value is not a conflict.
      if (valueA === null || valueB === null) continue;
      if (valueA === valueB) continue;
      conflictingFields.push({
        field: String(field),
        valueA,
        valueB,
        dateA: a.effectiveFrom,
        dateB: b.effectiveFrom,
      });
    }

    if (conflictingFields.length > 0) {
      conflicts.push({
        conflictId: deterministicId("CONF", [
          sourceA.id,
          sourceB.id,
          datasetA.artifactSha256,
          datasetB.artifactSha256,
          a.productCode,
        ]),
        sourceAId: sourceA.id,
        sourceBId: sourceB.id,
        artifactAHash: datasetA.artifactSha256,
        artifactBHash: datasetB.artifactSha256,
        productCode: a.productCode,
        conflictingFields,
        detectedAt,
        resolution: "PENDING_HUMAN_REVIEW",
      });
    }
  }

  return conflicts;
}

/**
 * Third-party early-warning signal (§30).
 *
 * Produces a discovery record that names the official sources that must be
 * checked. It can never modify the product registry, a regulatory dataset or
 * the computation engine.
 */
export interface DiscoverySignal {
  signalId: string;
  thirdPartySourceId: string;
  claim: string;
  detectedAt: Date;
  /** Official sources that must confirm before anything is believed. */
  requiresConfirmationFrom: string[];
  status: "AWAITING_OFFICIAL_CONFIRMATION";
  /** Always false — third-party data may never mutate authoritative state. */
  canMutateAuthoritativeState: false;
}

export function createDiscoverySignal(
  thirdPartySource: RegulatorySource,
  claim: string,
  officialSourceIds: string[],
  clock: Clock,
): DiscoverySignal {
  if (!isDiscoveryOnly(thirdPartySource)) {
    throw new Error(
      `NOT_A_THIRD_PARTY_SOURCE: ${thirdPartySource.id} is TIER ${thirdPartySource.authorityTier}; discovery signals are for TIER 4 sources`,
    );
  }
  return {
    signalId: deterministicId("SIG", [thirdPartySource.id, claim]),
    thirdPartySourceId: thirdPartySource.id,
    claim,
    detectedAt: clock.now(),
    requiresConfirmationFrom: officialSourceIds.slice().sort(),
    status: "AWAITING_OFFICIAL_CONFIRMATION",
    canMutateAuthoritativeState: false,
  };
}

// ─── Membership conflicts (§29) ───

export interface MembershipConflictInput {
  /** The source that states an obligation, e.g. the minimum-LC schedule. */
  obligationSource: RegulatorySource;
  obligationDataset: RegulatoryDataset;
  /** The source that defines membership, e.g. the Mandatory List. */
  listSource: RegulatorySource;
  listDataset: RegulatoryDataset;
  clock: Clock;
}

/**
 * Detect products that carry a published obligation but are ABSENT from the
 * list that is supposed to define who the obligation applies to.
 *
 * `detectConflicts` compares values for products both sources state. It says
 * nothing when a product is missing from one side — silence is not
 * disagreement. But a product with a *stated minimum local content percentage*
 * that does not appear on the Mandatory List is a different matter: two TIER 1
 * artifacts of the same publication month cannot both be right about whether
 * that product is regulated.
 *
 * This is the July 2026 case of `2802, 2804, 2805, 2808, 2809, 2814`.
 *
 * As with every conflict, the engine records both sides and resolves nothing.
 */
export function detectMembershipConflicts(
  input: MembershipConflictInput,
): RegulatoryConflict[] {
  const { obligationSource, obligationDataset, listSource, listDataset, clock } = input;

  if (isDiscoveryOnly(obligationSource) || isDiscoveryOnly(listSource)) return [];
  if (obligationSource.id === listSource.id) return [];

  const listed = new Set(listDataset.products.map((p) => p.productCode));
  const detectedAt = clock.now();

  return obligationDataset.products
    .filter((p) => !listed.has(p.productCode))
    // Only products that actually carry an obligation. A row with no stated
    // percentage and no schedule states nothing to conflict about.
    .filter(
      (p) =>
        p.minimumLcPct !== null ||
        (p.minimumLcSchedule ?? []).some((e) => e.state === "STATED"),
    )
    .sort((a, b) => a.productCode.localeCompare(b.productCode))
    .map((p) => {
      const stated = (p.minimumLcSchedule ?? []).filter((e) => e.state === "STATED");
      const summary =
        p.minimumLcPct !== null
          ? `${p.minimumLcPct}%`
          : stated.length > 0
            ? `${stated[0].pct}% from ${stated[0].year}`
            : "obligation stated";

      return {
        conflictId: deterministicId("CONF", [
          obligationSource.id,
          listSource.id,
          obligationDataset.artifactSha256,
          listDataset.artifactSha256,
          p.productCode,
          "MEMBERSHIP",
        ]),
        sourceAId: listSource.id,
        sourceBId: obligationSource.id,
        artifactAHash: listDataset.artifactSha256,
        artifactBHash: obligationDataset.artifactSha256,
        productCode: p.productCode,
        conflictingFields: [
          {
            field: "mandatoryListMembership",
            valueA: "ABSENT_FROM_LIST",
            valueB: `MINIMUM_STATED: ${summary} (${p.productNameAr})`,
            dateA: listDataset.effectiveFrom,
            dateB: p.effectiveFrom,
          },
        ],
        detectedAt,
        resolution: "PENDING_HUMAN_REVIEW" as const,
      };
    });
}

/** Operator-facing rendering of a conflict. */
export function renderConflict(c: RegulatoryConflict): string {
  return [
    `conflictId  ${c.conflictId}`,
    `product     ${c.productCode}`,
    `sourceA     ${c.sourceAId}  artifact ${c.artifactAHash.slice(0, 16)}…`,
    `sourceB     ${c.sourceBId}  artifact ${c.artifactBHash.slice(0, 16)}…`,
    ...c.conflictingFields.map(
      (f) => `  ${f.field}: A=${f.valueA ?? "(none)"} | B=${f.valueB ?? "(none)"}`,
    ),
    `resolution  ${c.resolution}`,
  ].join("\n");
}

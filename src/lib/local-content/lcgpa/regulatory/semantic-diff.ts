// ─── LCGPA Regulatory Intelligence :: Semantic Diff Engine (§15, §16) ───
//
// FILE_CHANGED is not an answer. This engine determines WHAT CHANGED INSIDE the
// regulatory content, field by field, with the old value, the new value, the
// effective date, and the artifact hashes on both sides.
//
// The diff is deterministic: the same pair of datasets always produces the same
// change ids, in the same order.

import type {
  ChangeSeverity,
  Clock,
  RegulatoryChange,
  RegulatoryChangeType,
  RegulatoryDataset,
  RegulatoryDiff,
  RegulatoryProduct,
} from "./types";
import { deterministicId } from "./ids";
import { classifyChange } from "./change-classification";

// ─── Value normalisation ───

/** Canonical string form of a product field value; null stays null (§45). */
export function normalizeValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (value instanceof Date) return value.toISOString();
  if (Array.isArray(value)) return value.slice().sort().join(",");
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

/**
 * Canonical serialisation of a published minimum-LC schedule.
 * `-` and `TBD` are preserved as states, never collapsed into a number.
 */
export function serializeSchedule(
  schedule: RegulatoryProduct["minimumLcSchedule"],
): string | null {
  if (!schedule || schedule.length === 0) return null;
  return schedule
    .slice()
    .sort((a, b) => a.year - b.year)
    .map((e) => `${e.year}:${e.state === "STATED" ? String(e.pct) : e.state}`)
    .join(";");
}

interface FieldRule {
  field: keyof RegulatoryProduct;
  changeType: RegulatoryChangeType;
}

/** Ordered so the diff output is stable and readable. */
const FIELD_RULES: FieldRule[] = [
  { field: "productNameAr", changeType: "PRODUCT_RENAMED" },
  { field: "productNameEn", changeType: "PRODUCT_DESCRIPTION_CHANGED" },
  { field: "descriptionAr", changeType: "PRODUCT_DESCRIPTION_CHANGED" },
  { field: "descriptionEn", changeType: "PRODUCT_DESCRIPTION_CHANGED" },
  { field: "sectorCode", changeType: "SECTOR_CHANGED" },
  { field: "sectorNameAr", changeType: "SECTOR_CHANGED" },
  { field: "category", changeType: "CATEGORY_CHANGED" },
  { field: "hsCode", changeType: "HS_CODE_CHANGED" },
  { field: "minimumLcPct", changeType: "MINIMUM_LC_CHANGED" },
  { field: "applicability", changeType: "APPLICABILITY_CHANGED" },
  { field: "priceCeilingRaw", changeType: "PRICE_CEILING_CHANGED" },
  { field: "manufacturerBaseline", changeType: "BASELINE_REQUIREMENT_CHANGED" },
  { field: "regulatoryStatus", changeType: "REGULATORY_STATUS_CHANGED" },
  { field: "effectiveFrom", changeType: "EFFECTIVE_DATE_CHANGED" },
  { field: "effectiveTo", changeType: "EXPIRY_DATE_CHANGED" },
];

// ─── Diff input ───

export interface DiffInput {
  /** Previous dataset. Null on the first ever dataset for a source. */
  before: RegulatoryDataset | null;
  after: RegulatoryDataset;
  clock: Clock;
  /**
   * Reviewer-confirmed methodology indicators. Supplied only when a human has
   * determined the change reflects a rule change rather than a data change.
   */
  methodologyChangeConfirmed?: boolean;
}

function makeChange(params: {
  datasetBefore: string;
  datasetAfter: string;
  productCode: string;
  changeType: RegulatoryChangeType;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  effectiveFrom: Date | null;
  detectedAt: Date;
  artifactBefore: string | null;
  artifactAfter: string;
  methodologyChangeConfirmed?: boolean;
  isBaseline?: boolean;
}): RegulatoryChange {
  const classification = classifyChange(params.changeType, {
    oldValue: params.oldValue,
    newValue: params.newValue,
    effectiveFrom: params.effectiveFrom,
    detectedAt: params.detectedAt,
    methodologyChangeConfirmed: params.methodologyChangeConfirmed,
    isBaseline: params.isBaseline,
  });

  return {
    changeId: deterministicId("CHG", [
      params.datasetBefore,
      params.datasetAfter,
      params.productCode,
      params.changeType,
      params.field,
      params.oldValue,
      params.newValue,
    ]),
    datasetBefore: params.datasetBefore,
    datasetAfter: params.datasetAfter,
    productCode: params.productCode,
    changeType: params.changeType,
    field: params.field,
    oldValue: params.oldValue,
    newValue: params.newValue,
    detectedAt: params.detectedAt,
    effectiveFrom: params.effectiveFrom,
    sourceArtifactBefore: params.artifactBefore,
    sourceArtifactAfter: params.artifactAfter,
    severity: classification.severity,
    severityRationale: `[${classification.policyId}] ${classification.rationale}`,
  };
}

/** Requirement set difference produces one change per requirement (§15). */
function diffRequirements(
  before: RegulatoryProduct,
  after: RegulatoryProduct,
): { added: string[]; removed: string[] } {
  const beforeSet = new Set(before.requirements);
  const afterSet = new Set(after.requirements);
  const added = after.requirements.filter((r) => !beforeSet.has(r)).sort();
  const removed = before.requirements.filter((r) => !afterSet.has(r)).sort();
  return { added, removed };
}

/**
 * Detect a product-code rename: a code disappears and another appears carrying
 * the same Arabic name and sector. Reported as PRODUCT_CODE_CHANGED rather than
 * an unrelated removal + addition.
 */
function matchRenamedCodes(
  removed: RegulatoryProduct[],
  added: RegulatoryProduct[],
): { pairs: { from: RegulatoryProduct; to: RegulatoryProduct }[] } {
  const pairs: { from: RegulatoryProduct; to: RegulatoryProduct }[] = [];
  const takenAdded = new Set<string>();
  for (const gone of removed.slice().sort((a, b) => a.productCode.localeCompare(b.productCode))) {
    const candidate = added
      .slice()
      .sort((a, b) => a.productCode.localeCompare(b.productCode))
      .find(
        (n) =>
          !takenAdded.has(n.productCode) &&
          n.productNameAr === gone.productNameAr &&
          n.sectorCode === gone.sectorCode,
      );
    if (candidate) {
      takenAdded.add(candidate.productCode);
      pairs.push({ from: gone, to: candidate });
    }
  }
  return { pairs };
}

// ─── Diff ───

/**
 * Compute the semantic diff between two dataset versions.
 *
 * When `before` is null the diff reports every product as PRODUCT_ADDED — this
 * is the first observation of a source, not a regulatory change to be alarmed at.
 */
export function computeSemanticDiff(input: DiffInput): RegulatoryDiff {
  const { before, after, clock } = input;
  const detectedAt = clock.now();
  const datasetBefore = before ? before.datasetVersion : "(none)";
  const datasetAfter = after.datasetVersion;
  const artifactBefore = before ? before.artifactSha256 : null;
  const artifactAfter = after.artifactSha256;
  const methodologyChangeConfirmed = input.methodologyChangeConfirmed;
  const isBaseline = before === null;

  const beforeMap = new Map<string, RegulatoryProduct>(
    (before?.products ?? []).map((p) => [p.productCode, p]),
  );
  const afterMap = new Map<string, RegulatoryProduct>(
    after.products.map((p) => [p.productCode, p]),
  );

  const removedProducts = Array.from(beforeMap.values()).filter(
    (p) => !afterMap.has(p.productCode),
  );
  const addedProducts = Array.from(afterMap.values()).filter(
    (p) => !beforeMap.has(p.productCode),
  );

  const { pairs } = matchRenamedCodes(removedProducts, addedProducts);
  const renamedFrom = new Set(pairs.map((p) => p.from.productCode));
  const renamedTo = new Set(pairs.map((p) => p.to.productCode));

  const changes: RegulatoryChange[] = [];
  let unchanged = 0;

  // ── Product code renames ──
  for (const { from, to } of pairs) {
    changes.push(
      makeChange({
        datasetBefore,
        datasetAfter,
        productCode: to.productCode,
        changeType: "PRODUCT_CODE_CHANGED",
        field: "productCode",
        oldValue: from.productCode,
        newValue: to.productCode,
        effectiveFrom: to.effectiveFrom,
        detectedAt,
        artifactBefore,
        artifactAfter,
        methodologyChangeConfirmed,
        isBaseline,
      }),
    );
  }

  // ── Additions ──
  for (const p of addedProducts
    .filter((p) => !renamedTo.has(p.productCode))
    .sort((a, b) => a.productCode.localeCompare(b.productCode))) {
    changes.push(
      makeChange({
        datasetBefore,
        datasetAfter,
        productCode: p.productCode,
        changeType: "PRODUCT_ADDED",
        field: "*",
        oldValue: null,
        newValue: p.productNameAr,
        effectiveFrom: p.effectiveFrom ?? after.effectiveFrom,
        detectedAt,
        artifactBefore,
        artifactAfter,
        methodologyChangeConfirmed,
        isBaseline,
      }),
    );
  }

  // ── Removals ──
  for (const p of removedProducts
    .filter((p) => !renamedFrom.has(p.productCode))
    .sort((a, b) => a.productCode.localeCompare(b.productCode))) {
    changes.push(
      makeChange({
        datasetBefore,
        datasetAfter,
        productCode: p.productCode,
        changeType: "PRODUCT_REMOVED",
        field: "*",
        oldValue: p.productNameAr,
        newValue: null,
        effectiveFrom: after.effectiveFrom,
        detectedAt,
        artifactBefore,
        artifactAfter,
        methodologyChangeConfirmed,
        isBaseline,
      }),
    );
  }

  // ── Field-level modifications ──
  const commonCodes = Array.from(afterMap.keys())
    .filter((code) => beforeMap.has(code))
    .sort();

  let modifiedProducts = 0;
  for (const code of commonCodes) {
    const prev = beforeMap.get(code) as RegulatoryProduct;
    const next = afterMap.get(code) as RegulatoryProduct;
    const productChanges: RegulatoryChange[] = [];

    // Restoration takes precedence over a plain status change.
    if (prev.regulatoryStatus === "REMOVED" && next.regulatoryStatus === "ACTIVE") {
      productChanges.push(
        makeChange({
          datasetBefore,
          datasetAfter,
          productCode: code,
          changeType: "PRODUCT_RESTORED",
          field: "regulatoryStatus",
          oldValue: prev.regulatoryStatus,
          newValue: next.regulatoryStatus,
          effectiveFrom: next.effectiveFrom ?? after.effectiveFrom,
          detectedAt,
          artifactBefore,
          artifactAfter,
          methodologyChangeConfirmed,
          isBaseline,
        }),
      );
    }

    for (const rule of FIELD_RULES) {
      if (
        rule.field === "regulatoryStatus" &&
        prev.regulatoryStatus === "REMOVED" &&
        next.regulatoryStatus === "ACTIVE"
      ) {
        continue; // already reported as PRODUCT_RESTORED
      }
      const oldValue = normalizeValue(prev[rule.field]);
      const newValue = normalizeValue(next[rule.field]);
      if (oldValue === newValue) continue;

      const effectiveFrom =
        rule.field === "effectiveFrom"
          ? next.effectiveFrom
          : (next.effectiveFrom ?? after.effectiveFrom);

      productChanges.push(
        makeChange({
          datasetBefore,
          datasetAfter,
          productCode: code,
          changeType: rule.changeType,
          field: String(rule.field),
          oldValue,
          newValue,
          effectiveFrom,
          detectedAt,
          artifactBefore,
          artifactAfter,
          methodologyChangeConfirmed,
          isBaseline,
        }),
      );
    }

    const scheduleBefore = serializeSchedule(prev.minimumLcSchedule);
    const scheduleAfter = serializeSchedule(next.minimumLcSchedule);
    if (scheduleBefore !== scheduleAfter) {
      productChanges.push(
        makeChange({
          datasetBefore,
          datasetAfter,
          productCode: code,
          changeType: "MINIMUM_LC_SCHEDULE_CHANGED",
          field: "minimumLcSchedule",
          oldValue: scheduleBefore,
          newValue: scheduleAfter,
          effectiveFrom: next.effectiveFrom ?? after.effectiveFrom,
          detectedAt,
          artifactBefore,
          artifactAfter,
          methodologyChangeConfirmed,
          isBaseline,
        }),
      );
    }

    const req = diffRequirements(prev, next);
    for (const added of req.added) {
      productChanges.push(
        makeChange({
          datasetBefore,
          datasetAfter,
          productCode: code,
          changeType: "REQUIREMENT_ADDED",
          field: "requirements",
          oldValue: null,
          newValue: added,
          effectiveFrom: next.effectiveFrom ?? after.effectiveFrom,
          detectedAt,
          artifactBefore,
          artifactAfter,
          methodologyChangeConfirmed,
          isBaseline,
        }),
      );
    }
    for (const removed of req.removed) {
      productChanges.push(
        makeChange({
          datasetBefore,
          datasetAfter,
          productCode: code,
          changeType: "REQUIREMENT_REMOVED",
          field: "requirements",
          oldValue: removed,
          newValue: null,
          effectiveFrom: next.effectiveFrom ?? after.effectiveFrom,
          detectedAt,
          artifactBefore,
          artifactAfter,
          methodologyChangeConfirmed,
          isBaseline,
        }),
      );
    }

    if (productChanges.length === 0) {
      unchanged++;
    } else {
      modifiedProducts++;
      changes.push(...productChanges);
    }
  }

  // ── Summary ──
  const byType: Partial<Record<RegulatoryChangeType, number>> = {};
  const bySeverity: Record<ChangeSeverity, number> = {
    LOW: 0,
    MEDIUM: 0,
    HIGH: 0,
    CRITICAL: 0,
  };
  for (const c of changes) {
    byType[c.changeType] = (byType[c.changeType] ?? 0) + 1;
    bySeverity[c.severity] += 1;
  }

  const sorted = changes
    .slice()
    .sort(
      (a, b) =>
        a.productCode.localeCompare(b.productCode) ||
        a.changeType.localeCompare(b.changeType) ||
        a.field.localeCompare(b.field),
    );

  return {
    diffId: deterministicId("DIFF", [datasetBefore, datasetAfter, artifactAfter]),
    isBaseline,
    datasetBefore: before ? before.datasetVersion : null,
    datasetAfter,
    changes: sorted,
    summary: {
      productsBefore: before?.products.length ?? 0,
      productsAfter: after.products.length,
      added: addedProducts.filter((p) => !renamedTo.has(p.productCode)).length,
      removed: removedProducts.filter((p) => !renamedFrom.has(p.productCode)).length,
      modified: modifiedProducts + pairs.length,
      unchanged,
      byType,
      bySeverity,
    },
    computedAt: detectedAt,
  };
}

/** Human-readable one-line rendering of a change, for alerts and the journal. */
export function describeChange(change: RegulatoryChange): string {
  const effective = change.effectiveFrom
    ? ` (effective ${change.effectiveFrom.toISOString().slice(0, 10)})`
    : " (effective date not stated)";
  switch (change.changeType) {
    case "PRODUCT_ADDED":
      return `${change.productCode} added: ${change.newValue}${effective}`;
    case "PRODUCT_REMOVED":
      return `${change.productCode} removed: ${change.oldValue}${effective}`;
    default:
      return `${change.productCode} ${change.changeType} ${change.field}: ${change.oldValue ?? "(none)"} → ${change.newValue ?? "(none)"}${effective}`;
  }
}

// ─── LCGPA Regulatory Intelligence :: Change Classification (§17) ───
//
// Severity is POLICY, not a hardcoded constant. Every assignment is explainable:
// `classifyChange` always returns the rule that produced the severity.
//
// BASE POLICY
//   LOW       identity/labelling only — no effect on any calculation
//   MEDIUM    classification changes that can re-route a spend item
//   HIGH      changes to a binding requirement, its scope, or when it applies
//   CRITICAL  changes that can invalidate already-produced regulatory results
//
// ESCALATION RULES override the base severity where the direction or timing of
// the change carries additional regulatory risk.

import type { ChangeSeverity, RegulatoryChangeType } from "./types";

export const SEVERITY_ORDER: Record<ChangeSeverity, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function maxSeverity(a: ChangeSeverity, b: ChangeSeverity): ChangeSeverity {
  return SEVERITY_ORDER[a] >= SEVERITY_ORDER[b] ? a : b;
}

export function highestSeverity(severities: ChangeSeverity[]): ChangeSeverity {
  return severities.reduce<ChangeSeverity>((acc, s) => maxSeverity(acc, s), "LOW");
}

// ─── Base policy ───

export interface SeverityPolicyEntry {
  severity: ChangeSeverity;
  policyId: string;
  rationale: string;
}

export const BASE_SEVERITY_POLICY: Record<RegulatoryChangeType, SeverityPolicyEntry> = {
  PRODUCT_RENAMED: {
    severity: "LOW",
    policyId: "POL-LOW-LABEL",
    rationale: "Name change only. Product identity and requirements unchanged.",
  },
  PRODUCT_DESCRIPTION_CHANGED: {
    severity: "LOW",
    policyId: "POL-LOW-LABEL",
    rationale: "Descriptive text only. No binding requirement changed.",
  },
  CATEGORY_CHANGED: {
    severity: "MEDIUM",
    policyId: "POL-MED-CLASSIFICATION",
    rationale:
      "Category drives classification routing; spend items may match a different rule set.",
  },
  SECTOR_CHANGED: {
    severity: "MEDIUM",
    policyId: "POL-MED-CLASSIFICATION",
    rationale:
      "Sector determines the official sector LC rate used for classification.",
  },
  HS_CODE_CHANGED: {
    severity: "MEDIUM",
    policyId: "POL-MED-CLASSIFICATION",
    rationale: "HS code drives customs/product matching and classification joins.",
  },
  PRODUCT_ADDED: {
    severity: "HIGH",
    policyId: "POL-HIGH-SCOPE",
    rationale:
      "Scope expansion: a product newly subject to mandatory-list obligations.",
  },
  PRODUCT_REMOVED: {
    severity: "HIGH",
    policyId: "POL-HIGH-SCOPE",
    rationale:
      "Scope reduction: obligations previously applied to this product no longer do.",
  },
  PRODUCT_RESTORED: {
    severity: "HIGH",
    policyId: "POL-HIGH-SCOPE",
    rationale: "Product re-enters the mandatory list after removal.",
  },
  PRODUCT_CODE_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-IDENTITY",
    rationale:
      "Official product identity changed; every stored reference to the old code must be re-resolved.",
  },
  MINIMUM_LC_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-REQUIREMENT",
    rationale:
      "The binding minimum local content percentage changed; compliance outcomes can flip.",
  },
  REQUIREMENT_ADDED: {
    severity: "HIGH",
    policyId: "POL-HIGH-REQUIREMENT",
    rationale: "A new binding requirement (certificate/standard) now applies.",
  },
  REQUIREMENT_REMOVED: {
    severity: "HIGH",
    policyId: "POL-HIGH-REQUIREMENT",
    rationale: "A previously binding requirement no longer applies.",
  },
  APPLICABILITY_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-SCOPE",
    rationale: "The scope of who/what the requirement applies to changed.",
  },
  EFFECTIVE_DATE_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-TIMING",
    rationale:
      "When the requirement begins to bind changed; temporal resolution of calculations is affected.",
  },
  EXPIRY_DATE_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-TIMING",
    rationale: "When the requirement stops binding changed.",
  },
  PRICE_CEILING_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-REQUIREMENT",
    rationale:
      "The published price ceiling changed; tender price evaluation for this product is affected.",
  },
  BASELINE_REQUIREMENT_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-REQUIREMENT",
    rationale:
      "The manufacturer local-content baseline requirement changed; supplier eligibility is affected.",
  },
  MINIMUM_LC_SCHEDULE_CHANGED: {
    severity: "HIGH",
    policyId: "POL-HIGH-TIMING",
    rationale:
      "The multi-year minimum local content schedule changed; a future binding percentage or the year it binds has moved.",
  },
  REGULATORY_STATUS_CHANGED: {
    severity: "CRITICAL",
    policyId: "POL-CRIT-STATUS",
    rationale:
      "The regulatory status of the product changed; existing assessments may no longer be valid.",
  },
};

// ─── Escalation context ───

export interface ClassificationContext {
  /** Previous value, normalized to string. */
  oldValue: string | null;
  /** New value, normalized to string. */
  newValue: string | null;
  /** Effective date of the new value, when stated. */
  effectiveFrom: Date | null;
  /** The moment the change was detected — used to test for retroactivity. */
  detectedAt: Date;
  /**
   * True when a reviewer has confirmed the change reflects a calculation
   * methodology or rule interpretation change rather than a data update (§42, §51).
   */
  methodologyChangeConfirmed?: boolean;
  /**
   * True when this is the FIRST observation of a source — a baseline rather
   * than a regulatory change. Every product in a baseline carries a historical
   * effective date, so the retroactivity escalation does not apply: nothing
   * changed, the system simply learned the existing state.
   */
  isBaseline?: boolean;
}

export interface ClassificationResult {
  severity: ChangeSeverity;
  policyId: string;
  rationale: string;
}

function parseNumeric(value: string | null): number | null {
  if (value === null || value.trim() === "") return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

/**
 * Classify one semantic change.
 * Always returns the policy id and the rationale that produced the severity.
 */
export function classifyChange(
  changeType: RegulatoryChangeType,
  ctx: ClassificationContext,
): ClassificationResult {
  const base = BASE_SEVERITY_POLICY[changeType];
  let severity = base.severity;
  let policyId = base.policyId;
  let rationale = base.rationale;

  // ── Escalation 1: a confirmed methodology change is always CRITICAL (§17). ──
  if (ctx.methodologyChangeConfirmed) {
    return {
      severity: "CRITICAL",
      policyId: "POL-CRIT-METHODOLOGY",
      rationale:
        "Reviewer confirmed a calculation methodology / rule interpretation change. This requires a new rule version before activation.",
    };
  }

  // ── Escalation 2: retroactive effect. Never applies to a baseline. ──
  if (
    !ctx.isBaseline &&
    ctx.effectiveFrom !== null &&
    ctx.effectiveFrom.getTime() < ctx.detectedAt.getTime() &&
    SEVERITY_ORDER[severity] >= SEVERITY_ORDER.MEDIUM
  ) {
    severity = "CRITICAL";
    policyId = "POL-CRIT-RETROACTIVE";
    rationale = `${rationale} Escalated: the new value is effective ${ctx.effectiveFrom.toISOString().slice(0, 10)}, before detection on ${ctx.detectedAt.toISOString().slice(0, 10)} — already-produced results fall inside the new regime.`;
    return { severity, policyId, rationale };
  }

  // ── Escalation 3: minimum LC increase raises the compliance bar. ──
  if (changeType === "MINIMUM_LC_CHANGED") {
    const oldPct = parseNumeric(ctx.oldValue);
    const newPct = parseNumeric(ctx.newValue);
    if (oldPct === null && newPct !== null) {
      severity = "CRITICAL";
      policyId = "POL-CRIT-LC-INTRODUCED";
      rationale =
        "A minimum local content percentage now applies to a product that previously had none. Suppliers with no stated obligation become subject to one.";
    } else if (oldPct !== null && newPct !== null && newPct > oldPct) {
      severity = "CRITICAL";
      policyId = "POL-CRIT-LC-INCREASE";
      rationale = `Minimum local content increased from ${oldPct}% to ${newPct}%. Previously compliant results can become non-compliant.`;
    } else if (oldPct !== null && newPct === null) {
      severity = "HIGH";
      policyId = "POL-HIGH-LC-WITHDRAWN";
      rationale = `A stated minimum local content of ${oldPct}% is no longer published for this product. Treated as UNKNOWN, not as zero.`;
    }
    return { severity, policyId, rationale };
  }

  // ── Escalation 4: an effective date pulled earlier compresses the runway. ──
  if (changeType === "EFFECTIVE_DATE_CHANGED") {
    const oldDate = ctx.oldValue ? Date.parse(ctx.oldValue) : NaN;
    const newDate = ctx.newValue ? Date.parse(ctx.newValue) : NaN;
    if (Number.isFinite(oldDate) && Number.isFinite(newDate) && newDate < oldDate) {
      severity = "CRITICAL";
      policyId = "POL-CRIT-DATE-ADVANCED";
      rationale = `Effective date moved earlier (${ctx.oldValue} → ${ctx.newValue}), reducing the compliance runway.`;
    }
  }

  return { severity, policyId, rationale };
}

/** Documented policy table, for the governance UI and the runbook. */
export function describeSeverityPolicy(): {
  changeType: RegulatoryChangeType;
  severity: ChangeSeverity;
  policyId: string;
  rationale: string;
}[] {
  return (Object.keys(BASE_SEVERITY_POLICY) as RegulatoryChangeType[])
    .sort()
    .map((changeType) => ({ changeType, ...BASE_SEVERITY_POLICY[changeType] }));
}

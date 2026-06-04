/**
 * S7-04 — SalesOS L5 acceptance criteria (machine-readable + evaluator).
 * Doctrine: criteria define when L5 may be claimed; evaluator reports honest partial state.
 */

export const SALES_L5_CRITERIA_VERSION = "2026-06-07";

export type SalesL5CriterionId =
  | "G1_AUTH_WORKSPACE"
  | "G2_TENANT_RBAC"
  | "G3_AUDIT_TRAIL"
  | "G4_EVIDENCE_LINKAGE"
  | "G5_REVIEW_APPROVAL"
  | "I1_INTELLIGENCE_HUB"
  | "I2_PIPELINE_FORECAST"
  | "I3_NO_FALSE_AI_CLAIMS"
  | "U1_BILINGUAL_RTL"
  | "C1_NO_CRM_SYNC_CLAIM"
  | "C2_OPERATOR_DISCLAIMER";

export type SalesL5Criterion = {
  id: SalesL5CriterionId;
  titleAr: string;
  titleEn: string;
  requiredForL5: boolean;
  gateRef: string;
};

export const SALES_L5_CRITERIA: SalesL5Criterion[] = [
  {
    id: "G1_AUTH_WORKSPACE",
    titleAr: "مساحة عمل محمية على /sales/*",
    titleEn: "Authenticated governed /sales workspace",
    requiredForL5: true,
    gateRef: "G4",
  },
  {
    id: "G2_TENANT_RBAC",
    titleAr: "عزل مؤسسة + RBAC على الطبقة الخادمية",
    titleEn: "Tenant isolation + server-side RBAC",
    requiredForL5: true,
    gateRef: "G4",
  },
  {
    id: "G3_AUDIT_TRAIL",
    titleAr: "سجل تدقيق للطفرات الحساسة",
    titleEn: "Audit trail for sensitive mutations",
    requiredForL5: true,
    gateRef: "G4",
  },
  {
    id: "G4_EVIDENCE_LINKAGE",
    titleAr: "ربط أدلة بالصفقات/المقترحات حيث ينطبق",
    titleEn: "Evidence linkage on deals/proposals",
    requiredForL5: true,
    gateRef: "G4",
  },
  {
    id: "G5_REVIEW_APPROVAL",
    titleAr: "مسار مراجعة/موافقة بشري قبل مخرجات حساسة",
    titleEn: "Human review/approval before sensitive outputs",
    requiredForL5: true,
    gateRef: "G4",
  },
  {
    id: "I1_INTELLIGENCE_HUB",
    titleAr: "مركز ذكاء S7-01 (سوق، إثبات، ذاكرة، رسم بياني)",
    titleEn: "S7-01 intelligence hub wired",
    requiredForL5: true,
    gateRef: "S7-01",
  },
  {
    id: "I2_PIPELINE_FORECAST",
    titleAr: "توقعات خط الأنابيب S7-02 (حتمية)",
    titleEn: "S7-02 deterministic pipeline forecast",
    requiredForL5: true,
    gateRef: "S7-02",
  },
  {
    id: "I3_NO_FALSE_AI_CLAIMS",
    titleAr: "الذكاء مساعد فقط — لا قرار آلي نهائي",
    titleEn: "AI assistive only — no autonomous final decision",
    requiredForL5: true,
    gateRef: "IC governance",
  },
  {
    id: "U1_BILINGUAL_RTL",
    titleAr: "تكافؤ عربي/RTL في المسارات الأساسية (S7-05)",
    titleEn: "Arabic/RTL parity on core routes (S7-05)",
    requiredForL5: true,
    gateRef: "S7-05",
  },
  {
    id: "C1_NO_CRM_SYNC_CLAIM",
    titleAr: "عدم ادّعاء CRM حي (S7-03 مفتوح)",
    titleEn: "No live CRM sync claim (S7-03 open)",
    requiredForL5: true,
    gateRef: "commercial truth",
  },
  {
    id: "C2_OPERATOR_DISCLAIMER",
    titleAr: "تصنيف Prototype/Internal في المصفوفة والوثائق",
    titleEn: "Prototype/internal labels in matrix + docs",
    requiredForL5: true,
    gateRef: "PRODUCT_STATUS_MATRIX",
  },
];

export type SalesL5EvaluationInput = Record<SalesL5CriterionId, boolean>;

export type SalesL5EvaluationResult = {
  version: string;
  requiredTotal: number;
  requiredMet: number;
  allRequiredMet: boolean;
  readinessLabel: "NOT_L5" | "L5_CONDITIONAL" | "L5_PILOT_READY";
  gaps: SalesL5CriterionId[];
  items: Array<{
    id: SalesL5CriterionId;
    met: boolean;
    requiredForL5: boolean;
  }>;
};

/** Repository baseline after Roadmap Phase 3 slice 2 (honest partial — not full L5). */
export const SALES_L5_REPO_BASELINE: SalesL5EvaluationInput = {
  G1_AUTH_WORKSPACE: true,
  G2_TENANT_RBAC: true,
  G3_AUDIT_TRAIL: true,
  G4_EVIDENCE_LINKAGE: true,
  G5_REVIEW_APPROVAL: true,
  I1_INTELLIGENCE_HUB: true,
  I2_PIPELINE_FORECAST: true,
  I3_NO_FALSE_AI_CLAIMS: true,
  U1_BILINGUAL_RTL: true, // S7-05 — layout RTL + Arabic loading/errors + core route manifest
  C1_NO_CRM_SYNC_CLAIM: true,
  C2_OPERATOR_DISCLAIMER: true,
};

export function evaluateSalesL5Acceptance(
  input: SalesL5EvaluationInput = SALES_L5_REPO_BASELINE,
): SalesL5EvaluationResult {
  const items = SALES_L5_CRITERIA.map((c) => ({
    id: c.id,
    met: Boolean(input[c.id]),
    requiredForL5: c.requiredForL5,
  }));

  const required = items.filter((i) => i.requiredForL5);
  const requiredMet = required.filter((i) => i.met).length;
  const gaps = required.filter((i) => !i.met).map((i) => i.id);
  const allRequiredMet = gaps.length === 0;

  let readinessLabel: SalesL5EvaluationResult["readinessLabel"] = "NOT_L5";
  if (allRequiredMet) {
    readinessLabel = "L5_PILOT_READY";
  } else if (requiredMet >= required.length - 2) {
    readinessLabel = "L5_CONDITIONAL";
  }

  return {
    version: SALES_L5_CRITERIA_VERSION,
    requiredTotal: required.length,
    requiredMet,
    allRequiredMet,
    readinessLabel,
    gaps,
    items,
  };
}

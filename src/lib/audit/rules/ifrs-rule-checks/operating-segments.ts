import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const SEGMENT_HINTS = [
  "operating segment",
  "segment",
  "segment reporting",
  "sector",
  "business segment",
  "geographical segment",
  "قطاع تشغيلي",
  "قطاع",
  "تقرير القطاعات",
];

const CODM_HINTS = [
  "chief operating decision maker",
  "codm",
  "operating decision maker",
  "صانع القرار التشغيلي",
];

const SEGMENT_DEF_HINTS = [
  "segment definition",
  "component",
  "discrete financial information",
  "تعريف القطاع",
  "معلومات مالية منفصلة",
];

const RECONCILIATION_HINTS = [
  "reconciliation",
  "segment reconciliation",
  "total reconciliation",
  "مطابقة",
  "مطابقة القطاعات",
];

/**
 * IFRS 8.5 — Report segment information based on CODM's internal reporting.
 */
export function handleCodmBasis(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSegment = hasMappingHint(ctx, SEGMENT_HINTS);
  if (!hasSegment) {
    return baseEval(
      rule, "skipped",
      "لا بنود قطاعات تشغيلية — القاعدة غير قابلة للتطبيق.",
      "No operating segment accounts — rule not applicable.",
    );
  }
  const hasCodm = hasMappingHint(ctx, CODM_HINTS);
  if (!hasCodm) {
    return baseEval(
      rule, "warning",
      "قطاعات تشغيلية بدون تحديد أساس صانع القرار التشغيلي (IFRS 8.5).",
      "Operating segments without CODM basis identification (IFRS 8.5).",
    );
  }
  return baseEval(
    rule, "pass",
    "أساس صانع القرار التشغيلي للقطاعات موثق.",
    "CODM basis for segment reporting documented.",
  );
}

/**
 * IFRS 8.5 — Define operating segment as component with discrete financial information reviewed by CODM.
 */
export function handleSegmentDefinition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSegment = hasMappingHint(ctx, SEGMENT_HINTS);
  if (!hasSegment) {
    return baseEval(
      rule, "skipped",
      "لا بنود قطاعات تشغيلية.",
      "No operating segment accounts — skipped.",
    );
  }
  const hasDef = hasMappingHint(ctx, SEGMENT_DEF_HINTS);
  if (!hasDef) {
    return baseEval(
      rule, "advisory",
      "تأكد من تعريف القطاع التشغيلي كمكون له معلومات مالية منفصلة يراجعها صانع القرار (IFRS 8.5).",
      "Ensure operating segment defined as component with discrete financial information reviewed by CODM (IFRS 8.5).",
    );
  }
  return baseEval(
    rule, "pass",
    "تعريف القطاع التشغيلي موثق.",
    "Operating segment definition documented.",
  );
}

/**
 * IFRS 8.21 — Disclose segment revenue, profit/loss, assets, and liabilities.
 */
export function handleSegmentMeasures(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSegment = hasMappingHint(ctx, SEGMENT_HINTS);
  if (!hasSegment) {
    return baseEval(
      rule, "skipped",
      "لا بنود قطاعات تشغيلية.",
      "No operating segment accounts — skipped.",
    );
  }
  const hasMeasures = hasMappingHint(ctx, ["segment revenue", "segment profit", "segment assets", "إيرادات القطاع", "أرباح القطاع", "أصول القطاع"]);
  if (!hasMeasures && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "قطاعات تشغيلية بدون إفصاح عن الإيرادات والأرباح والأصول (IFRS 8.21).",
      "Operating segments without revenue, profit, and assets disclosure (IFRS 8.21).",
    );
  }
  return baseEval(
    rule, "pass",
    "قياسات القطاعات التشغيلية مفصح عنها.",
    "Operating segment measures disclosed.",
  );
}

/**
 * IFRS 8.28 — Provide reconciliation of segment totals to entity totals.
 */
export function handleSegmentReconciliation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSegment = hasMappingHint(ctx, SEGMENT_HINTS);
  if (!hasSegment) {
    return baseEval(
      rule, "skipped",
      "لا بنود قطاعات تشغيلية.",
      "No operating segment accounts — skipped.",
    );
  }
  const hasRecon = hasMappingHint(ctx, RECONCILIATION_HINTS);
  if (!hasRecon) {
    return baseEval(
      rule, "warning",
      "قطاعات تشغيلية بدون مطابقة مجاميع القطاعات مع المجاميع الإجمالية (IFRS 8.28).",
      "Operating segments without reconciliation of segment totals to entity totals (IFRS 8.28).",
    );
  }
  return baseEval(
    rule, "pass",
    "مطابقة مجاميع القطاعات مع المجاميع الإجمالية موجودة.",
    "Segment totals reconciliation to entity totals present.",
  );
}

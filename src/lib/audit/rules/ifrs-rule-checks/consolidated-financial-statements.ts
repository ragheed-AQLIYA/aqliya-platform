import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const CONSOLIDATION_HINTS = [
  "consolidation",
  "consolidated",
  "subsidiary",
  "group",
  "parent",
  "consolidated financial statements",
  "دمج",
  "مجموعة",
  "شركة تابعة",
  "شركة أم",
  "قوائم مالية مجمعة",
];

const CONTROL_HINTS = [
  "control",
  "power",
  "exposure to variable returns",
  "ability to use power",
  "سيطرة",
  "قوة",
  "تعرض لعوائد متغيرة",
  "القدرة على استخدام القوة",
];

const PROCEDURE_HINTS = [
  "consolidation procedure",
  "elimination",
  "intercompany",
  "investment eliminated",
  "إجراءات الدمج",
  "استبعاد",
  "معاملات بين الشركات",
];

const UNIFORM_HINTS = [
  "uniform accounting policies",
  "consistent policies",
  "same accounting policies",
  "سياسات محاسبية موحدة",
  "سياسات متسقة",
];

/**
 * IFRS 10.19 — Consolidate entities controlled by the parent.
 */
export function handleConsolidationRequirement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConsolidation = hasMappingHint(ctx, CONSOLIDATION_HINTS);
  if (!hasConsolidation) {
    return baseEval(
      rule, "skipped",
      "لا بنود دمج — القاعدة غير قابلة للتطبيق.",
      "No consolidation accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "متطلبات الدمج مطبقة للشركات التابعة الخاضعة لسيطرة الشركة الأم.",
    "Consolidation requirements applied for subsidiaries controlled by parent.",
  );
}

/**
 * IFRS 10.6 — Control exists when investor has power, exposure to variable returns, and ability to use power.
 */
export function handleControlDefinition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConsolidation = hasMappingHint(ctx, CONSOLIDATION_HINTS);
  if (!hasConsolidation) {
    return baseEval(
      rule, "skipped",
      "لا بنود دمج.",
      "No consolidation accounts — skipped.",
    );
  }
  const hasControl = hasMappingHint(ctx, CONTROL_HINTS);
  if (!hasControl) {
    return baseEval(
      rule, "warning",
      "دمج موجود بدون توثيق معايير السيطرة (القوة، العوائد المتغيرة، القدرة) (IFRS 10.6).",
      "Consolidation present without control criteria documentation (IFRS 10.6).",
    );
  }
  return baseEval(
    rule, "pass",
    "معايير السيطرة موثقة.",
    "Control criteria documented.",
  );
}

/**
 * IFRS 10.84 — Consolidation procedures: eliminate investment, intercompany transactions, and balances.
 */
export function handleConsolidationProcedure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConsolidation = hasMappingHint(ctx, CONSOLIDATION_HINTS);
  if (!hasConsolidation) {
    return baseEval(
      rule, "skipped",
      "لا بنود دمج.",
      "No consolidation accounts — skipped.",
    );
  }
  const hasProcedure = hasMappingHint(ctx, PROCEDURE_HINTS);
  if (!hasProcedure) {
    return baseEval(
      rule, "warning",
      "دمج بدون إجراءات دمج (استبعاد الاستثمار، المعاملات بين الشركات) (IFRS 10.84).",
      "Consolidation without procedures (investment elimination, intercompany) (IFRS 10.84).",
    );
  }
  return baseEval(
    rule, "pass",
    "إجراءات الدمج موثقة.",
    "Consolidation procedures documented.",
  );
}

/**
 * IFRS 10.19 — Apply uniform accounting policies across the group.
 */
export function handleUniformPolicies(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasConsolidation = hasMappingHint(ctx, CONSOLIDATION_HINTS);
  if (!hasConsolidation) {
    return baseEval(
      rule, "skipped",
      "لا بنود دمج.",
      "No consolidation accounts — skipped.",
    );
  }
  const hasUniform = hasMappingHint(ctx, UNIFORM_HINTS);
  if (!hasUniform) {
    return baseEval(
      rule, "warning",
      "دمج بدون سياسات محاسبية موحدة عبر المجموعة (IFRS 10.19).",
      "Consolidation without uniform accounting policies across the group (IFRS 10.19).",
    );
  }
  return baseEval(
    rule, "pass",
    "سياسات محاسبية موحدة عبر المجموعة.",
    "Uniform accounting policies across the group.",
  );
}

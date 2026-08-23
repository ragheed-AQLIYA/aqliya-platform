import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const JOINT_ARRANGEMENT_HINTS = [
  "joint arrangement",
  "joint control",
  "jointly controlled",
  "مشروع مشترك",
  "سيطرة مشتركة",
  "مشروع مشترك التحكم",
];

const JOINT_OPERATION_HINTS = [
  "joint operation",
  "jointly controlled operation",
  "operation share",
  "عملية مشتركة",
  "عملية خاضعة لسيطرة مشتركة",
];

const JOINT_VENTURE_HINTS = [
  "joint venture",
  "jointly controlled venture",
  "مشروع مشترك",
  "مشروع مشترك التحكم",
];

const EQUITY_METHOD_HINTS = [
  "equity method",
  "equity accounting",
  "طريقة حقوق الملكية",
  "محاسبة حقوق الملكية",
];

/**
 * IFRS 11.4 — Classify joint arrangement as either joint operation or joint venture.
 */
export function handleJointArrangement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasJoint = hasMappingHint(ctx, JOINT_ARRANGEMENT_HINTS);
  if (!hasJoint) {
    return baseEval(
      rule, "skipped",
      "لا بنود مشاريع مشتركة — القاعدة غير قابلة للتطبيق.",
      "No joint arrangement accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "المشروع المشترك مصنف وفقاً لـ IFRS 11.",
    "Joint arrangement classified per IFRS 11.",
  );
}

/**
 * IFRS 11.20 — Account for joint operation by recognising share of assets, liabilities, revenue, and expenses.
 */
export function handleJointOperation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasJointOp = hasMappingHint(ctx, JOINT_OPERATION_HINTS);
  if (!hasJointOp) {
    return baseEval(
      rule, "skipped",
      "لا عمليات مشتركة — القاعدة غير قابلة للتطبيق.",
      "No joint operation accounts — rule not applicable.",
    );
  }
  const hasShare = hasMappingHint(ctx, ["share of assets", "share of liabilities", "share of revenue", "حصة من الأصول", "حصة من الالتزامات", "حصة من الإيرادات"]);
  if (!hasShare) {
    return baseEval(
      rule, "warning",
      "عملية مشتركة بدون الاعتراف بحصة الأصول والالتزامات والإيرادات والمصروفات (IFRS 11.20).",
      "Joint operation without recognising share of assets, liabilities, revenue, and expenses (IFRS 11.20).",
    );
  }
  return baseEval(
    rule, "pass",
    "الاعتراف بحصة العمولة المشتركة في الأصول والالتزامات والإيرادات.",
    "Joint operation share of assets, liabilities, revenue recognised.",
  );
}

/**
 * IFRS 11.24 — Account for joint venture using equity method.
 */
export function handleJointVenture(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasJointVenture = hasMappingHint(ctx, JOINT_VENTURE_HINTS);
  if (!hasJointVenture) {
    return baseEval(
      rule, "skipped",
      "لا مشاريع مشتركة (مشروع مشترك) — القاعدة غير قابلة للتطبيق.",
      "No joint venture accounts — rule not applicable.",
    );
  }
  const hasEquityMethod = hasMappingHint(ctx, EQUITY_METHOD_HINTS);
  if (!hasEquityMethod) {
    return baseEval(
      rule, "warning",
      "مشروع مشترك بدون استخدام طريقة حقوق الملكية (IFRS 11.24).",
      "Joint venture without equity method (IFRS 11.24).",
    );
  }
  return baseEval(
    rule, "pass",
    "طريقة حقوق الملكية مطبقة على المشروع المشترك.",
    "Equity method applied to joint venture.",
  );
}

/**
 * IFRS 11.B34 — Equity method: initial recognition at cost, adjusted for share of profit/loss.
 */
export function handleJointEquityMethod(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasJointVenture = hasMappingHint(ctx, JOINT_VENTURE_HINTS);
  if (!hasJointVenture) {
    return baseEval(
      rule, "skipped",
      "لا مشاريع مشتركة.",
      "No joint venture accounts — skipped.",
    );
  }
  const hasEquityMethod = hasMappingHint(ctx, EQUITY_METHOD_HINTS);
  if (!hasEquityMethod) {
    return baseEval(
      rule, "skipped",
      "لا طريقة حقوق ملكية.",
      "No equity method — skipped.",
    );
  }
  return baseEval(
    rule, "pass",
    "طريقة حقوق الملكية للمشروع المشترك موثقة.",
    "Equity method for joint venture documented.",
  );
}

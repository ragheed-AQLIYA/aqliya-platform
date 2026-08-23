import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

export function handlePpeRecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasPpe = hasMappingHint(ctx, [
    "property",
    "plant",
    "equipment",
    "ppe",
    "fixed",
    "ممتلكات",
    "معدات",
  ]);
  if (!hasPpe) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود PPE — القاعدة غير قابلة للتطبيق.",
      "No PPE accounts — rule not applicable.",
    );
  }
  return baseEval(
    rule,
    "pass",
    "بنود PPE موجودة — راجع IAS 16.",
    "PPE accounts present — review IAS 16.",
    ["balance_sheet"],
  );
}

export function handleDepreciation(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasPpe = hasMappingHint(ctx, ["property", "plant", "equipment", "ppe"]);
  const hasDepr = hasMappingHint(ctx, [
    "depreciation",
    "accumulated",
    "dep",
    "إهلاك",
  ]);
  if (hasPpe && !hasDepr) {
    return baseEval(
      rule,
      "warning",
      "أصول ثابتة بدون إهلاك متراكم مُعيّن.",
      "PPE mapped without accumulated depreciation.",
      ["balance_sheet"],
    );
  }
  if (!hasPpe) {
    return baseEval(rule, "skipped", "لا PPE.", "No PPE — skipped.");
  }
  return baseEval(
    rule,
    "pass",
    "إهلاك/أصول ثابتة معيّنة.",
    "PPE and depreciation mapping present.",
  );
}

/**
 * IAS 16.67 — Derecognition of PPE on disposal or when no future economic benefits expected.
 */
export function handleDerecognition(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasPpe = hasMappingHint(ctx, ["property", "plant", "equipment", "ppe", "fixed", "ممتلكات", "معدات"]);
  if (!hasPpe) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود PPE — القاعدة غير قابلة للتطبيق.",
      "No PPE accounts — rule not applicable.",
    );
  }

  const hasDisposal = hasMappingHint(ctx, ["disposal", "derecognition", "gain on disposal", "loss on disposal", "تصرف", "خروج أصل"]);
  if (!hasDisposal) {
    return baseEval(
      rule,
      "advisory",
      "أصول ثابتة موجودة. تأكد من الاعتراف بأي تخارج عن أصول وحساب الربح/الخسارة في الأرباح أو الخسائر (IAS 16.67).",
      "PPE present. Ensure any disposals are recognised and gain/loss is recorded in P&L (IAS 16.67).",
      ["income_statement"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "التخارج عن الأصول الثابتة معترف به.",
    "PPE derecognition on disposal identified.",
    ["income_statement"],
  );
}

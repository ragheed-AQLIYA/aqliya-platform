import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const INVENTORY_HINTS = [
  "inventory",
  "inventories",
  "stock",
  "goods",
  "raw material",
  "work in progress",
  "wip",
  "finished goods",
  "مخزون",
  "بضاعة",
  "مواد",
];

const NRV_HINTS = [
  "nrv",
  "net realisable",
  "net realizable",
  "write down",
  "provision",
  "خسارة",
  "تخفيض",
];

/**
 * IAS 2.9 — Inventories shall be measured at the lower of cost and net realisable value.
 */
export function handleInventoryMeasurement(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInventory = hasMappingHint(ctx, INVENTORY_HINTS);
  if (!hasInventory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مخزون — القاعدة غير قابلة للتطبيق.",
      "No inventory accounts — rule not applicable.",
    );
  }

  const hasNrv = hasMappingHint(ctx, NRV_HINTS);
  if (!hasNrv) {
    return baseEval(
      rule,
      "warning",
      "مخزون معيّن بدون تقدير صافي القيمة القابلة للتحقق (NRV). تأكد من تقييم المخزون بالأقل من التكلفة وNRV.",
      "Inventory mapped without NRV assessment. Ensure inventory is measured at lower of cost and NRV.",
      ["balance_sheet"],
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود المخزون وتخفيض القيمة موجودة — راجع IAS 2.9.",
    "Inventory and NRV write-down accounts present — review IAS 2.9.",
    ["balance_sheet"],
  );
}

/**
 * IAS 2.10 — Cost of inventories shall comprise costs of purchase, conversion, and other costs.
 */
export function handleCostComponents(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInventory = hasMappingHint(ctx, INVENTORY_HINTS);
  if (!hasInventory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مخزون — القاعدة غير قابلة للتطبيق.",
      "No inventory accounts — rule not applicable.",
    );
  }

  const hasPurchaseCost = hasMappingHint(ctx, ["purchase", "cost of goods", "cogs", "مشتريات", "تكلفة"]);
  if (!hasPurchaseCost) {
    return baseEval(
      rule,
      "warning",
      "مخزون معيّن بدون بنود تكلفة شراء واضحة. راجع تكوين تكلفة المخزون (IAS 2.10).",
      "Inventory mapped without clear purchase cost components. Review inventory cost composition (IAS 2.10).",
    );
  }

  return baseEval(
    rule,
    "pass",
    "بنود تكلفة المخزون موجودة.",
    "Inventory cost components present.",
  );
}

/**
 * IAS 2.23 — Specific identification for non-interchangeable items.
 */
export function handleSpecificIdentification(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInventory = hasMappingHint(ctx, INVENTORY_HINTS);
  if (!hasInventory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مخزون.",
      "No inventory accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من استخدام التحديد المحدد للأصناف غير القابلة للاستبدال (IAS 2.23).",
    "Ensure specific identification is used for non-interchangeable items (IAS 2.23).",
  );
}

/**
 * IAS 2.25 — Cost formula: FIFO or weighted average.
 */
export function handleCostFormulas(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInventory = hasMappingHint(ctx, INVENTORY_HINTS);
  if (!hasInventory) {
    return baseEval(
      rule,
      "skipped",
      "لا بنود مخزون.",
      "No inventory accounts — skipped.",
    );
  }

  return baseEval(
    rule,
    "advisory",
    "تأكد من استخدام FIFO أو المتوسط المرجح كمعادلة تكلفة (IAS 2.25).",
    "Ensure FIFO or weighted average cost formula is used (IAS 2.25).",
  );
}

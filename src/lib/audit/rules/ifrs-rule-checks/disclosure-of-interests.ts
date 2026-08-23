import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types";
import type { IfrsEvaluationContext } from "./common";
import { baseEval, hasMappingHint } from "./common";

const DISCLOSURE_HINTS = [
  "disclosure of interests",
  "subsidiary disclosure",
  "joint arrangement disclosure",
  "associate disclosure",
  "structured entity disclosure",
  "إفصاح عن المصالح",
  "إفصاح عن الشركات التابعة",
  "إفصاح عن الكيانات المهيكلة",
];

const SUBSIDIARY_HINTS = [
  "subsidiary",
  "significant judgements",
  "control assessment",
  "non-controlling interest",
  "شركة تابعة",
  "أحكام جوهرية",
  "مصالح غير مضبوطة",
];

const JOINT_ASSOCIATE_HINTS = [
  "joint venture",
  "associate",
  "joint arrangement",
  "significant influence",
  "مشروع مشترك",
  "شركة شقيقة",
  "تأثير جوهري",
];

const STRUCTURED_ENTITY_HINTS = [
  "structured entity",
  "unconsolidated structured entity",
  "securitisation",
  "special purpose entity",
  "spe",
  "كيان مهيكل",
  "كيان غير مدمج",
  "كيان ذو غرض خاص",
];

/**
 * IFRS 12.1 — Disclose nature of and risks associated with interests in subsidiaries, JVs, associates, and structured entities.
 */
export function handleDisclosureScope(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasInterests = hasMappingHint(ctx, [...DISCLOSURE_HINTS, ...SUBSIDIARY_HINTS, ...JOINT_ASSOCIATE_HINTS, ...STRUCTURED_ENTITY_HINTS]);
  if (!hasInterests) {
    return baseEval(
      rule, "skipped",
      "لا مصالح في شركات تابعة أو مشاريع مشتركة أو كيانات مهيكلة — القاعدة غير قابلة للتطبيق.",
      "No interests in subsidiaries, JVs, associates, or structured entities — rule not applicable.",
    );
  }
  return baseEval(
    rule, "pass",
    "نطاق الإفصاح عن المصالح مطبق وفقاً لـ IFRS 12.",
    "Disclosure scope for interests applied per IFRS 12.",
  );
}

/**
 * IFRS 12.10 — Disclose significant judgements about control of subsidiaries.
 */
export function handleSubsidiaryDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasSubsidiary = hasMappingHint(ctx, SUBSIDIARY_HINTS);
  if (!hasSubsidiary) {
    return baseEval(
      rule, "skipped",
      "لا شركات تابعة.",
      "No subsidiary accounts — skipped.",
    );
  }
  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "شركات تابعة بدون إفصاح عن الأحكام الجوهرية للسيطرة (IFRS 12.10).",
      "Subsidiaries without significant control judgements disclosure (IFRS 12.10).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات الشركات التابعة موجودة.",
    "Subsidiary disclosures present.",
  );
}

/**
 * IFRS 12.21 — Disclose nature and financial effects of interests in JVs and associates.
 */
export function handleJointAssociateDisclosure(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasJointAssociate = hasMappingHint(ctx, JOINT_ASSOCIATE_HINTS);
  if (!hasJointAssociate) {
    return baseEval(
      rule, "skipped",
      "لا مشاريع مشتركة أو شركات شقيقة.",
      "No JV or associate accounts — skipped.",
    );
  }
  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "مشاريع مشتركة/شركات شقيقة بدون إفصاح عن الطبيعة والآثار المالية (IFRS 12.21).",
      "JVs/associates without nature and financial effects disclosure (IFRS 12.21).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات المشاريع المشتركة والشركات الشقيقة موجودة.",
    "JV and associate disclosures present.",
  );
}

/**
 * IFRS 12.24 — Disclose nature and risks of interests in unconsolidated structured entities.
 */
export function handleStructuredEntities(
  rule: IfrsKnowledgeRule,
  ctx: IfrsEvaluationContext,
): IfrsRuleEvaluation {
  const hasStructured = hasMappingHint(ctx, STRUCTURED_ENTITY_HINTS);
  if (!hasStructured) {
    return baseEval(
      rule, "skipped",
      "لا كيانات مهيكلة غير مدمجة.",
      "No unconsolidated structured entity accounts — skipped.",
    );
  }
  const hasDisclosure = hasMappingHint(ctx, DISCLOSURE_HINTS);
  if (!hasDisclosure && ctx.disclosureNoteCount === 0) {
    return baseEval(
      rule, "warning",
      "كيانات مهيكلة غير مدمجة بدون إفصاح عن الطبيعة والمخاطر (IFRS 12.24).",
      "Unconsolidated structured entities without nature and risks disclosure (IFRS 12.24).",
    );
  }
  return baseEval(
    rule, "pass",
    "إفصاحات الكيانات المهيكلة موجودة.",
    "Structured entity disclosures present.",
  );
}

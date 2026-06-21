import "server-only";

import type { IsaKnowledgeRule, IsaRuleEvaluation } from "./types";

export interface IsaEvaluationContext {
  engagementId: string;
  engagementStatus: string;
  organizationId?: string | null;
  teamMemberCount: number;
  hasEngagementPartner: boolean;
  mappingCount: number;
  tbLineCount: number;
  materialityCount: number;
  findingCount: number;
}

function baseEval(
  rule: IsaKnowledgeRule,
  status: IsaRuleEvaluation["status"],
  messageAr: string,
  messageEn: string,
): IsaRuleEvaluation {
  return {
    ruleId: rule.ruleId,
    standardCode: rule.standardCode,
    paragraphReference: rule.paragraphReference,
    topic: rule.topic,
    status,
    messageAr,
    messageEn,
  };
}

export function evaluateIsaRule(
  rule: IsaKnowledgeRule,
  ctx: IsaEvaluationContext,
): IsaRuleEvaluation {
  switch (rule.topic) {
    case "risk-assessment":
      if (ctx.tbLineCount === 0 || ctx.mappingCount === 0) {
        return baseEval(
          rule,
          "warning",
          "لا يمكن تقييم مخاطر الإغفال الجوهري بدون ميزان مراجعة وتخطيط حسابات.",
          "Risk assessment requires trial balance and account mappings.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "تتوفر بيانات أساسية لتقييم مخاطر الإغفال الجوهري.",
        "Baseline data exists for risk assessment.",
      );

    case "understanding-entity":
      if (ctx.mappingCount < 3) {
        return baseEval(
          rule,
          "advisory",
          "فهم الكيان محدود — أضف المزيد من تخطيط الحسابات.",
          "Entity understanding is limited — add more account mappings.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "تخطيط الحسابات يدعم فهم الكيان.",
        "Account mappings support entity understanding.",
      );

    case "identify-risks":
      if (ctx.findingCount === 0 && ctx.mappingCount > 0) {
        return baseEval(
          rule,
          "advisory",
          "لم تُسجَّل نتائج/مخاطر بعد — راجع التحليل.",
          "No findings recorded yet — review analysis outputs.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "مسار تحديد المخاطر نشط.",
        "Risk identification path is active.",
      );

    case "pervasive-risks":
      return baseEval(
        rule,
        ctx.materialityCount > 0 ? "pass" : "warning",
        ctx.materialityCount > 0
          ? "تم احتساب الأهمية النسبية لدعم تقييم المخاطر الشاملة."
          : "احتسب الأهمية النسبية قبل إغلاق تقييم المخاطر الشاملة.",
        ctx.materialityCount > 0
          ? "Materiality is recorded for pervasive risk assessment."
          : "Calculate materiality before closing pervasive risk assessment.",
      );

    case "engagement-partner":
      if (!ctx.hasEngagementPartner) {
        return baseEval(
          rule,
          "fail",
          "لم يُحدَّد شريك الارتباط في فريق المراجعة.",
          "Engagement partner is not assigned on the audit team.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "شريك الارتباط محدد في الفريق.",
        "Engagement partner is assigned.",
      );

    case "competence":
      if (ctx.teamMemberCount < 2) {
        return baseEval(
          rule,
          "warning",
          "فريق الارتباط صغير — راجع الكفاءة والإشراف.",
          "Engagement team is small — review competence and supervision.",
        );
      }
      return baseEval(
        rule,
        "pass",
        "حجم الفريق يلبي الحد الأدنى للإشراف.",
        "Team size meets minimum supervision threshold.",
      );

    case "direction-supervision":
      return baseEval(
        rule,
        ctx.teamMemberCount >= 2 ? "pass" : "warning",
        ctx.teamMemberCount >= 2
          ? "هيكل الفريق يدعم التوجيه والإشراف."
          : "أضف أعضاء للفريق لدعم التوجيه والإشراف.",
        ctx.teamMemberCount >= 2
          ? "Team structure supports direction and supervision."
          : "Add team members to support direction and supervision.",
      );

    case "report-responsibility":
      return baseEval(
        rule,
        ctx.hasEngagementPartner ? "pass" : "warning",
        ctx.hasEngagementPartner
          ? "مسؤولية التقرير مرتبطة بشريك الارتباط."
          : "حدّد شريك الارتباط قبل إصدار التقرير.",
        ctx.hasEngagementPartner
          ? "Report responsibility is linked to engagement partner."
          : "Assign engagement partner before report issuance.",
      );

    default:
      return baseEval(
        rule,
        "skipped",
        "القاعدة غير قابلة للتنفيذ في وقت التشغيل.",
        "Rule is not executable at runtime.",
      );
  }
}

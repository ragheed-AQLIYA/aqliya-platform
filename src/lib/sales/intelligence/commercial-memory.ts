// ─── SalesOS commercial memory helpers (ICP, objections, NBA) ───

import type {
  SalesAccount,
  SalesInteractionLog,
  SalesNextBestActionItem,
  SalesICPHypothesis,
  SalesObjectionSignal,
  SalesCompetitorMentionView,
  SalesAIBriefDraft,
  SalesOpportunity,
} from "../types";
import type { AccountIntelligenceSummary } from "../vnext/account-intelligence";
import { buildOpportunityIntelligence } from "../vnext/opportunity-intelligence";
import { scoreOpportunity } from "./opportunity-scoring";

const OBJECTION_KEYWORDS: Record<string, string> = {
  budget: "قيود الميزانية",
  timing: "التوقيت غير مناسب",
  governance: "متطلبات الحوكمة",
  security: "الأمن والامتثال",
  competitor: "مقارنة مع منافس",
  approval: "سلسلة الاعتماد",
};

export function extractObjectionsFromInteractions(
  interactions: SalesInteractionLog[],
): SalesObjectionSignal[] {
  const counts = new Map<string, number>();
  for (const i of interactions) {
    const lower = i.summary.toLowerCase();
    for (const [key, labelAr] of Object.entries(OBJECTION_KEYWORDS)) {
      if (
        lower.includes(key) ||
        lower.includes(labelAr) ||
        (key === "governance" && lower.includes("governance"))
      ) {
        counts.set(labelAr, (counts.get(labelAr) ?? 0) + 1);
      }
    }
  }
  if (counts.size === 0 && interactions.length > 0) {
    counts.set("انتظار قرار داخلي", 1);
  }
  return [...counts.entries()].map(([labelAr, count], idx) => ({
    id: `obj-${idx}`,
    labelAr,
    count,
    source: "interaction" as const,
  }));
}

export function deriveCompetitorMentions(
  accounts: SalesAccount[],
  interactions: SalesInteractionLog[],
): SalesCompetitorMentionView[] {
  const competitors = ["SAP", "Oracle", "Salesforce", "Microsoft"];
  const mentions: SalesCompetitorMentionView[] = [];
  for (const i of interactions) {
    for (const c of competitors) {
      if (i.summary.includes(c)) {
        const acct = accounts.find((a) => a.id === i.accountId);
        mentions.push({
          id: `comp-${i.id}-${c}`,
          name: c,
          accountId: i.accountId,
          contextAr: `${acct?.nameAr ?? acct?.name ?? "حساب"} — ${i.summary.slice(0, 60)}`,
        });
      }
    }
  }
  if (mentions.length === 0) {
    mentions.push({
      id: "comp-seed-1",
      name: "حلول داخلية",
      contextAr: "منافسة ضمنية — بناء داخلي مقابل منصة محكومة",
    });
  }
  return mentions.slice(0, 8);
}

export function buildICPHypotheses(
  accounts: SalesAccount[],
  opportunities: SalesOpportunity[],
): SalesICPHypothesis[] {
  const industryMap = new Map<string, { count: number; value: number }>();
  for (const a of accounts) {
    const ind = a.industry ?? "Other";
    const bucket = industryMap.get(ind) ?? { count: 0, value: 0 };
    bucket.count += 1;
    industryMap.set(ind, bucket);
  }
  for (const o of opportunities) {
    const acct = accounts.find((a) => a.id === o.accountId);
    const ind = acct?.industry ?? "Other";
    const bucket = industryMap.get(ind) ?? { count: 0, value: 0 };
    bucket.value += o.valueEstimate ?? 0;
    industryMap.set(ind, bucket);
  }

  return [...industryMap.entries()].map(([industry, stats], idx) => {
    const avgValue = stats.count > 0 ? stats.value / stats.count : 0;
    const confidence = Math.min(0.85, 0.35 + stats.count * 0.15);
    return {
      id: `icp-${idx}`,
      segment: industry,
      segmentAr: industry,
      hypothesisAr: `القطاع ${industry} يُظهر ${stats.count} حساب(ات) بمتوسط مسار ${Math.round(avgValue).toLocaleString("ar-SA")} ر.س`,
      evidenceAr: [
        `${stats.count} حساب في العينة`,
        `إجمالي مسار ${stats.value.toLocaleString("ar-SA")} ر.س`,
      ],
      confidence,
      recommendedAdjustmentsAr: [
        confidence < 0.6
          ? "جمع المزيد من الأدلة قبل اعتماد هذا القطاع كـ ICP"
          : "توسيع outreach للقطاعات المشابهة",
        avgValue > 500_000
          ? "إضافة متطلبات مراجعة تجارية مبكرة"
          : "اختبار عروض pilot أصغر",
      ],
    };
  });
}

export function buildNextBestActions(input: {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  accountIntelligence?: Map<string, AccountIntelligenceSummary>;
}): SalesNextBestActionItem[] {
  const actions: SalesNextBestActionItem[] = [];
  const now = Date.now();
  const weekMs = 7 * 86400000;

  for (const o of input.opportunities) {
    if (["ClosedWon", "ClosedLost", "Archived", "Rejected"].includes(o.stage))
      continue;
    const opInteractions = input.interactions.filter(
      (i) => i.opportunityId === o.id,
    );
    const lastAt =
      opInteractions.length > 0
        ? new Date(opInteractions[0].loggedAt).getTime()
        : 0;
    const stalled = lastAt > 0 && now - lastAt > 14 * 86400000;
    const intel = buildOpportunityIntelligence({
      opportunity: o,
      evidenceCount: 0,
      interactionCount: opInteractions.length,
      hasApprovedClaims: o.approvalStatus === "Approved",
    });
    const scoring = scoreOpportunity(o);

    if (stalled) {
      actions.push({
        id: `nba-stall-${o.id}`,
        labelAr: `متابعة فرصة متوقفة: ${o.name}`,
        labelEn: `Follow up stalled: ${o.name}`,
        priority: "high",
        href: `/sales/opportunities/${o.id}`,
        accountId: o.accountId,
        opportunityId: o.id,
        reasonAr: "لا تفاعل منذ أكثر من 14 يوم",
      });
    }
    if (intel.reviewRequired && o.stage === "Qualification") {
      actions.push({
        id: `nba-review-${o.id}`,
        labelAr: `إكمال مراجعة: ${o.name}`,
        labelEn: `Complete review: ${o.name}`,
        priority: "medium",
        href: `/sales/opportunities/${o.id}`,
        opportunityId: o.id,
        accountId: o.accountId,
        reasonAr: intel.qualificationGap[0] ?? "فجوات تأهيل",
      });
    }
    if (scoring.blockers.length > 0 && o.valueEstimate && o.valueEstimate > 250_000) {
      actions.push({
        id: `nba-block-${o.id}`,
        labelAr: scoring.blockers[0],
        labelEn: scoring.blockers[0],
        priority: "high",
        href: `/sales/opportunities/${o.id}`,
        opportunityId: o.id,
        accountId: o.accountId,
        reasonAr: "صفقة عالية القيمة",
      });
    }
  }

  for (const a of input.accounts) {
    const acctInteractions = input.interactions.filter(
      (i) => i.accountId === a.id,
    );
    const meetingsThisWeek = acctInteractions.filter(
      (i) =>
        i.type === "meeting" &&
        now - new Date(i.loggedAt).getTime() < weekMs,
    );
    if (acctInteractions.length === 0) {
      actions.push({
        id: `nba-first-${a.id}`,
        labelAr: `تسجيل أول تفاعل: ${a.nameAr ?? a.name}`,
        labelEn: `Log first interaction: ${a.name}`,
        priority: "medium",
        href: `/sales/accounts/${a.id}`,
        accountId: a.id,
        reasonAr: "لا سجل تفاعل",
      });
    }
    if (meetingsThisWeek.length > 0) {
      actions.push({
        id: `nba-meeting-${a.id}`,
        labelAr: `متابعة بعد اجتماع: ${a.nameAr ?? a.name}`,
        labelEn: `Post-meeting follow-up: ${a.name}`,
        priority: "high",
        href: `/sales/accounts/${a.id}`,
        accountId: a.id,
        reasonAr: "اجتماع هذا الأسبوع",
      });
    }
  }

  const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2, urgent: 0 };
  return actions
    .sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority])
    .slice(0, 12);
}

export function buildAIBriefDraft(
  account: SalesAccount,
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
  intelligence: AccountIntelligenceSummary,
): SalesAIBriefDraft {
  const activeOpps = opportunities.filter(
    (o) => !["ClosedLost", "Archived", "Rejected"].includes(o.stage),
  );
  return {
    accountId: account.id,
    generatedAt: new Date().toISOString(),
    status: "DRAFT",
    disclaimerAr:
      "مسودة ذكاء مساعد — DRAFT — ليست قراراً تجارياً نهائياً. تتطلب مراجعة بشرية.",
    sections: [
      {
        titleAr: "ملخص الحساب",
        bodyAr: `${account.nameAr ?? account.name} — ${account.industry ?? "قطاع غير محدد"} — صحة ${intelligence.healthScore}%`,
      },
      {
        titleAr: "وضع المسار",
        bodyAr: `${activeOpps.length} فرص نشطة بقيمة ${intelligence.pipelineValue.toLocaleString("ar-SA")} ر.س`,
      },
      {
        titleAr: "آخر تفاعلات",
        bodyAr:
          interactions.length > 0
            ? interactions
                .slice(0, 3)
                .map((i) => `${i.type}: ${i.summary.slice(0, 80)}`)
                .join(" · ")
            : "لا تفاعلات مسجّلة بعد",
      },
      {
        titleAr: "توصيات أولية (مسودة)",
        bodyAr:
          intelligence.nextActions.length > 0
            ? intelligence.nextActions.join(" · ")
            : "متابعة التأهيل والاجتماعات",
      },
    ],
  };
}

export function countMeetingsThisWeek(
  interactions: SalesInteractionLog[],
): number {
  const weekMs = 7 * 86400000;
  const now = Date.now();
  return interactions.filter(
    (i) =>
      (i.type === "meeting" || i.type === "call") &&
      now - new Date(i.loggedAt).getTime() < weekMs,
  ).length;
}

export function countStalledOpportunities(
  opportunities: SalesOpportunity[],
  interactions: SalesInteractionLog[],
): number {
  const now = Date.now();
  const stallMs = 14 * 86400000;
  return opportunities.filter((o) => {
    if (["ClosedWon", "ClosedLost", "Archived", "Rejected"].includes(o.stage))
      return false;
    const opInts = interactions.filter((i) => i.opportunityId === o.id);
    if (opInts.length === 0) return o.stage === "Draft" || o.stage === "Qualification";
    const last = new Date(opInts[0].loggedAt).getTime();
    return now - last > stallMs;
  }).length;
}

export function buildICPFitDistribution(
  accounts: SalesAccount[],
  opportunities: SalesOpportunity[],
): { labelAr: string; count: number; pct: number }[] {
  const buckets = { high: 0, medium: 0, low: 0 };
  for (const a of accounts) {
    const opps = opportunities.filter((o) => o.accountId === a.id);
    const avgScore =
      opps.length > 0
        ? opps.reduce((s, o) => s + (o.qualificationScore ?? 40), 0) /
          opps.length
        : 40;
    if (avgScore >= 70) buckets.high++;
    else if (avgScore >= 50) buckets.medium++;
    else buckets.low++;
  }
  const total = accounts.length || 1;
  return [
    { labelAr: "ملاءمة عالية", count: buckets.high, pct: Math.round((buckets.high / total) * 100) },
    { labelAr: "ملاءمة متوسطة", count: buckets.medium, pct: Math.round((buckets.medium / total) * 100) },
    { labelAr: "ملاءمة منخفضة", count: buckets.low, pct: Math.round((buckets.low / total) * 100) },
  ];
}

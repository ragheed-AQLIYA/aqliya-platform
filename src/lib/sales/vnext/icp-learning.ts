// SalesOS vNext ICP learning (rule-based, no autonomous AI)

import { buildICPFitDistribution } from "../intelligence/commercial-memory";
import type {
  SalesAccount,
  SalesContact,
  SalesICPDimension,
  SalesICPInsight,
  SalesInteractionLog,
  SalesOpportunity,
  SalesWinLossInsight,
} from "../types";
import { isClosedOpportunityStage } from "../types";
import { getWinLossPatterns } from "./commercial-memory";

export const ICP_RECOMMENDATION_LABEL =
  "AI-assisted / evidence-based recommendation";

export const ICP_DISCLAIMER_EN =
  "AI-assisted / evidence-based recommendations only — not final truth. Human review required before adjusting ICP or outbound strategy.";

export const ICP_DISCLAIMER_AR =
  "توصيات مساعدة بالذكاء الاصطناعي / مبنية على الأدلة — ليست حقيقة نهائية. المراجعة البشرية مطلوبة قبل تعديل ICP أو التوسع.";

export interface ICPLearningEvidenceItem {
  text: string;
  textAr: string;
  source: "stored" | "derived" | "interaction" | "opportunity" | "win_loss";
}

export interface ICPLearningInsightRow {
  id: string;
  dimension: SalesICPDimension | "account_type" | "hypothesis" | "win_loss";
  label: string;
  labelAr: string;
  recommendation: string;
  recommendationAr: string;
  confidence: number;
  evidence: ICPLearningEvidenceItem[];
  insightLabel: typeof ICP_RECOMMENDATION_LABEL;
}

export interface ICPLearningSnapshot {
  organizationId: string;
  currentHypothesis: ICPLearningInsightRow;
  bestIndustries: ICPLearningInsightRow[];
  accountTypes: ICPLearningInsightRow[];
  titles: ICPLearningInsightRow[];
  painPoints: ICPLearningInsightRow[];
  winLossPatterns: ICPLearningInsightRow[];
  storedInsights: ICPLearningInsightRow[];
  overallConfidence: number;
  icpFit: ReturnType<typeof buildICPFitDistribution>;
  disclaimer: string;
  disclaimerAr: string;
}

type RankBucket = Map<
  string,
  {
    count: number;
    wonCount: number;
    pipelineValue: number;
    sources: Set<ICPLearningEvidenceItem["source"]>;
    evidence: ICPLearningEvidenceItem[];
  }
>;

const ACCOUNT_STATUS_AR: Record<string, string> = {
  prospect: "عميل محتمل",
  qualified: "مؤهل",
  active: "نشط",
  dormant: "خامل",
  archived: "مؤرشف",
};

const WIN_LOSS_REASON_AR: Record<string, string> = {
  budget_freeze: "تجميد الميزانية",
  expansion_fit: "ملاءمة التوسع",
  no_executive_sponsor: "غياب راعٍ تنفيذي",
  timing: "توقيت غير مناسب",
  competitor: "منافسة",
  price_value: "السعر مقابل القيمة",
};

function isWonStage(stage: SalesOpportunity["stage"]): boolean {
  return stage === "ClosedWon" || stage === "Closed Won";
}

function insightRow(
  partial: Omit<ICPLearningInsightRow, "insightLabel">,
): ICPLearningInsightRow {
  return { ...partial, insightLabel: ICP_RECOMMENDATION_LABEL };
}

function bumpBucket(
  buckets: RankBucket,
  key: string,
  evidence: ICPLearningEvidenceItem,
  opts?: { won?: boolean; pipelineValue?: number },
): void {
  const bucket = buckets.get(key) ?? {
    count: 0,
    wonCount: 0,
    pipelineValue: 0,
    sources: new Set<ICPLearningEvidenceItem["source"]>(),
    evidence: [],
  };
  bucket.count += 1;
  if (opts?.won) bucket.wonCount += 1;
  if (opts?.pipelineValue) bucket.pipelineValue += opts.pipelineValue;
  bucket.sources.add(evidence.source);
  if (!bucket.evidence.some((e) => e.text === evidence.text)) {
    bucket.evidence.push(evidence);
  }
  buckets.set(key, bucket);
}

function bucketConfidence(bucket: {
  count: number;
  wonCount: number;
  sources: Set<ICPLearningEvidenceItem["source"]>;
}): number {
  return Math.min(
    0.92,
    0.35 +
      bucket.count * 0.1 +
      bucket.wonCount * 0.12 +
      (bucket.sources.size > 1 ? 0.08 : 0),
  );
}

function bucketsToRows(
  buckets: RankBucket,
  dimension: ICPLearningInsightRow["dimension"],
  labelFn: (key: string) => { label: string; labelAr: string },
  recommendFn: (
    key: string,
    bucket: {
      count: number;
      wonCount: number;
      pipelineValue: number;
      sources: Set<ICPLearningEvidenceItem["source"]>;
      evidence: ICPLearningEvidenceItem[];
    },
  ) => { recommendation: string; recommendationAr: string },
  limit = 5,
): ICPLearningInsightRow[] {
  return [...buckets.entries()]
    .sort(
      (a, b) =>
        b[1].wonCount - a[1].wonCount ||
        b[1].pipelineValue - a[1].pipelineValue ||
        b[1].count - a[1].count,
    )
    .slice(0, limit)
    .map(([key, bucket], idx) =>
      insightRow({
        id: `icp-${dimension}-${idx}`,
        dimension,
        ...labelFn(key),
        ...recommendFn(key, bucket),
        confidence: bucketConfidence(bucket),
        evidence: bucket.evidence,
      }),
    );
}

function mapStoredInsight(insight: SalesICPInsight): ICPLearningInsightRow {
  const evidence: ICPLearningEvidenceItem[] = [
    {
      text: insight.evidenceSummary,
      textAr: insight.evidenceSummary,
      source: "stored",
    },
  ];
  if (insight.evidenceRef) {
    evidence.push({
      text: `Evidence ref: ${insight.evidenceRef}`,
      textAr: `مرجع دليل: ${insight.evidenceRef}`,
      source: "stored",
    });
  }

  const confidence = insight.confidence?.score ?? 0.65;

  return insightRow({
    id: insight.id,
    dimension: insight.dimension,
    label: insight.hypothesis,
    labelAr: insight.hypothesis,
    recommendation:
      insight.recommendation ??
      "Validate with stakeholder review before acting on this ICP signal.",
    recommendationAr:
      insight.recommendation ??
      "تحقق مع أصحاب المصلحة قبل التصرف بناءً على هذه الإشارة.",
    confidence,
    evidence,
  });
}

function deriveBestIndustries(
  accounts: SalesAccount[],
  opportunities: SalesOpportunity[],
): ICPLearningInsightRow[] {
  const buckets: RankBucket = new Map();

  for (const account of accounts) {
    const industry = account.industry ?? "Unknown";
    bumpBucket(buckets, industry, {
      text: `Account ${account.name} (${account.status})`,
      textAr: `حساب ${account.nameAr ?? account.name} (${ACCOUNT_STATUS_AR[account.status] ?? account.status})`,
      source: "derived",
    });
  }

  for (const opp of opportunities) {
    const account = accounts.find((a) => a.id === opp.accountId);
    const industry = account?.industry ?? "Unknown";
    bumpBucket(
      buckets,
      industry,
      {
        text: `Opportunity ${opp.name} — stage ${opp.stage}`,
        textAr: `فرصة ${opp.name} — مرحلة ${opp.stage}`,
        source: "opportunity",
      },
      {
        won: isWonStage(opp.stage),
        pipelineValue: opp.valueEstimate ?? 0,
      },
    );
  }

  return bucketsToRows(
    buckets,
    "industry",
    (key) => ({ label: key, labelAr: key }),
    (key, bucket) => ({
      recommendation:
        bucket.wonCount > 0
          ? `Prioritize ${key} accounts with documented win patterns.`
          : `Collect more closed-won evidence before expanding ${key} outbound.`,
      recommendationAr:
        bucket.wonCount > 0
          ? `أولِّ ${key} مع أنماط فوز موثقة.`
          : `اجمع المزيد من أدلة الفوز قبل التوسع في ${key}.`,
    }),
  );
}

function deriveAccountTypes(
  accounts: SalesAccount[],
  opportunities: SalesOpportunity[],
): ICPLearningInsightRow[] {
  const buckets: RankBucket = new Map();

  for (const account of accounts) {
    const gov = account.industry === "Government";
    const typeKey = gov
      ? "Government / public sector"
      : `${account.status} commercial`;
    bumpBucket(buckets, typeKey, {
      text: `${account.name} — status ${account.status}`,
      textAr: `${account.nameAr ?? account.name} — ${ACCOUNT_STATUS_AR[account.status] ?? account.status}`,
      source: "derived",
    });
  }

  for (const opp of opportunities) {
    const account = accounts.find((a) => a.id === opp.accountId);
    if (!account) continue;
    const gov = account.industry === "Government";
    const typeKey = gov
      ? "Government / public sector"
      : `${account.status} commercial`;
    bumpBucket(
      buckets,
      typeKey,
      {
        text: `${opp.name} (${opp.stage})`,
        textAr: `${opp.name} (${opp.stage})`,
        source: "opportunity",
      },
      { won: isWonStage(opp.stage), pipelineValue: opp.valueEstimate ?? 0 },
    );
  }

  return bucketsToRows(
    buckets,
    "account_type",
    (key) => ({
      label: key,
      labelAr:
        key === "Government / public sector"
          ? "حكومي / قطاع عام"
          : key.replace("commercial", "تجاري"),
    }),
    (key) => ({
      recommendation: key.includes("Government")
        ? "Plan extended security and procurement gates for public-sector motion."
        : `Focus on ${key.replace(" commercial", "")} accounts with active pipeline.`,
      recommendationAr: key.includes("Government")
        ? "خطط لبوابات أمن وشراء أطول للقطاع الحكومي."
        : `ركّز على حسابات ${key.replace(" commercial", "")} ذات مسار نشط.`,
    }),
  );
}

function deriveTitles(
  contacts: SalesContact[],
  opportunities: SalesOpportunity[],
): ICPLearningInsightRow[] {
  const activeAccountIds = new Set(
    opportunities
      .filter(
        (o) => !isClosedOpportunityStage(o.stage) || isWonStage(o.stage),
      )
      .map((o) => o.accountId),
  );
  const buckets: RankBucket = new Map();

  for (const contact of contacts) {
    if (!contact.title || !activeAccountIds.has(contact.accountId)) continue;
    bumpBucket(buckets, contact.title, {
      text: `${contact.name} — ${contact.title}`,
      textAr: `${contact.name} — ${contact.title}`,
      source: "derived",
    });
  }

  return bucketsToRows(
    buckets,
    "title",
    (key) => ({ label: key, labelAr: key }),
    (key) => ({
      recommendation: `Engage ${key} stakeholders early in discovery and proof planning.`,
      recommendationAr: `أشرك ${key} مبكراً في الاكتشاف وتخطيط الإثبات.`,
    }),
  );
}

function derivePainPoints(
  icpInsights: SalesICPInsight[],
  winLossInsights: SalesWinLossInsight[],
): ICPLearningInsightRow[] {
  const buckets: RankBucket = new Map();

  for (const insight of icpInsights.filter((i) => i.dimension === "pain_point")) {
    bumpBucket(buckets, insight.hypothesis, {
      text: insight.evidenceSummary,
      textAr: insight.evidenceSummary,
      source: "stored",
    });
  }

  for (const wl of winLossInsights) {
    if (wl.outcome !== "lost") continue;
    bumpBucket(buckets, wl.primaryReason, {
      text: `Win/loss insight — ${wl.primaryReason}`,
      textAr: `رؤية فوز/خسارة — ${WIN_LOSS_REASON_AR[wl.primaryReason] ?? wl.primaryReason}`,
      source: "win_loss",
    });
    for (const factor of wl.contributingFactors ?? []) {
      bumpBucket(buckets, factor, {
        text: `Contributing factor: ${factor}`,
        textAr: `عامل مساهم: ${WIN_LOSS_REASON_AR[factor] ?? factor}`,
        source: "win_loss",
      });
    }
  }

  return bucketsToRows(
    buckets,
    "pain_point",
    (key) => ({
      label: key,
      labelAr: WIN_LOSS_REASON_AR[key] ?? key,
    }),
    (key) => ({
      recommendation: `Address ${WIN_LOSS_REASON_AR[key] ?? key} earlier in qualification.`,
      recommendationAr: `عالج ${WIN_LOSS_REASON_AR[key] ?? key} مبكراً في التأهيل.`,
    }),
  );
}

function mapWinLossPatterns(
  patterns: ReturnType<typeof getWinLossPatterns>,
): ICPLearningInsightRow[] {
  return patterns.slice(0, 6).map((pattern, idx) =>
    insightRow({
      id: `icp-winloss-${idx}`,
      dimension: "win_loss",
      label: `${pattern.outcome === "won" ? "Won" : "Lost"}: ${pattern.reason}`,
      labelAr: `${pattern.outcome === "won" ? "فوز" : "خسارة"}: ${WIN_LOSS_REASON_AR[pattern.reason] ?? pattern.reason}`,
      recommendation:
        pattern.outcome === "won"
          ? `Replicate proof assets tied to ${pattern.reason}.`
          : `Add early qualification gate for ${pattern.reason}.`,
      recommendationAr:
        pattern.outcome === "won"
          ? `كرّر أصول الإثبات المرتبطة بـ ${WIN_LOSS_REASON_AR[pattern.reason] ?? pattern.reason}.`
          : `أضف بوابة تأهيل مبكرة لـ ${WIN_LOSS_REASON_AR[pattern.reason] ?? pattern.reason}.`,
      confidence: Math.min(0.88, 0.45 + pattern.count * 0.12),
      evidence: [
        {
          text: `${pattern.count} occurrence(s) — source ${pattern.source}`,
          textAr: `${pattern.count} تكرار — مصدر ${pattern.source}`,
          source:
            pattern.source === "stored"
              ? "stored"
              : pattern.source === "interaction"
                ? "interaction"
                : "opportunity",
        },
      ],
    }),
  );
}

function buildCurrentHypothesis(input: {
  industries: ICPLearningInsightRow[];
  accountTypes: ICPLearningInsightRow[];
  storedInsights: ICPLearningInsightRow[];
  winLoss: ICPLearningInsightRow[];
}): ICPLearningInsightRow {
  const topIndustry = input.industries[0];
  const topAccountType = input.accountTypes[0];
  const topStored = input.storedInsights[0];
  const topWin = input.winLoss.find((w) => w.label.startsWith("Won"));
  const topLoss = input.winLoss.find((w) => w.label.startsWith("Lost"));

  const parts = [
    topIndustry
      ? `Best-fit industry signal: ${topIndustry.label}`
      : "Insufficient industry evidence",
    topAccountType
      ? `Account motion: ${topAccountType.label}`
      : "Account type undetermined",
    topStored ? `Stored insight: ${topStored.label}` : null,
  ].filter(Boolean);

  const partsAr = [
    topIndustry
      ? `أقوى إشارة قطاع: ${topIndustry.labelAr}`
      : "أدلة قطاع غير كافية",
    topAccountType
      ? `نمط الحساب: ${topAccountType.labelAr}`
      : "نوع الحساب غير محدد",
    topStored ? `رؤية مخزنة: ${topStored.labelAr}` : null,
  ].filter(Boolean);

  const evidence: ICPLearningEvidenceItem[] = [
    ...(topIndustry?.evidence ?? []),
    ...(topAccountType?.evidence ?? []),
    ...(topStored?.evidence ?? []),
    ...(topWin?.evidence ?? []),
    ...(topLoss?.evidence ?? []),
  ].slice(0, 6);

  const confidences = [
    topIndustry?.confidence,
    topAccountType?.confidence,
    topStored?.confidence,
  ].filter((c): c is number => c !== undefined);
  const confidence =
    confidences.length > 0
      ? confidences.reduce((s, c) => s + c, 0) / confidences.length
      : 0.4;

  return insightRow({
    id: "icp-current-hypothesis",
    dimension: "hypothesis",
    label: parts.join(" · "),
    labelAr: partsAr.join(" · "),
    recommendation:
      "Review hypothesis with sales leadership before changing targeting or messaging.",
    recommendationAr:
      "راجع الفرضية مع قيادة المبيعات قبل تغيير الاستهداف أو الرسائل.",
    confidence,
    evidence,
  });
}

export function buildICPLearningSnapshot(input: {
  organizationId: string;
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  contacts: SalesContact[];
  icpInsights: SalesICPInsight[];
  winLossInsights: SalesWinLossInsight[];
  interactions: SalesInteractionLog[];
}): ICPLearningSnapshot {
  const storedInsights = input.icpInsights.map(mapStoredInsight);
  const bestIndustries = deriveBestIndustries(
    input.accounts,
    input.opportunities,
  );
  const accountTypes = deriveAccountTypes(
    input.accounts,
    input.opportunities,
  );
  const titles = deriveTitles(input.contacts, input.opportunities);
  const painPoints = derivePainPoints(
    input.icpInsights,
    input.winLossInsights,
  );
  const winLossPatterns = mapWinLossPatterns(
    getWinLossPatterns({
      winLoss: input.winLossInsights,
      opportunities: input.opportunities,
      interactions: input.interactions,
    }),
  );

  const currentHypothesis = buildCurrentHypothesis({
    industries: bestIndustries,
    accountTypes,
    storedInsights,
    winLoss: winLossPatterns,
  });

  const dimensionRows = [
    currentHypothesis,
    ...bestIndustries,
    ...accountTypes,
    ...titles,
    ...painPoints,
    ...winLossPatterns,
    ...storedInsights,
  ];
  const overallConfidence =
    dimensionRows.length > 0
      ? dimensionRows.reduce((s, r) => s + r.confidence, 0) /
        dimensionRows.length
      : 0.35;

  return {
    organizationId: input.organizationId,
    currentHypothesis,
    bestIndustries,
    accountTypes,
    titles,
    painPoints,
    winLossPatterns,
    storedInsights,
    overallConfidence,
    icpFit: buildICPFitDistribution(input.accounts, input.opportunities),
    disclaimer: ICP_DISCLAIMER_EN,
    disclaimerAr: ICP_DISCLAIMER_AR,
  };
}

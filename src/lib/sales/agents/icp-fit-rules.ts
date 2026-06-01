/** Client-safe ICP fit rules engine (no prisma, no server-only). */

import {
  icpBandFromScore,
  ICP_SEGMENT_RULES,
  readAccountSegmentHint,
  type AccountIcpScore,
  type IcpFitDimensions,
  type IcpSegmentRule,
} from "../icp-types";

export interface IcpFitStubAccountInput {
  industry: string | null;
  metadata: unknown;
}

export interface IcpFitStubResult {
  score: AccountIcpScore;
  reasoning: string[];
  confidence: number;
}

function clampScore(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function industryMatchesRule(industry: string, rule: IcpSegmentRule): boolean {
  const normalized = normalizeText(industry);
  if (!normalized) return false;
  return rule.industryKeywords.some((keyword) =>
    normalized.includes(keyword.toLowerCase()),
  );
}

function findRuleBySegmentHint(hint: string): IcpSegmentRule | null {
  const normalized = normalizeText(hint);
  if (!normalized) return null;

  const direct = ICP_SEGMENT_RULES.find(
    (rule) =>
      normalizeText(rule.label) === normalized ||
      normalizeText(rule.id) === normalized ||
      normalized.includes(normalizeText(rule.id)) ||
      normalizeText(rule.label).includes(normalized),
  );
  if (direct) return direct;

  if (normalized.includes("enterprise saas") || normalized.includes("saas")) {
    return ICP_SEGMENT_RULES.find((rule) => rule.id === "icp-4") ?? null;
  }
  if (normalized.includes("audit")) {
    return ICP_SEGMENT_RULES.find((rule) => rule.id === "icp-1") ?? null;
  }
  if (normalized.includes("financial")) {
    return ICP_SEGMENT_RULES.find((rule) => rule.id === "icp-5") ?? null;
  }

  return null;
}

function findBestIndustryRule(industry: string | null): IcpSegmentRule | null {
  const normalized = normalizeText(industry);
  if (!normalized) return null;

  let best: IcpSegmentRule | null = null;
  for (const rule of ICP_SEGMENT_RULES) {
    if (industryMatchesRule(normalized, rule)) {
      if (!best || rule.baseScore > best.baseScore) {
        best = rule;
      }
    }
  }
  return best;
}

function deriveDimensions(score: number): IcpFitDimensions {
  return {
    pain: clampScore(score + 3),
    urgency: clampScore(score - 5),
    budget: clampScore(score - 2),
    authority: clampScore(score + 1),
  };
}

/** Pure rules engine — no LLM, no DB. */
export function computeIcpFitStub(
  account: IcpFitStubAccountInput,
): IcpFitStubResult {
  const reasoning: string[] = [];
  const industry = account.industry?.trim() || null;
  const segmentHint = readAccountSegmentHint(account.metadata);

  let matchedRule = segmentHint ? findRuleBySegmentHint(segmentHint) : null;
  if (matchedRule) {
    reasoning.push(
      `تطابقت الشريحة ${matchedRule.label} (${matchedRule.id}) مع البيانات المتاحة.`,
    );
  }

  const industryRule = findBestIndustryRule(industry);
  if (industryRule) {
    if (!matchedRule || industryRule.baseScore > matchedRule.baseScore) {
      matchedRule = industryRule;
      reasoning.push(
        `القطاع "${industry}" يطابق ${industryRule.label} عبر قواعد الكلمات المفتاحية.`,
      );
    } else if (industryRule.id !== matchedRule.id) {
      reasoning.push(
        `القطاع يطابق أيضاً ${industryRule.label}، لكن الشريحة الصريحة أُبقيت.`,
      );
    }
  } else if (industry) {
    reasoning.push(
      `القطاع "${industry}" لا يطابق شريحة ICP مستهدفة — درجة منخفضة.`,
    );
  } else {
    reasoning.push("لا يوجد قطاع — درجة أساسية فقط.");
  }

  let fitScore: number;
  if (matchedRule) {
    fitScore = matchedRule.baseScore;
  } else if (industry) {
    fitScore = 38;
    reasoning.push("بيانات جزئية: درجة افتراضية ضعيفة (38).");
  } else {
    fitScore = 25;
    reasoning.push("بيانات غير كافية: خط أساس غير معروف (25).");
  }

  let confidence = 35;
  if (industry) {
    confidence += 25;
    reasoning.push("حقل القطاع متوفر (+25 ثقة).");
  }
  if (segmentHint) {
    confidence += 20;
    reasoning.push("تلميح الشريحة متوفر (+20 ثقة).");
  }
  if (matchedRule) {
    confidence += 15;
    reasoning.push("تطابق قاعدة الشريحة (+15 ثقة).");
  }
  confidence = clampScore(confidence);

  const segment = segmentHint ?? matchedRule?.label ?? null;
  const band = icpBandFromScore(fitScore);

  reasoning.push(
    `الدرجة النهائية ${fitScore} (${band})، الثقة ${confidence}%.`,
  );

  const score: AccountIcpScore = {
    fitScore,
    band,
    segment,
    confidence,
    dimensions: deriveDimensions(fitScore),
    assessedAt: new Date().toISOString(),
    source: "rules-agent",
    notes:
      "Rules-based ICP stub — requires human review before commercial use.",
    agentGenerated: true,
    reviewed: false,
    reviewedAt: null,
    reviewedById: null,
    reasoning: [...reasoning],
  };

  return { score, reasoning, confidence };
}

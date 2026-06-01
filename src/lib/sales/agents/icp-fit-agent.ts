import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "../audit-events";
import {
  icpBandFromScore,
  ICP_SEGMENT_RULES,
  readAccountSegmentHint,
  type AccountIcpScore,
  type IcpFitDimensions,
  type IcpSegmentRule,
} from "../icp-types";
import type { SalesActor, SalesOrgScope } from "../services";

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

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

async function loadAccountForIcp(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: {
      id: true,
      name: true,
      industry: true,
      metadata: true,
      status: true,
      isDemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

export async function recalculateAccountIcpFit(
  accountId: string,
  scope: SalesOrgScope,
  actor: SalesActor,
): Promise<{
  account: Awaited<ReturnType<typeof loadAccountForIcp>>;
  result: IcpFitStubResult;
}> {
  const account = await loadAccountForIcp(accountId, scope.organizationId);
  const result = computeIcpFitStub({
    industry: account.industry,
    metadata: account.metadata,
  });
  const existingMeta = parseMetadata(account.metadata);

  const updated = await prisma.salesAccount.update({
    where: { id: accountId },
    data: {
      metadata: {
        ...existingMeta,
        icpScore: result.score,
      } as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      name: true,
      industry: true,
      metadata: true,
      status: true,
      isDemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.AGENT_ICP_SCORED,
    targetType: "SalesAccount",
    targetId: accountId,
    metadata: {
      fitScore: result.score.fitScore,
      band: result.score.band,
      segment: result.score.segment,
      confidence: result.confidence,
      agentGenerated: true,
      reviewed: false,
    },
  });

  try {
    const { syncInstitutionalMemoryForAccount } = await import(
      "../institutional-memory"
    );
    await syncInstitutionalMemoryForAccount(accountId, scope);
  } catch {
    // Non-blocking — memory sync must not fail ICP scoring
  }

  return { account: updated, result };
}

export async function setAccountIcpReviewed(
  accountId: string,
  scope: SalesOrgScope,
  actor: SalesActor,
  reviewed: boolean,
) {
  const account = await loadAccountForIcp(accountId, scope.organizationId);
  const existingMeta = parseMetadata(account.metadata);
  const icpRaw = existingMeta.icpScore;

  if (!icpRaw || typeof icpRaw !== "object" || Array.isArray(icpRaw)) {
    throw new Error("SalesOS: no ICP score to review");
  }

  const now = new Date().toISOString();
  const updatedScore: AccountIcpScore = {
    ...(icpRaw as AccountIcpScore),
    reviewed,
    reviewedAt: reviewed ? now : null,
    reviewedById: reviewed ? actor.id : null,
  };

  const updated = await prisma.salesAccount.update({
    where: { id: accountId },
    data: {
      metadata: {
        ...existingMeta,
        icpScore: updatedScore,
      } as Prisma.InputJsonValue,
    },
    select: {
      id: true,
      name: true,
      industry: true,
      metadata: true,
      status: true,
      isDemo: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return updated;
}

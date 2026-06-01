import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "../audit-events";
import { readAccountIcpScore, icpBandLabelAr } from "../icp-types";
import { readSignalsFromMetadata, signalSeverityLabelAr, signalTypeLabelAr } from "../signals";
import type { SalesActor, SalesOrgScope } from "../services";

/** PR-14 stub — template brief from account fields + metadata signals; no external LLM. */

export const ACCOUNT_RESEARCH_STATUSES = [
  "draft_pending_review",
  "reviewed",
] as const;

export type AccountResearchStatus = (typeof ACCOUNT_RESEARCH_STATUSES)[number];

export interface AccountResearchSource {
  type: "account_field" | "icp" | "signal" | "deal_count";
  label: string;
  value?: string | number | null;
  refId?: string | null;
}

export interface AccountResearchRun {
  brief: string;
  sources: AccountResearchSource[];
  confidence: number;
  status: AccountResearchStatus;
  generatedAt: string;
  generatedById: string;
  generatedByName: string | null;
  reviewedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
}

export interface AccountResearchContext {
  scope: SalesOrgScope;
  actor: SalesActor;
}

export interface AccountResearchStubResult {
  brief: string;
  sources: AccountResearchSource[];
  confidence: number;
  status: AccountResearchStatus;
}

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function clampConfidence(value: number): number {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function parseAccountResearchRun(raw: unknown): AccountResearchRun | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const row = raw as Record<string, unknown>;
  if (typeof row.brief !== "string" || !row.brief.trim()) return null;
  if (
    row.status !== "draft_pending_review" &&
    row.status !== "reviewed"
  ) {
    return null;
  }
  if (typeof row.generatedAt !== "string" || typeof row.generatedById !== "string") {
    return null;
  }
  const confidence =
    typeof row.confidence === "number" && !Number.isNaN(row.confidence)
      ? clampConfidence(row.confidence)
      : null;
  if (confidence == null) return null;

  const sourcesRaw = row.sources;
  const sources: AccountResearchSource[] = [];
  if (Array.isArray(sourcesRaw)) {
    for (const item of sourcesRaw) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const s = item as Record<string, unknown>;
      const type = s.type;
      const label = typeof s.label === "string" ? s.label : null;
      if (
        !label ||
        (type !== "account_field" &&
          type !== "icp" &&
          type !== "signal" &&
          type !== "deal_count")
      ) {
        continue;
      }
      sources.push({
        type,
        label,
        value:
          typeof s.value === "string" ||
          typeof s.value === "number" ||
          s.value === null
            ? (s.value as string | number | null)
            : undefined,
        refId: typeof s.refId === "string" ? s.refId : null,
      });
    }
  }

  return {
    brief: row.brief.trim(),
    sources,
    confidence,
    status: row.status,
    generatedAt: row.generatedAt,
    generatedById: row.generatedById,
    generatedByName:
      typeof row.generatedByName === "string" ? row.generatedByName : null,
    reviewedAt: typeof row.reviewedAt === "string" ? row.reviewedAt : null,
    reviewedById: typeof row.reviewedById === "string" ? row.reviewedById : null,
    reviewedByName:
      typeof row.reviewedByName === "string" ? row.reviewedByName : null,
  };
}

export function readAccountResearchFromMetadata(
  metadata: unknown,
): AccountResearchRun | null {
  const agentRuns = parseMetadata(metadata).agentRuns;
  if (!agentRuns || typeof agentRuns !== "object" || Array.isArray(agentRuns)) {
    return null;
  }
  return parseAccountResearchRun(
    (agentRuns as Record<string, unknown>).accountResearch,
  );
}

function mergeAccountResearchIntoMetadata(
  existing: Record<string, unknown>,
  run: AccountResearchRun,
): Record<string, unknown> {
  const agentRuns = parseMetadata(existing).agentRuns;
  const prior =
    agentRuns && typeof agentRuns === "object" && !Array.isArray(agentRuns)
      ? (agentRuns as Record<string, unknown>)
      : {};
  return {
    ...existing,
    agentRuns: {
      ...prior,
      accountResearch: run,
    },
  };
}

async function assertAccountInOrg(accountId: string, organizationId: string) {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId },
    select: {
      id: true,
      name: true,
      industry: true,
      status: true,
      metadata: true,
    },
  });
  if (!account) {
    throw new Error("SalesOS: account not found in organization");
  }
  return account;
}

function accountStatusLabelAr(status: string): string {
  switch (status) {
    case "active":
      return "نشط";
    case "inactive":
      return "غير نشط";
    case "archived":
      return "مؤرشف";
    default:
      return status;
  }
}

function buildTemplateBrief(input: {
  name: string;
  industry: string | null;
  status: string;
  dealCount: number;
  icpConfigured: boolean;
  icpFitScore: number | null;
  icpBand: string | null;
  signals: ReturnType<typeof readSignalsFromMetadata>;
}): { brief: string; sources: AccountResearchSource[]; confidence: number } {
  const sources: AccountResearchSource[] = [
    {
      type: "account_field",
      label: "اسم الحساب",
      value: input.name,
    },
    {
      type: "account_field",
      label: "القطاع",
      value: input.industry ?? "—",
    },
    {
      type: "account_field",
      label: "حالة الحساب",
      value: accountStatusLabelAr(input.status),
    },
    {
      type: "deal_count",
      label: "عدد الصفقات المرتبطة",
      value: input.dealCount,
    },
  ];

  let confidence = 35;
  if (input.industry) confidence += 10;
  if (input.dealCount > 0) confidence += 10;

  const lines: string[] = [
    `# ملخص بحث الحساب (قالب محكوم — بدون LLM خارجي)`,
    ``,
    `**الحساب:** ${input.name}`,
    `**القطاع:** ${input.industry ?? "غير محدد"}`,
    `**الحالة:** ${accountStatusLabelAr(input.status)}`,
    `**الصفقات المرتبطة:** ${input.dealCount}`,
  ];

  if (input.icpConfigured && input.icpFitScore != null) {
    confidence += 15;
    sources.push({
      type: "icp",
      label: "ملاءمة ICP",
      value: `${input.icpFitScore}% — ${input.icpBand ?? ""}`,
    });
    lines.push(
      ``,
      `## ملاءمة ICP`,
      `- النتيجة: ${input.icpFitScore}% (${input.icpBand ?? "—"})`,
    );
  } else {
    lines.push(``, `## ملاءمة ICP`, `- غير مُكوَّنة — يُنصح بتقييم ICP قبل الاقتراب.`);
  }

  const signalSlice = input.signals.slice(0, 8);
  if (signalSlice.length > 0) {
    confidence += Math.min(25, signalSlice.length * 4);
    lines.push(``, `## إشارات مُسجَّلة (${input.signals.length})`);
    for (const signal of signalSlice) {
      sources.push({
        type: "signal",
        label: signal.title,
        value: `${signalTypeLabelAr(signal.type)} / ${signalSeverityLabelAr(signal.severity)}`,
        refId: signal.id,
      });
      const summary = signal.summary ? ` — ${signal.summary}` : "";
      lines.push(
        `- **${signal.title}** (${signalTypeLabelAr(signal.type)}, ${signalSeverityLabelAr(signal.severity)})${summary}`,
      );
    }
    if (input.signals.length > signalSlice.length) {
      lines.push(`- … و${input.signals.length - signalSlice.length} إشارة إضافية`);
    }
  } else {
    lines.push(``, `## إشارات`, `- لا إشارات مُسجَّلة — أضف إشارات يدوياً لرفع جودة الملخص.`);
  }

  lines.push(
    ``,
    `## توصيات تشغيلية (قالب)`,
    `- راجع الملخص مع فريق المبيعات قبل أي outreach.`,
    `- اربط دليلاً واحداً على الأقل قبل الانتقال لمراحل عرض/تجريب/فوز.`,
    `- الحالة: **مسودة بانتظار مراجعة ADMIN** — ليست قراراً آلياً.`,
  );

  return {
    brief: lines.join("\n"),
    sources,
    confidence: clampConfidence(confidence),
  };
}

export async function runAccountResearchStub(
  context: AccountResearchContext,
  accountId: string,
): Promise<AccountResearchStubResult> {
  const { scope, actor } = context;
  const account = await assertAccountInOrg(accountId, scope.organizationId);

  const dealCount = await prisma.salesDeal.count({
    where: { accountId: account.id, organizationId: scope.organizationId },
  });

  const icp = readAccountIcpScore(account.metadata);
  const signals = readSignalsFromMetadata(account.metadata);

  const { brief, sources, confidence } = buildTemplateBrief({
    name: account.name,
    industry: account.industry,
    status: account.status,
    dealCount,
    icpConfigured: icp.configured,
    icpFitScore: icp.score?.fitScore ?? null,
    icpBand: icp.score ? icpBandLabelAr(icp.score.band) : null,
    signals,
  });

  const nowIso = new Date().toISOString();
  const run: AccountResearchRun = {
    brief,
    sources,
    confidence,
    status: "draft_pending_review",
    generatedAt: nowIso,
    generatedById: actor.id,
    generatedByName: actor.name ?? null,
    reviewedAt: null,
    reviewedById: null,
    reviewedByName: null,
  };

  const metadata = parseMetadata(account.metadata);
  const nextMetadata = mergeAccountResearchIntoMetadata(metadata, run);

  await prisma.salesAccount.update({
    where: { id: account.id },
    data: { metadata: nextMetadata as Prisma.InputJsonValue },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.RESEARCH_GENERATED,
    targetType: "SalesAccount",
    targetId: account.id,
    metadata: {
      confidence,
      sourceCount: sources.length,
      signalCount: signals.length,
    },
  });

  return {
    brief,
    sources,
    confidence,
    status: run.status,
  };
}

export async function markAccountResearchReviewed(
  context: AccountResearchContext,
  accountId: string,
): Promise<AccountResearchRun> {
  const { scope, actor } = context;

  if (actor.role !== "ADMIN") {
    throw new Error(
      "SalesOS validation: marking account research reviewed requires ADMIN role",
    );
  }

  const account = await assertAccountInOrg(accountId, scope.organizationId);
  const existing = readAccountResearchFromMetadata(account.metadata);
  if (!existing) {
    throw new Error(
      "SalesOS validation: no account research brief to review — generate first",
    );
  }
  if (existing.status !== "draft_pending_review") {
    throw new Error(
      "SalesOS validation: account research is not pending review",
    );
  }

  const nowIso = new Date().toISOString();
  const run: AccountResearchRun = {
    ...existing,
    status: "reviewed",
    reviewedAt: nowIso,
    reviewedById: actor.id,
    reviewedByName: actor.name ?? null,
  };

  const metadata = parseMetadata(account.metadata);
  const nextMetadata = mergeAccountResearchIntoMetadata(metadata, run);

  await prisma.salesAccount.update({
    where: { id: account.id },
    data: { metadata: nextMetadata as Prisma.InputJsonValue },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.RESEARCH_REVIEWED,
    targetType: "SalesAccount",
    targetId: account.id,
    metadata: {
      confidence: run.confidence,
      reviewedAt: nowIso,
    },
  });

  return run;
}

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SalesAuditActions } from "./audit-events";
import { salesAuditActionLabelAr } from "./audit-trail";
import { readReviewDecisions, type ReviewDecisionRecord } from "./governance";
import { readAccountIcpScore } from "./icp-types";
import type { SalesOrgScope } from "./services";

/** Phase 2 stub — append-only timeline in SalesAccount.metadata.institutionalMemory[] (no migration). */

export const MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT = 100;

export const INSTITUTIONAL_MEMORY_TYPES = [
  "audit",
  "review_decision",
  "icp_review",
] as const;

export type InstitutionalMemoryType =
  (typeof INSTITUTIONAL_MEMORY_TYPES)[number];

export interface InstitutionalMemoryEntry {
  type: InstitutionalMemoryType;
  summary: string;
  sourceRef: string;
  actorId: string;
  at: string;
}

const AUDIT_ACTIONS_FOR_MEMORY = new Set<string>([
  SalesAuditActions.GOVERNANCE_REVIEW_DECISION,
  SalesAuditActions.GOVERNANCE_OVERRIDE,
  SalesAuditActions.AGENT_ICP_SCORED,
  SalesAuditActions.RESEARCH_GENERATED,
  SalesAuditActions.RESEARCH_REVIEWED,
  SalesAuditActions.SIGNAL_CREATED,
  SalesAuditActions.EVIDENCE_LINKED,
  SalesAuditActions.EVIDENCE_UNLINKED,
  SalesAuditActions.INTERACTION_CREATED,
  SalesAuditActions.AGENT_DEAL_RISK_COMPUTED,
  SalesAuditActions.CONVERSION_MEMO_UPDATED,
  SalesAuditActions.OUTREACH_REVIEWED,
  SalesAuditActions.FOLLOWUP_DRAFTED,
]);

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function parseMemoryType(value: unknown): InstitutionalMemoryType | null {
  if (
    typeof value === "string" &&
    INSTITUTIONAL_MEMORY_TYPES.includes(value as InstitutionalMemoryType)
  ) {
    return value as InstitutionalMemoryType;
  }
  return null;
}

export function readInstitutionalMemory(metadata: unknown): InstitutionalMemoryEntry[] {
  const raw = parseMetadata(metadata).institutionalMemory;
  if (!Array.isArray(raw)) return [];

  const entries: InstitutionalMemoryEntry[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const row = item as Record<string, unknown>;
    const type = parseMemoryType(row.type);
    const summary =
      typeof row.summary === "string" && row.summary.trim()
        ? row.summary.trim()
        : null;
    const sourceRef =
      typeof row.sourceRef === "string" && row.sourceRef.trim()
        ? row.sourceRef.trim()
        : null;
    const actorId =
      typeof row.actorId === "string" && row.actorId.trim()
        ? row.actorId.trim()
        : null;
    const at =
      typeof row.at === "string" && row.at.trim() ? row.at.trim() : null;

    if (!type || !summary || !sourceRef || !actorId || !at) continue;

    entries.push({ type, summary, sourceRef, actorId, at });
  }

  return entries.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export function appendInstitutionalMemoryMetadata(
  existing: Record<string, unknown>,
  incoming: InstitutionalMemoryEntry[],
): Record<string, unknown> {
  const prior = readInstitutionalMemory(existing);
  const knownRefs = new Set(prior.map((e) => e.sourceRef));
  const merged = [...prior];

  for (const entry of incoming) {
    if (knownRefs.has(entry.sourceRef)) continue;
    knownRefs.add(entry.sourceRef);
    merged.push(entry);
  }

  merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  return {
    ...existing,
    institutionalMemory: merged.slice(0, MAX_INSTITUTIONAL_MEMORY_PER_ACCOUNT),
  };
}

function reviewDecisionSummary(
  record: ReviewDecisionRecord,
  dealTitle: string,
): string {
  const decisionAr =
    record.decision === "approved"
      ? "موافقة"
      : record.decision === "rejected"
        ? "رفض"
        : "معلق";
  const stage =
    record.stageSlug && record.stageSlug.trim()
      ? ` — ${record.stageSlug.trim()}`
      : "";
  return `قرار مراجعة (${decisionAr}) على «${dealTitle}»${stage}: ${record.reason}`;
}

function icpReviewSummary(score: {
  fitScore: number;
  band: string;
  reviewedAt?: string | null;
}): string {
  return `مراجعة بشرية لملاءمة ICP — النتيجة ${score.fitScore} (${score.band})`;
}

function auditEventSummary(
  action: string,
  metadata: unknown,
  dealTitleById: Map<string, string>,
  targetType: string,
  targetId: string,
): string {
  const label = salesAuditActionLabelAr(action);
  const meta =
    metadata && typeof metadata === "object"
      ? (metadata as Record<string, unknown>)
      : null;

  if (action === SalesAuditActions.GOVERNANCE_REVIEW_DECISION && meta) {
    const decision = String(meta.decision ?? "");
    const reason = String(meta.reason ?? "").trim();
    const dealTitle = dealTitleById.get(targetId) ?? targetId;
    return `${label} — «${dealTitle}» (${decision}): ${reason || "—"}`;
  }

  if (action === SalesAuditActions.AGENT_ICP_SCORED && meta) {
    const fitScore = meta.fitScore != null ? String(meta.fitScore) : "—";
    const band = meta.band != null ? String(meta.band) : "—";
    return `${label} — fit ${fitScore} (${band})`;
  }

  if (targetType === "SalesDeal") {
    const dealTitle = dealTitleById.get(targetId) ?? targetId;
    return `${label} — «${dealTitle}»`;
  }

  return label;
}

export function buildReviewDecisionEntries(
  deals: Array<{
    id: string;
    title: string;
    metadata: unknown;
  }>,
): InstitutionalMemoryEntry[] {
  const entries: InstitutionalMemoryEntry[] = [];

  for (const deal of deals) {
    for (const record of readReviewDecisions(deal.metadata)) {
      entries.push({
        type: "review_decision",
        summary: reviewDecisionSummary(record, deal.title),
        sourceRef: `review:${deal.id}:${record.id}`,
        actorId: record.actorId,
        at: record.createdAt,
      });
    }
  }

  return entries;
}

export function buildIcpReviewEntry(
  accountId: string,
  metadata: unknown,
): InstitutionalMemoryEntry | null {
  const assessment = readAccountIcpScore(metadata);
  const score = assessment.score;
  if (!score?.reviewed || !score.reviewedAt) return null;

  const actorId = score.reviewedById?.trim() || "system";
  const at = score.reviewedAt;

  return {
    type: "icp_review",
    summary: icpReviewSummary({
      fitScore: score.fitScore,
      band: score.band,
      reviewedAt: score.reviewedAt,
    }),
    sourceRef: `icp-review:${accountId}:${at}`,
    actorId,
    at,
  };
}

export function buildAuditMemoryEntries(
  events: Array<{
    id: string;
    action: string;
    actorId: string;
    targetType: string;
    targetId: string;
    metadata: unknown;
    createdAt: Date;
  }>,
  dealTitleById: Map<string, string>,
  existingSourceRefs: Set<string>,
): InstitutionalMemoryEntry[] {
  const entries: InstitutionalMemoryEntry[] = [];

  for (const event of events) {
    if (!AUDIT_ACTIONS_FOR_MEMORY.has(event.action)) continue;

    const meta =
      event.metadata && typeof event.metadata === "object"
        ? (event.metadata as Record<string, unknown>)
        : null;

    if (event.action === SalesAuditActions.GOVERNANCE_REVIEW_DECISION) {
      const reviewDecisionId =
        typeof meta?.reviewDecisionId === "string"
          ? meta.reviewDecisionId
          : null;
      if (reviewDecisionId) {
        const ref = `review:${event.targetId}:${reviewDecisionId}`;
        if (existingSourceRefs.has(ref)) continue;
      }
    }

    const sourceRef = `audit:${event.id}`;
    if (existingSourceRefs.has(sourceRef)) continue;

    entries.push({
      type: "audit",
      summary: auditEventSummary(
        event.action,
        event.metadata,
        dealTitleById,
        event.targetType,
        event.targetId,
      ),
      sourceRef,
      actorId: event.actorId,
      at: event.createdAt.toISOString(),
    });
  }

  return entries;
}

export async function collectInstitutionalMemoryCandidates(
  accountId: string,
  scope: SalesOrgScope,
): Promise<InstitutionalMemoryEntry[]> {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId: scope.organizationId },
    select: { id: true, metadata: true },
  });

  if (!account) {
    throw new Error("SalesOS: account not found");
  }

  const deals = await prisma.salesDeal.findMany({
    where: { accountId, organizationId: scope.organizationId },
    select: { id: true, title: true, metadata: true },
  });

  const dealIds = deals.map((d) => d.id);
  const dealTitleById = new Map(deals.map((d) => [d.id, d.title]));

  const existingRefs = new Set(
    readInstitutionalMemory(account.metadata).map((e) => e.sourceRef),
  );

  const reviewEntries = buildReviewDecisionEntries(deals);
  for (const entry of reviewEntries) {
    existingRefs.add(entry.sourceRef);
  }

  const icpEntry = buildIcpReviewEntry(accountId, account.metadata);
  if (icpEntry) {
    existingRefs.add(icpEntry.sourceRef);
  }

  const auditEvents =
    dealIds.length > 0
      ? await prisma.salesAuditEvent.findMany({
          where: {
            organizationId: scope.organizationId,
            OR: [
              { targetType: "SalesAccount", targetId: accountId },
              { targetType: "SalesDeal", targetId: { in: dealIds } },
            ],
            action: { in: [...AUDIT_ACTIONS_FOR_MEMORY] },
          },
          orderBy: { createdAt: "asc" },
          take: 200,
          select: {
            id: true,
            action: true,
            actorId: true,
            targetType: true,
            targetId: true,
            metadata: true,
            createdAt: true,
          },
        })
      : await prisma.salesAuditEvent.findMany({
          where: {
            organizationId: scope.organizationId,
            targetType: "SalesAccount",
            targetId: accountId,
            action: { in: [...AUDIT_ACTIONS_FOR_MEMORY] },
          },
          orderBy: { createdAt: "asc" },
          take: 200,
          select: {
            id: true,
            action: true,
            actorId: true,
            targetType: true,
            targetId: true,
            metadata: true,
            createdAt: true,
          },
        });

  const auditEntries = buildAuditMemoryEntries(
    auditEvents,
    dealTitleById,
    existingRefs,
  );

  const combined = [
    ...reviewEntries,
    ...(icpEntry ? [icpEntry] : []),
    ...auditEntries,
  ];

  return combined.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime(),
  );
}

export { syncInstitutionalMemoryForAccount } from "./institutional-memory-sync";

export function listInstitutionalMemoryFromMetadata(
  metadata: unknown,
): InstitutionalMemoryEntry[] {
  return readInstitutionalMemory(metadata);
}

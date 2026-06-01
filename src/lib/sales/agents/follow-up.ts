import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "../audit-events";
import { readDealNextAction, mergeDealNextActionMetadata } from "../deal-metadata";
import type { SalesActor, SalesOrgScope } from "../services";

/** Phase 2 stub — governed follow-up drafts in deal.metadata.followUpDrafts (no send). */

export const FOLLOW_UP_DRAFT_STATUSES = [
  "draft",
  "approved",
  "rejected",
] as const;

export type FollowUpDraftStatus = (typeof FOLLOW_UP_DRAFT_STATUSES)[number];

export interface FollowUpDraft {
  id: string;
  subject: string;
  body: string;
  suggestedNextAction: string;
  sourceInteractionId: string | null;
  sourceInteractionType: string | null;
  sourceInteractionSummary: string | null;
  status: FollowUpDraftStatus;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface DraftFollowUpInput {
  interactionId?: string | null;
}

const INTERACTION_TYPE_LABELS_AR: Record<string, string> = {
  call: "مكالمة",
  meeting: "اجتماع",
  email: "بريد",
  note: "ملاحظة",
  demo: "عرض",
  other: "تفاعل",
};

function parseDealMetadata(metadata: unknown): Record<string, unknown> {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    return metadata as Record<string, unknown>;
  }
  return {};
}

function isFollowUpDraftStatus(value: unknown): value is FollowUpDraftStatus {
  return (
    typeof value === "string" &&
    (FOLLOW_UP_DRAFT_STATUSES as readonly string[]).includes(value)
  );
}

function parseFollowUpDraft(raw: unknown): FollowUpDraft | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.id !== "string" || !d.id.trim()) return null;
  if (typeof d.subject !== "string" || typeof d.body !== "string") return null;
  if (typeof d.suggestedNextAction !== "string" || !d.suggestedNextAction.trim()) {
    return null;
  }
  if (!isFollowUpDraftStatus(d.status)) return null;
  if (typeof d.createdById !== "string" || typeof d.createdAt !== "string") {
    return null;
  }

  return {
    id: d.id,
    subject: d.subject,
    body: d.body,
    suggestedNextAction: d.suggestedNextAction.trim(),
    sourceInteractionId:
      typeof d.sourceInteractionId === "string" ? d.sourceInteractionId : null,
    sourceInteractionType:
      typeof d.sourceInteractionType === "string"
        ? d.sourceInteractionType
        : null,
    sourceInteractionSummary:
      typeof d.sourceInteractionSummary === "string"
        ? d.sourceInteractionSummary
        : null,
    status: d.status,
    createdById: d.createdById,
    createdByName: typeof d.createdByName === "string" ? d.createdByName : null,
    createdAt: d.createdAt,
    reviewedById: typeof d.reviewedById === "string" ? d.reviewedById : null,
    reviewedByName:
      typeof d.reviewedByName === "string" ? d.reviewedByName : null,
    reviewedAt: typeof d.reviewedAt === "string" ? d.reviewedAt : null,
    reviewNote: typeof d.reviewNote === "string" ? d.reviewNote : null,
  };
}

export function readFollowUpDrafts(metadata: unknown): FollowUpDraft[] {
  const m = parseDealMetadata(metadata);
  const raw = m.followUpDrafts;
  if (!Array.isArray(raw)) return [];
  return raw
    .map(parseFollowUpDraft)
    .filter((d): d is FollowUpDraft => d !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function mergeFollowUpDraftsIntoMetadata(
  existing: Record<string, unknown>,
  drafts: FollowUpDraft[],
): Record<string, unknown> {
  return { ...existing, followUpDrafts: drafts };
}

function interactionTypeLabelAr(type: string): string {
  return INTERACTION_TYPE_LABELS_AR[type] ?? type;
}

function buildSuggestedNextAction(input: {
  interactionSubject: string | null;
  interactionSummary: string | null;
  interactionType: string;
  existingNextAction: string | null;
}): string {
  if (input.existingNextAction) {
    return input.existingNextAction;
  }
  const topic =
    input.interactionSubject?.trim() ||
    input.interactionSummary?.trim()?.slice(0, 80) ||
    interactionTypeLabelAr(input.interactionType);
  return `متابعة بخصوص: ${topic}`;
}

function buildFollowUpTemplate(input: {
  dealTitle: string;
  interactionType: string;
  interactionSubject: string | null;
  interactionSummary: string | null;
  occurredAt: Date;
  suggestedNextAction: string;
}): { subject: string; body: string } {
  const typeLabel = interactionTypeLabelAr(input.interactionType);
  const occurred = input.occurredAt.toLocaleDateString("ar-SA");
  const topic =
    input.interactionSubject?.trim() ||
    input.interactionSummary?.trim() ||
    "آخر تفاعل مسجّل";

  const lines = [
    `الموضوع: متابعة — ${input.dealTitle}`,
    "",
    `بعد ${typeLabel} بتاريخ ${occurred}:`,
    topic,
    "",
    input.interactionSummary?.trim()
      ? `ملخص: ${input.interactionSummary.trim()}`
      : null,
    "",
    `الإجراء التالي المقترح: ${input.suggestedNextAction}`,
    "",
    "---",
    "_مسودة متابعة PR-18 — لا إرسال تلقائي. يُنسخ الإجراء التالي فقط بعد اعتماد بشري._",
  ].filter((line) => line !== null);

  return {
    subject: `متابعة — ${topic.slice(0, 60)}`,
    body: lines.join("\n"),
  };
}

async function loadDealWithMetadata(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: {
      id: true,
      title: true,
      organizationId: true,
      metadata: true,
    },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function resolveSourceInteraction(
  dealId: string,
  organizationId: string,
  interactionId?: string | null,
) {
  if (interactionId?.trim()) {
    const interaction = await prisma.salesInteraction.findFirst({
      where: {
        id: interactionId.trim(),
        organizationId,
        dealId,
      },
      select: {
        id: true,
        type: true,
        subject: true,
        summary: true,
        occurredAt: true,
        metadata: true,
      },
    });
    if (!interaction) {
      throw new Error("SalesOS: interaction not found on deal");
    }
    const deletedAt =
      interaction.metadata &&
      typeof interaction.metadata === "object" &&
      !Array.isArray(interaction.metadata)
        ? (interaction.metadata as Record<string, unknown>).deletedAt
        : null;
    if (typeof deletedAt === "string" && deletedAt.length > 0) {
      throw new Error("SalesOS: interaction not found on deal");
    }
    return interaction;
  }

  const interactions = await prisma.salesInteraction.findMany({
    where: { dealId, organizationId },
    select: {
      id: true,
      type: true,
      subject: true,
      summary: true,
      occurredAt: true,
      metadata: true,
    },
    orderBy: { occurredAt: "desc" },
    take: 20,
  });

  for (const row of interactions) {
    const deletedAt =
      row.metadata &&
      typeof row.metadata === "object" &&
      !Array.isArray(row.metadata)
        ? (row.metadata as Record<string, unknown>).deletedAt
        : null;
    if (typeof deletedAt === "string" && deletedAt.length > 0) continue;
    return row;
  }

  throw new Error(
    "SalesOS: no interactions on deal — add a meeting or note before drafting follow-up",
  );
}

async function persistFollowUpDrafts(
  dealId: string,
  metadata: Record<string, unknown>,
  drafts: FollowUpDraft[],
  actor: SalesActor,
) {
  await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: mergeFollowUpDraftsIntoMetadata(
        metadata,
        drafts,
      ) as Prisma.InputJsonValue,
      updatedById: actor.id,
    },
  });
}

export async function listFollowUpDraftsForDeal(
  scope: SalesOrgScope,
  dealId: string,
): Promise<FollowUpDraft[]> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  return readFollowUpDrafts(deal.metadata);
}

export async function draftFollowUpStub(
  scope: SalesOrgScope,
  dealId: string,
  input: DraftFollowUpInput,
  actor: SalesActor,
): Promise<FollowUpDraft> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  const existingMeta = parseDealMetadata(deal.metadata);
  const drafts = readFollowUpDrafts(deal.metadata);
  const interaction = await resolveSourceInteraction(
    dealId,
    scope.organizationId,
    input.interactionId,
  );
  const { nextAction } = readDealNextAction(deal.metadata);

  const suggestedNextAction = buildSuggestedNextAction({
    interactionSubject: interaction.subject,
    interactionSummary: interaction.summary,
    interactionType: interaction.type,
    existingNextAction: nextAction,
  });

  const template = buildFollowUpTemplate({
    dealTitle: deal.title,
    interactionType: interaction.type,
    interactionSubject: interaction.subject,
    interactionSummary: interaction.summary,
    occurredAt: interaction.occurredAt,
    suggestedNextAction,
  });

  const now = new Date().toISOString();
  const draft: FollowUpDraft = {
    id: randomUUID(),
    subject: template.subject,
    body: template.body,
    suggestedNextAction,
    sourceInteractionId: interaction.id,
    sourceInteractionType: interaction.type,
    sourceInteractionSummary: interaction.summary,
    status: "draft",
    createdById: actor.id,
    createdByName: actor.name ?? null,
    createdAt: now,
    reviewedById: null,
    reviewedByName: null,
    reviewedAt: null,
    reviewNote: null,
  };

  await persistFollowUpDrafts(dealId, existingMeta, [draft, ...drafts], actor);

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.FOLLOWUP_DRAFTED,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: {
      draftId: draft.id,
      sourceInteractionId: draft.sourceInteractionId,
      suggestedNextAction: draft.suggestedNextAction,
    },
  });

  return draft;
}

export async function approveFollowUpDraft(
  scope: SalesOrgScope,
  dealId: string,
  draftId: string,
  actor: SalesActor,
  reviewNote?: string | null,
): Promise<{ draft: FollowUpDraft; nextAction: string }> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  const existingMeta = parseDealMetadata(deal.metadata);
  const drafts = readFollowUpDrafts(deal.metadata);
  const index = drafts.findIndex((d) => d.id === draftId);
  if (index < 0) {
    throw new Error("SalesOS: follow-up draft not found");
  }

  const current = drafts[index];
  if (current.status !== "draft") {
    throw new Error(
      "SalesOS: only draft follow-up messages can be approved",
    );
  }

  const now = new Date().toISOString();
  const updated: FollowUpDraft = {
    ...current,
    status: "approved",
    reviewedById: actor.id,
    reviewedByName: actor.name ?? null,
    reviewedAt: now,
    reviewNote: reviewNote?.trim() || null,
  };
  drafts[index] = updated;

  const nextMetadata = mergeDealNextActionMetadata(
    mergeFollowUpDraftsIntoMetadata(existingMeta, drafts),
    { nextAction: updated.suggestedNextAction },
  );

  await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: nextMetadata as Prisma.InputJsonValue,
      updatedById: actor.id,
    },
  });

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.DEAL_NEXT_ACTION_SET,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: {
      nextAction: updated.suggestedNextAction,
      nextActionAt: null,
      source: "follow_up_draft_approved",
      draftId: updated.id,
    },
  });

  return { draft: updated, nextAction: updated.suggestedNextAction };
}

export async function rejectFollowUpDraft(
  scope: SalesOrgScope,
  dealId: string,
  draftId: string,
  actor: SalesActor,
  reviewNote?: string | null,
): Promise<FollowUpDraft> {
  const deal = await loadDealWithMetadata(dealId, scope.organizationId);
  const existingMeta = parseDealMetadata(deal.metadata);
  const drafts = readFollowUpDrafts(deal.metadata);
  const index = drafts.findIndex((d) => d.id === draftId);
  if (index < 0) {
    throw new Error("SalesOS: follow-up draft not found");
  }

  const current = drafts[index];
  if (current.status !== "draft") {
    throw new Error(
      "SalesOS: only draft follow-up messages can be rejected",
    );
  }

  const now = new Date().toISOString();
  const updated: FollowUpDraft = {
    ...current,
    status: "rejected",
    reviewedById: actor.id,
    reviewedByName: actor.name ?? null,
    reviewedAt: now,
    reviewNote: reviewNote?.trim() || null,
  };
  drafts[index] = updated;
  await persistFollowUpDrafts(dealId, existingMeta, drafts, actor);

  return updated;
}

/** Governed follow-up: humans approve to copy nextAction only — no send API exists. */
export function assertNoFollowUpSend(): never {
  throw new Error(
    "SalesOS: follow-up send is not implemented — governed draft and approve-to-nextAction only",
  );
}

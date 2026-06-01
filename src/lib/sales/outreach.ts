import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  recordSalesAuditEvent,
  SalesAuditActions,
} from "./audit-events";
import type { SalesActor, SalesOrgScope } from "./services";

export type OutreachDraftStatus =
  | "draft"
  | "pending_review"
  | "approved"
  | "rejected";

export type OutreachChannel = "email" | "linkedin" | "other";

export interface OutreachDraft {
  id: string;
  subject: string;
  body: string;
  channel: OutreachChannel | null;
  status: OutreachDraftStatus;
  createdById: string;
  createdByName: string | null;
  createdAt: string;
  submittedAt: string | null;
  reviewedById: string | null;
  reviewedByName: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
}

export interface OutreachDraftQueueItem extends OutreachDraft {
  dealId: string;
  dealTitle: string;
  accountId: string;
  accountName: string;
}

export interface CreateOutreachDraftInput {
  subject: string;
  body: string;
  channel?: string | null;
  submitForReview?: boolean;
}

export interface ReviewOutreachDraftInput {
  decision: "approved" | "rejected";
  reviewNote?: string | null;
}

const OUTREACH_CHANNELS: OutreachChannel[] = ["email", "linkedin", "other"];

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

function normalizeChannel(value?: string | null): OutreachChannel | null {
  if (!value?.trim()) return null;
  const normalized = value.trim().toLowerCase();
  if (!OUTREACH_CHANNELS.includes(normalized as OutreachChannel)) {
    throw new Error(
      `SalesOS validation: outreach channel must be one of ${OUTREACH_CHANNELS.join(", ")}`,
    );
  }
  return normalized as OutreachChannel;
}

function normalizeDraftRow(value: unknown): OutreachDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  const row = value as Record<string, unknown>;
  const status = row.status;
  if (
    status !== "draft" &&
    status !== "pending_review" &&
    status !== "approved" &&
    status !== "rejected"
  ) {
    return null;
  }
  if (typeof row.id !== "string" || !row.id.trim()) return null;
  if (typeof row.subject !== "string" || !row.subject.trim()) return null;
  if (typeof row.body !== "string" || !row.body.trim()) return null;
  if (typeof row.createdById !== "string" || !row.createdById.trim()) {
    return null;
  }
  if (typeof row.createdAt !== "string" || !row.createdAt) return null;

  const channel = row.channel;
  const parsedChannel =
    channel === null || channel === undefined
      ? null
      : typeof channel === "string" &&
          OUTREACH_CHANNELS.includes(channel as OutreachChannel)
        ? (channel as OutreachChannel)
        : null;

  return {
    id: row.id.trim(),
    subject: row.subject.trim(),
    body: row.body.trim(),
    channel: parsedChannel,
    status,
    createdById: row.createdById.trim(),
    createdByName:
      typeof row.createdByName === "string" ? row.createdByName : null,
    createdAt: row.createdAt,
    submittedAt:
      typeof row.submittedAt === "string" && row.submittedAt
        ? row.submittedAt
        : null,
    reviewedById:
      typeof row.reviewedById === "string" ? row.reviewedById : null,
    reviewedByName:
      typeof row.reviewedByName === "string" ? row.reviewedByName : null,
    reviewedAt:
      typeof row.reviewedAt === "string" && row.reviewedAt
        ? row.reviewedAt
        : null,
    reviewNote: typeof row.reviewNote === "string" ? row.reviewNote : null,
  };
}

export function readOutreachDrafts(metadata: unknown): OutreachDraft[] {
  const parsed = parseMetadata(metadata);
  const raw = parsed.outreachDrafts;
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => normalizeDraftRow(item))
    .filter((item): item is OutreachDraft => item !== null)
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
}

function mergeOutreachDraftsMetadata(
  existing: Record<string, unknown>,
  drafts: OutreachDraft[],
): Record<string, unknown> {
  return {
    ...existing,
    outreachDrafts: drafts,
  };
}

function validateCreateOutreachDraftInput(
  input: CreateOutreachDraftInput,
): CreateOutreachDraftInput {
  const subject = input.subject?.trim();
  const body = input.body?.trim();
  if (!subject) {
    throw new Error("SalesOS validation: outreach subject is required");
  }
  if (!body) {
    throw new Error("SalesOS validation: outreach body is required");
  }
  return {
    subject,
    body,
    channel: normalizeChannel(input.channel),
    submitForReview: input.submitForReview === true,
  };
}

function validateReviewOutreachDraftInput(
  input: ReviewOutreachDraftInput,
): ReviewOutreachDraftInput {
  if (input.decision !== "approved" && input.decision !== "rejected") {
    throw new Error(
      "SalesOS validation: outreach review decision must be approved or rejected",
    );
  }
  const reviewNote = input.reviewNote?.trim() || null;
  return {
    decision: input.decision,
    reviewNote,
  };
}

async function assertDealInOrg(dealId: string, organizationId: string) {
  const deal = await prisma.salesDeal.findFirst({
    where: { id: dealId, organizationId },
    select: { id: true, title: true, metadata: true },
  });
  if (!deal) {
    throw new Error("SalesOS: deal not found in organization");
  }
  return deal;
}

async function persistOutreachDrafts(
  dealId: string,
  organizationId: string,
  existingMetadata: unknown,
  drafts: OutreachDraft[],
  actor: SalesActor,
) {
  const metadata = mergeOutreachDraftsMetadata(
    parseMetadata(existingMetadata),
    drafts,
  );

  await prisma.salesDeal.update({
    where: { id: dealId },
    data: {
      metadata: metadata as Prisma.InputJsonValue,
      updatedById: actor.id,
    },
  });
}

export async function createOutreachDraft(
  scope: SalesOrgScope,
  dealId: string,
  input: CreateOutreachDraftInput,
  actor: SalesActor,
): Promise<OutreachDraft> {
  const validated = validateCreateOutreachDraftInput(input);
  const deal = await assertDealInOrg(dealId, scope.organizationId);
  const now = new Date().toISOString();
  const status: OutreachDraftStatus = validated.submitForReview
    ? "pending_review"
    : "draft";

  const draft: OutreachDraft = {
    id: randomUUID(),
    subject: validated.subject,
    body: validated.body,
    channel: validated.channel ?? null,
    status,
    createdById: actor.id,
    createdByName: actor.name ?? null,
    createdAt: now,
    submittedAt: validated.submitForReview ? now : null,
    reviewedById: null,
    reviewedByName: null,
    reviewedAt: null,
    reviewNote: null,
  };

  const drafts = [draft, ...readOutreachDrafts(deal.metadata)];
  await persistOutreachDrafts(
    dealId,
    scope.organizationId,
    deal.metadata,
    drafts,
    actor,
  );

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.OUTREACH_DRAFT_CREATED,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: {
      draftId: draft.id,
      subject: draft.subject,
      status: draft.status,
      channel: draft.channel,
    },
  });

  return draft;
}

export async function submitOutreachDraftForReview(
  scope: SalesOrgScope,
  dealId: string,
  draftId: string,
  actor: SalesActor,
): Promise<OutreachDraft> {
  const deal = await assertDealInOrg(dealId, scope.organizationId);
  const drafts = readOutreachDrafts(deal.metadata);
  const index = drafts.findIndex((d) => d.id === draftId);
  if (index === -1) {
    throw new Error("SalesOS: outreach draft not found");
  }

  const existing = drafts[index];
  if (existing.status !== "draft") {
    throw new Error(
      "SalesOS validation: only draft outreach can be submitted for review",
    );
  }

  const now = new Date().toISOString();
  const updated: OutreachDraft = {
    ...existing,
    status: "pending_review",
    submittedAt: now,
  };
  drafts[index] = updated;

  await persistOutreachDrafts(
    dealId,
    scope.organizationId,
    deal.metadata,
    drafts,
    actor,
  );

  return updated;
}

export async function reviewOutreachDraft(
  scope: SalesOrgScope,
  dealId: string,
  draftId: string,
  input: ReviewOutreachDraftInput,
  actor: SalesActor,
): Promise<OutreachDraft> {
  const validated = validateReviewOutreachDraftInput(input);
  const deal = await assertDealInOrg(dealId, scope.organizationId);
  const drafts = readOutreachDrafts(deal.metadata);
  const index = drafts.findIndex((d) => d.id === draftId);
  if (index === -1) {
    throw new Error("SalesOS: outreach draft not found");
  }

  const existing = drafts[index];
  if (existing.status !== "pending_review") {
    throw new Error(
      "SalesOS validation: only pending_review outreach can be reviewed",
    );
  }

  const now = new Date().toISOString();
  const updated: OutreachDraft = {
    ...existing,
    status: validated.decision,
    reviewedById: actor.id,
    reviewedByName: actor.name ?? null,
    reviewedAt: now,
    reviewNote: validated.reviewNote,
  };
  drafts[index] = updated;

  await persistOutreachDrafts(
    dealId,
    scope.organizationId,
    deal.metadata,
    drafts,
    actor,
  );

  await recordSalesAuditEvent({
    organizationId: scope.organizationId,
    platformOrganizationId: scope.platformOrganizationId,
    actorId: actor.id,
    actorName: actor.name,
    action: SalesAuditActions.OUTREACH_REVIEWED,
    targetType: "SalesDeal",
    targetId: dealId,
    metadata: {
      draftId: updated.id,
      decision: validated.decision,
      reviewNote: validated.reviewNote,
      subject: updated.subject,
    },
  });

  return updated;
}

export async function listDraftsForDeal(
  scope: SalesOrgScope,
  dealId: string,
): Promise<OutreachDraft[]> {
  const deal = await assertDealInOrg(dealId, scope.organizationId);
  return readOutreachDrafts(deal.metadata);
}

export async function listPendingReviewDrafts(
  scope: SalesOrgScope,
): Promise<OutreachDraftQueueItem[]> {
  const deals = await prisma.salesDeal.findMany({
    where: { organizationId: scope.organizationId },
    select: {
      id: true,
      title: true,
      metadata: true,
      account: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const queue: OutreachDraftQueueItem[] = [];
  for (const deal of deals) {
    for (const draft of readOutreachDrafts(deal.metadata)) {
      if (draft.status !== "pending_review") continue;
      queue.push({
        ...draft,
        dealId: deal.id,
        dealTitle: deal.title,
        accountId: deal.account.id,
        accountName: deal.account.name,
      });
    }
  }

  return queue.sort(
    (a, b) =>
      new Date(a.submittedAt ?? a.createdAt).getTime() -
      new Date(b.submittedAt ?? b.createdAt).getTime(),
  );
}

/** Legacy alias — accepts org id string or SalesOrgScope. */
export async function listPendingReviewOutreachDrafts(
  organizationIdOrScope: string | SalesOrgScope,
): Promise<OutreachDraftQueueItem[]> {
  const scope =
    typeof organizationIdOrScope === "string"
      ? { organizationId: organizationIdOrScope, platformOrganizationId: null }
      : organizationIdOrScope;
  return listPendingReviewDrafts(scope);
}

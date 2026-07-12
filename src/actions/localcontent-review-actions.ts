// ─── LocalContentOS — Review Center Server Actions ───
// Unified queue for approvals/rejections across all AI outputs.
// P0: Every action is audit-trailed. P0: No autonomous decisions.

"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getLcAuditEvents(organizationId: string) {
  const user = await getCurrentUser();
  if (user.organizationId !== organizationId) {
    throw new Error("Access denied");
  }

  const [auditEventCount, recentAuditEvents] = await Promise.all([
    prisma.lcAiAuditEvent.count({ where: { organizationId } }),
    prisma.lcAiAuditEvent.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
  ]);

  return {
    auditEventCount,
    recentAuditEvents: recentAuditEvents.map((e) => ({
      id: e.id,
      action: e.action,
      status: e.status,
      confidence: e.confidence ?? undefined,
      durationMs: e.durationMs,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}
import {
  reviewPatternSuggestion,
  reviewFalsePositive,
} from "@/lib/local-content/workbook/ai-advisor";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";
import {
  requireOrganizationAccess,
  requirePatternSuggestionAccess,
  requireMatchReviewAccess,
} from "@/actions/localcontent-guards";
import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";

// ─── Types ───

export interface ReviewQueueItem {
  id: string;
  type: "explanation" | "suggestion" | "false_positive";
  workbookLineCode: string;
  title: string;
  detail: string;
  confidence: number;
  riskLevel?: string;
  status: string;
  createdAt: Date;
  source: string;
}

export interface ReviewQueue {
  total: number;
  items: ReviewQueueItem[];
  counts: {
    explanations: number;
    suggestions: number;
    falsePositives: number;
  };
  stats: {
    totalMemoryRecords: number;
    totalHealthRecords: number;
    totalReviewRuns: number;
    lastReviewRun: string | null;
  };
}

// ─── Queue Query ───

export async function getReviewQueueAction(
  organizationId: string,
  type?: "explanation" | "suggestion" | "false_positive",
): Promise<ReviewQueue> {
  await requireOrganizationAccess(organizationId);
  await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);

  const [explanations, suggestions, falsePositives, memCount, healthCount, runs] =
    await Promise.all([
      prisma.lcMatchReview.findMany({
        where: {
          organizationId,
          ...(type === "false_positive" || type === "explanation"
            ? { status: "pending" }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.lcPatternSuggestion.findMany({
        where: {
          organizationId,
          ...(type === "suggestion" ? { status: "pending" } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.lcMatchReview.findMany({
        where: {
          organizationId,
          ...(type === "false_positive" ? { isFalsePositive: true, status: "pending" } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 200,
      }),
      prisma.lcOrganizationMatchMemory.count({ where: { organizationId } }),
      prisma.lcPatternHealthRecord.count({ where: { organizationId } }),
      prisma.lcAiReviewRun.findMany({
        where: { organizationId },
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { createdAt: true },
      }),
    ]);

  const items: ReviewQueueItem[] = [];

  // Add explanations (pending reviews)
  for (const e of explanations) {
    items.push({
      id: e.id,
      type: e.isFalsePositive ? "false_positive" : "explanation",
      workbookLineCode: e.workbookLineCode,
      title: `${e.accountCode} — ${e.accountName}`,
      detail: `Risk: ${e.riskLevel} | Pattern: ${e.patternUsed || "N/A"}`,
      confidence: e.confidence,
      riskLevel: e.riskLevel,
      status: e.status,
      createdAt: e.createdAt,
      source: e.matchType,
    });
  }

  // Add suggestions
  for (const s of suggestions) {
    items.push({
      id: s.id,
      type: "suggestion",
      workbookLineCode: s.workbookLineCode,
      title: `Pattern suggestion for ${s.workbookLineCode}`,
      detail: `Current: ${(s.currentPattern || "").substring(0, 60)} → Suggested: ${(s.suggestedPattern || "").substring(0, 60)}`,
      confidence: s.confidence,
      status: s.status,
      createdAt: s.createdAt,
      source: s.source,
    });
  }

  items.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return {
    total: items.length,
    items,
    counts: {
      explanations: explanations.filter((e) => !e.isFalsePositive).length,
      suggestions: suggestions.length,
      falsePositives: falsePositives.length,
    },
    stats: {
      totalMemoryRecords: memCount,
      totalHealthRecords: healthCount,
      totalReviewRuns: runs.length,
      lastReviewRun: runs[0]?.createdAt.toISOString() ?? null,
    },
  };
}

// ─── Review Pattern Suggestion ───

export async function reviewSuggestionAction(
  suggestionId: string,
  decision: "approved" | "rejected",
  reviewNotes: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const orgId = await requirePatternSuggestionAccess(suggestionId);
    await requirePermission(Permission.AI_REVIEW, ResourceType.PATTERN_SUGGESTION);

    const result = await reviewPatternSuggestion(
      orgId,
      suggestionId,
      decision,
      reviewNotes,
      user.id,
    );
    if (!result.success) return { success: false, error: result.error };

    revalidatePath("/local-content/review-center");
    revalidatePath("/local-content/ai-advisor");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Review Match Explanation / False Positive ───

export async function reviewExplanationAction(
  matchReviewId: string,
  decision: "confirmed" | "rejected",
  reviewNotes: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    const orgId = await requireMatchReviewAccess(matchReviewId);
    await requirePermission(Permission.AI_REVIEW, ResourceType.PATTERN_SUGGESTION);

    const result = await reviewFalsePositive(
      orgId,
      matchReviewId,
      decision,
      reviewNotes,
      user.id,
    );
    if (!result.success) return { success: false, error: result.error };

    revalidatePath("/local-content/review-center");
    revalidatePath("/local-content/ai-advisor");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Override (set pattern without AI) ───

export async function createPatternOverrideAction(
  organizationId: string,
  workbookLineCode: string,
  currentPattern: string,
  suggestedPattern: string,
  reasoning: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };
  if (organizationId !== user.organizationId) {
    return { success: false, error: "Access denied: organization mismatch" };
  }
  await requirePermission(Permission.REVIEW_OVERRIDE, ResourceType.REVIEW);

  try {
    await prisma.lcPatternSuggestion.create({
      data: {
        organizationId,
        workbookLineCode,
        currentPattern,
        suggestedPattern,
        reasoning,
        confidence: 100,
        status: "approved",
        source: "manual",
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewNotes: "Manual override — pattern set by reviewer",
      },
    });

    await createAiAuditEvent({
      organizationId,
      action: AuditActions.AI_PATTERN_OVERRIDE,
      actorId: user.id,
      providerId: "manual",
      status: "success",
      inputSummary: { workbookLineCode, currentPattern, suggestedPattern },
      metadata: { reason: reasoning },
    }).catch(() => {});

    revalidatePath("/local-content/review-center");
    revalidatePath("/local-content/ai-advisor");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

// ─── Batch Review ───

export async function batchReviewAction(
  type: "suggestion" | "explanation" | "false_positive",
  ids: string[],
  decision: "approved" | "rejected" | "confirmed",
  reviewNotes: string,
): Promise<{ success: boolean; processed: number; errors: number; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, processed: 0, errors: 1, error: "Not authenticated" };
  await requirePermission(Permission.REVIEW_APPROVAL, ResourceType.REVIEW);

  let processed = 0;
  let errors = 0;

  for (const id of ids) {
    try {
      if (type === "suggestion") {
        const pOrgId = await requirePatternSuggestionAccess(id);
        const d = decision as "approved" | "rejected";
        const result = await reviewPatternSuggestion(pOrgId, id, d, reviewNotes, user.id);
        if (result.success) processed++;
        else errors++;
      } else {
        const mOrgId = await requireMatchReviewAccess(id);
        const d = decision as "confirmed" | "rejected";
        const result = await reviewFalsePositive(mOrgId, id, d, reviewNotes, user.id);
        if (result.success) processed++;
        else errors++;
      }
    } catch {
      errors++;
    }
  }

  revalidatePath("/local-content/review-center");
  revalidatePath("/local-content/ai-advisor");
  return { success: errors === 0, processed, errors };
}

// ─── Add Comment ───

export async function addReviewCommentAction(
  type: "suggestion" | "explanation",
  id: string,
  comment: string,
): Promise<{ success: boolean; error?: string }> {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Not authenticated" };

  try {
    if (type === "suggestion") {
      const existing = await prisma.lcPatternSuggestion.findFirst({
        where: { id, organizationId: user.organizationId },
      });
      if (!existing) return { success: false, error: "Not found" };
      await requirePermission(Permission.REVIEW_MANAGEMENT, ResourceType.REVIEW);
      const existingNotes = existing.reviewNotes || "";
      await prisma.lcPatternSuggestion.update({
        where: { id },
        data: {
          reviewNotes: existingNotes
            ? `${existingNotes}\n[${user.email}]: ${comment}`
            : `[${user.email}]: ${comment}`,
        },
      });
    } else {
      const existing = await prisma.lcMatchReview.findFirst({
        where: { id, organizationId: user.organizationId },
      });
      if (!existing) return { success: false, error: "Not found" };
      const existingNotes = existing.reviewNotes || "";
      await prisma.lcMatchReview.update({
        where: { id },
        data: {
          reviewNotes: existingNotes
            ? `${existingNotes}\n[${user.email}]: ${comment}`
            : `[${user.email}]: ${comment}`,
        },
      });
    }

    revalidatePath("/local-content/review-center");
    return { success: true };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}

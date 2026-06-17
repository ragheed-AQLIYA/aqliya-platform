// ─── AI Governance Dashboard Actions ───
// Aggregates AI audit events across all products for centralized governance visibility.
// P0: Read-only queries, no mutations.

"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface AiGovernanceStats {
  // LocalContentOS AI events
  lcTotalEvents: number;
  lcSuccessCount: number;
  lcFailedCount: number;
  lcPartialCount: number;
  lcAvgConfidence: number | null;
  lcAvgDurationMs: number | null;
  lcActionsBreakdown: Array<{ action: string; count: number }>;
  lcWarningsTotal: number;

  // Platform AI audit logs
  platformAiActions: number;

  // Combined recent events
  recentEvents: Array<{
    id: string;
    source: "localcontent" | "platform";
    action: string;
    status: string;
    confidence: number | null;
    durationMs: number;
    providerId: string | null;
    modelVersion: string | null;
    createdAt: string;
  }>;

  // Overall stats
  totalAiActions: number;
  totalWarnings: number;
  totalAiModels: number;
  uniqueProviders: string[];
}

// ─── Action ───

export async function getAiGovernanceStatsAction(): Promise<{
  ok: boolean;
  data?: AiGovernanceStats;
  error?: string;
}> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: "Not authenticated" };

    const orgId = user.organizationId;

    // ─── LocalContentOS AI Audit Events ───
    const lcEvents = await prisma.lcAiAuditEvent.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const lcTotalEvents = lcEvents.length;
    const lcSuccessCount = lcEvents.filter((e) => e.status === "success").length;
    const lcFailedCount = lcEvents.filter((e) => e.status === "failed").length;
    const lcPartialCount = lcEvents.filter((e) => e.status === "partial").length;

    const confidences = lcEvents.filter((e) => e.confidence !== null).map((e) => e.confidence!);
    const lcAvgConfidence =
      confidences.length > 0
        ? Math.round(confidences.reduce((a, b) => a + b, 0) / confidences.length)
        : null;

    const durations = lcEvents.filter((e) => e.durationMs > 0).map((e) => e.durationMs);
    const lcAvgDurationMs =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : null;

    const lcWarningsTotal = lcEvents.reduce((s, e) => s + e.warningCount, 0);

    // Action breakdown
    const actionMap = new Map<string, number>();
    for (const e of lcEvents) {
      actionMap.set(e.action, (actionMap.get(e.action) ?? 0) + 1);
    }
    const lcActionsBreakdown = Array.from(actionMap.entries())
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count);

    // ─── Platform AI Audit Logs ───
    const platformAiLogs = await prisma.platformAuditLog.findMany({
      where: {
        platformOrganizationId: orgId,
        NOT: { aiProvider: null },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const platformAiActions = platformAiLogs.length;

    // ─── Combined Recent Events ───
    const recentLc = lcEvents.slice(0, 15).map((e) => ({
      id: e.id,
      source: "localcontent" as const,
      action: e.action,
      status: e.status,
      confidence: e.confidence,
      durationMs: e.durationMs,
      providerId: e.providerId,
      modelVersion: e.modelVersion,
      createdAt: e.createdAt.toISOString(),
    }));

    const recentPlatform = platformAiLogs.slice(0, 10).map((e) => ({
      id: e.id,
      source: "platform" as const,
      action: e.action,
      status: e.status,
      confidence: null,
      durationMs: 0,
      providerId: e.aiProvider,
      modelVersion: e.aiModel,
      createdAt: e.createdAt.toISOString(),
    }));

    const recentEvents = [...recentLc, ...recentPlatform]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 20);

    // ─── Unique Providers / Models ───
    const providers = new Set<string>();
    const models = new Set<string>();
    for (const e of lcEvents) {
      if (e.providerId) providers.add(e.providerId);
      if (e.modelVersion) models.add(e.modelVersion);
    }
    for (const e of platformAiLogs) {
      if (e.aiProvider) providers.add(e.aiProvider);
      if (e.aiModel) models.add(e.aiModel);
    }

    return {
      ok: true,
      data: {
        lcTotalEvents,
        lcSuccessCount,
        lcFailedCount,
        lcPartialCount,
        lcAvgConfidence,
        lcAvgDurationMs,
        lcActionsBreakdown,
        lcWarningsTotal,
        platformAiActions,
        recentEvents,
        totalAiActions: lcTotalEvents + platformAiActions,
        totalWarnings: lcWarningsTotal,
        totalAiModels: models.size,
        uniqueProviders: Array.from(providers),
      },
    };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to load AI governance stats",
    };
  }
}

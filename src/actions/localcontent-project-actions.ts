"use server";

import { getCurrentUser } from "@/lib/auth";
import {
  listProjectsByOrganization,
  getProjectById,
  createProject,
  updateProjectStatus,
  updateVerificationChecklistItem,
  calculateProjectScore,
  listAuditEvents,
  getOrganizationSpendAnalytics,
  getOrganizationClassificationRules,
  getProjectTenderMatchReport,
  getProjectVerificationChecklistReport,
} from "@/lib/local-content/services";
import { assertProjectAccess } from "@/lib/local-content/guards";
import {
  extractLocalContentSignalsFromEngagement,
  summarizeLocalContentSignals,
  estimateLocalContentPercent,
} from "@/lib/local-content-intelligence";
import { resolveAuditEngagementIdForLcProject } from "@/lib/local-content-intelligence/audit-engagement-bridge";
import { parseOrError } from "@/lib/local-content/schemas/common";
import {
  createProjectSchema,
  updateVerificationItemSchema,
} from "@/lib/local-content/schemas/project";
import {
  requirePermission,
  requireRole,
  Permission,
  ResourceType,
  PlatformRole,
} from "@/actions/localcontent-rbac";
import { type ActionResult } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import {
  safe,
  logToPlatform,
  revalidateLocalContentPaths,
} from "@/actions/localcontent-shared";

// ─── Project Actions ───

export async function listLocalContentProjectsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof listProjectsByOrganization>>>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.PROJECT_MANAGEMENT, ResourceType.PROJECT);
    return listProjectsByOrganization(user.organizationId);
  });
}

export async function getLocalContentSpendAnalyticsAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getOrganizationSpendAnalytics>>>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    return getOrganizationSpendAnalytics(user.organizationId);
  });
}

export async function getLocalContentClassificationRulesAction(): Promise<
  ActionResult<Awaited<ReturnType<typeof getOrganizationClassificationRules>>>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.CLASSIFICATION_MANAGEMENT, ResourceType.CLASSIFICATION_RULE);
    return getOrganizationClassificationRules(user.organizationId);
  });
}

export async function getLocalContentTenderMatchAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectTenderMatchReport>>>
> {
  return safe(async () => {
    const _user = await getCurrentUser();
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    return getProjectTenderMatchReport(projectId);
  });
}

export async function getLocalContentVerificationChecklistAction(
  projectId: string,
): Promise<
  ActionResult<Awaited<ReturnType<typeof getProjectVerificationChecklistReport>>>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);
    return getProjectVerificationChecklistReport(projectId);
  });
}

export async function getLocalContentTbSignalsAction(projectId: string): Promise<
  ActionResult<{
    engagementId: string;
    signalCount: number;
    totalAmount: number;
    estimatedLocalContentPct: number;
    byCategory: Record<string, { count: number; amount: number }>;
    mappingUrl: string;
  } | null>
> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    const engagementId = await resolveAuditEngagementIdForLcProject(projectId);
    if (!engagementId) return null;

    const signals = await extractLocalContentSignalsFromEngagement(engagementId);
    const summary = summarizeLocalContentSignals(signals);

    return {
      engagementId,
      signalCount: signals.length,
      totalAmount: summary.totalAmount,
      estimatedLocalContentPct: estimateLocalContentPercent(signals),
      byCategory: summary.byCategory,
      mappingUrl: `/audit/engagements/${engagementId}/mapping`,
    };
  });
}

export async function updateLocalContentVerificationItemAction(
  projectId: string,
  itemId: string,
  formData: FormData,
): Promise<ActionResult<{ itemId: string; scale: string }>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(updateVerificationItemSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { scale, workingPaperRef } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    await requirePermission(Permission.FINDING_MANAGEMENT, ResourceType.FINDING);

    await updateVerificationChecklistItem(
      projectId,
      itemId,
      { scale, workingPaperRef: workingPaperRef || undefined },
      { id: user.id, name: user.name ?? user.email ?? "User" },
    );

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.verification.updated",
      targetType: "LocalContentProject",
      targetId: projectId,
      metadata: { itemId, scale },
    });

    revalidateLocalContentPaths(projectId, ["verification"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return { itemId, scale };
  });
}

export async function getLocalContentProjectAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof getProjectById>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.PROJECT_MANAGEMENT, ResourceType.PROJECT);
    return getProjectById(projectId);
  });
}

export async function createLocalContentProjectAction(
  formData: FormData,
): Promise<ActionResult<Awaited<ReturnType<typeof createProject>>>> {
  const raw = Object.fromEntries(formData);
  const parsed = parseOrError(createProjectSchema, raw);
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { name, reportingPeriod, scopeDescription } = parsed.data;

  return safe(async () => {
    const user = await getCurrentUser();
    await requireRole(PlatformRole.ORG_ADMIN);

    const project = await createProject({
      organizationId: user.organizationId,
      name,
      reportingPeriod,
      scopeDescription: scopeDescription || undefined,
      platformOrganizationId: user.platformOrganizationId,
      createdById: user.id,
      createdByName: user.name,
    });

    await logToPlatform({
      projectId: project.id,
      user,
      action: "localcontent.project.created",
      targetType: "LocalContentProject",
      targetId: project.id,
      metadata: {
        name: project.name,
        reportingPeriod: project.reportingPeriod,
      },
    });

    revalidateLocalContentPaths(project.id);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return project;
  });
}

export async function updateLocalContentProjectAction(
  projectId: string,
  status: string,
): Promise<ActionResult<Awaited<ReturnType<typeof updateProjectStatus>>>> {
  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "admin");
    await requirePermission(Permission.PROJECT_MANAGEMENT, ResourceType.PROJECT);
    const project = await updateProjectStatus(projectId, status, {
      id: user.id,
      name: user.name,
    });
    await logToPlatform({
      projectId,
      user,
      action: "localcontent.project.updated",
      targetType: "LocalContentProject",
      targetId: projectId,
      metadata: { newStatus: status },
    });
    revalidateLocalContentPaths(projectId, [
      "review",
      "approval",
      "audit-trail",
    ]);
    return project;
  });
}

// ─── Scoring Action ───

export async function getLocalContentScoreAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof calculateProjectScore>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    return calculateProjectScore(projectId);
  });
}

// ─── Audit Events Action ───

export async function listLocalContentAuditEventsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listAuditEvents>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "review");
    await requirePermission(Permission.AUDIT_LOG_ACCESS, ResourceType.AUDIT_LOG);
    return listAuditEvents(projectId);
  });
}

/** @deprecated Prefer revalidateLocalContentPaths — kept for existing callers */
export async function revalidateLocalContentProject(projectId: string) {
  revalidateLocalContentPaths(projectId);
}

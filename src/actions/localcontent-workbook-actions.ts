"use server";

import { createLogger } from "@/lib/observability/logger";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import {
  requireProjectAccess,
  requireWorkbookAccess,
  requireWorkbookLineAccess,
  requireDataRequestAccess,
  requireDataRequestItemAccess,
} from "./localcontent-guards";

import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";
import {
  createWorkbookSchema,
  populateWorkbookSchema,
} from "@/lib/local-content/schemas/workbook";

// ─── Workbook Engine Actions ───

import {
  populateWorkbookFromProject,
  populateWorkbookFromTb,
  recalculateWorkbookStats,
  getWorkbookWithLines,
  updateWorkbookLineValue,
  listProjectWorkbooks,
  listOrganizationWorkbooks,
  deleteWorkbook,
} from "@/lib/local-content/workbook/population";
import type { TbLine } from "@/lib/local-content/workbook/types";
import {
  detectMissingData,
  generateDataRequest,
  getWorkbookDataRequests,
  fulfillDataRequestItem,
  waiveDataRequestItem,
  sendDataRequest,
  getClientDataRequestText,
} from "@/lib/local-content/workbook/missing-data";
import {
  getWorkbookDashboardSummary,
  createWorkbook,
  exportWorkbookJson,
  markWorkbookExported,
} from "@/lib/local-content/workbook/services";
import { computeLcScore } from "@/lib/local-content/workbook/scoring";
import { parseOrError } from "@/lib/local-content/schemas/common";
import { populateWorkbookFromTbSchema } from "@/lib/local-content/schemas/workbook";
import { auditLogger, Product } from "@/lib/platform/audit-logger";


const logger = createLogger({ product: "platform", action: "unknown" });

// ─── Result type ───

type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; code?: string };

async function safe<T>(fn: () => Promise<T>): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (process.env.NODE_ENV !== "test") {
      logger.error("[Workbook Action]", error instanceof Error ? error : undefined);
    }
    return { ok: false, error: message };
  }
}

// ─── Workbook CRUD ───

export async function createWorkbookAction(
  projectId: string,
  title: string,
) {
  const parsed = parseOrError(createWorkbookSchema, { projectId, title });
  if (!parsed.success) return parsed;
  const organizationId = await requireProjectAccess(parsed.data.projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  {
    const user = await getCurrentUser();
    await enforce(user, { type: "project", id: parsed.data.projectId, tenantId: organizationId }, "create");
  }
  const result = await safe(() => createWorkbook(parsed.data.projectId, organizationId, parsed.data.title));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.created", { type: "LcWorkbook", id: parsed.data.projectId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  return result;
}

export async function populateWorkbookAction(
  projectId: string,
  title?: string,
) {
  const parsed = parseOrError(populateWorkbookSchema, { projectId, title });
  if (!parsed.success) return parsed;
  const organizationId = await requireProjectAccess(parsed.data.projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  {
    const user = await getCurrentUser();
    await enforce(user, { type: "project", id: parsed.data.projectId, tenantId: organizationId }, "update");
  }
  const result = await safe(() => populateWorkbookFromProject(parsed.data.projectId, organizationId, parsed.data.title));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.populated", { type: "LcWorkbook", id: parsed.data.projectId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath(`/local-content/projects/${parsed.data.projectId}`);
  revalidatePath("/local-content/workbook");
  return result;
}

export async function populateWorkbookFromTbAction(
  projectId: string,
  tbLines: TbLine[],
  title?: string,
) {
  const organizationId = await requireProjectAccess(projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const parsed = parseOrError(populateWorkbookFromTbSchema, { projectId, tbLines, title });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { tbLines: validatedLines, title: validatedTitle } = parsed.data;

  const result = await safe(() =>
    populateWorkbookFromTb(projectId, organizationId, validatedLines, validatedTitle),
  );
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.populated_from_tb", { type: "LcWorkbook", id: projectId }, { severity: "info", metadata: { lineCount: validatedLines.length } });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath(`/local-content/projects/${projectId}`);
  revalidatePath("/local-content/workbook");
  return result;
}

export async function getWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => getWorkbookWithLines(workbookId, organizationId));
}

export async function listProjectWorkbooksAction(projectId: string) {
  const organizationId = await requireProjectAccess(projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => listProjectWorkbooks(projectId, organizationId));
}

export async function listOrganizationWorkbooksAction() {
  return safe(async () => {
    const { organizationId } = await getCurrentUser();
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    return listOrganizationWorkbooks(organizationId);
  });
}

export async function updateWorkbookLineAction(
  lineId: string,
  manualValue: number,
  notes?: string,
) {
  const organizationId = await requireWorkbookLineAccess(lineId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  {
    const user = await getCurrentUser();
    await enforce(user, { type: "project", id: lineId, tenantId: organizationId }, "update");
  }
  const result = await safe(() =>
    updateWorkbookLineValue(lineId, organizationId, manualValue, notes),
  );
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.line.updated", { type: "LcWorkbookLine", id: lineId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function recalculateWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => recalculateWorkbookStats(workbookId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.recalculated", { type: "LcWorkbook", id: workbookId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function deleteWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  {
    const user = await getCurrentUser();
    await enforce(user, { type: "project", id: workbookId, tenantId: organizationId }, "delete");
  }
  const result = await safe(() => deleteWorkbook(workbookId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.deleted", { type: "LcWorkbook", id: workbookId }, { severity: "warning" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook");
  return result;
}

// ─── Dashboard ───

export async function getWorkbookDashboardAction() {
  return safe(async () => {
    const { organizationId } = await getCurrentUser();
    await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
    return getWorkbookDashboardSummary(organizationId);
  });
}

// ─── Missing Data ───

export async function detectMissingDataAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => detectMissingData(workbookId, organizationId));
}

export async function generateDataRequestAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => generateDataRequest(workbookId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.data_request.generated", { type: "LcWorkbook", id: workbookId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function getDataRequestsAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => getWorkbookDataRequests(workbookId, organizationId));
}

export async function fulfillDataRequestItemAction(
  itemId: string,
  responseValue: string,
) {
  const organizationId = await requireDataRequestItemAccess(itemId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() =>
    fulfillDataRequestItem(itemId, organizationId, responseValue),
  );
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.data_request.fulfilled", { type: "LcDataRequestItem", id: itemId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function waiveDataRequestItemAction(itemId: string) {
  const organizationId = await requireDataRequestItemAccess(itemId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => waiveDataRequestItem(itemId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.data_request.waived", { type: "LcDataRequestItem", id: itemId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function sendDataRequestAction(requestId: string) {
  const organizationId = await requireDataRequestAccess(requestId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => sendDataRequest(requestId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.data_request.sent", { type: "LcDataRequest", id: requestId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function getDataRequestTextAction(requestId: string) {
  const organizationId = await requireDataRequestAccess(requestId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => getClientDataRequestText(requestId, organizationId));
}

// ─── Export ───

export async function exportWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_EXPORT, ResourceType.WORKBOOK);
  return safe(async () => {
    const data = await exportWorkbookJson(workbookId, organizationId);
    return { ...data, _exportedAt: new Date().toISOString() };
  });
}

export async function markWorkbookExportedAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_EXPORT, ResourceType.WORKBOOK);
  const result = await safe(() => markWorkbookExported(workbookId, organizationId));
  if (result.ok) {
    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", organization: { platformOrganizationId: organizationId }, actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.exported", { type: "LcWorkbook", id: workbookId }, { severity: "info" });
    } catch { /* audit failure non-blocking */ }
  }
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function getWorkbookProjectOrgId(workbookId: string) {
  await requireWorkbookAccess(workbookId);
  const { prisma } = await import("@/lib/prisma");

  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    select: { projectId: true },
  });

  if (!workbook) return "";

  const project = await prisma.localContentProject.findUnique({
    where: { id: workbook.projectId },
    select: { organizationId: true },
  });

  return project?.organizationId ?? "";
}

// ─── Scoring ───

export async function computeWorkbookScoreAction(workbookId: string) {
  await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(async () => {
    const { prisma } = await import("@/lib/prisma");
    const lines = await prisma.lcWorkbookLine.findMany({
      where: { workbookId },
    });
    const result = computeLcScore(lines);

    await prisma.lcWorkbook.update({
      where: { id: workbookId },
      data: {
        lcScore: result.overallScore,
        lcScoreComputedAt: new Date(),
      },
    });

    try {
      const user = await getCurrentUser();
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", actor: { id: user.id, name: user.name, email: user.email } });
      await alog.record("localcontent.workbook.score_computed", { type: "LcWorkbook", id: workbookId }, { severity: "info", metadata: { score: result.overallScore } });
    } catch { /* audit failure non-blocking */ }

    return result;
  });
}

/**
 * Compute the LCGPA score for a workbook with full regulatory binding.
 *
 * Unlike computeWorkbookScoreAction (IKTVA-style weighted metrics), this action:
 * - Queries ACTIVE/SUPERSEDED regulatory datasets from the database
 * - Extracts LCGPA pillar inputs from workbook lines
 * - Resolves the regulatory binding BEFORE computing
 * - Persists the result with full provenance to LcCalculationRun
 *
 * The binding gate refuses to record when no dataset was in force or products
 * didn't resolve, unless an explicit BindingPolicy opts out.
 */
export async function computeLcgpaWorkbookScoreAction(
  workbookId: string,
  options?: {
    suppliers?: Array<{
      supplierId: string;
      name: string;
      spend: number;
      localityClassification: "local" | "non_local" | "mixed" | "unclassified";
      localContentPercentage?: number | null;
      sectorLcRate?: number;
    }>;
    totalGoodsServicesCost?: number;
    allowUnboundDataset?: boolean;
    allowIncompleteResolution?: boolean;
  },
) {
  await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(async () => {
    const { prisma } = await import("@/lib/prisma");
    const { computeLcgpaWorkbookScore } = await import(
      "@/lib/local-content/lcgpa/workbook-scoring-lcgpa"
    );

    // Resolve the project ID (needed for calculation run record)
    const workbook = await prisma.lcWorkbook.findUnique({
      where: { id: workbookId },
      select: { projectId: true },
    });
    if (!workbook) throw new Error("WORKBOOK_NOT_FOUND");

    // Get current user
    const user = await getCurrentUser();

    // Build ranked suppliers with rank assignment (descending spend)
    const suppliers = (options?.suppliers ?? [])
      .sort((a, b) => b.spend - a.spend)
      .map((s, i) => ({
        ...s,
        localContentPercentage: s.localContentPercentage ?? null,
        rank: i + 1,
      }));

    const result = await computeLcgpaWorkbookScore(prisma, {
      workbookId,
      projectId: workbook.projectId,
      suppliers,
      totalGoodsServicesCost: options?.totalGoodsServicesCost ?? 0,
      computedById: user?.id ?? null,
      policy: {
        ...(options?.allowUnboundDataset ? { allowUnboundDataset: true } : {}),
        ...(options?.allowIncompleteResolution ? { allowIncompleteResolution: true } : {}),
      },
    });

    try {
      const alog = auditLogger({ productKey: Product.LOCAL_CONTENT, sourceSystem: "localcontent", actor: { id: user?.id, name: user?.name, email: user?.email } });
      await alog.record(
        "localcontent.workbook.lcgpa_score_computed",
        { type: "LcWorkbook", id: workbookId },
        {
          severity: "info",
          metadata: {
            overallLcPct: result.overallLcPct,
            totalCosts: result.totalCosts,
            ruleVersion: result.ruleVersion,
            regulatoryDatasetVersion: result.regulatoryDatasetVersion,
            recordable: result.recordable,
          },
        },
      );
    } catch { /* audit failure non-blocking */ }

    return result;
  });
}

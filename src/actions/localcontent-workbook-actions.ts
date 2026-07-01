"use server";

import { revalidatePath } from "next/cache";
import { requireUserContext } from "@/lib/auth";
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
    console.error("[Workbook Action]", message);
    return { ok: false, error: message };
  }
}

// ─── Workbook CRUD ───

export async function createWorkbookAction(
  projectId: string,
  title: string,
) {
  const organizationId = await requireProjectAccess(projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  return safe(() => createWorkbook(projectId, organizationId, title));
}

export async function populateWorkbookAction(
  projectId: string,
  title?: string,
) {
  const organizationId = await requireProjectAccess(projectId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => populateWorkbookFromProject(projectId, organizationId, title));
  revalidatePath(`/local-content/projects/${projectId}`);
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
    const { organizationId } = await requireUserContext();
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
  const result = await safe(() =>
    updateWorkbookLineValue(lineId, organizationId, manualValue, notes),
  );
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function recalculateWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => recalculateWorkbookStats(workbookId, organizationId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function deleteWorkbookAction(workbookId: string) {
  const organizationId = await requireWorkbookAccess(workbookId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => deleteWorkbook(workbookId, organizationId));
  revalidatePath("/local-content/workbook");
  return result;
}

// ─── Dashboard ───

export async function getWorkbookDashboardAction() {
  return safe(async () => {
    const { organizationId } = await requireUserContext();
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
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function waiveDataRequestItemAction(itemId: string) {
  const organizationId = await requireDataRequestItemAccess(itemId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => waiveDataRequestItem(itemId, organizationId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function sendDataRequestAction(requestId: string) {
  const organizationId = await requireDataRequestAccess(requestId);
  await requirePermission(Permission.WORKBOOK_MANAGEMENT, ResourceType.WORKBOOK);
  const result = await safe(() => sendDataRequest(requestId, organizationId));
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
  revalidatePath("/local-content/workbook", "layout");
  return result;
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

    return result;
  });
}

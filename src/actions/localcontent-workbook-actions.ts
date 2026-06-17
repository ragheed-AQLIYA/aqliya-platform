"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUserContext } from "@/lib/auth";

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
  return safe(() => createWorkbook(projectId, title));
}

export async function populateWorkbookAction(
  projectId: string,
  title?: string,
) {
  const result = await safe(() => populateWorkbookFromProject(projectId, title));
  revalidatePath(`/local-content/projects/${projectId}`);
  revalidatePath("/local-content/workbook");
  return result;
}

export async function populateWorkbookFromTbAction(
  projectId: string,
  tbLines: TbLine[],
  title?: string,
) {
  const result = await safe(() =>
    populateWorkbookFromTb(projectId, tbLines, title),
  );
  revalidatePath(`/local-content/projects/${projectId}`);
  revalidatePath("/local-content/workbook");
  return result;
}

export async function getWorkbookAction(workbookId: string) {
  return safe(() => getWorkbookWithLines(workbookId));
}

export async function listProjectWorkbooksAction(projectId: string) {
  return safe(() => listProjectWorkbooks(projectId));
}

export async function listOrganizationWorkbooksAction() {
  return safe(async () => {
    const { organizationId } = await requireUserContext();
    return listOrganizationWorkbooks(organizationId);
  });
}

export async function updateWorkbookLineAction(
  lineId: string,
  manualValue: number,
  notes?: string,
) {
  const result = await safe(() =>
    updateWorkbookLineValue(lineId, manualValue, notes),
  );
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function recalculateWorkbookAction(workbookId: string) {
  const result = await safe(() => recalculateWorkbookStats(workbookId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function deleteWorkbookAction(workbookId: string) {
  const result = await safe(() => deleteWorkbook(workbookId));
  revalidatePath("/local-content/workbook");
  return result;
}

// ─── Dashboard ───

export async function getWorkbookDashboardAction() {
  return safe(async () => {
    const { organizationId } = await requireUserContext();
    return getWorkbookDashboardSummary(organizationId);
  });
}

// ─── Missing Data ───

export async function detectMissingDataAction(workbookId: string) {
  return safe(() => detectMissingData(workbookId));
}

export async function generateDataRequestAction(workbookId: string) {
  const result = await safe(() => generateDataRequest(workbookId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function getDataRequestsAction(workbookId: string) {
  return safe(() => getWorkbookDataRequests(workbookId));
}

export async function fulfillDataRequestItemAction(
  itemId: string,
  responseValue: string,
) {
  const result = await safe(() =>
    fulfillDataRequestItem(itemId, responseValue),
  );
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function waiveDataRequestItemAction(itemId: string) {
  const result = await safe(() => waiveDataRequestItem(itemId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function sendDataRequestAction(requestId: string) {
  const result = await safe(() => sendDataRequest(requestId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

export async function getDataRequestTextAction(requestId: string) {
  return safe(() => getClientDataRequestText(requestId));
}

// ─── Export ───

export async function exportWorkbookAction(workbookId: string) {
  return safe(async () => {
    const data = await exportWorkbookJson(workbookId);
    return { ...data, _exportedAt: new Date().toISOString() };
  });
}

export async function markWorkbookExportedAction(workbookId: string) {
  const result = await safe(() => markWorkbookExported(workbookId));
  revalidatePath("/local-content/workbook", "layout");
  return result;
}

// ─── Scoring ───

export async function computeWorkbookScoreAction(workbookId: string) {
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

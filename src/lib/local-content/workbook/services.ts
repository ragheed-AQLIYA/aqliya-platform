// ─── LocalContentOS Workbook — Prisma CRUD Services ───

import { prisma } from "@/lib/prisma";
import { WORKBOOK_TEMPLATE } from "./template";
import { recalculateWorkbookStats } from "./population";
import { requireTransition } from "@/lib/local-content/workflow-gating";
import type {
  WorkbookDashboardSummary,
  WorkbookWithLines,
  DataRequestWithItems,
} from "./types";

/**
 * List all workbooks for an organization with summary.
 */
export async function getWorkbookDashboardSummary(
  organizationId: string,
): Promise<WorkbookDashboardSummary> {
  const workbooks = await prisma.lcWorkbook.findMany({
    where: {
      project: { organizationId },
    },
    include: {
      lines: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const byStatus: Record<string, number> = {};
  let totalCompletion = 0;
  let totalMissing = 0;

  for (const wb of workbooks) {
    byStatus[wb.status] = (byStatus[wb.status] || 0) + 1;
    totalCompletion += wb.completionPct;
    totalMissing += wb.missingLines;
  }

  return {
    totalWorkbooks: workbooks.length,
    byStatus,
    averageCompletion:
      workbooks.length > 0
        ? Math.round(totalCompletion / workbooks.length)
        : 0,
    totalMissing,
  };
}

/**
 * Create a new workbook for a project (without population).
 */
export async function createWorkbook(
  projectId: string,
  title: string,
): Promise<WorkbookWithLines> {
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
  });
  if (!project) throw new Error(`Project not found: ${projectId}`);

  // Create workbook
  const workbook = await prisma.lcWorkbook.create({
    data: {
      projectId,
      title: title || `Workbook - ${project.name}`,
      reportingPeriod: project.reportingPeriod,
      status: "draft",
      totalLines: WORKBOOK_TEMPLATE.lines.length,
      autoFilledLines: 0,
      missingLines: WORKBOOK_TEMPLATE.lines.length,
      completionPct: 0,
    },
  });

  // Create template lines
  await prisma.lcWorkbookLine.createMany({
    data: WORKBOOK_TEMPLATE.lines.map((tmpl) => ({
      workbookId: workbook.id,
      section: tmpl.section,
      code: tmpl.code,
      name: tmpl.name,
      autoFillable: tmpl.autoFillable,
      autoFilled: false,
      autoFillValue: null,
      autoFillSource: null,
      manualValue: null,
      source: "tb",
      confidence: "high",
      evidenceRequired: tmpl.evidenceRequired,
      evidenceTypes: tmpl.evidenceTypes ? JSON.stringify(tmpl.evidenceTypes) : null,
      displayOrder: tmpl.displayOrder,
    })),
  });

  return (await prisma.lcWorkbook.findUnique({
    where: { id: workbook.id },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  })) as WorkbookWithLines;
}

/**
 * Export workbook data as JSON for download.
 * Does NOT change the workbook status (read-only export).
 */
export async function exportWorkbookJson(
  workbookId: string,
): Promise<object> {
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
      project: true,
    },
  });

  if (!workbook) throw new Error("Workbook not found");

  return {
    exportVersion: "1.0",
    exportedAt: new Date().toISOString(),
    workbook: {
      id: workbook.id,
      title: workbook.title,
      reportingPeriod: workbook.reportingPeriod,
      status: workbook.status,
      completionPct: workbook.completionPct,
      totalLines: workbook.totalLines,
      autoFilledLines: workbook.autoFilledLines,
      missingLines: workbook.missingLines,
      lcScore: workbook.lcScore,
      lcScoreComputedAt: workbook.lcScoreComputedAt?.toISOString() ?? null,
    },
    project: {
      id: workbook.project.id,
      name: workbook.project.name,
      reportingPeriod: workbook.project.reportingPeriod,
      status: workbook.project.status,
    },
    lines: workbook.lines.map((l) => ({
      code: l.code,
      name: l.name,
      section: l.section,
      value: l.manualValue !== null ? l.manualValue : l.autoFillValue,
      source: l.source,
      confidence: l.confidence,
      autoFilled: l.autoFilled,
      evidenceRequired: l.evidenceRequired,
      notes: l.notes,
    })),
    sections: groupBySection(workbook.lines),
    stats: {
      completionPct: workbook.completionPct,
      autoFilled: workbook.autoFilledLines,
      missing: workbook.missingLines,
      total: workbook.totalLines,
    },
  };
}

/**
 * Mark a workbook as exported (terminal workflow state).
 * Requires transition from current status → "exported".
 */
export async function markWorkbookExported(
  workbookId: string,
): Promise<void> {
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    select: { status: true, completionPct: true },
  });

  if (!workbook) throw new Error("Workbook not found");

  // Enforce workflow gating: must allow transition to exported
  requireTransition(workbook.status, "exported");

  // Enforce completion: cannot export incomplete workbook
  if (workbook.completionPct < 100) {
    throw new Error("Cannot export incomplete workbook (completionPct < 100%)");
  }

  await prisma.lcWorkbook.update({
    where: { id: workbookId },
    data: { status: "exported" },
  });
}

function groupBySection(
  lines: Array<{ section: string; code: string; name: string }>,
): Record<string, Array<{ code: string; name: string }>> {
  const groups: Record<string, Array<{ code: string; name: string }>> = {};
  for (const l of lines) {
    if (!groups[l.section]) groups[l.section] = [];
    groups[l.section].push({ code: l.code, name: l.name });
  }
  return groups;
}

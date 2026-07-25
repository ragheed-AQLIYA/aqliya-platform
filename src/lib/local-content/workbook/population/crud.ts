// ─── LocalContentOS Workbook — CRUD & Stats Operations ───

import { prisma } from "@/lib/prisma";
import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "../template";
import { isWorkbookEditable, requireTransition } from "@/lib/local-content/workflow-gating";
import type { LcWorkbookStatus } from "@/lib/local-content/workflow-gating";
import type { WorkbookPopulationResult, WorkbookWithLines } from "../types";
import {
  evaluateFormula,
  computeSectionStatsFromLines,
  type LineValueMap,
} from "./common";

export async function recalculateWorkbookStats(
  workbookId: string,
  organizationId: string,
): Promise<WorkbookPopulationResult> {
  const current = await prisma.lcWorkbook.findFirst({
    where: { id: workbookId, project: { organizationId } },
    select: { status: true },
  });
  if (!current) throw new Error("Workbook not found");
  if (!isWorkbookEditable(current.status)) {
    throw new Error("Cannot recalculate stats for exported workbook");
  }

  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId, workbook: { project: { organizationId } } },
    take: 100,
  });

  const lineValues: Record<string, number | null> = {};
  for (const line of lines) {
    lineValues[line.code] = line.manualValue ?? line.autoFillValue ?? null;
  }

  const formulaLineCodes = WORKBOOK_TEMPLATE.lines
    .filter((t) => t.formula)
    .map((t) => t.code);

  for (const formulaCode of formulaLineCodes) {
    const tmpl = getTemplateLineByCode(formulaCode);
    if (!tmpl?.formula) continue;

    const newValue = evaluateFormula(tmpl.formula, lineValues);

    if (newValue !== null) {
      const existingLine = lines.find((l) => l.code === formulaCode);
      if (existingLine && existingLine.autoFillValue !== newValue) {
        await prisma.lcWorkbookLine.update({
          where: { id: existingLine.id, workbook: { project: { organizationId } } },
          data: {
            autoFillValue: newValue,
            autoFilled: true,
            source: "formula",
            autoFillSource: `formula:${tmpl.formula}`,
            confidence: "high",
          },
        });
        existingLine.autoFillValue = newValue;
        existingLine.autoFilled = true;
        existingLine.source = "formula";
        existingLine.autoFillSource = `formula:${tmpl.formula}`;
        existingLine.confidence = "high";
      }
      lineValues[formulaCode] = newValue;
    }
  }

  const total = lines.length;
  const autoFilled = lines.filter((l) => l.autoFilled).length;
  const manualFilled = lines.filter(
    (l) => !l.autoFilled && l.manualValue !== null,
  ).length;
  const filled = autoFilled + manualFilled;
  const missing = total - filled;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  const sectionStats = computeSectionStatsFromLines(lines);

  const newStatus: LcWorkbookStatus = missing === 0 ? "complete" : pct > 0 ? "partial" : "populated";

  requireTransition(current.status, newStatus);

  await prisma.lcWorkbook.update({
    where: { id: workbookId, project: { organizationId } },
    data: {
      autoFilledLines: autoFilled,
      missingLines: missing,
      completionPct: pct,
      status: newStatus,
    },
  });

  return {
    workbookId,
    totalLines: total,
    autoFilledLines: autoFilled,
    missingLines: missing,
    completionPct: pct,
    sectionStats,
  };
}

export async function getWorkbookWithLines(
  workbookId: string,
  organizationId: string,
): Promise<WorkbookWithLines | null> {
  const workbook = await prisma.lcWorkbook.findFirst({
    where: { id: workbookId, project: { organizationId } },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
    },
  });
  return workbook as WorkbookWithLines | null;
}

export async function updateWorkbookLineValue(
  lineId: string,
  organizationId: string,
  manualValue: number,
  notes?: string,
): Promise<void> {
  const line = await prisma.lcWorkbookLine.findFirst({
    where: { id: lineId, workbook: { project: { organizationId } } },
    select: { workbookId: true },
  });
  if (!line) throw new Error("Workbook line not found");
  const workbook = await prisma.lcWorkbook.findFirst({
    where: { id: line.workbookId, project: { organizationId } },
    select: { status: true },
  });
  if (!workbook) throw new Error("Workbook not found");
  if (!isWorkbookEditable(workbook.status)) {
    throw new Error("Workbook is not editable in its current status");
  }

  await prisma.lcWorkbookLine.update({
    where: { id: lineId, workbook: { project: { organizationId } } },
    data: {
      manualValue,
      source: "manual",
      updatedAt: new Date(),
      ...(notes !== undefined ? { notes } : {}),
    },
  });
}

export async function listProjectWorkbooks(
  projectId: string,
  organizationId: string,
): Promise<WorkbookWithLines[]> {
  const workbooks = await prisma.lcWorkbook.findMany({
    where: { projectId, project: { organizationId } },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return workbooks as WorkbookWithLines[];
}

export async function listOrganizationWorkbooks(
  organizationId: string,
): Promise<WorkbookWithLines[]> {
  const workbooks = await prisma.lcWorkbook.findMany({
    where: {
      project: { organizationId },
    },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return workbooks as WorkbookWithLines[];
}

export async function deleteWorkbook(
  workbookId: string,
  organizationId: string,
): Promise<void> {
  const workbook = await prisma.lcWorkbook.findFirst({
    where: { id: workbookId, project: { organizationId } },
    select: { status: true },
  });
  if (!workbook) throw new Error("Workbook not found");
  if (!isWorkbookEditable(workbook.status)) {
    throw new Error("Cannot delete exported workbook");
  }

  await prisma.lcWorkbook.delete({
    where: { id: workbookId, project: { organizationId } },
  });
}

// ─── LocalContentOS Workbook — Population from Trial Balance ───

import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import { WORKBOOK_TEMPLATE } from "../template";
import { requireTransition } from "@/lib/local-content/workflow-gating";
import type { WorkbookPopulationResult, TbLine } from "../types";
import { runWorkbookAiReview } from "../ai-auto-review";
import {
  deduplicateTbAccounts,
  aggregateTbValues,
  evaluateFormula,
  buildLinesData,
  computeSectionStatsFromLines,
  type LineValueMap,
} from "./common";

export async function populateWorkbookFromTb(
  projectId: string,
  organizationId: string,
  tbLines: TbLine[],
  title?: string,
): Promise<WorkbookPopulationResult> {
  const project = await prisma.localContentProject.findFirst({
    where: { id: projectId, organizationId },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

const logger = createLogger({ product: "platform", action: "lib-local-content-workbook-population-from-tb" });

  const deduped = deduplicateTbAccounts(tbLines);

  const tbValues: LineValueMap = {};
  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (tmpl.autoFillable && tmpl.tbAccountPatterns && deduped.length > 0) {
      tbValues[tmpl.code] = aggregateTbValues(deduped, tmpl.code);
    } else {
      tbValues[tmpl.code] = null;
    }
  }

  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (tmpl.formula) {
      const formulaValue = evaluateFormula(tmpl.formula, tbValues);
      if (formulaValue !== null) {
        tbValues[tmpl.code] = formulaValue;
      }
    }
  }

  const existing = await prisma.lcWorkbook.findFirst({
    where: { projectId, project: { organizationId } },
    orderBy: { createdAt: "desc" },
  });

  let workbook = existing;

  if (workbook) {
    requireTransition(workbook.status, "populated");
  }

  if (!workbook) {
    workbook = await prisma.lcWorkbook.create({
      data: {
        projectId,
        title: title || `Workbook - ${project.name} (${project.reportingPeriod})`,
        reportingPeriod: project.reportingPeriod,
        status: "populated",
        totalLines: WORKBOOK_TEMPLATE.lines.length,
        autoFilledLines: 0,
        missingLines: WORKBOOK_TEMPLATE.lines.length,
        completionPct: 0,
      },
    });
  } else {
    await prisma.lcWorkbookLine.deleteMany({
      where: { workbookId: workbook.id, workbook: { project: { organizationId } } },
    });
  }

  const { linesData, autoFilledCount } = buildLinesData(tbValues, workbook.id);

  await prisma.lcWorkbookLine.createMany({ data: linesData });

  const total = WORKBOOK_TEMPLATE.lines.length;
  const missing = total - autoFilledCount;
  const pct = total > 0 ? Math.round((autoFilledCount / total) * 100) : 0;

  await prisma.lcWorkbook.update({
    where: { id: workbook.id, project: { organizationId } },
    data: {
      autoFilledLines: autoFilledCount,
      missingLines: missing,
      completionPct: pct,
      status: missing === 0 ? "complete" : pct > 0 ? "partial" : "populated",
    },
  });

  workbook = await prisma.lcWorkbook.findFirst({
    where: { id: workbook.id, project: { organizationId } },
  });

  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId: workbook!.id, workbook: { project: { organizationId } } },
    orderBy: { displayOrder: "asc" },
    take: 100,
  });

  const sectionStats = computeSectionStatsFromLines(lines);

  runWorkbookAiReview(
    project.organizationId,
    workbook!.id,
    deduped,
    "system",
  ).catch((err) => {
    logger.warn("[LocalContentOS] Auto AI review failed (non-blocking):", { error: err instanceof Error ? err.message : "unknown", });
  });

  return {
    workbookId: workbook!.id,
    totalLines: workbook!.totalLines,
    autoFilledLines: workbook!.autoFilledLines,
    missingLines: workbook!.missingLines,
    completionPct: workbook!.completionPct,
    sectionStats,
  };
}

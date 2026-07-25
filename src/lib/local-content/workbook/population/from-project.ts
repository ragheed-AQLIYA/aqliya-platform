// ─── LocalContentOS Workbook — Population from Project Data ───

import { prisma } from "@/lib/prisma";
import { WORKBOOK_TEMPLATE } from "../template";
import { requireTransition } from "@/lib/local-content/workflow-gating";
import type { WorkbookPopulationResult } from "../types";
import {
  deduplicateTbAccounts,
  aggregateTbValues,
  evaluateFormula,
  buildLinesData,
  computeSectionStatsFromLines,
  type LineValueMap,
} from "./common";

export async function populateWorkbookFromProject(
  projectId: string,
  organizationId: string,
  title?: string,
): Promise<WorkbookPopulationResult> {
  const project = await prisma.localContentProject.findFirst({
    where: { id: projectId, organizationId },
    include: {
      suppliers: true,
      spendRecords: true,
      evidence: true,
    },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  const existing = await prisma.lcWorkbook.findFirst({
    where: { projectId, project: { organizationId } },
    orderBy: { createdAt: "desc" },
  });

  let workbook = existing;

  if (!workbook) {
    const rawTbLines: Array<{
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
    }> = [];

    for (const supplier of project.suppliers) {
      const relatedSpend = project.spendRecords.filter(
        (s) => s.supplierId === supplier.id,
      );
      for (const spend of relatedSpend) {
        rawTbLines.push({
          accountCode: `${supplier.name}-${spend.category}`,
          accountName: `${spend.description || spend.category} - ${supplier.name}`,
          debit: spend.amount,
          credit: 0,
        });
      }
    }

    const tbLines = deduplicateTbAccounts(rawTbLines);

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

    const tbValues: LineValueMap = {};
    for (const tmpl of WORKBOOK_TEMPLATE.lines) {
      if (tmpl.autoFillable && tmpl.tbAccountPatterns && tbLines.length > 0) {
        tbValues[tmpl.code] = aggregateTbValues(tbLines, tmpl.code);
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

    const { linesData, autoFilledCount } = buildLinesData(tbValues, workbook.id);

    await prisma.lcWorkbookLine.createMany({ data: linesData });

    const total = WORKBOOK_TEMPLATE.lines.length;
    const missing = total - autoFilledCount;
    const pct = total > 0 ? Math.round((autoFilledCount / total) * 100) : 0;

    await prisma.lcWorkbook.update({
      where: { id: workbook.id },
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
  }

  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId: workbook!.id, workbook: { project: { organizationId } } },
    orderBy: { displayOrder: "asc" },
    take: 100,
  });

  const sectionStats = computeSectionStatsFromLines(lines);

  return {
    workbookId: workbook!.id,
    totalLines: workbook!.totalLines,
    autoFilledLines: workbook!.autoFilledLines,
    missingLines: workbook!.missingLines,
    completionPct: workbook!.completionPct,
    sectionStats,
  };
}

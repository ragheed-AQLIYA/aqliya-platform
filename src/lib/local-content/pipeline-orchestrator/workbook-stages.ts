// ─── Pipeline Stages 1-3: Workbook Population & Gap Detection ───

import "server-only";

import { detectMissingData } from "../workbook/missing-data";
import { populateWorkbookFromProject } from "../workbook/population";
import type { StageOutcome } from "./common";

export async function stagePopulateWorkbook(
  projectId: string,
  organizationId: string,
  workbookId: string,
): Promise<StageOutcome> {
  const populated = await populateWorkbookFromProject(projectId, organizationId, workbookId);
  return {
    status: "success",
    summary: `Population: ${populated.autoFilledLines}/${populated.totalLines} lines auto-filled (${populated.completionPct}% complete)`,
    details: {
      totalLines: populated.totalLines,
      autoFilled: populated.autoFilledLines,
      missingLines: populated.missingLines,
      completionPct: populated.completionPct,
    },
  };
}

export async function stageDetectMissing(
  workbookId: string,
  organizationId: string,
): Promise<StageOutcome> {
  const missing = await detectMissingData(workbookId, organizationId);
  const categoryCount = Object.keys(missing.byCategory).length;
  return {
    status: "success",
    summary: `Detected ${missing.totalMissing} missing items across ${categoryCount} categories`,
    details: {
      totalMissing: missing.totalMissing,
      categories: categoryCount,
    },
  };
}

export async function stageGenerateRequests(
  workbookId: string,
  organizationId: string,
): Promise<StageOutcome> {
  const missing = await detectMissingData(workbookId, organizationId);
  if (missing.items.length === 0) {
    return {
      status: "skipped",
      summary: "No missing items — no data request needed",
    };
  }
  const evidenceItems = missing.items.filter((i) => i.evidenceRequired);
  if (evidenceItems.length === 0) {
    return {
      status: "skipped",
      summary: `Missing ${missing.items.length} items, but none require evidence collection`,
      details: { totalMissing: missing.items.length, evidenceRequired: 0 },
    };
  }
  return {
    status: "success",
    summary: `Generated data request for ${evidenceItems.length} evidence-required items`,
    details: { evidenceItems: evidenceItems.length },
  };
}

// ─── LocalContentOS Workbook — Population Engine ───
// Maps TB accounts into workbook structure, populates auto-fillable fields.
// Phase 1: Basic TB→workbook mapping (no advanced ML/AI).

import { prisma } from "@/lib/prisma";
import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "./template";
import { isWorkbookEditable, requireTransition } from "@/lib/local-content/workflow-gating";
import type { LcWorkbookStatus } from "@/lib/local-content/workflow-gating";
import type {
  WorkbookPopulationResult,
  WorkbookWithLines,
  WorkbookTemplateLine,
  AccountCodeRange,
  TbLine,
} from "./types";
import { runWorkbookAiReview } from "./ai-auto-review";

/**
 * Check if an account code falls within the allowed ranges for a template line.
 * Returns true if the account passes the range filter (or no ranges are defined).
 */
export function isAccountInCodeRange(
  accountCode: string,
  codeRanges?: AccountCodeRange[],
): boolean {
  if (!codeRanges || codeRanges.length === 0) return true;

  for (const range of codeRanges) {
    // Check if account code starts with the required prefix
    if (accountCode.startsWith(range.prefix)) {
      // Check exclusion prefixes
      if (range.excludePrefixes) {
        for (const exPrefix of range.excludePrefixes) {
          if (accountCode.startsWith(exPrefix)) return false;
        }
      }
      return true;
    }
  }
  return false;
}

/**
 * Deduplicate TB account lines by account code.
 * When duplicate codes exist, uses the one with the higher absolute balance.
 */
export function deduplicateTbAccounts(
  tbLines: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
): Array<{ accountCode: string; accountName: string; debit: number; credit: number }> {
  const seen = new Map<string, { accountCode: string; accountName: string; debit: number; credit: number }>();

  for (const line of tbLines) {
    const existing = seen.get(line.accountCode);
    if (!existing) {
      seen.set(line.accountCode, line);
    } else {
      // Prefer entry with higher absolute balance
      const existingAbs = Math.abs(existing.debit - existing.credit);
      const newAbs = Math.abs(line.debit - line.credit);
      if (newAbs > existingAbs) {
        seen.set(line.accountCode, line);
      }
    }
  }

  return Array.from(seen.values());
}

/** Match a TB line name against a template line's account patterns */
function matchTbLineToTemplate(
  tbName: string,
  tbCode: string,
  _debit: number,
  _credit: number,
): { matched: boolean; score: number; templateCode: string | null } {
  let bestMatch: { code: string; score: number } | null = null;

  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (!tmpl.autoFillable || !tmpl.tbAccountPatterns) continue;

    // Check account code range filter first
    if (!isAccountInCodeRange(tbCode, tmpl.accountCodeRanges)) continue;

    for (const pattern of tmpl.tbAccountPatterns) {
      try {
        const regex = new RegExp(pattern, "iu");
        if (regex.test(tbName) || regex.test(tbCode)) {
          // Score by pattern specificity (longer patterns = more specific)
          const score = pattern.length;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { code: tmpl.code, score };
          }
        }
      } catch {
        // Skip invalid regex patterns
        continue;
      }
    }
  }

  if (bestMatch) {
    return { matched: true, score: bestMatch.score, templateCode: bestMatch.code };
  }
  return { matched: false, score: 0, templateCode: null };
}

/** Aggregate matched values for a template line across multiple TB lines */
export function aggregateTbValues(
  tbLines: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
  templateCode: string,
): number | null {
  const tmpl = getTemplateLineByCode(templateCode);
  if (!tmpl || !tmpl.tbAccountPatterns) return null;

  let total = 0;
  let matched = false;

  for (const tb of tbLines) {
    // Check account code range filter first
    if (!isAccountInCodeRange(tb.accountCode, tmpl.accountCodeRanges)) continue;

    for (const pattern of tmpl.tbAccountPatterns) {
      try {
        const regex = new RegExp(pattern, "iu");
        if (regex.test(tb.accountName) || regex.test(tb.accountCode)) {
          // Use balance (debit - credit) for the value
          total += tb.debit - tb.credit;
          matched = true;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return matched ? Math.abs(total) : null;
}

/**
 * Interface for resolved line values used in formula evaluation.
 */
export interface LineValueMap {
  [code: string]: number | null;
}

/**
 * Evaluate a formula expression against resolved line values.
 * Supported operators: +, -, *, / and parentheses.
 * Example: "REV-03 - COS-03"
 */
export function evaluateFormula(
  formula: string,
  lineValues: LineValueMap,
): number | null {
  try {
    let expression = formula;

    // Replace each line code with its numeric value
    // Only check values that are actually referenced in the formula
    for (const [code, value] of Object.entries(lineValues)) {
      // Skip codes not referenced in the formula
      if (!formula.includes(code)) continue;

      if (value === null || value === undefined) {
        // If a referenced dependency is missing, formula cannot be computed
        return null;
      }
      // Escape special regex chars in code (e.g., REV-03 has a hyphen)
      const escaped = code.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
      expression = expression.replace(new RegExp(escaped, 'g'), String(value));
    }

    // Safety check: only allow digits, operators, spaces, decimal points, parentheses
    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return null;
    }

    // Evaluate the expression
    // Using Function constructor is safe here because we've validated the input
    const result = new Function(`return (${expression});`)();
    return typeof result === 'number' && !isNaN(result) ? Math.abs(result) : null;
  } catch {
    return null;
  }
}

/**
 * Populate a workbook from a project's TB data.
 * Creates the workbook lines based on the canonical template
 * and attempts to auto-fill from existing LocalContent data.
 */
export async function populateWorkbookFromProject(
  projectId: string,
  title?: string,
): Promise<WorkbookPopulationResult> {
  // Get the project
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
    include: {
      suppliers: true,
      spendRecords: true,
      evidence: true,
    },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Check if a workbook already exists for this project
  const existing = await prisma.lcWorkbook.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  let workbook = existing;

  if (!workbook) {
    // Gather TB data from LocalContent spend records
    const rawTbLines: Array<{
      accountCode: string;
      accountName: string;
      debit: number;
      credit: number;
    }> = [];

    // Use supplier names and spend categories as pseudo-TB lines
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

    // Deduplicate accounts by code before processing
    const tbLines = deduplicateTbAccounts(rawTbLines);

    // Create workbook
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

    // Create lines — two-pass approach:
    // Pass 1: Compute all TB-matched values
    const tbValues: LineValueMap = {};
    for (const tmpl of WORKBOOK_TEMPLATE.lines) {
      if (tmpl.autoFillable && tmpl.tbAccountPatterns && tbLines.length > 0) {
        tbValues[tmpl.code] = aggregateTbValues(tbLines, tmpl.code);
      } else {
        tbValues[tmpl.code] = null;
      }
    }

    // Pass 2: Evaluate formulas using computed TB values
    for (const tmpl of WORKBOOK_TEMPLATE.lines) {
      if (tmpl.formula) {
        const formulaValue = evaluateFormula(tmpl.formula, tbValues);
        if (formulaValue !== null) {
          tbValues[tmpl.code] = formulaValue;
        }
      }
    }

    let autoFilledCount = 0;
    const linesData = WORKBOOK_TEMPLATE.lines.map((tmpl) => {
      let autoFillValue: number | null = null;
      let autoFillSource: string | null = null;
      let autoFilled = false;
      let source: string = "tb";
      let confidence: string = "high";

      const computedValue = tbValues[tmpl.code];

      if (tmpl.autoFillable && computedValue !== null) {
        autoFillValue = computedValue;
        autoFilled = true;
        autoFilledCount++;
        source = tmpl.formula ? "formula" : "tb";
        confidence = tmpl.formula ? "high" : "medium";
        autoFillSource = tmpl.formula ? `formula:${tmpl.formula}` : `tb:${tmpl.code}`;
      }

      return {
        workbookId: workbook!.id,
        section: tmpl.section,
        code: tmpl.code,
        name: tmpl.name,
        autoFillable: tmpl.autoFillable,
        autoFilled,
        autoFillValue,
        autoFillSource,
        manualValue: null,
        source,
        confidence,
        evidenceRequired: tmpl.evidenceRequired,
        evidenceTypes: tmpl.evidenceTypes ? JSON.stringify(tmpl.evidenceTypes) : null,
        displayOrder: tmpl.displayOrder,
      };
    });

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

    // Refresh workbook
    workbook = await prisma.lcWorkbook.findUnique({ where: { id: workbook.id } });
  }

  // Calculate section stats
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId: workbook!.id },
    orderBy: { displayOrder: "asc" },
  });

  const sectionStats: Record<string, { total: number; filled: number; pct: number }> = {};
  for (const line of lines) {
    if (!sectionStats[line.section]) {
      sectionStats[line.section] = { total: 0, filled: 0, pct: 0 };
    }
    sectionStats[line.section].total++;
    if (line.autoFilled || line.manualValue !== null) {
      sectionStats[line.section].filled++;
    }
  }
  for (const [key, stat] of Object.entries(sectionStats)) {
    stat.pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
  }

  return {
    workbookId: workbook!.id,
    totalLines: workbook!.totalLines,
    autoFilledLines: workbook!.autoFilledLines,
    missingLines: workbook!.missingLines,
    completionPct: workbook!.completionPct,
    sectionStats,
  };
}

/**
 * Populate a workbook from real trial balance data using the pattern matching engine.
 * Creates or updates workbook lines with auto-filled values from TB account matching.
 */
export async function populateWorkbookFromTb(
  projectId: string,
  tbLines: TbLine[],
  title?: string,
): Promise<WorkbookPopulationResult> {
  // Get the project
  const project = await prisma.localContentProject.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }

  // Deduplicate TB accounts
  const deduped = deduplicateTbAccounts(tbLines);

  // Pass 1: Compute all TB-matched values
  const tbValues: LineValueMap = {};
  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (tmpl.autoFillable && tmpl.tbAccountPatterns && deduped.length > 0) {
      tbValues[tmpl.code] = aggregateTbValues(deduped, tmpl.code);
    } else {
      tbValues[tmpl.code] = null;
    }
  }

  // Pass 2: Evaluate formulas using computed TB values
  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (tmpl.formula) {
      const formulaValue = evaluateFormula(tmpl.formula, tbValues);
      if (formulaValue !== null) {
        tbValues[tmpl.code] = formulaValue;
      }
    }
  }

  // Check if a workbook already exists for this project
  const existing = await prisma.lcWorkbook.findFirst({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });

  let workbook = existing;

  // Enforce workflow gating: existing workbook must allow transition to "populated"
  if (workbook) {
    requireTransition(workbook.status, "populated");
  }

  if (!workbook) {
    // Create new workbook
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
    // Delete existing lines for re-population
    await prisma.lcWorkbookLine.deleteMany({
      where: { workbookId: workbook.id },
    });
  }

  let autoFilledCount = 0;
  const linesData = WORKBOOK_TEMPLATE.lines.map((tmpl) => {
    let autoFillValue: number | null = null;
    let autoFillSource: string | null = null;
    let autoFilled = false;
    let source: string = "tb";
    let confidence: string = "high";

    const computedValue = tbValues[tmpl.code];

    if (tmpl.autoFillable && computedValue !== null) {
      autoFillValue = computedValue;
      autoFilled = true;
      autoFilledCount++;
      source = tmpl.formula ? "formula" : "tb";
      confidence = tmpl.formula ? "high" : "medium";
      autoFillSource = tmpl.formula ? `formula:${tmpl.formula}` : `tb:${tmpl.code}`;
    }

    return {
      workbookId: workbook!.id,
      section: tmpl.section,
      code: tmpl.code,
      name: tmpl.name,
      autoFillable: tmpl.autoFillable,
      autoFilled,
      autoFillValue,
      autoFillSource,
      manualValue: null,
      source,
      confidence,
      evidenceRequired: tmpl.evidenceRequired,
      evidenceTypes: tmpl.evidenceTypes ? JSON.stringify(tmpl.evidenceTypes) : null,
      displayOrder: tmpl.displayOrder,
    };
  });

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

  // Refresh workbook
  workbook = await prisma.lcWorkbook.findUnique({ where: { id: workbook.id } });

  // Calculate section stats
  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId: workbook!.id },
    orderBy: { displayOrder: "asc" },
  });

  const sectionStats: Record<string, { total: number; filled: number; pct: number }> = {};
  for (const line of lines) {
    if (!sectionStats[line.section]) {
      sectionStats[line.section] = { total: 0, filled: 0, pct: 0 };
    }
    sectionStats[line.section].total++;
    if (line.autoFilled || line.manualValue !== null) {
      sectionStats[line.section].filled++;
    }
  }
  for (const [key, stat] of Object.entries(sectionStats)) {
    stat.pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
  }

  // ── Phase 1: Auto-trigger AI review (non-blocking) ──
  runWorkbookAiReview(
    project.organizationId,
    workbook!.id,
    deduped,
    "system",
  ).catch((err) => {
    console.warn(
      "[LocalContentOS] Auto AI review failed (non-blocking):",
      err instanceof Error ? err.message : "unknown",
    );
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

/**
 * Recalculate workbook statistics after manual updates.
 * Also re-evaluates formula-based lines (e.g., GP-01, WRK-03).
 */
export async function recalculateWorkbookStats(
  workbookId: string,
): Promise<WorkbookPopulationResult> {
  // Enforce workflow gating: must be editable
  const current = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    select: { status: true },
  });
  if (!current) throw new Error("Workbook not found");
  if (!isWorkbookEditable(current.status)) {
    throw new Error("Cannot recalculate stats for exported workbook");
  }

  const lines = await prisma.lcWorkbookLine.findMany({
    where: { workbookId },
  });

  // ── Phase 1: Re-evaluate formulas ──
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
      // Update the line's autoFillValue if it changed
      const existingLine = lines.find((l) => l.code === formulaCode);
      if (existingLine && existingLine.autoFillValue !== newValue) {
        await prisma.lcWorkbookLine.update({
          where: { id: existingLine.id },
          data: {
            autoFillValue: newValue,
            autoFilled: true,
            source: "formula",
            autoFillSource: `formula:${tmpl.formula}`,
            confidence: "high",
          },
        });
        // Update in-memory copy for stats
        existingLine.autoFillValue = newValue;
        existingLine.autoFilled = true;
        existingLine.source = "formula";
        existingLine.autoFillSource = `formula:${tmpl.formula}`;
        existingLine.confidence = "high";
      }
      // Update line values map so chained formulas see the new value
      lineValues[formulaCode] = newValue;
    }
  }

  // ── Phase 2: Compute stats ──
  const total = lines.length;
  const autoFilled = lines.filter((l) => l.autoFilled).length;
  const manualFilled = lines.filter(
    (l) => !l.autoFilled && l.manualValue !== null,
  ).length;
  const filled = autoFilled + manualFilled;
  const missing = total - filled;
  const pct = total > 0 ? Math.round((filled / total) * 100) : 0;

  const sectionStats: Record<string, { total: number; filled: number; pct: number }> = {};
  for (const line of lines) {
    if (!sectionStats[line.section]) {
      sectionStats[line.section] = { total: 0, filled: 0, pct: 0 };
    }
    sectionStats[line.section].total++;
    if (line.autoFilled || line.manualValue !== null) {
      sectionStats[line.section].filled++;
    }
  }
  for (const [key, stat] of Object.entries(sectionStats)) {
    stat.pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
  }

  const newStatus: LcWorkbookStatus = missing === 0 ? "complete" : pct > 0 ? "partial" : "populated";

  // Enforce workflow gating: validate status transition
  requireTransition(current.status, newStatus);

  await prisma.lcWorkbook.update({
    where: { id: workbookId },
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

/**
 * Get workbook with lines.
 */
export async function getWorkbookWithLines(
  workbookId: string,
): Promise<WorkbookWithLines | null> {
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
    },
  });
  return workbook as WorkbookWithLines | null;
}

/**
 * Update a workbook line's manual value.
 */
export async function updateWorkbookLineValue(
  lineId: string,
  manualValue: number,
  notes?: string,
): Promise<void> {
  // Enforce workflow gating: must be editable
  const line = await prisma.lcWorkbookLine.findUnique({
    where: { id: lineId },
    select: { workbookId: true },
  });
  if (!line) throw new Error("Workbook line not found");
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: line.workbookId },
    select: { status: true },
  });
  if (!workbook) throw new Error("Workbook not found");
  if (!isWorkbookEditable(workbook.status)) {
    throw new Error("Workbook is not editable in its current status");
  }

  await prisma.lcWorkbookLine.update({
    where: { id: lineId },
    data: {
      manualValue,
      source: "manual",
      updatedAt: new Date(),
      ...(notes !== undefined ? { notes } : {}),
    },
  });
}

/**
 * List workbooks for a project.
 */
export async function listProjectWorkbooks(
  projectId: string,
): Promise<WorkbookWithLines[]> {
  const workbooks = await prisma.lcWorkbook.findMany({
    where: { projectId },
    include: {
      lines: { orderBy: { displayOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });
  return workbooks as WorkbookWithLines[];
}

/**
 * List workbooks for an organization.
 */
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
  });
  return workbooks as WorkbookWithLines[];
}

/**
 * Delete a workbook and all its lines (cascade handled by Prisma).
 */
export async function deleteWorkbook(workbookId: string): Promise<void> {
  // Enforce workflow gating: cannot delete exported workbook
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    select: { status: true },
  });
  if (!workbook) throw new Error("Workbook not found");
  if (!isWorkbookEditable(workbook.status)) {
    throw new Error("Cannot delete exported workbook");
  }

  await prisma.lcWorkbook.delete({ where: { id: workbookId } });
}

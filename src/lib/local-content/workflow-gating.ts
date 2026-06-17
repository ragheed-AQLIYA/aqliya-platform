// ─── LocalContentOS — Workflow Gating ───
// Validates workbook status transitions and controls tab/mutation access.
// Follows the same pattern as AuditOS workflow-gating.ts.

import type { LcWorkbook } from "@prisma/client";

// ─── Status Constants ───

export const LC_WORKBOOK_STATUSES = [
  "draft",
  "populated",
  "partial",
  "complete",
  "exported",
] as const;

export type LcWorkbookStatus = (typeof LC_WORKBOOK_STATUSES)[number];

// ─── Transition Definitions ───

type TransitionMap = Partial<Record<LcWorkbookStatus, LcWorkbookStatus[]>>;

/**
 * Legal status transitions for workbook state machine.
 * - `exported` is a terminal state — no transitions out.
 * - `populated` is reachable from most states via re-import of TB.
 */
const ALLOWED_TRANSITIONS: TransitionMap = {
  draft: ["populated", "partial"],
  populated: ["partial", "complete", "populated"],
  partial: ["populated", "complete"],
  complete: ["populated", "exported"],
};

/**
 * Check whether a status transition is allowed.
 */
export function isTransitionAllowed(
  current: string,
  next: string,
): { allowed: boolean; reason?: string } {
  if (current === next) {
    return { allowed: true }; // No-op transitions are always allowed
  }

  if (current === "exported") {
    return {
      allowed: false,
      reason:
        "تم تصدير الدفتر ولا يمكن تعديله. إذا لزم الأمر، قم بإنشاء دفتر جديد.",
    };
  }

  if (!LC_WORKBOOK_STATUSES.includes(current as LcWorkbookStatus)) {
    return { allowed: true }; // Unknown status — allow
  }

  const allowedNext = ALLOWED_TRANSITIONS[current as LcWorkbookStatus];
  if (!allowedNext) {
    return {
      allowed: false,
      reason: `الحالة "${current}" لا تسمح بأي انتقالات.`,
    };
  }

  if (!allowedNext.includes(next as LcWorkbookStatus)) {
    return {
      allowed: false,
      reason: `لا يمكن الانتقال من "${current}" إلى "${next}".`,
    };
  }

  return { allowed: true };
}

// ─── Tab Gate Definitions ───

export interface WorkbookGateContext {
  status: string;
  totalLines: number;
  autoFilledLines: number;
  missingLines: number;
  completionPct: number;
}

export interface TabGateResult {
  locked: boolean;
  reason?: string;
}

type TabGate = (ctx: WorkbookGateContext) => TabGateResult;

const WORKBOOK_TAB_GATES: Record<string, TabGate> = {
  // Lines tab — always accessible
  lines: () => ({ locked: false }),

  // Missing data — needs workbook population
  missing: (ctx) =>
    ctx.status === "draft"
      ? { locked: true, reason: "استورد الميزان أولا لتعبئة الدفتر." }
      : { locked: false },

  // Data requests — needs missing data detected
  requests: (ctx) =>
    ctx.status === "draft"
      ? { locked: true, reason: "استورد الميزان أولا لتعبئة الدفتر." }
      : { locked: false },

  // TB import — blocked on exported only
  "tb-import": (ctx) =>
    ctx.status === "exported"
      ? { locked: true, reason: "تم تصدير الدفتر ولا يمكن استيراد ميزان جديد." }
      : { locked: false },

  // Export — needs completeness
  export: (ctx) =>
    ctx.completionPct < 100
      ? {
          locked: true,
          reason: `أكمل جميع البنود (${ctx.completionPct}%) قبل التصدير.`,
        }
      : ctx.status === "exported"
        ? { locked: true, reason: "تم تصدير الدفتر مسبقاً." }
        : { locked: false },

  // Manual edit — blocked on exported
  "manual-edit": (ctx) =>
    ctx.status === "exported"
      ? { locked: true, reason: "تم تصدير الدفتر ولا يمكن تعديل القيم." }
      : { locked: false },
};

/**
 * Evaluate a single tab gate against workbook context.
 */
export function evaluateWorkbookTabGate(
  tabKey: string,
  ctx: WorkbookGateContext,
): TabGateResult {
  const gate = WORKBOOK_TAB_GATES[tabKey];
  if (!gate) return { locked: false };
  return gate(ctx);
}

/**
 * Evaluate all tab gates against workbook context.
 */
export function evaluateAllTabGates(
  ctx: WorkbookGateContext,
): Record<string, TabGateResult> {
  const results: Record<string, TabGateResult> = {};
  for (const tabKey of Object.keys(WORKBOOK_TAB_GATES)) {
    results[tabKey] = evaluateWorkbookTabGate(tabKey, ctx);
  }
  return results;
}

/**
 * Quick check if a tab is accessible.
 */
export function isTabAccessible(
  tabKey: string,
  ctx: WorkbookGateContext,
): boolean {
  return !evaluateWorkbookTabGate(tabKey, ctx).locked;
}

// ─── Export Lock ───

/**
 * Check if the workbook is locked from editing (exported).
 */
export function isWorkbookEditable(status: string): boolean {
  return status !== "exported";
}

// ─── Transition helpers for server actions ───

/**
 * Build a WorkbookGateContext from an LcWorkbook record.
 */
export function buildGateContext(workbook: LcWorkbook): WorkbookGateContext {
  return {
    status: workbook.status,
    totalLines: workbook.totalLines,
    autoFilledLines: workbook.autoFilledLines,
    missingLines: workbook.missingLines,
    completionPct: workbook.completionPct,
  };
}

/**
 * Validate a transition and throw if not allowed.
 * Returns void if allowed.
 */
export function requireTransition(
  current: string,
  next: string,
): void {
  const { allowed, reason } = isTransitionAllowed(current, next);
  if (!allowed) {
    throw new Error(reason || `الانتقال من "${current}" إلى "${next}" غير مسموح.`);
  }
}

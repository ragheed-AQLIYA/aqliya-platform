import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export type SlaStatus = "on_track" | "approaching" | "overdue" | "breached";

export interface StepSlaConfig {
  timeLimitMinutes: number;
  warnAtPercent: number;
  escalateAfterMinutes?: number;
}

export interface SlaInfo {
  status: SlaStatus;
  dueAt: Date | null;
  remainingMinutes: number | null;
  stepIndex: number;
  stepLabel: string;
}

export function calculateDueAt(from: Date, slaMinutes: number): Date {
  return new Date(from.getTime() + slaMinutes * 60 * 1000);
}

export function getSlaStatus(
  dueAt: Date | null,
  completedAt: Date | null,
  warnAtPercent: number = 80,
): SlaStatus {
  if (completedAt || !dueAt) return "on_track";
  const now = Date.now();
  const due = dueAt.getTime();
  const remaining = due - now;

  if (remaining <= 0) return "breached";
  if (now >= due - (due - (due - remaining)) * 0) {
    const total = due - (due - remaining);
    const elapsedPercent = total > 0 ? ((total - remaining) / total) * 100 : 0;
    if (elapsedPercent >= 100) return "breached";
    if (remaining <= 0) return "breached";
  }

  const totalDuration = due - (due - remaining);
  const elapsed = totalDuration - remaining;
  const elapsedPercent = totalDuration > 0 ? (elapsed / totalDuration) * 100 : 0;

  if (remaining <= 0) return "breached";
  if (elapsedPercent >= warnAtPercent) return "approaching";
  if (remaining < 0) return "overdue";
  return "on_track";
}

export function getSlaConfig(
  steps: unknown[],
  stepIndex: number,
): StepSlaConfig | null {
  if (!Array.isArray(steps)) return null;
  const step = steps[stepIndex] as Record<string, unknown> | undefined;
  if (!step) return null;
  const sla = step.slaConfig as StepSlaConfig | undefined;
  if (!sla || typeof sla.timeLimitMinutes !== "number") return null;
  return {
    timeLimitMinutes: sla.timeLimitMinutes,
    warnAtPercent: sla.warnAtPercent ?? 80,
    escalateAfterMinutes: sla.escalateAfterMinutes,
  };
}

export async function checkOverdue(): Promise<{
  overdue: { id: string; title: string; status: SlaStatus }[];
  breached: { id: string; title: string }[];
}> {
  const records = await prisma.workflowRecord.findMany({
    where: {
      status: { notIn: ["completed", "cancelled"] },
      dueDate: { not: null },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      completedAt: true,
      steps: true,
      currentStep: true,
    },
  });

  const overdue: { id: string; title: string; status: SlaStatus }[] = [];
  const breached: { id: string; title: string }[] = [];

  for (const record of records) {
    if (!record.dueDate) continue;
    const status = getSlaStatus(record.dueDate, record.completedAt);
    if (status === "overdue" || status === "approaching") {
      overdue.push({ id: record.id, title: record.title, status });
    }
    if (status === "breached") {
      breached.push({ id: record.id, title: record.title });
    }
  }

  return { overdue, breached };
}

export async function getSLAInfo(
  recordId: string,
): Promise<SlaInfo | null> {
  const record = await prisma.workflowRecord.findUnique({
    where: { id: recordId },
    select: {
      id: true,
      dueDate: true,
      completedAt: true,
      steps: true,
      currentStep: true,
    },
  });
  if (!record) return null;

  const steps = record.steps as unknown[];
  const stepIndex = record.currentStep > 0 ? record.currentStep - 1 : 0;
  const step = steps[stepIndex] as Record<string, unknown> | undefined;
  const slaConfig = step?.slaConfig as StepSlaConfig | undefined;

  if (!record.dueDate) {
    return {
      status: "on_track",
      dueAt: null,
      remainingMinutes: null,
      stepIndex,
      stepLabel: step?.name as string ?? `الخطوة ${stepIndex + 1}`,
    };
  }

  const status = getSlaStatus(
    record.dueDate,
    record.completedAt,
    slaConfig?.warnAtPercent,
  );
  const remainingMinutes =
    record.dueDate
      ? Math.max(0, Math.floor((record.dueDate.getTime() - Date.now()) / 60000))
      : null;

  return {
    status,
    dueAt: record.dueDate,
    remainingMinutes,
    stepIndex,
    stepLabel: step?.name as string ?? `الخطوة ${stepIndex + 1}`,
  };
}

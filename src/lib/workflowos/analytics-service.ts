import "server-only";

import { prisma } from "@/lib/prisma";

export interface ThroughputMetrics {
  totalActive: number;
  overdueCount: number;
  completedToday: number;
  completedThisWeek: number;
  completedThisMonth: number;
  avgCompletionHours: number | null;
}

export interface SlaCompliance {
  onTime: number;
  breached: number;
  complianceRate: number;
  byPriority: Record<string, { total: number; onTime: number; rate: number }>;
}

export interface StepBreakdown {
  stepType: string;
  count: number;
  avgHours: number | null;
  minHours: number | null;
  maxHours: number | null;
}

export interface DailyThroughput {
  date: string;
  completed: number;
  created: number;
}

export async function getThroughputMetrics(
  organizationId: string,
): Promise<ThroughputMetrics> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfDay);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalActive,
    overdueCount,
    completedToday,
    completedThisWeek,
    completedThisMonth,
    completionTimes,
  ] = await Promise.all([
    prisma.workflowRecord.count({
      where: {
        organizationId,
        status: { notIn: ["completed", "cancelled"] },
      },
    }),
    prisma.workflowRecord.count({
      where: {
        organizationId,
        dueDate: { lt: now },
        status: { notIn: ["completed", "cancelled"] },
      },
    }),
    prisma.workflowRecord.count({
      where: {
        organizationId,
        status: "completed",
        completedAt: { gte: startOfDay },
      },
    }),
    prisma.workflowRecord.count({
      where: {
        organizationId,
        status: "completed",
        completedAt: { gte: startOfWeek },
      },
    }),
    prisma.workflowRecord.count({
      where: {
        organizationId,
        status: "completed",
        completedAt: { gte: startOfMonth },
      },
    }),
    prisma.workflowRecord.findMany({
      where: {
        organizationId,
        status: "completed",
        completedAt: { not: null as unknown as Date },
        createdAt: { not: null as unknown as Date },
      },
      select: { createdAt: true, completedAt: true },
    }),
  ]);

  let avgCompletionHours: number | null = null;
  if (completionTimes.length > 0) {
    const totalHours = completionTimes.reduce((sum, r) => {
      const diff =
        (r.completedAt!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + diff;
    }, 0);
    avgCompletionHours = Math.round((totalHours / completionTimes.length) * 100) / 100;
  }

  return {
    totalActive,
    overdueCount,
    completedToday,
    completedThisWeek,
    completedThisMonth,
    avgCompletionHours,
  };
}

export async function getSLACompliance(
  organizationId: string,
): Promise<SlaCompliance> {
  const records = await prisma.workflowRecord.findMany({
    where: {
      organizationId,
      status: "completed",
      dueDate: { not: null as unknown as Date },
      completedAt: { not: null as unknown as Date },
    },
    select: {
      id: true,
      dueDate: true,
      completedAt: true,
      priority: true,
    },
  });

  const onTime = records.filter(
    (r) => r.dueDate && r.completedAt && r.completedAt <= r.dueDate,
  );
  const breached = records.filter(
    (r) => r.dueDate && r.completedAt && r.completedAt > r.dueDate,
  );

  const byPriority: Record<string, { total: number; onTime: number; rate: number }> = {};
  for (const r of records) {
    if (!byPriority[r.priority]) {
      byPriority[r.priority] = { total: 0, onTime: 0, rate: 0 };
    }
    byPriority[r.priority].total++;
    if (r.dueDate && r.completedAt && r.completedAt <= r.dueDate) {
      byPriority[r.priority].onTime++;
    }
  }
  for (const key of Object.keys(byPriority)) {
    byPriority[key].rate =
      byPriority[key].total > 0
        ? Math.round((byPriority[key].onTime / byPriority[key].total) * 10000) / 100
        : 0;
  }

  const total = records.length;
  return {
    onTime: onTime.length,
    breached: breached.length,
    complianceRate: total > 0 ? Math.round((onTime.length / total) * 10000) / 100 : 100,
    byPriority,
  };
}

export async function getStepBreakdown(
  organizationId: string,
): Promise<StepBreakdown[]> {
  const records = await prisma.workflowRecord.findMany({
    where: { organizationId, status: "completed" },
    select: {
      steps: true,
      stepResults: true,
      createdAt: true,
    },
  });

  const typeMap: Record<string, number[]> = {};

  for (const record of records) {
    const steps = record.steps as unknown[];
    const results = record.stepResults as Record<string, unknown>;
    if (!Array.isArray(steps)) continue;

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i] as Record<string, unknown> | undefined;
      if (!step) continue;
      const stepType = (step.type as string) ?? "unknown";
      if (!typeMap[stepType]) typeMap[stepType] = [];

      const resultKey = `step_${i + 1}`;
      const result = results?.[resultKey] as Record<string, unknown> | undefined;
      if (result?.updatedAt && record.createdAt) {
        const start = record.createdAt.getTime();
        const end = new Date(result.updatedAt as string).getTime();
        const hours = (end - start) / (1000 * 60 * 60);
        typeMap[stepType].push(hours);
      }
    }
  }

  return Object.entries(typeMap).map(([stepType, hours]) => ({
    stepType,
    count: hours.length,
    avgHours: hours.length > 0
      ? Math.round((hours.reduce((a, b) => a + b, 0) / hours.length) * 100) / 100
      : null,
    minHours: hours.length > 0 ? Math.round(Math.min(...hours) * 100) / 100 : null,
    maxHours: hours.length > 0 ? Math.round(Math.max(...hours) * 100) / 100 : null,
  }));
}

export async function getAvgCompletionTime(
  organizationId: string,
): Promise<{ avgHours: number | null; recordCount: number }> {
  const records = await prisma.workflowRecord.findMany({
    where: {
      organizationId,
      status: "completed",
      completedAt: { not: null as unknown as Date },
      createdAt: { not: null as unknown as Date },
    },
    select: { createdAt: true, completedAt: true },
  });

  if (records.length === 0) return { avgHours: null, recordCount: 0 };

  const totalHours = records.reduce((sum, r) => {
    return sum + (r.completedAt!.getTime() - r.createdAt.getTime()) / (1000 * 60 * 60);
  }, 0);

  return {
    avgHours: Math.round((totalHours / records.length) * 100) / 100,
    recordCount: records.length,
  };
}

export async function getDailyThroughput(
  organizationId: string,
  days: number = 30,
): Promise<DailyThroughput[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const records = await prisma.workflowRecord.findMany({
    where: {
      organizationId,
      createdAt: { gte: since },
    },
    select: { createdAt: true, completedAt: true },
  });

  const dateMap: Record<string, { completed: number; created: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    dateMap[key] = { completed: 0, created: 0 };
  }

  for (const r of records) {
    const createdKey = r.createdAt.toISOString().slice(0, 10);
    if (dateMap[createdKey]) dateMap[createdKey].created++;
    if (r.completedAt) {
      const completedKey = r.completedAt.toISOString().slice(0, 10);
      if (dateMap[completedKey]) dateMap[completedKey].completed++;
    }
  }

  return Object.entries(dateMap).map(([date, data]) => ({
    date,
    ...data,
  }));
}

import "server-only";

import { prisma } from "@/lib/prisma";
import { getMappingClosingBalance } from "./balance-utils";
import { resolveCategoryLabel } from "./category-labels";
import {
  fetchLeadSchedulesWithLines,
  upsertLeadScheduleBundle,
} from "./lead-schedule-repository";
import type {
  LeadScheduleGenerationResult,
  LeadScheduleListItem,
  LeadScheduleValidationIssue,
  LeadScheduleValidationResult,
  PriorYearRollforwardReport,
} from "./types";

const MATERIALITY_THRESHOLD = 50_000;

function groupKeyForMapping(mapping: {
  statementClassification: string | null;
  canonicalAccount: { category: string } | null;
}): string {
  return (
    mapping.statementClassification ??
    mapping.canonicalAccount?.category ??
    "Other"
  );
}

export async function generateLeadSchedulesFromMappings(
  engagementId: string,
  createdById?: string,
): Promise<LeadScheduleGenerationResult> {
  const mappings = await prisma.auditAccountMapping.findMany({
    where: {
      engagementId,
      status: "confirmed",
      canonicalAccountId: { not: null },
    },
    include: { canonicalAccount: true },
    orderBy: { sourceAccountCode: "asc" },
  });

  const groups = new Map<
    string,
    typeof mappings
  >();

  for (const mapping of mappings) {
    const key = groupKeyForMapping(mapping);
    const list = groups.get(key) ?? [];
    list.push(mapping);
    groups.set(key, list);
  }

  const schedules: LeadScheduleGenerationResult["schedules"] = [];

  for (const [category, groupMappings] of groups.entries()) {
    const bundle = await upsertLeadScheduleBundle({
      engagementId,
      category,
      createdById,
      mappingLines: groupMappings.map((m) => ({
        mappingId: m.id,
        accountCode: m.sourceAccountCode,
        accountName: m.sourceAccountName,
        closingBalance: getMappingClosingBalance({
          debitAmount: m.debitAmount,
          creditAmount: m.creditAmount,
          statementClassification: m.statementClassification,
          canonicalAccount: m.canonicalAccount,
        }),
        priorBalance: 0,
      })),
    });

    const materialLineCount = groupMappings.filter((m) => {
      const bal = Math.abs(
        getMappingClosingBalance({
          debitAmount: m.debitAmount,
          creditAmount: m.creditAmount,
          statementClassification: m.statementClassification,
          canonicalAccount: m.canonicalAccount,
        }),
      );
      return bal >= MATERIALITY_THRESHOLD;
    }).length;

    schedules.push({
      leadScheduleId: bundle.leadScheduleId,
      workingPaperIndexId: bundle.workingPaperIndexId,
      category,
      lineCount: bundle.lineCount,
      totalClosingBalance: bundle.totalClosingBalance,
      materialLineCount,
    });
  }

  await prisma.auditEvent.create({
    data: {
      engagementId,
      eventType: "lead_schedule.generated",
      actorId: createdById ?? "system",
      actorName: "System",
      actorRole: "operator",
      targetType: "lead_schedule",
      targetId: engagementId,
      newState: "generated",
      description: `Generated ${schedules.length} lead schedules from confirmed mappings`,
      metadata: { scheduleCount: schedules.length },
    },
  });

  return {
    engagementId,
    generatedCount: schedules.length,
    schedules,
    generatedAt: new Date().toISOString(),
  };
}

export async function listLeadSchedulesForEngagement(
  engagementId: string,
): Promise<LeadScheduleListItem[]> {
  const rows = await fetchLeadSchedulesWithLines(engagementId);
  return rows.map((row) => ({
    id: row.id,
    workingPaperIndexId: row.workingPaperIndexId,
    paperNumber: row.workingPaperIndex.paperNumber,
    paperTitle: row.workingPaperIndex.paperTitle,
    category: row.notes?.replace("Factory auto-generated — ", "") ?? row.accountName,
    accountCode: row.accountCode,
    accountName: row.accountName,
    priorYearBalance: row.priorYearBalance,
    currentYearBalance: row.currentYearBalance,
    finalBalance: row.finalBalance,
    lineCount: row.lines.length,
    status: row.workingPaperIndex.status,
  }));
}

export async function validateLeadSchedulesForEngagement(
  engagementId: string,
): Promise<LeadScheduleValidationResult> {
  const issues: LeadScheduleValidationIssue[] = [];

  const [confirmedCount, schedules] = await Promise.all([
    prisma.auditAccountMapping.count({
      where: { engagementId, status: "confirmed" },
    }),
    fetchLeadSchedulesWithLines(engagementId),
  ]);

  if (confirmedCount > 0 && schedules.length === 0) {
    issues.push({
      code: "LS-001",
      severity: "error",
      messageAr: "توجد تعيينات مؤكدة دون قوائم ربط (Lead Schedules).",
      messageEn: "Confirmed mappings exist but no lead schedules were generated.",
    });
  }

  for (const schedule of schedules) {
    const lineTotal = schedule.lines.reduce((sum, line) => sum + line.amount, 0);
    const headerBalance = schedule.currentYearBalance ?? 0;

    if (
      schedule.lines.length > 0 &&
      Math.abs(lineTotal - headerBalance) > 0.01
    ) {
      issues.push({
        code: "LS-002",
        severity: "error",
        messageAr: `مجموع بنود ${schedule.accountCode} لا يطابق الرصيد الختامي.`,
        messageEn: `Line total for ${schedule.accountCode} does not match closing balance.`,
        leadScheduleId: schedule.id,
        accountCode: schedule.accountCode,
      });
    }

    if (schedule.lines.length === 0) {
      issues.push({
        code: "LS-004",
        severity: "error",
        messageAr: `قائمة الربط ${schedule.accountCode} بلا بنود.`,
        messageEn: `Lead schedule ${schedule.accountCode} has no detail lines.`,
        leadScheduleId: schedule.id,
        accountCode: schedule.accountCode,
      });
    }

    if (
      schedule.priorYearBalance != null &&
      schedule.priorYearBalance !== 0 &&
      schedule.currentYearBalance != null
    ) {
      const variance = Math.abs(
        schedule.currentYearBalance - schedule.priorYearBalance,
      );
      if (variance > schedule.priorYearBalance * 0.5 && variance > 100_000) {
        issues.push({
          code: "LS-003",
          severity: "warning",
          messageAr: `تباين كبير بين العام الحالي والسابق في ${schedule.accountCode}.`,
          messageEn: `Large prior-year variance on ${schedule.accountCode}.`,
          leadScheduleId: schedule.id,
          accountCode: schedule.accountCode,
        });
      }
    }
  }

  const hasError = issues.some((i) => i.severity === "error");

  return {
    passed: !hasError,
    issueCount: issues.length,
    issues,
    checkedAt: new Date().toISOString(),
  };
}

export async function buildPriorYearRollforwardForEngagement(
  engagementId: string,
): Promise<PriorYearRollforwardReport> {
  const schedules = await fetchLeadSchedulesWithLines(engagementId);

  const rows = schedules.map((s) => {
    const priorYear = s.priorYearBalance ?? 0;
    const currentYear = s.currentYearBalance ?? 0;
    const variance = currentYear - priorYear;
    const variancePct =
      priorYear !== 0 ? (variance / Math.abs(priorYear)) * 100 : null;

    return {
      category:
        s.notes?.replace("Factory auto-generated — ", "") ??
        resolveCategoryLabel(s.accountName).en,
      paperNumber: s.workingPaperIndex.paperNumber,
      priorYear,
      currentYear,
      variance,
      variancePct,
    };
  });

  return {
    engagementId,
    rows,
    generatedAt: new Date().toISOString(),
  };
}

"use server";

import {
  listReports,
  createReport,
  calculateProjectScore,
} from "@/lib/local-content/services";
import { assertProjectAccess } from "@/lib/local-content/guards";
import { checkRateLimit } from "@/lib/rate-limit";
import { RATE_LIMIT_PRESETS } from "@/lib/platform/rate-limiter/presets";
import { parseOrError } from "@/lib/local-content/schemas/common";
import { generateReportSchema } from "@/lib/local-content/schemas/report";
import {
  requirePermission,
  Permission,
  ResourceType,
} from "@/actions/localcontent-rbac";
import { type ActionResult } from "@/lib/platform/action-result";
import { invalidateCacheByPrefix } from "@/lib/platform/cache-strategy";
import {
  safe,
  logToPlatform,
  revalidateLocalContentPaths,
} from "@/actions/localcontent-shared";

// ─── Report Actions ───

export async function listLocalContentReportsAction(
  projectId: string,
): Promise<ActionResult<Awaited<ReturnType<typeof listReports>>>> {
  return safe(async () => {
    await assertProjectAccess(projectId, "view");
    await requirePermission(Permission.REPORT_MANAGEMENT, ResourceType.REPORT);
    return listReports(projectId);
  });
}

export async function generateLocalContentReportAction(
  projectId: string,
  reportType: string,
  format: string,
): Promise<ActionResult<Awaited<ReturnType<typeof createReport>>>> {
  const parsed = parseOrError(generateReportSchema, { reportType, format });
  if (!parsed.success) {
    return { ok: false as const, error: parsed.details[0]?.message || "Invalid input", code: "VALIDATION_ERROR" };
  }
  const { reportType: validatedType, format: validatedFormat } = parsed.data;

  return safe(async () => {
    const { user } = await assertProjectAccess(projectId, "create_spend");
    await requirePermission(Permission.REPORT_MANAGEMENT, ResourceType.REPORT);
    // Rate limit: report generation is CPU-heavy (score calc + PDF/XLSX)
    const { allowed } = await checkRateLimit(`lcos:report:${user.id}`, RATE_LIMIT_PRESETS.LCOS_EXPORT);
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please wait before generating more reports.");
    }
    const score = await calculateProjectScore(projectId);

    const disclaimer = [
      "───────────────────────────────────────────",
      "هذا التقرير مُولّد بواسطة LocalContentOS ولا يعد تقرير امتثال معتمد.",
      "تمت مراجعته واعتماده حسب الإجراءات الموثقة داخل النظام.",
      "AI assists. Humans decide. Evidence governs.",
      "───────────────────────────────────────────",
    ].join("\n");

    const report = await createReport({
      projectId,
      reportType: validatedType,
      format: validatedFormat,
      generatedById: user.id,
      generatedByName: user.name,
      disclaimer,
      metadata: {
        localContentPercentage: score.localContentPercentage,
        totalSpend: score.totalSpend,
        supplierCount: score.supplierCounts.total,
        evidenceCoverage: score.evidenceStats.coveragePercentage,
        findingCount: score.findingStats.total,
        generatedAt: new Date().toISOString(),
      },
    });

    await logToPlatform({
      projectId,
      user,
      action: "localcontent.report.generated",
      targetType: "LocalContentReport",
      targetId: report.id,
      metadata: { reportType: validatedType, format: validatedFormat },
    });

    revalidateLocalContentPaths(projectId, ["reports"]);
    await invalidateCacheByPrefix(`dashboard:localcontent:${user.organizationId}:stats`);
    return report;
  });
}

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
import { prisma } from "@/lib/kernel";
import { getCurrentUser } from "@/lib/auth";

// ─── Report Types ───

export type LcScoreReportRow = {
  projectId: string;
  projectName: string;
  reportingPeriod: string;
  score: number | null;
  totalSpend: number;
  localPercentage: number;
};

export type SpendReportRow = {
  category: string;
  total: number;
  local: number;
  international: number;
  localPct: number;
};

export type SupplierReportRow = {
  classification: string;
  count: number;
  totalSpend: number;
};

// ─── Dashboard Report Actions ───

export async function getLcScoreReportAction(): Promise<
  ActionResult<LcScoreReportRow[]>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.REPORT_MANAGEMENT, ResourceType.REPORT);

    const projects = await prisma.localContentProject.findMany({
      where: { organizationId: user.organizationId },
      select: {
        id: true,
        name: true,
        reportingPeriod: true,
        localContentScore: true,
        spendRecords: {
          select: { amount: true, category: true, supplierId: true },
        },
        suppliers: {
          select: { id: true, localityClassification: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 100,
    });

    const localSupplierIds = new Set(
      projects.flatMap((p) =>
        p.suppliers
          .filter((s) => s.localityClassification === "local")
          .map((s) => s.id),
      ),
    );

    return projects.map((p) => {
      const totalSpend = p.spendRecords.reduce((s, r) => s + r.amount, 0);
      const localSpend = p.spendRecords
        .filter((r) => localSupplierIds.has(r.supplierId))
        .reduce((s, r) => s + r.amount, 0);
      return {
        projectId: p.id,
        projectName: p.name,
        reportingPeriod: p.reportingPeriod,
        score: p.localContentScore,
        totalSpend,
        localPercentage: totalSpend > 0 ? (localSpend / totalSpend) * 100 : 0,
      };
    });
  });
}

export async function getSpendReportAction(): Promise<
  ActionResult<SpendReportRow[]>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.REPORT_MANAGEMENT, ResourceType.REPORT);

    const projects = await prisma.localContentProject.findMany({
      where: { organizationId: user.organizationId },
      select: {
        spendRecords: {
          select: {
            amount: true,
            category: true,
            supplier: {
              select: { localityClassification: true },
            },
          },
        },
      },
      take: 100,
    });

    const allRecords = projects.flatMap((p) => p.spendRecords);
    const byCategory = new Map<string, SpendReportRow>();

    for (const r of allRecords) {
      const cat = r.category || "other";
      const existing = byCategory.get(cat) || {
        category: cat,
        total: 0,
        local: 0,
        international: 0,
        localPct: 0,
      };
      existing.total += r.amount;
      if (r.supplier?.localityClassification === "local") {
        existing.local += r.amount;
      } else {
        existing.international += r.amount;
      }
      existing.localPct =
        existing.total > 0 ? (existing.local / existing.total) * 100 : 0;
      byCategory.set(cat, existing);
    }

    return Array.from(byCategory.values()).sort(
      (a, b) => b.total - a.total,
    );
  });
}

export async function getSupplierReportAction(): Promise<
  ActionResult<SupplierReportRow[]>
> {
  return safe(async () => {
    const user = await getCurrentUser();
    await requirePermission(Permission.REPORT_MANAGEMENT, ResourceType.REPORT);

    const projects = await prisma.localContentProject.findMany({
      where: { organizationId: user.organizationId },
      select: {
        suppliers: {
          select: {
            localityClassification: true,
            spendRecords: { select: { amount: true } },
          },
        },
      },
      take: 100,
    });

    const allSuppliers = projects.flatMap((p) => p.suppliers);
    const byClass = new Map<string, SupplierReportRow>();

    for (const s of allSuppliers) {
      const cls = s.localityClassification || "unclassified";
      const existing = byClass.get(cls) || {
        classification: cls,
        count: 0,
        totalSpend: 0,
      };
      existing.count++;
      existing.totalSpend += s.spendRecords.reduce(
        (sum, r) => sum + r.amount,
        0,
      );
      byClass.set(cls, existing);
    }

    return Array.from(byClass.values()).sort(
      (a, b) => b.totalSpend - a.totalSpend,
    );
  });
}

// ─── Existing Report Actions ───

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

// ─── AuditOS L6.3 Materiality Engine ───
// حساب مستويات الأهمية النسبية مع المنهجيات والتوثيق
// ISA 320, ISA 450 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditActor } from "./actor-context";
import { assertEngagementAccess } from "./tenant-guard";
import { recordAuditEvent } from "./services";

// ─── Types ───

export type BenchmarkType = "revenue" | "profit_before_tax" | "total_assets" | "net_assets" | "custom";
export type SourceType = "trial_balance" | "prior_year" | "budgeted" | "preliminary";
export type MaterialityStatus = "draft" | "reviewed" | "approved";
export type BenchmarkStatus = "preliminary" | "final" | "updated";

export interface MethodologyConfig {
  benchmarkType: BenchmarkType;
  percentageMin: number;
  percentageMax: number;
  percentageDefault: number;
  label: string;
  description: string;
  regulatoryReference: string;
}

export const METHODOLOGIES: MethodologyConfig[] = [
  {
    benchmarkType: "revenue",
    percentageMin: 0.005,
    percentageMax: 0.01,
    percentageDefault: 0.005,
    label: "نسبة من الإيرادات",
    description: "0.5% – 1% من إجمالي الإيرادات (ISA 320)",
    regulatoryReference: "ISA 320.A3",
  },
  {
    benchmarkType: "profit_before_tax",
    percentageMin: 0.05,
    percentageMax: 0.10,
    percentageDefault: 0.05,
    label: "نسبة من الربح قبل الضريبة",
    description: "5% – 10% من الربح قبل الضريبة (ISA 320)",
    regulatoryReference: "ISA 320.A4",
  },
  {
    benchmarkType: "total_assets",
    percentageMin: 0.01,
    percentageMax: 0.02,
    percentageDefault: 0.01,
    label: "نسبة من إجمالي الأصول",
    description: "1% – 2% من إجمالي الأصول (ISA 320)",
    regulatoryReference: "ISA 320.A5",
  },
  {
    benchmarkType: "net_assets",
    percentageMin: 0.02,
    percentageMax: 0.05,
    percentageDefault: 0.02,
    label: "نسبة من صافي الأصول",
    description: "2% – 5% من صافي الأصول (ISA 320)",
    regulatoryReference: "ISA 320.A6",
  },
];

export interface MaterialityCalculationInput {
  engagementId: string;
  benchmarkType: BenchmarkType;
  sourceType: SourceType;
  benchmarkValue: number;
  currency: string;
  percentage: number;
  percentageRule?: string;
  rationale?: string;
  methodologyRef?: string;
  performancePercentage?: number;
  trivialPercentage?: number;
}

export interface MaterialityCalculationResult {
  benchmarkId: string;
  planningId: string;
  performanceId: string;
  trivialId: string;
  benchmarkValue: number;
  planningMateriality: number;
  performanceMateriality: number;
  trivialThreshold: number;
  currency: string;
  percentage: number;
  performancePercentage: number;
  trivialPercentage: number;
  methodologyRef?: string;
  status: MaterialityStatus;
}

// ─── Service ───

export class MaterialityEngine {
  /**
   * Calculate and persist a complete materiality set for an engagement.
   */
  async calculate(
    actor: AuditActor,
    input: MaterialityCalculationInput,
  ): Promise<MaterialityCalculationResult> {
    await assertEngagementAccess(input.engagementId, actor);

    const planningAmount = input.benchmarkValue * input.percentage;
    const performancePct = input.performancePercentage ?? 0.75;
    const performanceAmount = planningAmount * performancePct;
    const trivialPct = input.trivialPercentage ?? 0.05;
    const trivialAmount = planningAmount * trivialPct;

    const result = await prisma.$transaction(async (tx) => {
      // 1. Create benchmark
      const benchmark = await tx.materialityBenchmark.create({
        data: {
          engagementId: input.engagementId,
          benchmarkType: input.benchmarkType,
          sourceType: input.sourceType,
          value: input.benchmarkValue,
          currency: input.currency,
          methodologyRef: input.methodologyRef,
          methodologyRule: input.percentageRule,
          status: "preliminary",
          createdById: actor.actorId,
        },
      });

      // 2. Create planning materiality
      const planning = await tx.planningMateriality.create({
        data: {
          engagementId: input.engagementId,
          benchmarkId: benchmark.id,
          percentage: input.percentage,
          percentageRule: input.percentageRule,
          computedAmount: Math.round(planningAmount * 100) / 100,
          currency: input.currency,
          rationale: input.rationale ?? null,
          status: "draft",
        },
      });

      // 3. Create performance materiality
      const performance = await tx.performanceMateriality.create({
        data: {
          engagementId: input.engagementId,
          planningMaterialityId: planning.id,
          percentage: performancePct,
          computedAmount: Math.round(performanceAmount * 100) / 100,
          currency: input.currency,
        },
      });

      // 4. Create trivial threshold
      const trivial = await tx.trivialThreshold.create({
        data: {
          engagementId: input.engagementId,
          planningMaterialityId: planning.id,
          percentage: trivialPct,
          computedAmount: Math.round(trivialAmount * 100) / 100,
          currency: input.currency,
        },
      });

      return { benchmark, planning, performance, trivial };
    });

    // Audit trail
    await recordAuditEvent({
      engagementId: input.engagementId,
      eventType: "materiality.calculated",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: input.engagementId,
      newState: "materiality_calculated",
      description: `Materiality: ${input.benchmarkType} × ${(input.percentage * 100).toFixed(1)}% = planning ${result.planning.computedAmount} ${input.currency}`,
      aiRelated: false,
      metadata: {
        benchmarkType: input.benchmarkType,
        benchmarkValue: input.benchmarkValue,
        percentage: input.percentage,
        planningMateriality: result.planning.computedAmount,
        performanceMateriality: result.performance.computedAmount,
        trivialThreshold: result.trivial.computedAmount,
      },
    });

    return {
      benchmarkId: result.benchmark.id,
      planningId: result.planning.id,
      performanceId: result.performance.id,
      trivialId: result.trivial.id,
      benchmarkValue: input.benchmarkValue,
      planningMateriality: result.planning.computedAmount,
      performanceMateriality: result.performance.computedAmount,
      trivialThreshold: result.trivial.computedAmount,
      currency: input.currency,
      percentage: input.percentage,
      performancePercentage: performancePct,
      trivialPercentage: trivialPct,
      methodologyRef: input.methodologyRef,
      status: "draft",
    };
  }

  /**
   * Get the current materiality set for an engagement.
   */
  async getCurrent(engagementId: string) {
    const planning = await prisma.planningMateriality.findFirst({
      where: { engagementId, status: { not: undefined } },
      orderBy: { version: "desc" },
      include: {
        benchmark: true,
        performanceMateriality: true,
        trivialThreshold: true,
      },
    });
    return planning;
  }

  /**
   * Get all materiality versions for an engagement.
   */
  async getHistory(engagementId: string) {
    return prisma.planningMateriality.findMany({
      where: { engagementId },
      orderBy: { version: "desc" },
      include: {
        benchmark: true,
        performanceMateriality: true,
        trivialThreshold: true,
      },
    });
  }

  /**
   * Approve materiality for an engagement.
   */
  async approve(
    actor: AuditActor,
    planningMaterialityId: string,
    engagementId: string,
  ): Promise<void> {
    await assertEngagementAccess(engagementId, actor);

    await prisma.$transaction(async (tx) => {
      const planning = await tx.planningMateriality.update({
        where: { id: planningMaterialityId },
        data: {
          status: "approved",
          approvedById: actor.actorId,
          approvedAt: new Date(),
        },
      });

      await tx.performanceMateriality.update({
        where: { planningMaterialityId },
        data: {
          approvedById: actor.actorId,
          approvedAt: new Date(),
        },
      });

      await tx.trivialThreshold.update({
        where: { planningMaterialityId },
        data: {
          reviewedById: actor.actorId,
          reviewedAt: new Date(),
        },
      });

      await tx.materialityBenchmark.update({
        where: { id: planning.benchmarkId! },
        data: { status: "final" },
      });
    });

    await recordAuditEvent({
      engagementId,
      eventType: "materiality.approved",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: engagementId,
      newState: "materiality_approved",
      description: `Materiality approved for engagement ${engagementId}`,
      aiRelated: false,
    });
  }

  /**
   * Record a materiality override with partner approval.
   */
  async recordOverride(
    actor: AuditActor,
    input: {
      engagementId: string;
      materialityType: "planning" | "performance" | "trivial";
      materialityEntityId: string;
      overriddenAmount: number;
      originalAmount: number;
      currency: string;
      reason: string;
    },
  ): Promise<void> {
    await assertEngagementAccess(input.engagementId, actor);

    // Get the actor's organizationId
    const engagement = await prisma.auditEngagement.findUnique({
      where: { id: input.engagementId },
      select: { organizationId: true },
    });
    if (!engagement) throw new Error("Engagement not found");

    await prisma.materialityOverride.create({
      data: {
        organizationId: engagement.organizationId,
        engagementId: input.engagementId,
        materialityType: input.materialityType,
        materialityEntityId: input.materialityEntityId,
        overriddenAmount: input.overriddenAmount,
        originalAmount: input.originalAmount,
        currency: input.currency,
        reason: input.reason,
        approvedById: actor.actorId,
        approvedAt: new Date(),
        createdById: actor.actorId,
      },
    });

    await recordAuditEvent({
      engagementId: input.engagementId,
      eventType: "materiality.override",
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "engagement",
      targetId: input.engagementId,
      newState: "materiality_overridden",
      description: `${input.materialityType} materiality overridden: ${input.originalAmount} → ${input.overriddenAmount}. Reason: ${input.reason}`,
      aiRelated: false,
      metadata: {
        materialityType: input.materialityType,
        originalAmount: input.originalAmount,
        overriddenAmount: input.overriddenAmount,
        reason: input.reason,
      },
    });
  }

  /**
   * List all methodologies supported by the engine.
   */
  getMethodologies(): MethodologyConfig[] {
    return METHODOLOGIES;
  }

  /**
   * Suggest a benchmark value from the trial balance.
   */
  async suggestBenchmarkValue(
    engagementId: string,
    benchmarkType: BenchmarkType,
  ): Promise<number | null> {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { importTimestamp: "desc" },
      include: { lines: true },
    });
    if (!tb) return null;

    const { lines } = tb;

    switch (benchmarkType) {
      case "revenue": {
        const revenueLines = lines.filter(
          (l) =>
            l.accountType === "revenue" ||
            l.accountName.toLowerCase().includes("revenue") ||
            l.accountName.toLowerCase().includes("مبيعات") ||
            l.accountName.toLowerCase().includes("إيراد"),
        );
        return revenueLines.reduce((sum, l) => sum + Math.abs(l.balance), 0) || null;
      }
      case "total_assets": {
        const assetLines = lines.filter(
          (l) =>
            l.accountType === "asset" ||
            l.accountName.toLowerCase().includes("asset") ||
            l.accountName.toLowerCase().includes("أصول") ||
            l.accountName.toLowerCase().includes("موجودات"),
        );
        const total = assetLines.reduce((sum, l) => sum + Math.abs(l.balance), 0);
        return total || null;
      }
      case "profit_before_tax":
      case "net_assets": {
        // Calculate from income statement / equity accounts
        const incomeLines = lines.filter(
          (l) =>
            l.accountType === "income" ||
            l.accountType === "expense" ||
            l.accountName.toLowerCase().includes("profit") ||
            l.accountName.toLowerCase().includes("ربح"),
        );
        const netProfit = incomeLines.reduce((sum, l) => sum + l.balance, 0);
        return Math.abs(netProfit) || null;
      }
      default:
        return null;
    }
  }

  /**
   * Generate a working paper summary for the materiality set.
   */
  async generateWorkingPaper(engagementId: string): Promise<string> {
    const current = await this.getCurrent(engagementId);
    if (!current) return "لم يتم حساب الأهمية النسبية بعد.";

    const bm = current.benchmark;
    const pm = current.performanceMateriality;
    const tt = current.trivialThreshold;

    const lines: string[] = [];
    lines.push("ورقة عمل الأهمية النسبية");
    lines.push("=".repeat(40));
    lines.push(`مهمة المراجعة: ${engagementId}`);
    lines.push(`التاريخ: ${new Date().toLocaleDateString("ar-SA")}`);
    lines.push("");
    lines.push("1. الأساس المختار:");
    lines.push(`   النوع: ${bm?.benchmarkType ?? "غير محدد"}`);
    lines.push(`   القيمة: ${bm?.value.toLocaleString() ?? "0"} ${bm?.currency ?? ""}`);
    lines.push(`   المصدر: ${bm?.sourceType ?? "غير محدد"}`);
    lines.push(`   المنهجية: ${bm?.methodologyRef ?? " ISA 320"}`);
    lines.push("");
    lines.push("2. الأهمية النسبية العامة (Planning Materiality):");
    lines.push(`   النسبة: ${(current.percentage * 100).toFixed(1)}%`);
    lines.push(`   المبلغ: ${current.computedAmount.toLocaleString()} ${current.currency}`);
    lines.push(`   الحالة: ${current.status}`);
    lines.push("");
    lines.push("3. أداء الأهمية النسبية (Performance Materiality):");
    lines.push(`   النسبة: ${(pm?.percentage ?? 0.75) * 100}%`);
    lines.push(`   المبلغ: ${(pm?.computedAmount ?? 0).toLocaleString()} ${current.currency}`);
    lines.push("");
    lines.push("4. عتبة التافه الواضح (Clearly Trivial Threshold):");
    lines.push(`   النسبة: ${(tt?.percentage ?? 0.05) * 100}%`);
    lines.push(`   المبلغ: ${(tt?.computedAmount ?? 0).toLocaleString()} ${current.currency}`);
    lines.push("");
    lines.push("5. الاعتماد والموافقة:");
    lines.push(`   حالة الاعتماد: ${current.status === "approved" ? "✔ معتمد" : "✗ قيد المراجعة"}`);

    return lines.join("\n");
  }
}

export const materialityEngine = new MaterialityEngine();

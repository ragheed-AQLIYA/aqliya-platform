// ─── AuditOS L6.4 Sampling Hardening Engine ───
// توثيق أدلة العينات والتحقق من المنهجية
// ISA 530 compliant

import "server-only";
import { prisma } from "@/lib/prisma";
import type { AuditActor } from "./actor-context";
import { assertEngagementAccess } from "./tenant-guard";
import { recordAuditEvent } from "./services";

export class SamplingHardeningEngine {
  // ==================== Evidence ====================

  async recordEvidence(
    actor: AuditActor,
    data: {
      organizationId: string;
      planId: string;
      resultId?: string;
      itemIndex: number;
      itemReference?: string;
      itemDescription?: string;
      evidenceType?: string;
      evidenceRef?: string;
      evidenceDescription?: string;
      conclusion: string;
      errorAmount?: number;
      errorDescription?: string;
    },
  ) {
    const evidence = await prisma.samplingEvidence.create({
      data: {
        organizationId: data.organizationId,
        planId: data.planId,
        resultId: data.resultId,
        itemIndex: data.itemIndex,
        itemReference: data.itemReference,
        itemDescription: data.itemDescription,
        evidenceType: data.evidenceType ?? "document",
        evidenceRef: data.evidenceRef,
        evidenceDescription: data.evidenceDescription,
        conclusion: data.conclusion,
        errorAmount: data.errorAmount,
        errorDescription: data.errorDescription,
        testedById: actor.actorId,
        testedAt: new Date(),
      },
    });

    await this.audit(actor, "sampling.evidence.recorded", data.planId, {
      evidenceId: evidence.id,
      itemIndex: data.itemIndex,
    });

    return evidence;
  }

  async listEvidence(planId: string) {
    return prisma.samplingEvidence.findMany({
      where: { planId },
      orderBy: { itemIndex: "asc" },
    });
  }

  async getEvidenceByResult(resultId: string) {
    return prisma.samplingEvidence.findMany({
      where: { resultId },
      orderBy: { itemIndex: "asc" },
    });
  }

  async generateWorkingPaper(planId: string): Promise<string> {
    const plan = await prisma.samplingPlan.findUnique({ where: { id: planId } });
    if (!plan) return "خطة العينة غير موجودة";

    const evidence = await prisma.samplingEvidence.findMany({
      where: { planId },
      orderBy: { itemIndex: "asc" },
    });

    const lines: string[] = [];
    lines.push("ورقة عمل العينة الإحصائية");
    lines.push("=".repeat(50));
    lines.push(`العنوان: ${plan.title}`);
    lines.push(`المنهجية: ${plan.method}`);
    lines.push(`حجم المجتمع: ${plan.populationSize}`);
    lines.push(`حجم العينة: ${plan.sampleSize ?? "—"}`);
    lines.push(`مستوى الثقة: ${(plan.confidenceLevel * 100).toFixed(0)}%`);
    lines.push(`نسبة الأهمية: ${plan.materialityPct}%`);
    lines.push("");
    lines.push("نتائج الاختبار:");
    lines.push("-".repeat(30));

    const errors = evidence.filter((e) => e.conclusion === "error_found");
    const tested = evidence.filter((e) => e.conclusion !== "not_applicable");

    lines.push(`العناصر المختبرة: ${tested.length}`);
    lines.push(`الأخطاء المكتشفة: ${errors.length}`);
    lines.push(`معدل الخطأ: ${tested.length > 0 ? ((errors.length / tested.length) * 100).toFixed(1) : 0}%`);

    if (errors.length > 0) {
      lines.push("");
      lines.push("تفاصيل الأخطاء:");
      for (const err of errors) {
        lines.push(`  - البند ${err.itemIndex}: ${err.errorDescription ?? "—"}${err.errorAmount ? ` (${err.errorAmount.toLocaleString()} SAR)` : ""}`);
      }
    }

    lines.push("");
    lines.push(`تاريخ الإعداد: ${new Date().toLocaleDateString("ar-SA")}`);

    // Get reviews
    const review = await prisma.samplingReview.findFirst({
      where: { planId, status: { not: "pending" } },
      orderBy: { reviewedAt: "desc" },
    });

    if (review) {
      lines.push(`حالة المراجعة: ${review.status}`);
      lines.push(`تاريخ المراجعة: ${review.reviewedAt ? new Date(review.reviewedAt).toLocaleDateString("ar-SA") : "—"}`);
    }

    return lines.join("\n");
  }

  // ==================== Reviewer Validation ====================

  async submitForReview(
    actor: AuditActor,
    data: {
      organizationId: string;
      planId: string;
      resultId?: string;
      reviewType?: string;
    },
  ) {
    return prisma.samplingReview.create({
      data: {
        organizationId: data.organizationId,
        planId: data.planId,
        resultId: data.resultId,
        reviewerId: actor.actorId,
        reviewerName: actor.actorName,
        reviewType: data.reviewType ?? "full",
        status: "pending",
      },
    });
  }

  async approveSample(
    actor: AuditActor,
    reviewId: string,
    planId: string,
    data: {
      methodologyValid?: boolean;
      selectionValid?: boolean;
      conclusionValid?: boolean;
      comments?: string;
    },
  ) {
    const review = await prisma.samplingReview.update({
      where: { id: reviewId },
      data: {
        status: "approved",
        ...data,
        reviewerId: actor.actorId,
        reviewerName: actor.actorName,
        reviewedAt: new Date(),
      },
    });

    await prisma.samplingPlan.update({
      where: { id: planId },
      data: { status: "REVIEWED" },
    });

    await this.audit(actor, "sampling.review.approved", planId, {
      reviewId,
      methodologyValid: data.methodologyValid,
      conclusionValid: data.conclusionValid,
    });

    return review;
  }

  async rejectSample(
    actor: AuditActor,
    reviewId: string,
    planId: string,
    justification: string,
    comments?: string,
  ) {
    const review = await prisma.samplingReview.update({
      where: { id: reviewId },
      data: {
        status: "rejected",
        justification,
        comments,
        reviewerId: actor.actorId,
        reviewerName: actor.actorName,
        reviewedAt: new Date(),
      },
    });

    await this.audit(actor, "sampling.review.rejected", planId, {
      reviewId,
      justification,
    });

    return review;
  }

  async requestChanges(
    actor: AuditActor,
    reviewId: string,
    planId: string,
    comments: string,
  ) {
    const review = await prisma.samplingReview.update({
      where: { id: reviewId },
      data: {
        status: "changes_requested",
        comments,
        reviewerId: actor.actorId,
        reviewerName: actor.actorName,
        reviewedAt: new Date(),
      },
    });

    return review;
  }

  async getReviewStatus(planId: string) {
    const reviews = await prisma.samplingReview.findMany({
      where: { planId },
      orderBy: { reviewedAt: "desc" },
    });

    return {
      totalReviews: reviews.length,
      latestReview: reviews[0] ?? null,
      approved: reviews.some((r) => r.status === "approved"),
      rejected: reviews.some((r) => r.status === "rejected"),
      pending: reviews.filter((r) => r.status === "pending"),
    };
  }

  // ==================== Summary ====================

  async getPlanSummary(planId: string) {
    const [plan, evidence, review] = await Promise.all([
      prisma.samplingPlan.findUnique({ where: { id: planId } }),
      prisma.samplingEvidence.findMany({ where: { planId } }),
      prisma.samplingReview.findFirst({
        where: { planId },
        orderBy: { reviewedAt: "desc" },
      }),
    ]);

    if (!plan) return null;

    const errorItems = evidence.filter((e) => e.conclusion === "error_found");

    return {
      plan,
      evidenceCount: evidence.length,
      errorCount: errorItems.length,
      errorRate: evidence.length > 0 ? ((errorItems.length / evidence.length) * 100).toFixed(1) : "0.0",
      totalErrorAmount: errorItems.reduce((sum, e) => sum + (e.errorAmount ?? 0), 0),
      reviewStatus: review?.status ?? "not_reviewed",
      evidence,
    };
  }

  // ─── Private ───

  private async audit(
    actor: AuditActor,
    action: string,
    planId: string,
    metadata?: Record<string, unknown>,
  ) {
    await recordAuditEvent({
      engagementId: "",
      eventType: action,
      actorId: actor.actorId,
      actorName: actor.actorName,
      actorRole: actor.actorRole,
      targetType: "sampling_plan",
      targetId: planId,
      newState: action,
      description: `[Sampling] ${action}`,
      aiRelated: false,
      metadata,
    });
  }
}

export const samplingHardening = new SamplingHardeningEngine();

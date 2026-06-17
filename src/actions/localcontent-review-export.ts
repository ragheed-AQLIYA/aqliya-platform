// ─── LocalContentOS — Review Summary Export Action ───
// Generates a bilingual PDF summary of AI review results.
// P0: Read-only, no mutations.

"use server";

import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import PDFDocument from "pdfkit";
import {
  formatPdfArabicNumber,
  getLocalContentPdfLocale,
  pdfTextOptions,
} from "@/lib/local-content/pdf-arabic";

// ─── Types ───

export interface ReviewExportResult {
  success: boolean;
  data?: {
    filename: string;
    contentType: string;
    /** Base64-encoded PDF content */
    base64: string;
  };
  error?: string;
}

// ─── Action ───

export async function exportReviewSummaryPdfAction(): Promise<ReviewExportResult> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Not authenticated" };

    const orgId = user.organizationId;

    // Gather data
    const [suggestions, explanations, healthRecords, reviewRuns, memCount] =
      await Promise.all([
        prisma.lcPatternSuggestion.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
        prisma.lcMatchReview.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 500,
        }),
        prisma.lcPatternHealthRecord.findMany({
          where: { organizationId: orgId },
          orderBy: { healthScore: "desc" },
          take: 100,
        }),
        prisma.lcAiReviewRun.findMany({
          where: { organizationId: orgId },
          orderBy: { createdAt: "desc" },
          take: 1,
        }),
        prisma.lcOrganizationMatchMemory.count({
          where: { organizationId: orgId },
        }),
      ]);

    const lastRun = reviewRuns[0] ?? null;

    // Compute metrics
    const total = suggestions.length;
    const approved = suggestions.filter((s) => s.status === "approved").length;
    const rejected = suggestions.filter((s) => s.status === "rejected").length;
    const pending = suggestions.filter((s) => s.status === "pending").length;
    const acceptanceRate =
      approved + rejected > 0
        ? Math.round((approved / (approved + rejected)) * 100)
        : 0;
    const avgConf =
      total > 0
        ? Math.round(
            suggestions.reduce((sum, s) => sum + s.confidence, 0) / total,
          )
        : 0;

    const totalExp = explanations.length;
    const confirmedExp = explanations.filter((e) => e.status === "confirmed").length;
    const fpositives = explanations.filter((e) => e.isFalsePositive).length;
    const highRisk = explanations.filter((e) => e.riskLevel === "high").length;

    const healthyRecords = healthRecords.filter(
      (h) => h.status === "high_performing",
    ).length;
    const avgHealth =
      healthRecords.length > 0
        ? Math.round(
            healthRecords.reduce((sum, h) => sum + h.healthScore, 0) /
              healthRecords.length,
          )
        : 0;

    // Generate PDF
    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 50, left: 50, right: 50 },
      info: {
        Title: "AI Review Summary — LocalContentOS",
        Author: "AQLIYA LocalContentOS",
        Subject: "AI Review Summary Report",
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const endPromise = new Promise<void>((resolve) =>
      doc.on("end", () => resolve()),
    );

    const locale = getLocalContentPdfLocale();
    const t = pdfTextOptions(locale);

    // ─── Header ───
    doc.fontSize(16).font("Helvetica-Bold").text("LocalContentOS", t);
    doc.fontSize(10).font("Helvetica").text("ملخص مراجعة مخرجات الذكاء الاصطناعي", t);
    doc.fontSize(8).font("Helvetica").text("AI Review Summary Report", t);
    doc.moveDown(0.4);
    doc
      .fontSize(7)
      .fillColor("#666")
      .text(`تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")}`, t);
    doc
      .fontSize(7)
      .fillColor("#666")
      .text(`المستخدم: ${user.email}`, t);
    doc.fillColor("#000");
    doc.moveDown(0.8);

    // ─── Section 1: Suggestions ───
    doc.fontSize(11).font("Helvetica-Bold").text("1. اقتراحات الأنماط / Pattern Suggestions", t);
    doc.moveDown(0.2);
    doc.fontSize(8).font("Helvetica");

    const sData = [
      ["الإجمالي", "مقبول", "مرفوض", "معلق", "معدل القبول", "متوسط الثقة"],
      [
        String(total),
        String(approved),
        String(rejected),
        String(pending),
        `${acceptanceRate}%`,
        `${avgConf}%`,
      ],
    ];
    for (const row of sData) {
      doc.text(row.join("  |  "), t);
      doc.moveDown(0.1);
    }
    doc.moveDown(0.6);

    // ─── Section 2: Explanations ───
    doc.fontSize(11).font("Helvetica-Bold").text("2. تفسيرات الحسابات / Account Explanations", t);
    doc.moveDown(0.2);
    doc.fontSize(8).font("Helvetica");

    const eData = [
      ["الإجمالي", "مؤكد", "إيجابيات كاذبة", "عالية المخاطر"],
      [String(totalExp), String(confirmedExp), String(fpositives), String(highRisk)],
    ];
    for (const row of eData) {
      doc.text(row.join("  |  "), t);
      doc.moveDown(0.1);
    }
    doc.moveDown(0.6);

    // ─── Section 3: Pattern Health ───
    doc.fontSize(11).font("Helvetica-Bold").text("3. صحة الأنماط / Pattern Health", t);
    doc.moveDown(0.2);
    doc.fontSize(8).font("Helvetica");

    const hData = [
      ["سجلات الصحة", "عالية الأداء", "متوسط الصحة", "ذاكرة التنظيم"],
      [
        String(healthRecords.length),
        String(healthyRecords),
        `${avgHealth}%`,
        String(memCount),
      ],
    ];
    for (const row of hData) {
      doc.text(row.join("  |  "), t);
      doc.moveDown(0.1);
    }
    doc.moveDown(0.6);

    // ─── Section 4: Pipeline ───
    if (lastRun) {
      doc.fontSize(11).font("Helvetica-Bold").text("4. آخر تشغيل pipeline / Last Pipeline Run", t);
      doc.moveDown(0.2);
      doc.fontSize(8).font("Helvetica");
      doc.text(`الحالة: ${lastRun.status === "completed" ? "مكتمل ✅" : lastRun.status}`, t);
      doc.text(
        `التفسيرات المولّدة: ${lastRun.explanationsGenerated}`,
        t,
      );
      doc.text(`الاقتراحات: ${lastRun.patternSuggestions}`, t);
      doc.text(
        `التاريخ: ${lastRun.createdAt.toLocaleDateString("ar-SA")}`,
        t,
      );
    }

    doc.moveDown(1);

    // ─── Recent approved suggestions ───
    const recentApproved = suggestions
      .filter((s) => s.status === "approved")
      .slice(0, 10);
    if (recentApproved.length > 0) {
      doc.fontSize(10).font("Helvetica-Bold").text("آخر الاقتراحات المعتمدة", t);
      doc.fontSize(7).font("Helvetica");
      doc.moveDown(0.1);
      for (const s of recentApproved) {
        const reasonTrunc = (s.reasoning ?? "").substring(0, 80);
        doc.text(
          `• ${s.workbookLineCode} — ${s.suggestedPattern.substring(0, 50)} [ثقة: ${s.confidence}%] ${reasonTrunc ? `— ${reasonTrunc}` : ""}`,
          { ...t, indent: 10 },
        );
        doc.moveDown(0.05);
      }
    }

    doc.moveDown(1);

    // ─── Disclaimer ───
    doc
      .fontSize(6)
      .fillColor("#888")
      .font("Helvetica")
      .text(
        "AI assists. Humans decide. Evidence governs. هذا التقرير مولّد بواسطة LocalContentOS تحت AQLIYA. " +
          "يمثل ملخص مراجعة مخرجات الذكاء الاصطناعي وليس تقرير امتثال نظامي.",
        t,
      );

    // Footer
    const range = doc.bufferedPageRange();
    if (range && range.count > 0) {
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        doc.fontSize(7).fillColor("#888888").font("Helvetica");
        doc.text(
          `AQLIYA LocalContentOS — AI Review Summary — Page ${i + 1}`,
          50,
          doc.page.height - 50 - 10,
          { align: "center", width: 495 },
        );
      }
    }

    doc.end();
    await endPromise;

    const buffer = Buffer.concat(chunks);

    return {
      success: true,
      data: {
        filename: `ai-review-summary-${new Date().toISOString().split("T")[0]}.pdf`,
        contentType: "application/pdf",
        base64: buffer.toString("base64"),
      },
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : "Failed to generate PDF",
    };
  }
}

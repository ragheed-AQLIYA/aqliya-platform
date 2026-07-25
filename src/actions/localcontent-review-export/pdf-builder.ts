"use server";

import PDFDocument from "pdfkit";
import {
  getLocalContentPdfLocale,
  pdfTextOptions,
} from "@/lib/local-content/pdf-arabic";
import type { ReviewMetrics } from "./metrics";

interface UserInfo {
  email: string;
}

interface Suggestion {
  status: string;
  confidence: number;
  reasoning: string | null;
  workbookLineCode: string;
  suggestedPattern: string;
}

interface Explanation {
  status: string;
  isFalsePositive: boolean;
  riskLevel: string;
}

interface HealthRecord {
  healthScore: number;
  status: string;
}

interface PipelineRun {
  status: string;
  explanationsGenerated: number;
  patternSuggestions: number;
  createdAt: Date;
}

export async function generateReviewPdf(
  user: UserInfo,
  suggestions: Suggestion[],
  explanations: Explanation[],
  healthRecords: HealthRecord[],
  lastRun: PipelineRun | null,
  memCount: number,
  metrics: ReviewMetrics,
): Promise<{ filename: string; contentType: string; base64: string }> {
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

  // Header
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

  // Section 1: Suggestions
  doc.fontSize(11).font("Helvetica-Bold").text("1. اقتراحات الأنماط / Pattern Suggestions", t);
  doc.moveDown(0.2);
  doc.fontSize(8).font("Helvetica");

  const sData = [
    ["الإجمالي", "مقبول", "مرفوض", "معلق", "معدل القبول", "متوسط الثقة"],
    [
      String(metrics.total),
      String(metrics.approved),
      String(metrics.rejected),
      String(metrics.pending),
      `${metrics.acceptanceRate}%`,
      `${metrics.avgConf}%`,
    ],
  ];
  for (const row of sData) {
    doc.text(row.join("  |  "), t);
    doc.moveDown(0.1);
  }
  doc.moveDown(0.6);

  // Section 2: Explanations
  doc.fontSize(11).font("Helvetica-Bold").text("2. تفسيرات الحسابات / Account Explanations", t);
  doc.moveDown(0.2);
  doc.fontSize(8).font("Helvetica");

  const eData = [
    ["الإجمالي", "مؤكد", "إيجابيات كاذبة", "عالية المخاطر"],
    [
      String(metrics.totalExp),
      String(metrics.confirmedExp),
      String(metrics.fpositives),
      String(metrics.highRisk),
    ],
  ];
  for (const row of eData) {
    doc.text(row.join("  |  "), t);
    doc.moveDown(0.1);
  }
  doc.moveDown(0.6);

  // Section 3: Pattern Health
  doc.fontSize(11).font("Helvetica-Bold").text("3. صحة الأنماط / Pattern Health", t);
  doc.moveDown(0.2);
  doc.fontSize(8).font("Helvetica");

  const hData = [
    ["سجلات الصحة", "عالية الأداء", "متوسط الصحة", "ذاكرة التنظيم"],
    [
      String(healthRecords.length),
      String(metrics.healthyRecords),
      `${metrics.avgHealth}%`,
      String(memCount),
    ],
  ];
  for (const row of hData) {
    doc.text(row.join("  |  "), t);
    doc.moveDown(0.1);
  }
  doc.moveDown(0.6);

  // Section 4: Pipeline
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

  // Recent approved suggestions
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

  // Disclaimer
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
    filename: `ai-review-summary-${new Date().toISOString().split("T")[0]}.pdf`,
    contentType: "application/pdf",
    base64: buffer.toString("base64"),
  };
}

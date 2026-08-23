import PDFDocument from "pdfkit";
import { createWorkbook, aoaToSheet, writeBuffer } from "@/lib/xlsx";
import type { ScoringResult } from "./types";
import {
  formatPdfArabicNumber,
  setupLocalContentPdfFonts,
} from "./pdf-arabic";

export interface LocalContentExportInput {
  projectName: string;
  reportingPeriod: string;
  generatedBy: string;
  generatedAt: string;
  reviewStatus: string;
  approvalStatus: string;
  score: ScoringResult;
  disclaimer: string;
}

export interface LocalContentExportResult {
  format: "pdf" | "xlsx";
  filename: string;
  mimeType: string;
  content: string | Buffer;
}


export async function buildAssessmentSummaryPDF(
  input: LocalContentExportInput,
): Promise<LocalContentExportResult> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Local Content Assessment - ${input.projectName}`,
      Author: "AQLIYA LocalContentOS",
      Subject: "Local Content Assessment Report",
      Creator: "AQLIYA LocalContentOS",
    },
  });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<void>((resolve) =>
    doc.on("end", () => resolve()),
  );

  const { fRegular, fBold, locale, textOpts } = setupLocalContentPdfFonts(doc);

  doc
    .fontSize(16)
    .font(fBold())
    .text("LocalContentOS — تقرير المحتوى المحلي", textOpts);
  doc
    .fontSize(12)
    .font(fRegular())
    .text("تقرير تقييم المحتوى المحلي", textOpts);
  doc.moveDown(0.8);

  doc.fontSize(9).font(fRegular());
  doc.text(`المشروع: ${input.projectName}`, textOpts);
  doc.text(`فترة التقرير: ${input.reportingPeriod}`, textOpts);
  doc.text(`تاريخ التوليد: ${input.generatedAt}`, textOpts);
  doc.text(`أُعد بواسطة: ${input.generatedBy}`, textOpts);
  doc.text(`حالة المراجعة: ${input.reviewStatus || "قيد الانتظار"}`, textOpts);
  doc.text(`حالة الاعتماد: ${input.approvalStatus || "قيد الانتظار"}`, textOpts);
  doc.moveDown(0.6);

  doc.fontSize(11).font(fBold()).text("ملخص النتيجة", textOpts);
  doc.moveDown(0.2);
  doc.fontSize(9).font(fRegular());
  doc.text(
    `إجمالي الإنفاق: ${formatPdfArabicNumber(input.score.totalSpend)} ر.س`,
    textOpts,
  );
  doc.text(
    `نسبة المحتوى المحلي: ${input.score.localContentPercentage.toFixed(1)}%`,
    textOpts,
  );
  doc.text(
    `إنفاق محلي: ${formatPdfArabicNumber(input.score.localSpend)} ر.س`,
    textOpts,
  );
  doc.text(
    `إنفاق غير محلي: ${formatPdfArabicNumber(input.score.nonLocalSpend)} ر.س`,
    textOpts,
  );
  doc.moveDown(0.6);

  doc.fontSize(11).font(fBold()).text("الموردون", textOpts);
  doc.moveDown(0.2);
  doc.fontSize(9).font(fRegular());
  doc.text(`الإجمالي: ${input.score.supplierCounts.total}`, textOpts);
  doc.text(`محلي: ${input.score.supplierCounts.local}`, textOpts);
  doc.text(`غير محلي: ${input.score.supplierCounts.nonLocal}`, textOpts);
  doc.text(`مختلط: ${input.score.supplierCounts.mixed}`, textOpts);
  doc.text(`غير مصنّف: ${input.score.supplierCounts.unclassified}`, textOpts);
  doc.moveDown(0.6);

  doc.fontSize(11).font(fBold()).text("الأدلة", textOpts);
  doc.moveDown(0.2);
  doc.fontSize(9).font(fRegular());
  doc.text(`الإجمالي: ${input.score.evidenceStats.total}`, textOpts);
  doc.text(`موثّق: ${input.score.evidenceStats.verified}`, textOpts);
  doc.text(
    `التغطية: ${input.score.evidenceStats.coveragePercentage.toFixed(0)}%`,
    textOpts,
  );
  doc.moveDown(0.6);

  doc.fontSize(11).font(fBold()).text("الملاحظات", textOpts);
  doc.moveDown(0.2);
  doc.fontSize(9).font(fRegular());
  doc.text(`الإجمالي: ${input.score.findingStats.total}`, textOpts);
  for (const [severity, count] of Object.entries(
    input.score.findingStats.bySeverity,
  )) {
    doc.text(`  ${severity}: ${count}`, textOpts);
  }
  doc.moveDown(1);

  const range = doc.bufferedPageRange();
  if (range && range.count > 0) {
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      doc.fontSize(7).fillColor("#888888").font(fRegular());
      doc.text(
        `AQLIYA LocalContentOS — Page ${i + 1}`,
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
    format: "pdf",
    filename: `local_content_assessment_${input.reportingPeriod.replace(/\s+/g, "_")}.pdf`,
    mimeType: "application/pdf",
    content: buffer,
  };
}

export async function buildSpendClassificationXLSX(
  input: LocalContentExportInput,
): Promise<LocalContentExportResult> {
  const wb = createWorkbook();
  const data: (string | number)[][] = [];

  data.push(["Category", "Supplier", "Amount (SAR)", "Local %", "Locality"]);
  data.push(["Score Summary", "", "", "", ""]);
  data.push(["Total Spend", "", input.score.totalSpend, "", ""]);
  data.push([
    "Local Content %",
    "",
    parseFloat(input.score.localContentPercentage.toFixed(1)),
    "",
    "",
  ]);
  data.push(["Local Spend", "", input.score.localSpend, "", ""]);
  data.push(["Non-Local Spend", "", input.score.nonLocalSpend, "", ""]);
  data.push([""]);
  data.push(["Evidence Coverage", "", "", "", ""]);
  data.push([
    "Coverage",
    "",
    `${input.score.evidenceStats.coveragePercentage.toFixed(0)}%`,
    "",
    "",
  ]);
  data.push(["Verified", "", input.score.evidenceStats.verified, "", ""]);
  data.push(["Total", "", input.score.evidenceStats.total, "", ""]);
  data.push([""]);
  data.push([input.disclaimer]);

  aoaToSheet(wb, data, {
    sheetName: "Spend Classification",
    colWidths: [25, 20, 18, 12, 12],
  });

  const buffer = await writeBuffer(wb);

  return {
    format: "xlsx",
    filename: `spend_classification_${input.reportingPeriod.replace(/\s+/g, "_")}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    content: buffer,
  };
}

export async function buildEvidenceIndexXLSX(
  input: LocalContentExportInput,
): Promise<LocalContentExportResult> {
  const wb = createWorkbook();
  const data: (string | number)[][] = [];

  data.push(["Evidence Type", "Status", "Count"]);
  data.push(["Verified", "", input.score.evidenceStats.verified]);
  data.push(["Reviewed", "", input.score.evidenceStats.reviewed]);
  data.push(["Uploaded", "", input.score.evidenceStats.uploaded]);
  data.push(["Linked", "", input.score.evidenceStats.linked]);
  data.push(["Rejected", "", input.score.evidenceStats.rejected]);
  data.push(["Missing", "", input.score.evidenceStats.missing]);
  data.push(["Total", "", input.score.evidenceStats.total]);
  data.push([""]);
  data.push([input.disclaimer]);

  aoaToSheet(wb, data, {
    sheetName: "Evidence Index",
    colWidths: [25, 12, 10],
  });

  const buffer = await writeBuffer(wb);

  return {
    format: "xlsx",
    filename: `evidence_index_${input.reportingPeriod.replace(/\s+/g, "_")}.xlsx`,
    mimeType:
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    content: buffer,
  };
}
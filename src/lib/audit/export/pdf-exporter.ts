import "server-only";
import PDFDocument from "pdfkit";
import type { ExportInput, ExportResult, Exporter } from "./types";
import type { FinancialStatementLine } from "@/types/audit";
import {
  isArabicText,
  getPdfFontConfig,
  normalizeArabicNumber,
  ARABIC_LABELS,
} from "../arabic-pdf-support";

const COMPANY_NAME = "AQLIYA";
const PRODUCT_NAME = "AuditOS";

function sar(v: number, locale: "ar" | "en" = "en"): string {
  if (locale === "ar") {
    return `${normalizeArabicNumber(Math.abs(v), "ar")} ر.س`;
  }
  return `SAR ${normalizeArabicNumber(Math.abs(v), "en")}`;
}

function lbl(key: string, locale: "ar" | "en"): string {
  return ARABIC_LABELS[key]?.[locale] ?? key;
}

function isArabicLocale(input: ExportInput): boolean {
  return input.metadata.locale === "ar" || input.metadata.locale === "bilingual" || isArabicText(input.metadata.clientName);
}

function drawHeader(doc: PDFKit.PDFDocument, input: ExportInput): void {
  const m = input.metadata;
  const isAr = isArabicLocale(input);
  const align = isAr ? "right" as const : "left" as const;
  const locale = isAr ? "ar" as const : "en" as const;

  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(`${COMPANY_NAME} ${PRODUCT_NAME}`, { align });
  doc
    .fontSize(8)
    .font("Helvetica")
    .text(locale === "ar" ? "القوائم المالية — تصدير" : "Financial Statements — Draft Export", { align });
  doc.moveDown(0.3);
  doc.fontSize(9).font("Helvetica");
  doc.text(
    `${lbl("client", locale)}: ${m.clientName}  |  ${lbl("period", locale)}: ${m.fiscalPeriod}  |  ${lbl("standard", locale)}: ${m.reportingFramework}  |  ${lbl("currency", locale)}: ${m.currency}`,
  );
  doc.text(
    `${lbl("exported", locale)}: ${new Date(m.exportedAt).toLocaleString(isAr ? "ar-SA" : "en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}  |  ${lbl("status", locale)}: ${m.status}`,
  );
  doc.moveDown(0.5);

  if (m.labels.draftWarning) {
    doc.fontSize(8).fillColor("#cc5500").font("Helvetica-Oblique");
    doc.text(isAr ? "مسودة — ليست نهائية حتى الاعتماد" : m.labels.draftWarning, { align: "center" });
    doc.fillColor("#000000").font("Helvetica");
    doc.moveDown(0.3);
  }

  if (m.labels.approvalInfo) {
    doc.fontSize(8).fillColor("#2b7a2b").font("Helvetica-Oblique");
    doc.text(m.labels.approvalInfo, { align: "center" });
    doc.fillColor("#000000").font("Helvetica");
    doc.moveDown(0.3);
  }

  doc.moveDown(0.5);
}

function drawStatementTable(
  doc: PDFKit.PDFDocument,
  title: string,
  lines: FinancialStatementLine[],
  locale: "ar" | "en" = "en",
): void {
  const align = locale === "ar" ? "right" as const : "left" as const;
  doc.fontSize(11).font("Helvetica-Bold").text(title, { align });
  doc.moveDown(0.2);

  const pageWidth = 540;
  const leftMargin = 50;
  const labelX = locale === "ar" ? leftMargin + 100 : leftMargin;
  const amountX = locale === "ar" ? leftMargin : leftMargin + pageWidth - 100;
  const colWidth = pageWidth - 100;
  const availableWidth = pageWidth;

  for (const line of lines) {
    const indent = line.indentLevel * 15;
    const label = line.label;
    const amount = line.amount;

    doc.fontSize(line.isTotal ? 9 : 8);
    doc.font(line.isTotal ? "Helvetica-Bold" : "Helvetica");

    if (line.isTotal) {
      doc.moveDown(0.1);
      const y = doc.y;
      doc
        .moveTo(leftMargin, y)
        .lineTo(leftMargin + availableWidth, y)
        .strokeColor("#cccccc")
        .stroke();
      doc.moveDown(0.1);
    }

    const labelAlign = locale === "ar" ? "right" as const : "left" as const;
    doc.text(label, labelX + (locale === "ar" ? 0 : indent), doc.y, {
      width: colWidth - indent,
      align: labelAlign,
      lineBreak: true,
    });
    const afterLabel = doc.y;
    doc.text(sar(amount, locale), amountX, afterLabel - 9, {
      width: 90,
      align: locale === "ar" ? "left" as const : "right" as const,
    });
    doc.y = Math.max(doc.y, afterLabel) + 1;

    if (line.isTotal) {
      doc.moveDown(0.05);
      const y2 = doc.y;
      doc
        .moveTo(leftMargin, y2)
        .lineTo(leftMargin + availableWidth, y2)
        .strokeColor("#cccccc")
        .stroke();
      doc.moveDown(0.1);
    }
  }

  doc.moveDown(0.5);
}

function drawNotesSummary(doc: PDFKit.PDFDocument, input: ExportInput): void {
  if (input.notes.length === 0) return;
  const isAr = isArabicLocale(input);
  const align = isAr ? "right" as const : "left" as const;
  const locale = isAr ? "ar" as const : "en" as const;

  doc.addPage();
  doc
    .fontSize(14)
    .font("Helvetica-Bold")
    .text(lbl("notesToFinancialStatements", locale) + (isAr ? " (Notes)" : ""), { align });
  doc.moveDown(0.5);

  for (const note of input.notes) {
    doc
      .fontSize(9)
      .font("Helvetica-Bold")
      .text(`${note.noteNumber}. ${note.title}`, { align });
    doc.fontSize(8).font("Helvetica");
    const cleanContent = note.content.replace(/<[^>]*>/g, "").substring(0, 600);
    doc.text(cleanContent, { indent: 10, align });
    if (note.missingInformation.length > 0) {
      doc.fontSize(7).fillColor("#cc5500").font("Helvetica-Oblique");
      doc.text(isAr ? `معلومات ناقصة: ${note.missingInformation.join(", ")}` : `Missing information: ${note.missingInformation.join(", ")}`, { align });
      doc.fillColor("#000000").font("Helvetica");
    }
    doc.moveDown(0.3);
  }
}

export const pdfExporter: Exporter = {
  format: "pdf",

  async generate(input: ExportInput): Promise<ExportResult> {
    const isAr = isArabicLocale(input);
    const locale = isAr ? "ar" as const : "en" as const;
    const align = isAr ? "right" as const : "left" as const;

    const doc = new PDFDocument({
      size: "A4",
      margins: { top: 40, bottom: 40, left: 50, right: 50 },
      info: {
        Title: `${locale === "ar" ? "القوائم المالية" : "Financial Statements"} - ${input.metadata.clientName}`,
        Author: `${COMPANY_NAME} ${PRODUCT_NAME}`,
        Subject: locale === "ar" ? "القوائم المالية الأولية" : "Draft Financial Statements",
        Creator: `${COMPANY_NAME} ${PRODUCT_NAME}`,
      },
    });

    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    const endPromise = new Promise<void>((resolve) =>
      doc.on("end", () => resolve()),
    );

    drawHeader(doc, input);

    for (const stmt of input.statements) {
      if (doc.y > 650) doc.addPage();
      drawStatementTable(doc, stmt.title, stmt.lines, locale);
    }

    drawNotesSummary(doc, input);

    // Draw audit file sections if present
    if (input.auditTrail && input.auditTrail.length > 0) {
      doc.addPage();
      doc.fontSize(12).font("Helvetica-Bold").text(locale === "ar" ? "سجل التدقيق" : "Audit Trail", { align });
      doc.moveDown(0.3);
      for (const event of input.auditTrail.slice(0, 50)) {
        doc.fontSize(7).font("Helvetica");
        doc.text(
          `${new Date(event.timestamp).toLocaleString(isAr ? "ar-SA" : "en-US")} | ${event.actorName} | ${event.eventType} | ${event.description.substring(0, 100)}`,
          { align },
        );
        doc.moveDown(0.1);
      }
    }

    // Footer with page numbers
    const range = doc.bufferedPageRange();
    if (range && range.count > 0) {
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);
        const bottom = doc.page.margins?.bottom ?? 40;
        doc.fontSize(7).fillColor("#888888").font("Helvetica");
        doc.text(
          `${COMPANY_NAME} ${PRODUCT_NAME} — ${lbl("draft", locale)} — ${lbl("page", locale)} ${i}`,
          50,
          doc.page.height - bottom - 10,
          { align: "center", width: 495 },
        );
      }
    }

    doc.end();
    await endPromise;

    const buffer = Buffer.concat(chunks);
    const suffix = locale === "ar" ? "ar" : "en";

    return {
      format: "pdf",
      filename: `financial_statements_${input.metadata.engagementId.substring(0, 8)}_${suffix}.pdf`,
      mimeType: "application/pdf",
      buffer,
      sizeBytes: buffer.length,
    };
  },
};

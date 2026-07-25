import "server-only";
import PDFDocument from "pdfkit";
import { registerArabicFonts } from "@/lib/pdf/fonts/arabic-font-utils";
import type { DecisionExportInput, DecisionExportResult } from "./types";
import { renderHeader } from "./header";
import { renderTenderContext } from "./tender-context";
import { renderScenarioComparison } from "./scenarios";
import { renderRecommendation } from "./recommendation";
import { addPageFooters } from "./footer";

export async function buildDecisionReportPDF(
  input: DecisionExportInput,
): Promise<DecisionExportResult> {
  const doc = new PDFDocument({
    size: "A4",
    margins: { top: 40, bottom: 50, left: 50, right: 50 },
    info: {
      Title: `Decision Report - ${input.title}`,
      Author: "AQLIYA DecisionOS",
      Subject: "Decision Report",
      Creator: "AQLIYA DecisionOS",
    },
  });
  registerArabicFonts(doc);

  const chunks: Buffer[] = [];
  doc.on("data", (chunk: Buffer) => chunks.push(chunk));
  const endPromise = new Promise<void>((resolve) =>
    doc.on("end", () => resolve()),
  );

  renderHeader(doc, input);

  if (input.tenderProfile) {
    renderTenderContext(doc, input.tenderProfile);
  }

  renderScenarioComparison(doc, input.scenarios);

  if (input.recommendation) {
    renderRecommendation(doc, input.recommendation);
  }

  addPageFooters(doc);

  doc.end();
  await endPromise;

  const buffer = Buffer.concat(chunks);

  return {
    format: "pdf",
    filename: `decision_report_${input.decisionId.substring(0, 8)}.pdf`,
    mimeType: "application/pdf",
    content: buffer,
  };
}

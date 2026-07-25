import type { DecisionExportInput } from "./types";
import { writeSection } from "./common";
import { fontNameForLocale } from "@/lib/pdf/fonts/arabic-font-utils";

export function renderScenarioComparison(
  doc: PDFKit.PDFDocument,
  scenarios: DecisionExportInput["scenarios"],
): void {
  writeSection(doc, "Scenario Comparison");
  if (scenarios.length === 0) return;

  const tableTop = doc.y;
  const colX = [50, 120, 190, 260, 330, 400, 470];
  const colW = 65;
  const headers = [
    "Scenario",
    "Feasibility",
    "Financial",
    "Capacity",
    "Risk",
    "Strategic",
    "Overall",
  ];

  doc.font(fontNameForLocale("bilingual", "bold")).fontSize(7);
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], colX[i], tableTop, {
      width: colW,
      align: "left",
    });
  }
  doc.moveDown(0.3);

  doc.font(fontNameForLocale("bilingual")).fontSize(7);
  for (const s of scenarios) {
    const y = doc.y;
    const row = [
      s.type.replace(/_/g, " "),
      s.feasibilityScore?.toString() ?? "N/A",
      s.financialScore?.toString() ?? "N/A",
      s.capacityScore?.toString() ?? "N/A",
      s.riskScore?.toString() ?? "N/A",
      s.strategicFitScore?.toString() ?? "N/A",
      s.overallDecisionScore?.toString() ?? "N/A",
    ];
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], colX[i], y, { width: colW, align: "left" });
    }
    doc.moveDown(0.2);
  }
}

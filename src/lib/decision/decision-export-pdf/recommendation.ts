import type { DecisionExportInput } from "./types";
import { writeBold, writeNormal, writeSection } from "./common";

export function renderRecommendation(
  doc: PDFKit.PDFDocument,
  recommendation: NonNullable<DecisionExportInput["recommendation"]>,
): void {
  writeSection(doc, "Recommendation");
  writeBold(doc, "Type:");
  writeNormal(doc, recommendation.type);
  if (recommendation.confidenceScore != null) {
    writeBold(doc, "Confidence:");
    writeNormal(doc, `${recommendation.confidenceScore}%`);
  }
  if (recommendation.reasoning) {
    writeBold(doc, "Reasoning:");
    writeNormal(doc, recommendation.reasoning);
  }
  if (recommendation.conditions) {
    writeBold(doc, "Conditions:");
    writeNormal(doc, recommendation.conditions);
  }
  if (recommendation.riskNotes) {
    writeBold(doc, "Risk Notes:");
    writeNormal(doc, recommendation.riskNotes);
  }
}

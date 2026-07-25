import type { DecisionExportInput } from "./types";
import { writeBold, writeNormal, writeSection, fmtSar, fmtPct, fmtVal } from "./common";

export function renderTenderContext(
  doc: PDFKit.PDFDocument,
  tenderProfile: NonNullable<DecisionExportInput["tenderProfile"]>,
): void {
  writeSection(doc, "Tender Context");
  writeBold(doc, "Client:");
  writeNormal(doc, tenderProfile.clientName);
  writeBold(doc, "Contract Value:");
  writeNormal(doc, fmtSar(tenderProfile.estimatedContractValue));
  writeBold(doc, "Estimated Cost:");
  writeNormal(doc, fmtSar(tenderProfile.estimatedCost));
  writeBold(doc, "Duration:");
  writeNormal(
    doc,
    tenderProfile.durationMonths != null
      ? `${tenderProfile.durationMonths} months`
      : "N/A",
  );
  writeBold(doc, "Margin:");
  writeNormal(doc, fmtPct(tenderProfile.marginEstimate));
  writeBold(doc, "Risk Level:");
  writeNormal(doc, fmtVal(tenderProfile.riskLevel));
  writeBold(doc, "Required Capacity:");
  writeNormal(doc, fmtVal(tenderProfile.requiredCapacity));
  writeBold(doc, "Available Capacity:");
  writeNormal(doc, fmtVal(tenderProfile.internalAvailableCapacity));
  writeBold(doc, "Strategic Fit:");
  writeNormal(doc, fmtPct(tenderProfile.strategicFitScore));
}

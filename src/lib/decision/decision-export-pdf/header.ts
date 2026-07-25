import type { DecisionExportInput } from "./types";
import { writeBold, writeNormal, writeSection, fmtVal } from "./common";
import { fontNameForLocale } from "@/lib/pdf/fonts/arabic-font-utils";

export function renderHeader(
  doc: PDFKit.PDFDocument,
  input: DecisionExportInput,
): void {
  doc
    .fontSize(16)
    .font(fontNameForLocale("bilingual", "bold"))
    .text("DecisionOS", {
      align: "center",
    });
  doc
    .fontSize(12)
    .font(fontNameForLocale("bilingual"))
    .text("نسخة تقرير القرار / Decision Report", {
      align: "center",
    });
  doc.moveDown(0.5);

  doc.fontSize(8).font(fontNameForLocale("bilingual"));
  doc.text(`Exported: ${input.exportedAt.toISOString()}`);
  doc.text(`Status: ${input.status}`);
  doc.moveDown(0.5);

  writeSection(doc, "Decision Header");
  writeBold(doc, "Title:");
  writeNormal(doc, input.title);
  writeBold(doc, "Owner:");
  writeNormal(doc, fmtVal(input.ownerName));
  writeBold(doc, "Organization:");
  writeNormal(doc, fmtVal(input.organizationName));
  writeBold(doc, "Created:");
  writeNormal(doc, input.createdAt.toISOString().split("T")[0]);
}

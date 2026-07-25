import { fontNameForLocale } from "@/lib/pdf/fonts/arabic-font-utils";

export function addPageFooters(doc: PDFKit.PDFDocument): void {
  const range = doc.bufferedPageRange();
  if (!range || range.count === 0) return;
  for (let i = range.start; i < range.start + range.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(7).fillColor("#888888").font(fontNameForLocale("bilingual"));
    doc.text(
      `AQLIYA DecisionOS — Page ${i + 1}`,
      50,
      doc.page.height - 50 - 10,
      { align: "center", width: 495 },
    );
  }
}

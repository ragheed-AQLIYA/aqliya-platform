import { fontNameForLocale } from "@/lib/pdf/fonts/arabic-font-utils";

export function fmtSar(v: number | null | undefined): string {
  return v != null ? `SAR ${v.toLocaleString("en-US")}` : "N/A";
}

export function fmtPct(v: number | null | undefined): string {
  return v != null ? `${v}%` : "N/A";
}

export function fmtVal(v: string | null | undefined): string {
  return v ?? "N/A";
}

export function writeBold(doc: PDFKit.PDFDocument, text: string): void {
  doc.font(fontNameForLocale("bilingual", "bold")).fontSize(9).text(text);
}

export function writeNormal(doc: PDFKit.PDFDocument, text: string): void {
  doc.font(fontNameForLocale("bilingual")).fontSize(9).text(text);
}

export function writeSection(doc: PDFKit.PDFDocument, title: string): void {
  doc.moveDown(0.5);
  doc.fontSize(12).font(fontNameForLocale("bilingual", "bold")).text(title);
  doc.moveDown(0.2);
}

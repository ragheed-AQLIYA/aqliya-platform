/**
 * Arabic font registration and utilities for PDF generation.
 *
 * Uses Noto Naskh Arabic (SIL Open Font License) embedded via
 * @embedpdf/fonts-arabic. Registered with pdfkit at document creation.
 *
 * https://scripts.sil.org/OFL
 */
import "server-only";
import path from "path";

// Resolve from project root (process.cwd() at runtime)
const FONTS_DIR = path.resolve(
  process.cwd(),
  "src",
  "lib",
  "pdf",
  "fonts",
);

export const ARABIC_FONT_PATHS = {
  regular: path.join(FONTS_DIR, "NotoNaskhArabic-Regular.ttf"),
  bold: path.join(FONTS_DIR, "NotoNaskhArabic-Bold.ttf"),
} as const;

export const ARABIC_FONT_NAMES = {
  regular: "NotoNaskhArabic",
  bold: "NotoNaskhArabic-Bold",
} as const;

/**
 * Register Noto Naskh Arabic fonts on a pdfkit document.
 * Call once per document, before any text rendering.
 *
 * Usage:
 *   const doc = new PDFDocument(...);
 *   registerArabicFonts(doc);
 *   doc.font(ARABIC_FONT_NAMES.regular).fontSize(9).text("…");
 */
export function registerArabicFonts(doc: PDFKit.PDFDocument): void {
  doc.registerFont(ARABIC_FONT_NAMES.regular, ARABIC_FONT_PATHS.regular);
  doc.registerFont(ARABIC_FONT_NAMES.bold, ARABIC_FONT_PATHS.bold);
}

/**
 * Return the correct font name for a given locale.
 * Arabic content should use NotoNaskhArabic for proper glyph rendering.
 * Helvetica is the pdfkit default (used for English/Latin text).
 */
export function fontNameForLocale(
  locale: "ar" | "en" | "bilingual",
  weight: "regular" | "bold" = "regular",
): string {
  if (locale === "ar" || locale === "bilingual") {
    return weight === "bold"
      ? ARABIC_FONT_NAMES.bold
      : ARABIC_FONT_NAMES.regular;
  }
  return weight === "bold" ? "Helvetica-Bold" : "Helvetica";
}

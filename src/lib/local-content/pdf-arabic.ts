/**
 * LC-05 — Arabic-first PDF helpers for LocalContentOS exports.
 *
 * Now uses Noto Naskh Arabic (embedded via @embedpdf/fonts-arabic)
 * for proper Arabic glyph rendering instead of pdfkit's default Helvetica.
 */
import {
  registerArabicFonts,
  fontNameForLocale,
} from "@/lib/pdf/fonts/arabic-font-utils";

export function getLocalContentPdfLocale(): "ar" {
  return "ar";
}

export function pdfTextOptions(locale: "ar" | "en" = "ar") {
  return {
    align: (locale === "ar" ? "right" : "left") as "right" | "left" | "center",
    features: locale === "ar" ? (["rtla"] as ("rtla" | "ltra")[]) : undefined,
  };
}

export function formatPdfArabicNumber(value: number): string {
  return value.toLocaleString("ar-SA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Register Noto Naskh Arabic on a pdfkit document and return
 * locale-aware font name helpers for LocalContentOS exports.
 *
 * Usage:
 *   const { fRegular, fBold } = setupLocalContentPdfFonts(doc);
 *   doc.fontSize(9).font(fRegular()).text("…");
 */
export function setupLocalContentPdfFonts(doc: PDFKit.PDFDocument) {
  registerArabicFonts(doc);
  const locale = getLocalContentPdfLocale();
  const fRegular = () => fontNameForLocale(locale);
  const fBold = () => fontNameForLocale(locale, "bold");
  return { fRegular, fBold, locale, textOpts: pdfTextOptions(locale) };
}

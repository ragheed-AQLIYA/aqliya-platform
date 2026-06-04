/**
 * LC-05 — Arabic-first PDF helpers for LocalContentOS exports.
 */

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

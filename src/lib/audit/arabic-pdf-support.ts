import "server-only";

const ARABIC_CHAR_RANGE = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
const ARABIC_GLYPH_MAP: Record<string, string> = {};

export function isArabicText(text: string): boolean {
  return ARABIC_CHAR_RANGE.test(text);
}

export function getArabicCharCount(text: string): number {
  let count = 0;
  for (const ch of text) {
    if (ARABIC_CHAR_RANGE.test(ch)) count++;
  }
  return count;
}

export function isBilingualText(text: string): boolean {
  const hasAr = isArabicText(text);
  const hasEn = /[a-zA-Z0-9]/.test(text);
  return hasAr && hasEn;
}

export function renderArabicText(text: string): string {
  const map = ARABIC_GLYPH_MAP;
  let result = "";
  for (const ch of text) {
    result += map[ch] ?? ch;
  }
  return result;
}

export function getPdfFontConfig(locale: "ar" | "en" = "en") {
  if (locale === "ar") {
    return {
      regular: "Helvetica",
      bold: "Helvetica-Bold",
      italic: "Helvetica-Oblique",
      boldItalic: "Helvetica-BoldOblique",
      rtl: true,
      lineHeight: 1.8,
      bodySize: 9,
      headerSize: 11,
      titleSize: 14,
    };
  }
  return {
    regular: "Helvetica",
    bold: "Helvetica-Bold",
    italic: "Helvetica-Oblique",
    boldItalic: "Helvetica-BoldOblique",
    rtl: false,
    lineHeight: 1.4,
    bodySize: 9,
    headerSize: 11,
    titleSize: 14,
  };
}

export interface RtlLayoutOptions {
  rtl: boolean;
  marginLeft: number;
  marginRight: number;
  contentWidth: number;
}

export function wrapRtlLayout(
  content: { label: string; value: string }[],
  options: RtlLayoutOptions,
): { label: string; value: string }[] {
  if (!options.rtl) return content;
  return content.map((item) => ({
    label: `\u200F${item.label}`,
    value: `\u200F${item.value}`,
  }));
}

export function normalizeArabicNumber(value: number, locale: "ar" | "en" = "en"): string {
  if (locale === "ar") {
    return value.toLocaleString("ar-SA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  return value.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function detectReportLocale(texts: string[]): "ar" | "en" | "bilingual" {
  const arCount = texts.filter((t) => isArabicText(t)).length;
  if (arCount === 0) return "en";
  if (arCount === texts.length) return "ar";
  return "bilingual";
}

export const ARABIC_LABELS: Record<string, Record<string, string>> = {
  financialStatements: {
    en: "Financial Statements",
    ar: "القوائم المالية",
  },
  notesToFinancialStatements: {
    en: "Notes to the Financial Statements",
    ar: "الإيضاحات المتممة للقوائم المالية",
  },
  draft: {
    en: "DRAFT",
    ar: "مسودة",
  },
  approved: {
    en: "Approved",
    ar: "معتمد",
  },
  client: {
    en: "Client",
    ar: "العميل",
  },
  period: {
    en: "Period",
    ar: "الفترة",
  },
  standard: {
    en: "Standard",
    ar: "المعيار",
  },
  currency: {
    en: "Currency",
    ar: "العملة",
  },
  exported: {
    en: "Exported",
    ar: "تاريخ التصدير",
  },
  status: {
    en: "Status",
    ar: "الحالة",
  },
  page: {
    en: "Page",
    ar: "صفحة",
  },
  evidenceChecklist: {
    en: "Evidence Checklist",
    ar: "قائمة الأدلة",
  },
  findings: {
    en: "Findings",
    ar: "النتائج",
  },
  recommendations: {
    en: "Recommendations",
    ar: "التوصيات",
  },
  auditTrail: {
    en: "Audit Trail",
    ar: "سجل التدقيق",
  },
  approvalHistory: {
    en: "Approval History",
    ar: "سجل الاعتماد",
  },
  reviewComments: {
    en: "Review Comments",
    ar: "تعليقات المراجعة",
  },
};

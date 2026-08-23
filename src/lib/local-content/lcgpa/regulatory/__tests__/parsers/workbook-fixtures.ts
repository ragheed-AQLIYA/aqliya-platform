// Synthetic workbooks mirroring the EXACT structure of the official LCGPA
// artifacts (verified 2026-08-22). Used so the parser suite runs anywhere,
// including CI, without shipping the official binaries.

import ExcelJS from "exceljs";

export const MANDATORY_HEADER_GOVERNMENT = [
  null,
  "الرمز في منصة اعتماد Etimad Code",
  "اسم المنتج (عربي) Commidity Title (Arabic)",
  "اسم المنتج (انجليزي) Commodity Title (English)",
  "وصف المنتج (عربي) Commodity Definition (Arabic)",
  "وصف المنتج (انجليزي) Commodity Definition (English)",
  "السقف السعري Price Ceiling",
  "تاريخ التطبيق Effective Date",
  "الحد الأدنى لخط الأساس لمصنع المنتج Manufacturer Local Content baseline",
  "ملاحظات",
];

/**
 * The البناء و التشييد sheet in the published file mislabels its Arabic name
 * column as "Commodity Title (English)". Reproduced deliberately.
 */
export const MANDATORY_HEADER_MISLABELLED = [
  null,
  "الرمز في منصة اعتماد Etimad Code",
  "اسم المنتج (عربي) Commodity Title (English)",
  "اسم المنتج (انجليزي) Commodity Title (English)",
  "وصف المنتج (عربي) Commodity Definition (Arabic)",
  "وصف المنتج (انجليزي) Commodity Definition (English)",
  "تاريخ التطبيق Effective Date",
  "ملاحظات",
];

export const MINIMUM_HEADER = [
  "الرمز في منصة اعتماد Etimad Code",
  "اسم المنتج (عربي) Commidity Title (Arabic)",
  "اسم المنتج (انجليزي) Commodity Title (English)",
  "تاريخ بدء إشتراط الحد الأدنى",
  "نسبة الحد الأدنى لعام 2026",
  "نسبة الحد الأدنى لعام 2027",
  "نسبة الحد الأدنى لعام 2028",
  "نسبة الحد الأدنى لعام 2029",
  "نسبة الحد الأدنى لعام 2030",
  "نسبة الحد الأدنى لعام 2031",
];

export interface SheetSpec {
  title: string;
  header: (string | null)[];
  rows: (string | number | Date | null)[][];
}

export async function buildWorkbook(sheets: SheetSpec[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  for (const spec of sheets) {
    const ws = wb.addWorksheet(spec.title);
    ws.addRow(spec.header);
    for (const row of spec.rows) ws.addRow(row);
  }
  const out = await wb.xlsx.writeBuffer();
  return Buffer.from(out);
}

/** An overview sheet: no Etimad Code column, must be skipped. */
export const OVERVIEW_SHEET: SheetSpec = {
  title: "نظرة عامة ",
  header: [null, "القائمة الالزامية للمنتجات الوطنية"],
  rows: [[null, "الأدوية و المستحضرات الطبية", 366]],
};

export function governmentSheet(
  title: string,
  rows: (string | number | Date | null)[][],
): SheetSpec {
  return { title, header: MANDATORY_HEADER_GOVERNMENT, rows };
}

/** Row in the government mandatory-list shape. Column A is empty, as published. */
export function govRow(opts: {
  code: string;
  nameAr?: string;
  nameEn?: string;
  descAr?: string;
  descEn?: string;
  priceCeiling?: number | string | null;
  effectiveDate?: string | Date | null;
  baseline?: string | null;
  notes?: string | null;
}): (string | number | Date | null)[] {
  return [
    null,
    opts.code,
    opts.nameAr ?? `منتج ${opts.code}`,
    opts.nameEn ?? `Product ${opts.code}`,
    opts.descAr ?? "وصف عربي",
    opts.descEn ?? "English definition",
    opts.priceCeiling === undefined ? 0.1 : opts.priceCeiling,
    opts.effectiveDate === undefined ? "2020-04-07" : opts.effectiveDate,
    opts.baseline === undefined ? "يشترط وجود شهادة المحتوى المحلي للمصنع" : opts.baseline,
    opts.notes ?? null,
  ];
}

export function minimumRow(opts: {
  code: string;
  nameAr?: string;
  nameEn?: string;
  start?: string;
  years?: (string | number | null)[];
}): (string | number | Date | null)[] {
  const years = opts.years ?? [0.23, 0.27, 0.3, 0.4, 0.6, "TBD"];
  return [
    opts.code,
    opts.nameAr ?? `منتج ${opts.code}`,
    opts.nameEn ?? `Product ${opts.code}`,
    opts.start ?? "1 أغسطس 2026م",
    ...years,
  ];
}

export function minimumSheet(
  rows: (string | number | Date | null)[][],
): SheetSpec {
  return { title: "Sheet1", header: MINIMUM_HEADER, rows };
}

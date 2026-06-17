// ─── LocalContentOS Workbook — Canonical Template ───
// Defines the standard structure of a Local Content workbook.
// Phase 1: Static template (no runtime editing).

import type { WorkbookTemplate, WorkbookTemplateLine } from "./types";

const LINES: WorkbookTemplateLine[] = [
  // ── Company Info ──
  {
    code: "INF-01",
    name: "اسم المنشأة / Company Name",
    section: "company_info",
    autoFillable: false,
    displayOrder: 10,
    evidenceRequired: true,
    evidenceTypes: ["registration", "commercial_registration"],
    description: "الاسم القانوني للمنشأة كما في السجل التجاري",
  },
  {
    code: "INF-02",
    name: "السجل التجاري / CR Number",
    section: "company_info",
    autoFillable: false,
    displayOrder: 20,
    evidenceRequired: true,
    evidenceTypes: ["registration"],
    description: "رقم السجل التجاري للمنشأة",
  },
  {
    code: "INF-03",
    name: "تاريخ التأسيس / Date of Incorporation",
    section: "company_info",
    autoFillable: false,
    displayOrder: 30,
    evidenceRequired: true,
    evidenceTypes: ["registration"],
    description: "تاريخ تأسيس المنشأة",
  },
  // ── Revenue ──
  {
    code: "REV-01",
    name: "إيرادات العملاء المحليين / Local Customer Revenue",
    section: "revenue",
    autoFillable: true,
    displayOrder: 100,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إيرادات.*صيانة.*تشغيل|ايرادات.*صيانة.*تشغيل|إيرادات.*تشغيل|ايرادات.*تشغيل",
      "إيرادات.*محلي|ايرادات.*محلي|إيراد.*محلي|ايراد.*محلي",
      "إيرادات قطاع|ايرادات قطاع|إيرادات.*أمن.*سلامة|ايرادات.*أمن.*سلامة",
      "sales.*local|revenue.*local|local.*sales|local.*revenue",
      "إيرادات تشغيلية|ايرادات تشغيلية|إيرادات عمليات|ايرادات عمليات",
    ],
    accountCodeRanges: [{ prefix: "4" }],
    description: "إجمالي الإيرادات من العملاء داخل المملكة",
  },
  {
    code: "REV-02",
    name: "إيرادات العملاء الأجانب / Foreign Customer Revenue",
    section: "revenue",
    autoFillable: true,
    displayOrder: 110,
    evidenceRequired: false,
    tbAccountPatterns: [
      "مبيعات.*أجنبي|إيراد.*أجنبي|ايراد.*أجنبي|صادرات",
      "sales.*foreign|export.*revenue|foreign.*sales",
      "إيرادات.*خارج|ايرادات.*خارج|إيراد.*خارجي|ايراد.*خارجي",
    ],
    accountCodeRanges: [{ prefix: "4" }],
    description: "إجمالي الإيرادات من العملاء خارج المملكة",
  },
  {
    code: "REV-03",
    name: "إجمالي الإيرادات / Total Revenue",
    section: "revenue",
    autoFillable: true,
    displayOrder: 120,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*إيراد|اجمالي.*ايراد|total.*revenue|gross.*revenue",
      "إيرادات.*صيانة|ايرادات.*صيانة|إيرادات.*تشغيل|ايرادات.*تشغيل",
      "إيرادات قطاع|ايرادات قطاع|إيرادات.*أمن|ايرادات.*أمن",
    ],
    accountCodeRanges: [{ prefix: "4" }],
    description: "إجمالي إيرادات المنشأة (محلي + أجنبي) — مجموع كل حسابات الإيرادات",
  },
  // ── Cost of Sales ──
  {
    code: "COS-01",
    name: "تكلفة المبيعات من موردين محليين / Local Supplier COS",
    section: "cost_of_sales",
    autoFillable: true,
    displayOrder: 200,
    evidenceRequired: false,
    tbAccountPatterns: [
      "تكلفة.*محلي|مشتريات.*محلي|مورد.*محلي",
      "cost.*local|purchase.*local|local.*supplier.*cost",
      "مشتريات مستعاضة|مشتريات.*مستعاضة",
      "تكلفة المبيعات|تكلفة مبيعات",
      "cost of sales|cogs|purchases",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "تكلفة المبيعات من الموردين المحليين",
  },
  {
    code: "COS-02",
    name: "تكلفة المبيعات من موردين أجانب / Foreign Supplier COS",
    section: "cost_of_sales",
    autoFillable: true,
    displayOrder: 210,
    evidenceRequired: false,
    tbAccountPatterns: [
      "تكلفة.*أجنبي|مشتريات.*أجنبي|مورد.*أجنبي|مستوردات",
      "cost.*foreign|import.*cost|foreign.*supplier.*cost",
      "مستوردات|واردات",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "تكلفة المبيعات من الموردين الأجانب",
  },
  {
    code: "COS-03",
    name: "إجمالي تكلفة المبيعات / Total Cost of Sales",
    section: "cost_of_sales",
    autoFillable: true,
    displayOrder: 220,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*تكلفة|اجمالي.*تكلفة|total.*cost of sales|total.*cogs",
      "تكلفة المبيعات|تكلفة مبيعات",
      "cost of sales|cogs",
      "تكلفة|مردم",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "إجمالي تكلفة المبيعات",
  },
  // ── Gross Profit ──
  {
    code: "GP-01",
    name: "إجمالي الربح / Gross Profit",
    section: "gross_profit",
    autoFillable: true,
    displayOrder: 300,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي الربح|اجمالي الربح|مجمل الربح",
      "gross profit|gross profit margin",
    ],
    formula: "REV-03 - COS-03",
    description: "إجمالي الربح (الإيرادات - تكلفة المبيعات) — محسوب آلياً",
  },
  // ── Supplier Spend ──
  {
    code: "SPN-01",
    name: "إجمالي المشتريات من موردين سعوديين / Saudi Supplier Spend",
    section: "supplier_spend",
    autoFillable: true,
    displayOrder: 400,
    evidenceRequired: true,
    evidenceTypes: ["invoice", "contract"],
    tbAccountPatterns: [
      "مشتريات.*سعودي|مورد.*سعودي|مشتريات.*محلي.*سعودي",
      "saudi.*supplier|local.*content.*spend",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "إجمالي المشتريات من الموردين السعوديين",
  },
  {
    code: "SPN-02",
    name: "إجمالي المشتريات من موردين غير سعوديين / Non-Saudi Supplier Spend",
    section: "supplier_spend",
    autoFillable: true,
    displayOrder: 410,
    evidenceRequired: true,
    evidenceTypes: ["invoice", "contract"],
    tbAccountPatterns: [
      "مشتريات.*غير.*سعودي|مورد.*أجنبي|مستوردات",
      "non.*saudi.*supplier|foreign.*supplier.*purchase",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "إجمالي المشتريات من الموردين غير السعوديين",
  },
  {
    code: "SPN-03",
    name: "إجمالي المشتريات / Total Procurement Spend",
    section: "supplier_spend",
    autoFillable: true,
    displayOrder: 420,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*مشتريات|اجمالي.*مشتريات|total.*procurement|total.*purchases",
      "مشتريات مستعاضة|مشتريات",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    formula: "SPN-01 + SPN-02",
    description: "إجمالي المشتريات (سعودي + غير سعودي) — محسوب آلياً",
  },
  // ── Workforce ──
  {
    code: "WRK-01",
    name: "عدد الموظفين السعوديين / Saudi Workforce Count",
    section: "workforce",
    autoFillable: false,
    displayOrder: 500,
    evidenceRequired: true,
    evidenceTypes: ["gosi_certificate", "payroll"],
    description: "عدد الموظفين السعوديين المسجلين في GOSI",
  },
  {
    code: "WRK-02",
    name: "إجمالي عدد الموظفين / Total Workforce Count",
    section: "workforce",
    autoFillable: false,
    displayOrder: 510,
    evidenceRequired: true,
    evidenceTypes: ["gosi_certificate", "payroll"],
    description: "إجمالي عدد الموظفين (سعودي + غير سعودي)",
  },
  {
    code: "WRK-03",
    name: "نسبة التوطين / Saudization Percentage",
    section: "workforce",
    autoFillable: true,
    displayOrder: 520,
    evidenceRequired: false,
    formula: "WRK-01 / WRK-02 * 100",
    description: "نسبة الموظفين السعوديين من إجمالي الموظفين — محسوب آلياً",
  },
  {
    code: "WRK-04",
    name: "إجمالي الرواتب / Total Payroll",
    section: "workforce",
    autoFillable: true,
    displayOrder: 530,
    evidenceRequired: false,
    tbAccountPatterns: [
      "رواتب|مرتبات|أجور|اجور|payroll|salaries|wages",
      "مصاريف.*موظفين|تكلفة.*عمالة",
    ],
    accountCodeRanges: [{ prefix: "3", excludePrefixes: ["1106"] }],
    description: "إجمالي تكلفة الرواتب والأجور (مستثنى منها الحسابات المدفوعة مقدماً)",
  },
  // ── Assets ──
  {
    code: "AST-01",
    name: "الأصول الثابتة المحلية / Local Fixed Assets",
    section: "assets",
    autoFillable: true,
    displayOrder: 600,
    evidenceRequired: true,
    evidenceTypes: ["asset_register", "invoice"],
    tbAccountPatterns: [
      "أصول.*ثابتة|ممتلكات.*محلي",
      "fixed.*assets|property.*local|equipment.*local|ppe",
      "أصول ثابتة|آلات ومعدات|أثاث",
      "معدات",
    ],
    accountCodeRanges: [{ prefix: "1", excludePrefixes: ["4", "1106"] }],
    description: "الأصول الثابتة الموجودة داخل المملكة (مستثنى منها إيرادات بيع الأصول والحسابات المدفوعة مقدماً)",
  },
  {
    code: "AST-02",
    name: "إجمالي الأصول الثابتة / Total Fixed Assets",
    section: "assets",
    autoFillable: true,
    displayOrder: 610,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*أصول|اجمالي.*أصول|total.*assets|total.*fixed.*assets",
      "أصول ثابتة|آلات ومعدات|أثاث",
      "معدات",
    ],
    accountCodeRanges: [{ prefix: "1", excludePrefixes: ["4", "1106"] }],
    description: "إجمالي الأصول الثابتة للمنشأة (مستثنى منها إيرادات بيع الأصول)",
  },
  // ── Declarations ──
  {
    code: "DEC-01",
    name: "حالة شهادة المحتوى المحلي / LC Certificate Status",
    section: "declarations",
    autoFillable: false,
    displayOrder: 700,
    evidenceRequired: true,
    evidenceTypes: ["certificate"],
    description: "هل تمتلك المنشأة شهادة محتوى محلي سارية المفعول؟",
  },
  {
    code: "DEC-02",
    name: "نسبة المحتوى المحلي المعلنة / Declared LC Percentage",
    section: "declarations",
    autoFillable: false,
    displayOrder: 710,
    evidenceRequired: true,
    evidenceTypes: ["certificate"],
    description: "نسبة المحتوى المحلي حسب آخر شهادة",
  },
  {
    code: "DEC-03",
    name: "ملاحظات إضافية / Additional Notes",
    section: "declarations",
    autoFillable: false,
    displayOrder: 800,
    evidenceRequired: false,
    description: "أية معلومات إضافية تدعم تقييم المحتوى المحلي",
  },
];

/** The canonical workbook template */
export const WORKBOOK_TEMPLATE: WorkbookTemplate = {
  version: "1.0",
  lines: LINES,
};

/** Get all lines for a specific section */
export function getTemplateLinesBySection(
  section: string,
): WorkbookTemplateLine[] {
  return LINES.filter((l) => l.section === section);
}

/** Find a template line by code */
export function getTemplateLineByCode(
  code: string,
): WorkbookTemplateLine | undefined {
  return LINES.find((l) => l.code === code);
}

/** Get all template sections with their line counts */
export function getTemplateSectionSummary(): Record<
  string,
  { total: number; autoFillable: number }
> {
  const summary: Record<string, { total: number; autoFillable: number }> = {};
  for (const line of LINES) {
    if (!summary[line.section]) {
      summary[line.section] = { total: 0, autoFillable: 0 };
    }
    summary[line.section].total++;
    if (line.autoFillable) summary[line.section].autoFillable++;
  }
  return summary;
}

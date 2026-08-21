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
  // ── Workforce — LCGPA Compensation-Based Lines ──
  {
    code: "WRK-05",
    name: "رواتب الموظفين السعوديين / Saudi Employee Compensation",
    section: "workforce",
    autoFillable: true,
    displayOrder: 540,
    evidenceRequired: true,
    evidenceTypes: ["payroll", "gosi_certificate"],
    tbAccountPatterns: [
      "رواتب.*سعودي|مرتبات.*سعودي|أجور.*سعودي",
      "saudi.*salary|saudi.*payroll|saudi.*wage",
    ],
    accountCodeRanges: [{ prefix: "3", excludePrefixes: ["1106"] }],
    description: "إجمالي رواتب ومكافآت وبدلات الموظفين السعوديين — تُحتسب ١٠٠٪ كمحتوى محلي",
  },
  {
    code: "WRK-06",
    name: "رواتب الموظفين الأجانب / Expat Employee Compensation",
    section: "workforce",
    autoFillable: true,
    displayOrder: 550,
    evidenceRequired: true,
    evidenceTypes: ["payroll"],
    tbAccountPatterns: [
      "رواتب.*أجنبي|مرتبات.*أجنبي|أجور.*أجنبي|رواتب.*غير.*سعودي",
      "expat.*salary|expat.*payroll|foreign.*employee.*wage|non.*saudi.*salary",
    ],
    accountCodeRanges: [{ prefix: "3", excludePrefixes: ["1106"] }],
    description: "إجمالي رواتب ومكافآت وبدلات الموظفين الأجانب — تُحتسب ٣٧٪ كمحتوى محلي",
  },
  {
    code: "WRK-07",
    name: "نسبة المحتوى المحلي من الأجور / Labor LC Percentage",
    section: "workforce",
    autoFillable: true,
    displayOrder: 560,
    evidenceRequired: false,
    formula: "(WRK-05 + WRK-06 * 0.37) / WRK-04 * 100",
    description: "نسبة المحتوى المحلي من تكلفة العمالة — (سعودي × ١٠٠٪ + أجنبي × ٣٧٪) ÷ إجمالي الرواتب",
  },
  // ── Assets / Depreciation (Section 7) ──
  // These represent depreciation values from the Fixed Asset Register (FAR)
  {
    code: "AST-01",
    name: "إهلاك الأصول المحلية / Local Asset Depreciation",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 600,
    evidenceRequired: true,
    evidenceTypes: ["asset_register", "invoice"],
    tbAccountPatterns: [
      "إهلاك.*أصول.*ثابتة|مصروف.*إهلاك|depreciation.*expense|amortization",
      "أصول.*ثابتة|ممتلكات.*محلي|fixed.*assets|ppe",
    ],
    accountCodeRanges: [{ prefix: "3", excludePrefixes: ["1106"] }],
    description: "DEP-02: إهلاك الأصول المصنعة داخل المملكة — يُحتسب ١٠٠٪ كمحتوى محلي",
  },
  {
    code: "AST-02",
    name: "إجمالي الإهلاك / Total Depreciation",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 610,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*إهلاك|اجمالي.*إهلاك|total.*depreciation|total.*amortization",
      "مصروف.*إهلاك|depreciation.*expense",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "DEP-02: إجمالي مصروف الإهلاك والاستهلاك للمنشأة",
  },
  {
    code: "AST-03",
    name: "إهلاك الأصول الأجنبية / Foreign Asset Depreciation",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 620,
    evidenceRequired: true,
    evidenceTypes: ["asset_register", "invoice", "import_declaration"],
    tbAccountPatterns: [
      "إهلاك.*أصل.*أجنبي|إهلاك.*مستورد|depreciation.*foreign|amortization.*imported",
      "أصول.*أجنبي|أصول.*مستوردة|foreign.*assets|imported.*assets",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "إهلاك الأصول المصنعة خارج المملكة — يُحتسب ٢٠٪ فقط كمحتوى محلي",
  },
  {
    code: "AST-04",
    name: "نسبة المحتوى المحلي من الإهلاك / Asset LC Percentage",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 630,
    evidenceRequired: false,
    formula: "(AST-01 + AST-03 * 0.20) / AST-02 * 100",
    description: "نسبة المحتوى المحلي من الإهلاك — (محلي × ١٠٠٪ + أجنبي × ٢٠٪) ÷ إجمالي الإهلاك",
  },
  // ── Capacity Building (LCGPA Pillar 4) ──
  {
    code: "CAP-01",
    name: "تكلفة تدريب الموظفين Saudia / Saudi Employee Training Cost",
    section: "capacity_building",
    autoFillable: true,
    displayOrder: 650,
    evidenceRequired: true,
    evidenceTypes: ["training_certificate", "invoice", "contract"],
    tbAccountPatterns: [
      "تدريب|تعليم|تأهيل|ورشة|دورة",
      "training|education|development.*program|workshop",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "تكلفة برامج تدريب وتطوير الموظفين السعوديين — تُحتسب ١٠٠٪ كمحتوى محلي",
  },
  {
    code: "CAP-02",
    name: "تكلفة تطوير الموردين / Supplier Development Cost",
    section: "capacity_building",
    autoFillable: true,
    displayOrder: 660,
    evidenceRequired: true,
    evidenceTypes: ["contract", "invoice"],
    tbAccountPatterns: [
      "تطوير.*مورد|تأهيل.*مورد|شراكة.*مورد",
      "supplier.*development|vendor.*development",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "تكلفة برامج تطوير وتأهيل الموردين المحليين",
  },
  {
    code: "CAP-03",
    name: "تكلفة البحث والتطوير في المملكة / R&D Cost in KSA",
    section: "capacity_building",
    autoFillable: true,
    displayOrder: 670,
    evidenceRequired: true,
    evidenceTypes: ["contract", "invoice", "project_report"],
    tbAccountPatterns: [
      "بحث.*تطوير|بحوث|تطوير.*منتج|تطوير.*تقنية",
      "research.*and.*development|R&D|product.*development",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "تكلفة أنشطة البحث والتطوير التي تُنفّذ داخل المملكة — تُحتسب ١٠٠٪ كمحتوى محلي",
  },
  {
    code: "CAP-04",
    name: "إجمالي تكلفة بناء القدرات / Total Capacity Building Cost",
    section: "capacity_building",
    autoFillable: true,
    displayOrder: 680,
    evidenceRequired: false,
    formula: "CAP-01 + CAP-02 + CAP-03",
    description: "إجمالي تكلفة بناء القدرات — محسوب آلياً",
  },
  {
    code: "CAP-05",
    name: "نسبة المحتوى المحلي من بناء القدرات / Capacity Building LC Percentage",
    section: "capacity_building",
    autoFillable: true,
    displayOrder: 690,
    evidenceRequired: false,
    formula: "(CAP-01 + CAP-02 + CAP-03) / CAP-04 * 100",
    description: "نسبة المحتوى المحلي من بناء القدرات — (تدريب سعودي + تطوير موردين + بحث وتطوير في المملكة) ÷ إجمالي بناء القدرات",
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

  // ══════════════════════════════════════════════════════════
  // SECTION 2: LC% ASSESSMENT — Formula Summary Rows
  // Template v.2 Section 2: R10-R18
  // ══════════════════════════════════════════════════════════

  {
    code: "LC-01",
    name: "القسط من الإهلاك المحلي / Local Depreciation Component",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 850,
    evidenceRequired: false,
    formula: "AST-01 + AST-03 * 0.20",
    description: "R10: الإهلاك والاستهلاك — (أصول محلية × ١٠٠٪ + أصل أجنبي × ٢٠٪)",
  },
  {
    code: "LC-02",
    name: "القسط من التعويضات المحلية / Local Compensation Component",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 860,
    evidenceRequired: false,
    formula: "WRK-05 + WRK-06 * 0.37",
    description: "R11: تعويضات الموظفين — (سعودي × ١٠٠٪ + أجنبي × ٣٧٪)",
  },
  {
    code: "LC-03",
    name: "القسط من البضائع والخدمات المحلية / Local G&S Component",
    section: "lc_assessment",
    autoFillable: false,
    displayOrder: 870,
    evidenceRequired: false,
    description: "R12: صافي المساهمة في المحتوى المحلي من البضائع والخدمات (يُحسب آلياً من ترتيب الموردين)",
  },
  {
    code: "LC-04",
    name: "القسط من التدريب وبناء القدرات / Local Capacity Building Component",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 880,
    evidenceRequired: false,
    formula: "CAP-01 + CAP-02 + CAP-03",
    description: "R13-R15: (تدريب سعودي × ١٠٠٪ + تطوير موردين + بحث وتطوير في المملكة × ١٠٠٪)",
  },
  {
    code: "LC-05",
    name: "إجمالي المساهمة في المحتوى المحلي / Total LC Contribution Value",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 890,
    evidenceRequired: false,
    formula: "LC-01 + LC-02 + LC-03 + LC-04",
    description: "R16: مجموع المساهمات في المحتوى المحلي",
  },
  {
    code: "LC-06",
    name: "إجمالي التكاليف / Total Costs (LC denominator)",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 900,
    evidenceRequired: false,
    tbAccountPatterns: [
      "إجمالي.*تكاليف|اجمالي.*تكاليف|total.*cost|total.*expense",
      "تكلفة.*إنتاج|-cost.*production|cost.*goods.*sold",
    ],
    accountCodeRanges: [{ prefix: "3" }],
    description: "R17: إجمالي التكاليف الإنتاجية الخاضعة للضريبة (القاطع المشترك)",
  },
  {
    code: "LC-07",
    name: "نسبة المحتوى المحلي النهائية / Final LC Percentage",
    section: "lc_assessment",
    autoFillable: true,
    displayOrder: 910,
    evidenceRequired: false,
    formula: "LC-05 / LC-06 * 100",
    description: "R18: نسبة المحتوى المحلي = (LC-05 ÷ LC-06) × ١٠٠",
  },

  // ══════════════════════════════════════════════════════════
  // SECTION 4: GOODS & SERVICES — Supplier Grid (R14-R93)
  // Up to 80 suppliers ranked by spend. Section 4.1 adds 300 more when goods < 50%.
  // ══════════════════════════════════════════════════════════

  {
    code: "GS-01",
    name: "إجمالي تكلفة البضائع والخدمات / Total G&S Cost",
    section: "goods_services",
    autoFillable: false,
    displayOrder: 1000,
    evidenceRequired: false,
    description: "R10 (Section 4): إجمالي تكاليف البضائع والخدمات المشتراة من الموردين",
  },
  {
    code: "GS-02",
    name: "قيمة المحتوى المحلي من البضائع والخدمات / G&S LC Value",
    section: "goods_services",
    autoFillable: false,
    displayOrder: 1010,
    evidenceRequired: false,
    description: "R12 (Section 4): صافي المساهمة في المحتوى المحلي من البضائع والخدمات",
  },
  {
    code: "GS-03",
    name: "نسبة البضائع من إجمالي التكاليف / Goods % of Total Cost",
    section: "goods_services",
    autoFillable: true,
    displayOrder: 1020,
    evidenceRequired: false,
    formula: "GS-01 / LC-06 * 100",
    description: "ISIC تقييم: إذا كانت البضائع < ٥٠٪ من التكاليف يُطلب كشف إضافي (Section 4.1)",
  },
  {
    code: "GS-04",
    name: "عدد الموردين الفعليين / Number of Active Suppliers",
    section: "goods_services",
    autoFillable: false,
    displayOrder: 1030,
    evidenceRequired: false,
    description: "عدد الموردين المُدخلين فعلياً في الجدول",
  },
  {
    code: "GS-05",
    name: "ملاحظات البضائع والخدمات / G&S Notes",
    section: "goods_services",
    autoFillable: false,
    displayOrder: 1040,
    evidenceRequired: false,
    description: "ملاحظات إضافية حول تصنيف البضائع والخدمات",
  },

  // ══════════════════════════════════════════════════════════
  // SECTION 4.1: ADDITIONAL DISCLOSURE — When Goods < 50%
  // Up to 300 additional suppliers (SC-10 rule)
  // ══════════════════════════════════════════════════════════

  {
    code: "XD-01",
    name: "هل البضائع أقل من ٥٠٪؟ / Goods < 50% Threshold?",
    section: "additional_disclosure",
    autoFillable: true,
    displayOrder: 1100,
    evidenceRequired: false,
    formula: "GS-03 < 50 ? 'نعم / Yes' : 'لا / No'",
    description: "SC-10: إذا كانت البضائع < ٥٠٪ يُطلب كشف إضافي حتى ٣٠٠ مورد",
  },
  {
    code: "XD-02",
    name: "عدد الموردين الإضافيين / Additional Supplier Count",
    section: "additional_disclosure",
    autoFillable: false,
    displayOrder: 1110,
    evidenceRequired: false,
    description: "عدد الموردين الإضافيين المُدخلين في القسم ٤.١",
  },
  {
    code: "XD-03",
    name: "ملاحظات الكشف الإضافي / Additional Disclosure Notes",
    section: "additional_disclosure",
    autoFillable: false,
    displayOrder: 1120,
    evidenceRequired: false,
    description: "ملاحظات حول الكشف الإضافي للموردين",
  },

  // ══════════════════════════════════════════════════════════
  // SECTION 5: CAPITAL EXPENDITURE — Capex Assets
  // 80 assets tracked when annual capex ≥ 100M SAR
  // ══════════════════════════════════════════════════════════

  {
    code: "CPX-01",
    name: "إجمالي الاستثمارات الرأسمالية / Total Capital Additions",
    section: "capex",
    autoFillable: true,
    displayOrder: 1200,
    evidenceRequired: true,
    evidenceTypes: ["asset_register", "invoice"],
    tbAccountPatterns: [
      "أصول.*ثابتة|أصل.*رأسمالي|إضافة.*أصل|购置|acquisition",
      "fixed.*assets|capital.*addition|asset.*acquisition|ppe.*addition",
    ],
    accountCodeRanges: [{ prefix: "1", excludePrefixes: ["4", "1106"] }],
    description: "إجمالي additions الرأسمالية السنوية (بعد الاستثناءات)",
  },
  {
    code: "CPX-02",
    name: "هل الاستثمارات ≥ ١٠٠ مليون؟ / Capex ≥ 100M Threshold",
    section: "capex",
    autoFillable: true,
    displayOrder: 1210,
    evidenceRequired: false,
    formula: "CPX-01 >= 100000000 ? 'نعم / Yes' : 'لا / No'",
    description: "CPX-01: إذا كانت additions ≥ ١٠٠ مليون ريال يُطلب تطبيق كامل",
  },
  {
    code: "CPX-03",
    name: "الأصول المستثناة / Excluded Assets",
    section: "capex",
    autoFillable: false,
    displayOrder: 1220,
    evidenceRequired: false,
    description: "CPX-02: استثناءات: عقارد، أراضي عارية، مخزون، تحويلات داخلية",
  },
  {
    code: "CPX-04",
    name: "الاستثمارات بعد الاستثناءات / Capex After Exclusions",
    section: "capex",
    autoFillable: true,
    displayOrder: 1230,
    evidenceRequired: false,
    formula: "CPX-01 - CPX-03",
    description: "إجمالي الاستثمارات بعد طرح الاستثناءات",
  },
  {
    code: "CPX-05",
    name: "عدد الأصول المتعقبة / Tracked Asset Count",
    section: "capex",
    autoFillable: false,
    displayOrder: 1240,
    evidenceRequired: false,
    description: "CPX-03: عدد الأصول الفريدة حسب ترتيب التكلفة التنازلي (حد أقصى ٨٠)",
  },
  {
    code: "CPX-06",
    name: "ملاحظات الاستثمارات / Capex Notes",
    section: "capex",
    autoFillable: false,
    displayOrder: 1250,
    evidenceRequired: false,
    description: "ملاحظات حول الاستثمارات الرأسمالية",
  },

  // ══════════════════════════════════════════════════════════
  // SECTION 7: DEPRECIATION — FAR Reconciliation
  // Requires Fixed Asset Register + reconciliation to balance sheet
  // ══════════════════════════════════════════════════════════

  {
    code: "DEP-01",
    name: "إجمالي الإهلاك حسب الدفتر / Depreciation per FAR",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 1300,
    evidenceRequired: true,
    evidenceTypes: ["asset_register", "financial_statement"],
    tbAccountPatterns: [
      "إهلاك.*دفتر|إهلاك.*سجل|إهلاك.* ثابتة|depreciation.*register|depreciation.*far",
      "مصروف.*إهلاك|depreciation.*expense|amortization.*expense",
    ],
    description: "DEP-01: إجمالي الإهلاك المُسجّل في دفتر الأصول الثابتة",
  },
  {
    code: "DEP-02",
    name: "إجمالي الإهلاك في الميزانية / Depreciation per Balance Sheet",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 1310,
    evidenceRequired: true,
    evidenceTypes: ["financial_statement"],
    tbAccountPatterns: [
      "إهلاك.*ميزانية|إهلاك.*عمومية|depreciation.*balance.*sheet|depreciation.*financial",
      "مصروف.*إهلاك|depreciation.*expense|amortization.*expense",
    ],
    description: "DEP-01: التسوية: إجمالي الإهلاك في الدفتر مقابل الميزانية العمومية",
  },
  {
    code: "DEP-03",
    name: "فرق التسوية / Reconciliation Difference",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 1320,
    evidenceRequired: false,
    formula: "DEP-01 - DEP-02",
    description: "الفرق بين الإهلاك في الدفتر والميزانية (يجب أن يكون صفراً أو مبرراً)",
  },
  {
    code: "DEP-04",
    name: "نسبة المكون المحلي من الإهلاك / Depreciation LC Component",
    section: "depreciation",
    autoFillable: true,
    displayOrder: 1330,
    evidenceRequired: false,
    formula: "(AST-01 + AST-03 * 0.20) / AST-02 * 100",
    description: "DEP-02: المكون المحلي من الإهلاك — (محلي × ١٠٠٪ + أجنبي × ٢٠٪) — مُعاد من AST-01/AST-03",
  },
  {
    code: "DEP-05",
    name: "ملاحظات الإهلاك / Depreciation Notes",
    section: "depreciation",
    autoFillable: false,
    displayOrder: 1340,
    evidenceRequired: false,
    description: "ملاحظات حول تسوية الإهلاك وأي فروقات",
  },

  // ══════════════════════════════════════════════════════════
  // APPENDIX A: SUPPLIER DETAIL GRID — 54-row detailed supplier data
  // ══════════════════════════════════════════════════════════

  {
    code: "APX-01",
    name: "عدد موردي Appendix A / Appendix A Supplier Count",
    section: "appendix_a",
    autoFillable: false,
    displayOrder: 1400,
    evidenceRequired: false,
    description: "عدد الموردين المُدخلين في جدول الملحق أ التفصيلي",
  },
  {
    code: "APX-02",
    name: "إجمالي مشتريات Appendix A / Appendix A Total Spend",
    section: "appendix_a",
    autoFillable: false,
    displayOrder: 1410,
    evidenceRequired: false,
    description: "إجمالي المشتريات من موردي الملحق أ",
  },
  {
    code: "APX-03",
    name: "نسبة التغطية / Coverage Percentage",
    section: "appendix_a",
    autoFillable: true,
    displayOrder: 1420,
    evidenceRequired: false,
    formula: "APX-02 / GS-01 * 100",
    description: "نسبة تغطية الملحق أ من إجمالي البضائع والخدمات",
  },
  {
    code: "APX-04",
    name: "ملاحظات الملحق أ / Appendix A Notes",
    section: "appendix_a",
    autoFillable: false,
    displayOrder: 1430,
    evidenceRequired: false,
    description: "ملاحظات إضافية حول جدول الملحق أ",
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

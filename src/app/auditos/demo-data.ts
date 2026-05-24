// ─── AuditOS Demo Data — Local mock for public guided demo ───
// Self-contained, read-only, sanitized. No import from @/lib/audit/*.

const SAR = (v: number) => v;

// ─── Trial Balance ───
const LINES = [
  {
    id: "tb-demo-1",
    accountCode: "1010",
    accountName: "النقد والبنوك",
    debitAmount: SAR(500000),
    creditAmount: 0,
    balance: SAR(500000),
    accountType: "asset",
  },
  {
    id: "tb-demo-2",
    accountCode: "1020",
    accountName: "حسابات مدينة",
    debitAmount: SAR(1200000),
    creditAmount: 0,
    balance: SAR(1200000),
    accountType: "asset",
  },
  {
    id: "tb-demo-3",
    accountCode: "1030",
    accountName: "المخزون",
    debitAmount: SAR(800000),
    creditAmount: 0,
    balance: SAR(800000),
    accountType: "asset",
  },
  {
    id: "tb-demo-4",
    accountCode: "1040",
    accountName: "مصاريف مدفوعة مقدمًا",
    debitAmount: SAR(75000),
    creditAmount: 0,
    balance: SAR(75000),
    accountType: "asset",
  },
  {
    id: "tb-demo-5",
    accountCode: "1050",
    accountName: "ممتلكات ومعدات",
    debitAmount: SAR(3500000),
    creditAmount: 0,
    balance: SAR(3500000),
    accountType: "non-current-asset",
  },
  {
    id: "tb-demo-6",
    accountCode: "1051",
    accountName: "مجمع الاستهلاك",
    debitAmount: 0,
    creditAmount: SAR(875000),
    balance: SAR(-875000),
    accountType: "non-current-asset",
  },
  {
    id: "tb-demo-7",
    accountCode: "2010",
    accountName: "حسابات دائنة",
    debitAmount: 0,
    creditAmount: SAR(950000),
    balance: SAR(-950000),
    accountType: "liability",
  },
  {
    id: "tb-demo-8",
    accountCode: "2020",
    accountName: "مصروفات مستحقة",
    debitAmount: 0,
    creditAmount: SAR(95000),
    balance: SAR(-95000),
    accountType: "liability",
  },
  {
    id: "tb-demo-9",
    accountCode: "2030",
    accountName: "زكاة وضريبة مستحقة",
    debitAmount: 0,
    creditAmount: SAR(85000),
    balance: SAR(-85000),
    accountType: "liability",
  },
  {
    id: "tb-demo-10",
    accountCode: "2040",
    accountName: "قرض قصير الأجل",
    debitAmount: 0,
    creditAmount: SAR(500000),
    balance: SAR(-500000),
    accountType: "liability",
  },
  {
    id: "tb-demo-11",
    accountCode: "2050",
    accountName: "تكاليف تمويل",
    debitAmount: SAR(35000),
    creditAmount: 0,
    balance: SAR(35000),
    accountType: "expense",
  },
  {
    id: "tb-demo-12",
    accountCode: "3010",
    accountName: "رأس المال",
    debitAmount: 0,
    creditAmount: SAR(2000000),
    balance: SAR(-2000000),
    accountType: "equity",
  },
  {
    id: "tb-demo-13",
    accountCode: "3020",
    accountName: "الأرباح المبقاة",
    debitAmount: 0,
    creditAmount: SAR(705000),
    balance: SAR(-705000),
    accountType: "equity",
  },
  {
    id: "tb-demo-14",
    accountCode: "4010",
    accountName: "إيرادات مبيعات",
    debitAmount: 0,
    creditAmount: SAR(4500000),
    balance: SAR(-4500000),
    accountType: "revenue",
  },
  {
    id: "tb-demo-15",
    accountCode: "4020",
    accountName: "إيرادات خدمات",
    debitAmount: 0,
    creditAmount: SAR(750000),
    balance: SAR(-750000),
    accountType: "revenue",
  },
  {
    id: "tb-demo-16",
    accountCode: "5010",
    accountName: "تكلفة المبيعات",
    debitAmount: SAR(2800000),
    creditAmount: 0,
    balance: SAR(2800000),
    accountType: "expense",
  },
  {
    id: "tb-demo-17",
    accountCode: "5020",
    accountName: "رواتب وأجور",
    debitAmount: SAR(900000),
    creditAmount: 0,
    balance: SAR(900000),
    accountType: "expense",
  },
  {
    id: "tb-demo-18",
    accountCode: "5030",
    accountName: "إيجار",
    debitAmount: SAR(240000),
    creditAmount: 0,
    balance: SAR(240000),
    accountType: "expense",
  },
  {
    id: "tb-demo-19",
    accountCode: "5040",
    accountName: "مرافق",
    debitAmount: SAR(95000),
    creditAmount: 0,
    balance: SAR(95000),
    accountType: "expense",
  },
  {
    id: "tb-demo-20",
    accountCode: "5050",
    accountName: "إهلاك",
    debitAmount: SAR(175000),
    creditAmount: 0,
    balance: SAR(175000),
    accountType: "expense",
  },
  {
    id: "tb-demo-21",
    accountCode: "5060",
    accountName: "رسوم مهنية",
    debitAmount: SAR(120000),
    creditAmount: 0,
    balance: SAR(120000),
    accountType: "expense",
  },
  {
    id: "tb-demo-22",
    accountCode: "5070",
    accountName: "مصاريف عمومية وإدارية",
    debitAmount: SAR(65000),
    creditAmount: 0,
    balance: SAR(65000),
    accountType: "expense",
  },
  {
    id: "tb-demo-23",
    accountCode: "5100",
    accountName: "إيرادات متنوعة",
    debitAmount: 0,
    creditAmount: SAR(45000),
    balance: SAR(-45000),
    accountType: "revenue",
  },
];

const totalDr = LINES.reduce((s, l) => s + l.debitAmount, 0);
const totalCr = LINES.reduce((s, l) => s + l.creditAmount, 0);

// ─── Mappings ───
const MAPPINGS = [
  {
    id: "map-demo-1",
    sourceAccountCode: "1010",
    sourceAccountName: "النقد والبنوك",
    canonicalAccountCode: "CA-1010",
    canonicalAccountName: "نقد وما يعادله",
    statementClassification: "أصول متداولة",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-2",
    sourceAccountCode: "1020",
    sourceAccountName: "حسابات مدينة",
    canonicalAccountCode: "CA-1020",
    canonicalAccountName: "ذمم مدينة تجارية",
    statementClassification: "أصول متداولة",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-3",
    sourceAccountCode: "1030",
    sourceAccountName: "المخزون",
    canonicalAccountCode: "CA-1030",
    canonicalAccountName: "مخزون",
    statementClassification: "أصول متداولة",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-4",
    sourceAccountCode: "1040",
    sourceAccountName: "مصاريف مدفوعة مقدمًا",
    canonicalAccountCode: "CA-1040",
    canonicalAccountName: "مصاريف مدفوعة مقدمًا",
    statementClassification: "أصول متداولة",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-5",
    sourceAccountCode: "1050",
    sourceAccountName: "ممتلكات ومعدات",
    canonicalAccountCode: "CA-1050",
    canonicalAccountName: "ممتلكات وآلات ومعدات",
    statementClassification: "أصول غير متداولة",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-6",
    sourceAccountCode: "1051",
    sourceAccountName: "مجمع الاستهلاك",
    canonicalAccountCode: "CA-1060",
    canonicalAccountName: "مجمع الاستهلاك",
    statementClassification: "أصول غير متداولة",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-7",
    sourceAccountCode: "2010",
    sourceAccountName: "حسابات دائنة",
    canonicalAccountCode: "CA-2010",
    canonicalAccountName: "ذمم دائنة تجارية",
    statementClassification: "خصوم متداولة",
    mappingType: "human_mapped",
    status: "confirmed",
  },
  {
    id: "map-demo-8",
    sourceAccountCode: "2020",
    sourceAccountName: "مصروفات مستحقة",
    canonicalAccountCode: "CA-2020",
    canonicalAccountName: "مصروفات مستحقة",
    statementClassification: "خصوم متداولة",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-9",
    sourceAccountCode: "2030",
    sourceAccountName: "زكاة وضريبة مستحقة",
    canonicalAccountCode: "CA-2030",
    canonicalAccountName: "زكاة وضريبة مستحقة",
    statementClassification: "خصوم متداولة",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-10",
    sourceAccountCode: "2040",
    sourceAccountName: "قرض قصير الأجل",
    canonicalAccountCode: "CA-2040",
    canonicalAccountName: "اقتراضات قصيرة الأجل",
    statementClassification: "خصوم متداولة",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-11",
    sourceAccountCode: "3010",
    sourceAccountName: "رأس المال",
    canonicalAccountCode: "CA-3010",
    canonicalAccountName: "رأس المال",
    statementClassification: "حقوق ملكية",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-12",
    sourceAccountCode: "3020",
    sourceAccountName: "الأرباح المبقاة",
    canonicalAccountCode: "CA-3020",
    canonicalAccountName: "الأرباح المبقاة",
    statementClassification: "حقوق ملكية",
    mappingType: "human_mapped",
    status: "confirmed",
  },
  {
    id: "map-demo-13",
    sourceAccountCode: "4010",
    sourceAccountName: "إيرادات مبيعات",
    canonicalAccountCode: "CA-4010",
    canonicalAccountName: "إيرادات بيع بضائع",
    statementClassification: "إيرادات",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-14",
    sourceAccountCode: "4020",
    sourceAccountName: "إيرادات خدمات",
    canonicalAccountCode: "CA-4020",
    canonicalAccountName: "إيرادات خدمات",
    statementClassification: "إيرادات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-15",
    sourceAccountCode: "5010",
    sourceAccountName: "تكلفة المبيعات",
    canonicalAccountCode: "CA-5010",
    canonicalAccountName: "تكلفة المبيعات",
    statementClassification: "مصروفات",
    mappingType: "confirmed_ai",
    status: "confirmed",
  },
  {
    id: "map-demo-16",
    sourceAccountCode: "5020",
    sourceAccountName: "رواتب وأجور",
    canonicalAccountCode: "CA-5020",
    canonicalAccountName: "مزايا الموظفين",
    statementClassification: "مصروفات",
    mappingType: "human_mapped",
    status: "confirmed",
  },
  {
    id: "map-demo-17",
    sourceAccountCode: "5030",
    sourceAccountName: "إيجار",
    canonicalAccountCode: "CA-5030",
    canonicalAccountName: "مصاريف إيجار",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-18",
    sourceAccountCode: "5040",
    sourceAccountName: "مرافق",
    canonicalAccountCode: "CA-5040",
    canonicalAccountName: "مرافق",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-19",
    sourceAccountCode: "5050",
    sourceAccountName: "إهلاك",
    canonicalAccountCode: "CA-5050",
    canonicalAccountName: "إهلاك وإطفاء",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-20",
    sourceAccountCode: "5060",
    sourceAccountName: "رسوم مهنية",
    canonicalAccountCode: "CA-5060",
    canonicalAccountName: "رسوم مهنية واستشارية",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-21",
    sourceAccountCode: "5070",
    sourceAccountName: "مصاريف عمومية وإدارية",
    canonicalAccountCode: "CA-5070",
    canonicalAccountName: "مصاريف عمومية وإدارية",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-22",
    sourceAccountCode: "2050",
    sourceAccountName: "تكاليف تمويل",
    canonicalAccountCode: "CA-2050",
    canonicalAccountName: "تكاليف تمويل",
    statementClassification: "مصروفات",
    mappingType: "ai_suggested",
    status: "confirmed",
  },
  {
    id: "map-demo-23",
    sourceAccountCode: "5100",
    sourceAccountName: "إيرادات متنوعة",
    canonicalAccountCode: "CA-5100",
    canonicalAccountName: "إيرادات أخرى",
    statementClassification: "إيرادات",
    mappingType: "ai_suggested",
    status: "pending",
  },
];

// ─── Financial Statements ───
const INCOME_LINES = [
  {
    id: "fsl-is-1",
    label: "الإيرادات",
    amount: SAR(5295000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-is-2",
    label: "  إيرادات مبيعات",
    amount: SAR(4500000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-3",
    label: "  إيرادات خدمات",
    amount: SAR(750000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-4",
    label: "  إيرادات أخرى",
    amount: SAR(45000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-5",
    label: "تكلفة المبيعات",
    amount: SAR(2800000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-is-6",
    label: "مجمل الربح",
    amount: SAR(2495000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-is-7",
    label: "مصاريف تشغيلية",
    amount: SAR(1630000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-is-8",
    label: "  رواتب وأجور",
    amount: SAR(900000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-9",
    label: "  إيجار",
    amount: SAR(240000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-10",
    label: "  مرافق",
    amount: SAR(95000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-11",
    label: "  إهلاك",
    amount: SAR(175000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-12",
    label: "  رسوم مهنية",
    amount: SAR(120000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-13",
    label: "  مصاريف عمومية",
    amount: SAR(65000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-14",
    label: "  تكاليف تمويل",
    amount: SAR(35000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-is-15",
    label: "صافي الربح",
    amount: SAR(865000),
    isTotal: true,
    indentLevel: 0,
  },
];

const BALANCE_LINES = [
  {
    id: "fsl-bs-1",
    label: "الأصول المتداولة",
    amount: SAR(2575000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-bs-2",
    label: "  نقد وما يعادله",
    amount: SAR(500000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-3",
    label: "  ذمم مدينة",
    amount: SAR(1200000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-4",
    label: "  مخزون",
    amount: SAR(800000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-5",
    label: "  مصاريف مدفوعة مقدمًا",
    amount: SAR(75000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-6",
    label: "الأصول غير المتداولة",
    amount: SAR(2625000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-bs-7",
    label: "  ممتلكات ومعدات",
    amount: SAR(3500000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-8",
    label: "  ناقص: مجمع الاستهلاك",
    amount: SAR(-875000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-9",
    label: "إجمالي الأصول",
    amount: SAR(5200000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-bs-10",
    label: "الخصوم المتداولة",
    amount: SAR(1630000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-bs-11",
    label: "  ذمم دائنة",
    amount: SAR(950000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-12",
    label: "  مصروفات مستحقة",
    amount: SAR(95000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-13",
    label: "  زكاة وضريبة",
    amount: SAR(85000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-14",
    label: "  قرض قصير الأجل",
    amount: SAR(500000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-15",
    label: "حقوق الملكية",
    amount: SAR(3570000),
    isTotal: true,
    indentLevel: 0,
  },
  {
    id: "fsl-bs-16",
    label: "  رأس المال",
    amount: SAR(2000000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-17",
    label: "  أرباح مبقاة",
    amount: SAR(705000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-18",
    label: "  صافي ربح العام",
    amount: SAR(865000),
    isTotal: false,
    indentLevel: 1,
  },
  {
    id: "fsl-bs-19",
    label: "إجمالي الخصوم وحقوق الملكية",
    amount: SAR(5200000),
    isTotal: true,
    indentLevel: 0,
  },
];

// ─── Disclosure Notes ───
const NOTES = [
  {
    id: "note-demo-1",
    noteNumber: "1",
    title: "معلومات عامة",
    content:
      "الجهة المعروضة في هذا السيناريو هي كيان تجريبي لأغراض العرض العام. القوائم المالية معدة وفق معايير IFRS for SMEs.",
    aiDrafted: false,
    status: "reviewed",
    missingInformation: [],
  },
  {
    id: "note-demo-2",
    noteNumber: "2",
    title: "ممتلكات وآلات ومعدات",
    content:
      "تبلغ قيمة الممتلكات والمعدات 3,500,000 ريال سعودي قبل الاستهلاك. مجمع الاستهلاك 875,000 ريال. نسبة الاستهلاك السنوية تتراوح بين 10%–25% حسب أصل كل بند.",
    aiDrafted: false,
    status: "draft",
    missingInformation: [
      "نسب الإهلاك لكل أصل",
      "تفاصيل الإضافات والاستبعادات خلال العام",
    ],
  },
  {
    id: "note-demo-3",
    noteNumber: "3",
    title: "المخزون",
    content:
      "المخزون بقيمة 800,000 ريال سعودي ويشمل بضاعة جاهزة ومواد خام. تم تقييمه بتكلفة الشراء أو صافي القيمة القابلة للتحقق أيهما أقل.",
    aiDrafted: false,
    status: "draft",
    missingInformation: ["تقرير جرد المخزون"],
  },
  {
    id: "note-demo-4",
    noteNumber: "4",
    title: "إيرادات",
    content:
      "تبلغ إيرادات المبيعات 4,500,000 ريال وإيرادات الخدمات 750,000 ريال.",
    aiDrafted: false,
    status: "draft",
    missingInformation: ["تفصيل الإيرادات حسب القطاع"],
  },
  {
    id: "note-demo-5",
    noteNumber: "5",
    title: "تكاليف التمويل",
    content:
      "تكاليف التمويل تبلغ 35,000 ريال سعودي وتشمل فوائد القرض البنكي قصير الأجل.",
    aiDrafted: false,
    status: "draft",
    missingInformation: ["شروط التمويل وسعر الفائدة"],
  },
  {
    id: "note-demo-6",
    noteNumber: "6",
    title: "الالتزامات والطوارئ",
    content: "لا ت istnie التزامات طارئة جوهرية تستوجب الإفصاح.",
    aiDrafted: false,
    status: "approved",
    missingInformation: [],
  },
  {
    id: "note-demo-7",
    noteNumber: "7",
    title: "الأحداث اللاحقة",
    content:
      "لا توجد أحداث جوهرية بعد تاريخ الميزانية تستوجب تعديل أو إفصاح في القوائم المالية.",
    aiDrafted: false,
    status: "draft",
    missingInformation: [],
  },
];

// ─── Evidence ───
const EVIDENCE = [
  {
    id: "ev-demo-1",
    fileType: "xlsx",
    fileSize: 245000,
    state: "accepted",
    uploadedBy: "مشغل العرض",
    linkedEntities: [{ id: "el-demo-1", targetLabel: "جميع الحسابات" }],
  },
  {
    id: "ev-demo-2",
    fileType: "pdf",
    fileSize: 180000,
    state: "accepted",
    uploadedBy: "مشغل العرض",
    linkedEntities: [{ id: "el-demo-2", targetLabel: "النقد والبنوك" }],
  },
  {
    id: "ev-demo-3",
    fileType: "pdf",
    fileSize: 320000,
    state: "accepted",
    uploadedBy: "مراجع العرض",
    linkedEntities: [{ id: "el-demo-3", targetLabel: "الذمم المدينة" }],
  },
  {
    id: "ev-demo-4",
    fileType: "xlsx",
    fileSize: 95000,
    state: "accepted",
    uploadedBy: "مشغل العرض",
    linkedEntities: [{ id: "el-demo-4", targetLabel: "الممتلكات والمعدات" }],
  },
  {
    id: "ev-demo-5",
    fileType: "pdf",
    fileSize: 450000,
    state: "reviewed",
    uploadedBy: "مراجع العرض",
    linkedEntities: [{ id: "el-demo-5", targetLabel: "القرض قصير الأجل" }],
  },
  {
    id: "ev-demo-6",
    fileType: "pdf",
    fileSize: 0,
    state: "missing",
    uploadedBy: "",
    linkedEntities: [{ id: "el-demo-6", targetLabel: "المخزون" }],
  },
];

// ─── Findings ───
const FINDINGS = [
  {
    id: "find-demo-1",
    title: "تركيز إيرادات المبيعات",
    severity: "medium",
    description:
      "إيرادات المبيعات تمثل 85% من إجمالي الإيرادات. يوصى بتحليل تركز العملاء.",
    findingType: "observation",
    materiality: "immaterial",
    aiSuggested: true,
  },
  {
    id: "find-demo-2",
    title: "تصنيف القرض قصير الأجل",
    severity: "high",
    description:
      "القرض قصير الأجل بقيمة 500,000 ريال قد يحتاج إعادة تصنيف كالتزام غير متداول حسب مدة العقد.",
    findingType: "disclosure_gap",
    materiality: "material",
    aiSuggested: true,
  },
  {
    id: "find-demo-3",
    title: "نقص دليل المخزون",
    severity: "high",
    description: "المخزون بقيمة 800,000 ريال بدون دليل إثبات جرد فعلي.",
    findingType: "disclosure_gap",
    materiality: "material",
    aiSuggested: false,
  },
  {
    id: "find-demo-4",
    title: "تباين الرسوم المهنية",
    severity: "low",
    description:
      "الرسوم المهنية زادت 60% مقارنة بالعام السابق من 75,000 إلى 120,000 ريال دون تفسير.",
    findingType: "observation",
    materiality: "immaterial",
    aiSuggested: true,
  },
  {
    id: "find-demo-5",
    title: "الإفصاح عن تكاليف التمويل",
    severity: "low",
    description:
      "تكاليف التمويل 35,000 ريال تحتاج إيضاحًا بشروط وأسعار التمويل.",
    findingType: "disclosure_gap",
    materiality: "immaterial",
    aiSuggested: true,
  },
];

// ─── Recommendations ───
const RECOMMENDATIONS = [
  {
    id: "rec-demo-1",
    findingId: "find-demo-1",
    title: "تحليل تركز الإيرادات",
    recommendedAction:
      "طلب تفصيل الإيرادات حسب كل عميل لحساب نسب التركز وتوثيق النتائج.",
  },
  {
    id: "rec-demo-2",
    findingId: "find-demo-2",
    title: "إعادة تصنيف القرض",
    recommendedAction:
      "إعادة تصنيف القرض قصير الأجل إلى التزامات غير متداولة والإفصاح عن ذلك في الإيضاحات.",
  },
  {
    id: "rec-demo-3",
    findingId: "find-demo-3",
    title: "طلب دليل المخزون",
    recommendedAction:
      "طلب مستندات جرد المخزون من الجهة المعنية وتقييم صافي القيمة القابلة للتحقق.",
  },
];

// ─── Audit Events ───
const EVENTS = [
  {
    id: "ae-demo-1",
    eventType: "engagement.created",
    actorName: "مدير العرض",
    aiRelated: false,
    timestamp: "2025-03-01T08:00:00Z",
    description: "تهيئة سيناريو العرض التجريبي.",
  },
  {
    id: "ae-demo-2",
    eventType: "team.assigned",
    actorName: "مدير العرض",
    aiRelated: false,
    timestamp: "2025-03-01T09:00:00Z",
    description: "تخصيص أدوار فريق العرض الداخلي.",
  },
  {
    id: "ae-demo-3",
    eventType: "trial_balance.uploaded",
    actorName: "مشغل العرض",
    aiRelated: false,
    timestamp: "2025-04-15T10:30:00Z",
    description: "إدراج ميزان المراجعة التجريبي في العرض.",
  },
  {
    id: "ae-demo-4",
    eventType: "mapping.ai_suggested",
    actorName: "المساعد الذكي",
    aiRelated: true,
    timestamp: "2025-04-15T10:45:00Z",
    description: "اقتراح 23 تصنيفًا للحسابات عبر الذكاء المؤسسي.",
  },
  {
    id: "ae-demo-5",
    eventType: "mapping.confirmed",
    actorName: "مشغل العرض",
    aiRelated: false,
    timestamp: "2025-04-15T12:45:00Z",
    description: "اعتماد جميع التصنيفات المقترحة.",
  },
  {
    id: "ae-demo-6",
    eventType: "validation.completed",
    actorName: "النظام",
    aiRelated: false,
    timestamp: "2025-04-15T13:00:00Z",
    description: "اكتمال التحقق من البيانات - 0 أخطاء.",
  },
  {
    id: "ae-demo-7",
    eventType: "evidence.uploaded",
    actorName: "مشغل العرض",
    aiRelated: false,
    timestamp: "2025-04-15T10:30:00Z",
    description: "ربط ملف الدليل التجريبي الأول.",
  },
  {
    id: "ae-demo-8",
    eventType: "evidence.accepted",
    actorName: "مراجع العرض",
    aiRelated: false,
    timestamp: "2025-04-22T15:00:00Z",
    description: "مراجعة واعتماد دليل تجريبي.",
  },
  {
    id: "ae-demo-9",
    eventType: "signal.generated",
    actorName: "المساعد الذكي",
    aiRelated: true,
    timestamp: "2025-04-20T07:55:00Z",
    description: "رصد إشارة ذكية حول تركز الإيرادات.",
  },
  {
    id: "ae-demo-10",
    eventType: "finding.created",
    actorName: "مراجع العرض",
    aiRelated: false,
    timestamp: "2025-04-20T08:00:00Z",
    description: "إنشاء ملاحظة تجريبية حول تركز الإيرادات.",
  },
  {
    id: "ae-demo-11",
    eventType: "recommendation.ai_suggested",
    actorName: "المساعد الذكي",
    aiRelated: true,
    timestamp: "2025-04-25T07:55:00Z",
    description: "اقتراح توصية تجريبية لتحليل التركز.",
  },
  {
    id: "ae-demo-12",
    eventType: "recommendation.created",
    actorName: "مراجع العرض",
    aiRelated: true,
    timestamp: "2025-04-25T08:00:00Z",
    description: "مراجعة واعتماد التوصية المقترحة.",
  },
  {
    id: "ae-demo-13",
    eventType: "review.comment_added",
    actorName: "مراجع العرض",
    aiRelated: false,
    timestamp: "2025-04-28T14:00:00Z",
    description: "إضافة تعليق مراجعة على قائمة الدخل.",
  },
  {
    id: "ae-demo-14",
    eventType: "engagement.state_changed",
    actorName: "مدير العرض",
    aiRelated: false,
    timestamp: "2025-03-05T09:00:00Z",
    description: "نقل سيناريو العرض إلى مرحلة التنفيذ.",
  },
  {
    id: "ae-demo-15",
    eventType: "finding.state_changed",
    actorName: "مراجع العرض",
    aiRelated: false,
    timestamp: "2025-05-01T10:00:00Z",
    description: "نقل حالة الملاحظة إلى قيد المراجعة.",
  },
  {
    id: "ae-demo-16",
    eventType: "recommendation.state_changed",
    actorName: "مراجع العرض",
    aiRelated: false,
    timestamp: "2025-05-02T09:00:00Z",
    description: "تحديث حالة التوصية إلى تحت المراجعة.",
  },
];

// ─── AI Outputs ───
const AI_OUTPUTS = [
  {
    id: "ai-demo-1",
    suggestionType: "mapping",
    confidence: 0.85,
    outputContent: "اقتراح تصنيف: إيرادات متنوعة ← إيرادات أخرى (CA-5100)",
    status: "suggested",
    modelVersion: "audit-os-llm-v1",
  },
  {
    id: "ai-demo-2",
    suggestionType: "finding",
    confidence: 0.75,
    outputContent:
      "ملاحظة محتملة: تركز عالٍ في إيرادات المبيعات. يوصى بتحليل التركز.",
    status: "accepted_by_human",
    modelVersion: "audit-os-llm-v1",
  },
  {
    id: "ai-demo-3",
    suggestionType: "recommendation",
    confidence: 0.91,
    outputContent:
      "توصية: إعادة تصنيف القرض قصير الأجل بقيمة 500,000 ريال كالتزام غير متداول.",
    status: "accepted_by_human",
    modelVersion: "audit-os-llm-v1",
  },
  {
    id: "ai-demo-4",
    suggestionType: "note_draft",
    confidence: 0.78,
    outputContent:
      "مسودة إيضاح رقم 2 - ممتلكات ومعدات وفق الإفصاح المعياري للمنشآت الصغيرة والمتوسطة.",
    status: "accepted_by_human",
    modelVersion: "audit-os-llm-v1",
  },
  {
    id: "ai-demo-5",
    suggestionType: "anomaly_explanation",
    confidence: 0.72,
    outputContent:
      "تحليل تباين: الرسوم المهنية زادت 60% مقارنة بالعام السابق. الأسباب المحتملة: استشارات أو تعاقدات جديدة.",
    status: "suggested",
    modelVersion: "audit-os-llm-v1",
  },
];

// ─── Dashboard Summary ───
const DASHBOARD = {
  totalEngagements: 3,
  activeEngagements: 2,
  pendingReviews: 2,
  openFindings: 5,
};

// ─── Engagement ───
const ENGAGEMENT = {
  fiscalPeriod: "FY2025",
};

// ─── Exported Demo Getters ───
export function getDemoTrialBalance() {
  return { trialBalance: { variance: totalDr - totalCr }, lines: LINES };
}

export function getDemoMappings() {
  return MAPPINGS;
}

export function getDemoFinancialStatements() {
  return [
    {
      statementType: "income_statement",
      title: "قائمة الدخل التجريبية",
      lines: INCOME_LINES,
    },
    {
      statementType: "balance_sheet",
      title: "قائمة المركز المالي التجريبية",
      lines: BALANCE_LINES,
    },
  ];
}

export function getDemoDisclosureNotes() {
  return NOTES;
}

export function getDemoEvidence() {
  return EVIDENCE;
}

export function getDemoFindings() {
  return FINDINGS;
}

export function getDemoRecommendations() {
  return RECOMMENDATIONS;
}

export function getDemoAuditEvents() {
  return EVENTS;
}

export function getDemoAiOutputs() {
  return AI_OUTPUTS;
}

export function getDemoDashboardSummary() {
  return DASHBOARD;
}

export function getDemoEngagement() {
  return ENGAGEMENT;
}

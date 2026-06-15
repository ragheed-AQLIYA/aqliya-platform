/**
 * Arabic / English / mixed account name synonyms → canonical COA codes (ADR-001).
 * Order matters: specific Phase 8.1 rules precede broad bucket rules.
 */

export interface CoaSynonymRule {
  canonicalCode: string;
  aliases: string[];
  category?: string;
}

export const COA_SYNONYM_RULES: CoaSynonymRule[] = [
  // ─── Phase 8.1 — specific balance sheet lines (match before broad rules) ───
  {
    canonicalCode: "CA-1071",
    aliases: [
      "rou accumulated depreciation",
      "right of use accumulated depreciation",
      "accumulated depreciation right of use",
      "accumulated depreciation right-of-use",
      "right-of-use accumulated",
      "مجمع اهلاك اصول حق الاستخدام",
      "مجمع اهلاك حق الاستخدام",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1070",
    aliases: [
      "right of use assets",
      "right-of-use-assets",
      "right of use asset",
      "right-of-use asset",
      "rou asset",
      "rou assets",
      "assets right of use",
      "اصول حق الاستخدام",
      "أصول حق الاستخدام",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1080",
    aliases: ["contract assets", "contract asset", "أصول العقود"],
    category: "asset",
  },
  {
    canonicalCode: "CA-1060",
    aliases: [
      "accumulated depreciation ppe",
      "accumulated depreciation pp&e",
      "accumulated depreciation property",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-2035",
    aliases: [
      "zakat provision",
      "provision for zakat",
      "provision for zakat and tax",
      "مخصص الزكاة",
      "مخصص زكاة",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2110",
    aliases: [
      "lease liabilities current portion",
      "lease liabilities - current portion",
      "lease liability current",
      "current portion of lease liability",
      "lease liabilities current",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2120",
    aliases: [
      "lease liability non current",
      "lease liabilities non current",
      "lease liability non-current",
      "non current lease liability",
      "non-current lease liability",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2130",
    aliases: [
      "long term loans non current",
      "long term loans ( non current )",
      "long-term debt",
      "long term debt",
      "long term loan non current",
      "قرض طويل الاجل",
      "قروض طويلة الاجل",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2140",
    aliases: [
      "deferred tax",
      "deferred tax liability",
      "deferred tax liabilities",
      "deferred income tax",
      "ضريبة مؤجلة",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-3030",
    aliases: [
      "actuarial reserve",
      "actuarial reserves",
      "احتياطي اكتواري",
      "احتياطى اكتواري",
    ],
    category: "equity",
  },
  {
    canonicalCode: "CA-3040",
    aliases: [
      "oci reserve",
      "other comprehensive income reserve",
      "reserve oci",
      "احتياطي الدخل الشامل",
    ],
    category: "equity",
  },
  // ─── Baseline COA ───
  {
    canonicalCode: "CA-1010",
    aliases: [
      "cash",
      "petty cash",
      "cash and cash equivalents",
      "cash and cash equivalent",
      "الصندوق",
      "النقدية",
      "الخزينة",
      "نقد",
      "صندوق",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1020",
    aliases: [
      "accounts receivable",
      "trade receivables",
      "due from related parties",
      "ذمم مدينة",
      "عملاء",
      "مدينون",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1030",
    aliases: [
      "inventories",
      "inventory",
      "contract costs",
      "مخزون",
      "بضاعة",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1040",
    aliases: [
      "prepaid expenses and other current assets",
      "prepaid expenses",
      "prepayments",
      "prepayment",
      "مصروفات مدفوعة مقدما",
      "مدفوعات مقدمة",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-1050",
    aliases: [
      "property plant and equipment",
      "property, plant, and equipment",
      "property plant equipment",
      "investment in subsidiary",
      "intangible assets",
      "intangible asset",
      "ppe",
      "ممتلكات ومعدات",
      "أصول غير ملموسة",
    ],
    category: "asset",
  },
  {
    canonicalCode: "CA-2010",
    aliases: [
      "accounts payable",
      "accounts payables",
      "trade payables",
      "due to related parties",
      "ذمم دائنة",
      "موردون",
      "دائنون",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2020",
    aliases: [
      "accrued expenses and other credit balances",
      "accrued expenses",
      "accrued salaries",
      "contracts liabilities",
      "contract liabilities",
      "contract liability",
      "employees defined benefits obligation",
      "مصروفات مستحقة",
      "رواتب مستحقة",
      "التزامات",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2030",
    aliases: [
      "tax and zakat payable",
      "zakat payable",
      "income tax payable",
      "tax payable",
      "زكاة مستحقة",
      "ضريبة",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-2040",
    aliases: [
      "short term loans",
      "short-term borrowings",
      "long term loans current",
      "long term loans ( current )",
      "borrowings",
      "قروض قصيرة",
    ],
    category: "liability",
  },
  {
    canonicalCode: "CA-3010",
    aliases: ["share capital", "capital", "رأس المال", "راس المال"],
    category: "equity",
  },
  {
    canonicalCode: "CA-3020",
    aliases: [
      "retained earnings",
      "retained earninggs",
      "general reserve",
      "أرباح محتجزة",
      "احتياطي نظامي",
      "احتياطى نظامى",
    ],
    category: "equity",
  },
  {
    canonicalCode: "CA-4010",
    aliases: [
      "revenue",
      "revenues",
      "sales",
      "related party revenue",
      "intercompany revenue",
      "ايرادات الشركات الشقيقة",
      "إيرادات الشركات الشقيقة",
      "إيرادات",
      "مبيعات",
      "دخل",
    ],
    category: "revenue",
  },
  {
    canonicalCode: "CA-5010",
    aliases: [
      "cost of sales",
      "cost of goods sold",
      "cost of revenue",
      "cogs",
      "spare parts",
      "consumables",
      "spare parts & consumables",
      "تكلفة المبيعات",
      "تكلفة البضاعة",
      "تكلفة الإيراد",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-5020",
    aliases: [
      "employee benefits",
      "salaries and wages",
      "salaries & wages",
      "wages salaries",
      "wages, salaries",
      "salaries",
      "wages",
      "رواتب",
      "أجور",
      "رواتب وأجور",
      "بدل اجازة",
      "مصاريف ترك الخدمة",
      "eos",
      "overtime",
      "اضافى",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-5040",
    aliases: ["utilities", "مرافق", "كهرباء", "مياه"],
    category: "expense",
  },
  {
    canonicalCode: "CA-5050",
    aliases: [
      "depreciation",
      "amortisation",
      "amortization",
      "depreciation ppe",
      "depreciation pp&e",
      "إهلاك",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-5060",
    aliases: [
      "professional fees",
      "consulting fees",
      "bank fees",
      "professional and consulting",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-5070",
    aliases: [
      "general and administrative expenses",
      "general and administrative",
      "general & administrative",
      "g&a",
      "administrative expenses",
      "other expenses",
      "other exp",
      "government exp",
      "government expenses",
      "vehicles and fuel",
      "fuel expense",
      "zakat expense",
      "مصاريف إدارية",
      "مصروفات عمومية",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-2050",
    aliases: [
      "finance cost",
      "finance costs",
      "finance costs borwings",
      "finance costs - borwings",
      "interest expense",
      "borrowing costs",
      "تكلفة تمويل",
      "مصاريف تمويل",
      "عمولة قرض",
      "عمولة قروض",
    ],
    category: "expense",
  },
  {
    canonicalCode: "CA-5100",
    aliases: ["other income", "sundry income", "إيرادات أخرى"],
    category: "revenue",
  },
];

export function normaliseAccountText(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[-_/]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\u0600-\u06FF]/g, "");
}

export function matchSynonym(
  accountName: string,
  accountCode: string,
): { canonicalCode: string; category?: string; alias: string } | null {
  const normName = normaliseAccountText(accountName);
  const normCode = normaliseAccountText(accountCode);

  for (const rule of COA_SYNONYM_RULES) {
    for (const alias of rule.aliases) {
      const normAlias = normaliseAccountText(alias);
      if (
        normName.includes(normAlias) ||
        normAlias.includes(normName) ||
        normCode.includes(normAlias)
      ) {
        return { canonicalCode: rule.canonicalCode, category: rule.category, alias };
      }
    }
  }
  return null;
}

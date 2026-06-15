import {
  buildPresentationIncomeStatementTotals,
  classifyRevenuePresentationSegment,
  isAuditedCorPresentationExcluded,
  isPresentationCostOfRevenueMapping,
  isPresentationZakatMapping,
  resolveErpMap1Label,
  sumAllPresentationRevenue,
} from "@/lib/audit/db/income-statement-presentation";
import { SHALFA_PILOT_PRESENTATION_POLICY_V1 } from "@/lib/audit/presentation/presentation-policy-types";

function mapping(
  overrides: Partial<{
    sourceAccountCode: string;
    sourceAccountName: string;
    debitAmount: number;
    creditAmount: number;
    erpMap1Label: string | null;
    canonicalName: string;
    canonicalCode: string;
    category: string;
  }> = {},
) {
  return {
    sourceAccountCode: "3101020005",
    sourceAccountName: "رسوم الزكاة والدخل",
    debitAmount: 2575256.63,
    creditAmount: 0,
    status: "confirmed",
    erpMap1Label: "zakat expense",
    canonicalAccount: {
      code: overrides.canonicalCode ?? "CA-5070",
      name: overrides.canonicalName ?? "General & Administrative Expenses",
      category: overrides.category ?? "Expenses",
      statementType: "income_statement",
    },
    ...overrides,
  };
}

describe("income-statement-presentation", () => {
  const shalfaPolicy = SHALFA_PILOT_PRESENTATION_POLICY_V1;
  it("treats only Map1 zakat expense as zakat — not all 310102 government GL", () => {
    expect(isPresentationZakatMapping(mapping())).toBe(true);
    expect(
      isPresentationZakatMapping(
        mapping({
          sourceAccountCode: "3101020002",
          sourceAccountName: "تجديد واستخراج اقامات",
          erpMap1Label: "General and administrative expenses",
          debitAmount: 2616354.31,
        }),
      ),
    ).toBe(false);
  });

  it("classifies 32xx as cost of revenue for presentation", () => {
    expect(
      isPresentationCostOfRevenueMapping(
        mapping({
          sourceAccountCode: "3204010001",
          sourceAccountName: "رواتب",
          erpMap1Label: "Cost of revenue",
          debitAmount: 1000,
          canonicalName: "Cost of Sales",
          canonicalCode: "CA-5010",
        }),
      ),
    ).toBe(true);
  });

  it("Map1 G&A overrides 32xx/33xx prefix (Phase 14 Shalfa reclass)", () => {
    expect(
      isPresentationCostOfRevenueMapping(
        mapping({
          sourceAccountCode: "3204010038",
          sourceAccountName: "منح ومكافأت",
          erpMap1Label: "General and administrative expenses",
          debitAmount: 433_201.08,
          canonicalName: "General & Administrative Expenses",
          canonicalCode: "CA-5070",
        }),
      ),
    ).toBe(false);
    expect(
      buildPresentationIncomeStatementTotals(
        [
          mapping({
            sourceAccountCode: "3204010038",
            sourceAccountName: "منح ومكافأت",
            erpMap1Label: "General and administrative expenses",
            debitAmount: 433_201.08,
          }),
        ],
        SHALFA_PILOT_PRESENTATION_POLICY_V1,
      ).operatingExpensesTotal,
    ).toBe(433_201.08);
  });

  it("moves unbilled duplicate GL to other revenue segment (Shalfa policy)", () => {
    expect(
      classifyRevenuePresentationSegment(
        mapping({
          sourceAccountCode: "4401010003",
          sourceAccountName: "ايرادات الصيانه والتشغيل (غير مفوترة)",
          erpMap1Label: "Revenues",
          creditAmount: 60395590,
          debitAmount: 0,
          canonicalName: "Revenue",
          canonicalCode: "CA-4010",
          category: "Revenue",
        }),
        shalfaPolicy,
      ),
    ).toBe("revenue_other");
  });

  it("reports affiliate as a traceable revenue sub-line without changing segment sum", () => {
    const rows = [
      mapping({
        sourceAccountCode: "4401010005",
        sourceAccountName: "ايرادات الشركات الشقيقة",
        erpMap1Label: "Affiliate revenue",
        creditAmount: 100,
        debitAmount: 0,
        canonicalName: "Revenue",
        canonicalCode: "CA-4010",
        category: "Revenue",
      }),
      mapping({
        sourceAccountCode: "4401010004",
        sourceAccountName: "Contract revenue",
        erpMap1Label: "Revenues",
        creditAmount: 200,
        debitAmount: 0,
        canonicalName: "Revenue",
        canonicalCode: "CA-4010",
        category: "Revenue",
      }),
    ];

    expect(sumAllPresentationRevenue(rows)).toBe(300);
    expect(buildPresentationIncomeStatementTotals(rows).revenueAffiliate).toBe(100);
  });

  it("applies audited CoR exclusions for government, JV, and 33xx ROU amort", () => {
    expect(
      isAuditedCorPresentationExcluded(
        mapping({
          sourceAccountCode: "3204010028",
          sourceAccountName: "مصروفات حكومية",
          erpMap1Label: "Cost of revenue",
          debitAmount: 1000,
        }),
      ),
    ).toBe(true);
    expect(
      isAuditedCorPresentationExcluded(
        mapping({
          sourceAccountCode: "3301010011",
          sourceAccountName: "اهلاك اصول حق الاستخدام",
          erpMap1Label: "Cost of revenue",
          debitAmount: 500,
        }),
      ),
    ).toBe(true);
  });

  it("nets misc other income GL to audited-style residual", () => {
    const rows = [
      mapping({
        sourceAccountCode: "4501010001",
        sourceAccountName: "أ.خ بيع أصول ثابتة",
        erpMap1Label: "Other income",
        creditAmount: 8408,
        canonicalName: "Other Income",
        canonicalCode: "CA-5100",
        category: "Revenue",
      }),
      mapping({
        sourceAccountCode: "4501010003",
        sourceAccountName: "ايرادات اخرى متنوعه.",
        erpMap1Label: "Other income",
        creditAmount: 11_163_436,
        canonicalName: "Other Income",
        canonicalCode: "CA-5100",
        category: "Revenue",
      }),
    ];
    expect(
      buildPresentationIncomeStatementTotals(
        rows,
        SHALFA_PILOT_PRESENTATION_POLICY_V1,
      ).otherIncomeTotal,
    ).toBe(735_915);
  });
});

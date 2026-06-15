import {
  checkBalanceSheetEquation,
  checkCashFlowTie,
  checkIncomeToEquityFlow,
  checkLeadScheduleToFsTie,
  checkMappingCoverage,
  checkTbToLeadScheduleTie,
} from "@/lib/audit/reconciliation/reconciliation-checks";
import {
  isReconciliationEnabled,
  isReconciliationGatesEnabled,
} from "@/lib/audit/reconciliation";

describe("reconciliation checks", () => {
  describe("checkBalanceSheetEquation", () => {
    it("passes when assets equal liabilities and equity", () => {
      const results = checkBalanceSheetEquation({
        statements: [
          {
            id: "bs-1",
            statementType: "balance_sheet",
            lines: [
              {
                id: "a",
                label: "TOTAL ASSETS",
                amount: 1_000_000,
                isTotal: true,
                linkedAccountMappings: [],
              },
              {
                id: "l",
                label: "TOTAL LIABILITIES AND EQUITY",
                amount: 1_000_000,
                isTotal: true,
                linkedAccountMappings: [],
              },
            ],
          },
        ],
      });
      expect(results[0]?.passed).toBe(true);
      expect(results[0]?.code).toBe("RC-003");
    });
  });

  describe("checkTbToLeadScheduleTie", () => {
    it("passes when lead schedule lines match mapping balances", () => {
      const results = checkTbToLeadScheduleTie({
        mappings: [
          {
            id: "m1",
            sourceAccountCode: "1000",
            status: "confirmed",
            debitAmount: 100,
            creditAmount: 0,
            canonicalAccount: {
              category: "Current Assets",
              statementType: "balance_sheet",
            },
          },
        ],
        schedules: [
          {
            id: "ls1",
            accountCode: "LS-CURRENTASSET",
            currentYearBalance: 100,
            lines: [{ amount: 100, reference: "m1" }],
          },
        ],
      });
      expect(results[0]?.passed).toBe(true);
    });

    it("flags mismatch between mappings and lead schedule lines", () => {
      const results = checkTbToLeadScheduleTie({
        mappings: [
          {
            id: "m1",
            sourceAccountCode: "1000",
            status: "confirmed",
            debitAmount: 100,
            creditAmount: 0,
            canonicalAccount: {
              category: "Current Assets",
              statementType: "balance_sheet",
            },
          },
        ],
        schedules: [
          {
            id: "ls1",
            accountCode: "LS-CURRENTASSET",
            currentYearBalance: 50,
            lines: [{ amount: 50, reference: "m1" }],
          },
        ],
      });
      expect(results[0]?.passed).toBe(false);
    });
  });

  describe("checkLeadScheduleToFsTie", () => {
    it("passes when cost of sales detail lines tie to lead schedules", () => {
      const results = checkLeadScheduleToFsTie({
        schedules: [
          {
            id: "ls1",
            accountCode: "LS-EXPENSES",
            currentYearBalance: 2_800_000,
            lines: [{ amount: 2_800_000, reference: "map-cos" }],
          },
        ],
        statements: [
          {
            id: "is-1",
            statementType: "income_statement",
            lines: [
              {
                id: "cos-total",
                label: "Cost of Sales",
                amount: 2_800_000,
                isTotal: true,
                linkedAccountMappings: ["map-cos"],
              },
              {
                id: "cos-detail",
                label: "  Cost of Sales",
                amount: 2_800_000,
                isTotal: false,
                linkedAccountMappings: ["map-cos"],
              },
            ],
          },
        ],
      });
      expect(results[0]?.passed).toBe(true);
      expect(results[0]?.code).toBe("RC-002");
    });
  });

  describe("checkMappingCoverage", () => {
    it("passes when all confirmed mappings referenced", () => {
      const results = checkMappingCoverage({
        mappings: [
          {
            id: "m1",
            sourceAccountCode: "1000",
            status: "confirmed",
            debitAmount: 1,
            creditAmount: 0,
          },
        ],
        schedules: [
          {
            id: "ls1",
            accountCode: "LS",
            currentYearBalance: 1,
            lines: [{ amount: 1, reference: "m1" }],
          },
        ],
      });
      expect(results[0]?.passed).toBe(true);
    });
  });

  describe("checkCashFlowTie", () => {
    it("uses CA-1010 only and ignores bank loans in account names", () => {
      const results = checkCashFlowTie({
        statements: [
          {
            id: "cf-1",
            statementType: "cash_flow",
            lines: [
              {
                id: "c1",
                label: "Cash at End of Period",
                amount: 100,
                isTotal: true,
                linkedAccountMappings: [],
              },
            ],
          },
        ],
        mappings: [
          {
            id: "cash",
            sourceAccountCode: "1101",
            sourceAccountName: "Cash",
            status: "confirmed",
            debitAmount: 100,
            creditAmount: 0,
            canonicalAccount: {
              code: "CA-1010",
              name: "Cash and Cash Equivalents",
              category: "Current Assets",
              statementType: "balance_sheet",
            },
          },
          {
            id: "loan",
            sourceAccountCode: "2108",
            sourceAccountName: "تمويل بنك الرياض",
            status: "confirmed",
            debitAmount: 0,
            creditAmount: 500,
            canonicalAccount: {
              code: "CA-2040",
              name: "Short-term Borrowings",
              category: "Current Liabilities",
              statementType: "balance_sheet",
            },
          },
        ],
      });
      expect(results[0]?.passed).toBe(true);
      expect(results[0]?.expectedValue).toBe(100);
    });
  });
});

describe("reconciliation flags", () => {
  const prevRecon = process.env.FF_AUDIT_RECONCILIATION;
  const prevGates = process.env.FF_AUDIT_RECONCILIATION_GATES;

  afterEach(() => {
    if (prevRecon === undefined) delete process.env.FF_AUDIT_RECONCILIATION;
    else process.env.FF_AUDIT_RECONCILIATION = prevRecon;
    if (prevGates === undefined) delete process.env.FF_AUDIT_RECONCILIATION_GATES;
    else process.env.FF_AUDIT_RECONCILIATION_GATES = prevGates;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_RECONCILIATION;
    delete process.env.FF_AUDIT_RECONCILIATION_GATES;
    expect(isReconciliationEnabled()).toBe(false);
    expect(isReconciliationGatesEnabled()).toBe(false);
  });
});

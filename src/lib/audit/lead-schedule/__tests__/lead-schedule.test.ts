import { getMappingClosingBalance } from "@/lib/audit/lead-schedule/balance-utils";
import {
  categoryToPaperNumber,
  resolveCategoryLabel,
} from "@/lib/audit/lead-schedule/category-labels";
import { isLeadScheduleAutoEnabled } from "@/lib/audit/lead-schedule";

describe("getMappingClosingBalance", () => {
  it("uses credit for income statement revenue", () => {
    expect(
      getMappingClosingBalance({
        debitAmount: 0,
        creditAmount: 100_000,
        canonicalAccount: {
          category: "Revenue",
          statementType: "income_statement",
        },
      }),
    ).toBe(100_000);
  });

  it("uses debit for current assets", () => {
    expect(
      getMappingClosingBalance({
        debitAmount: 50_000,
        creditAmount: 0,
        statementClassification: "Current Assets",
        canonicalAccount: {
          category: "Current Assets",
          statementType: "balance_sheet",
        },
      }),
    ).toBe(50_000);
  });
});

describe("categoryToPaperNumber", () => {
  it("builds stable paper numbers", () => {
    expect(categoryToPaperNumber("Current Assets")).toBe("LS-CURRENTASSET");
  });
});

describe("resolveCategoryLabel", () => {
  it("returns Arabic label for known categories", () => {
    expect(resolveCategoryLabel("Equity").ar).toBe("حقوق الملكية");
  });
});

describe("isLeadScheduleAutoEnabled", () => {
  const prev = process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO;

  afterEach(() => {
    if (prev === undefined) delete process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO;
    else process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO = prev;
  });

  it("defaults off", () => {
    delete process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO;
    expect(isLeadScheduleAutoEnabled()).toBe(false);
  });

  it("respects env override", () => {
    process.env.FF_AUDIT_LEAD_SCHEDULE_AUTO = "true";
    expect(isLeadScheduleAutoEnabled()).toBe(true);
  });
});

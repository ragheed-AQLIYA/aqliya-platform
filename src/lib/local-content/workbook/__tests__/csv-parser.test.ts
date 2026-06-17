import { parseCsvTrialBalance } from "../csv-parser";

describe("CsvTrialBalance parser", () => {
  describe("English headers", () => {
    it("should parse standard CSV with English headers", () => {
      const csv = `Account Code,Account Name,Debit,Credit
1001,Revenue,0,500000
2001,Expenses,300000,0`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(2);
      expect(result.parsedRows).toBe(2);
      expect(result.totalRows).toBe(2);
      expect(result.lines[0].accountCode).toBe("1001");
      expect(result.lines[0].accountName).toBe("Revenue");
      expect(result.lines[0].debit).toBe(0);
      expect(result.lines[0].credit).toBe(500000);
      expect(result.lines[1].accountCode).toBe("2001");
      expect(result.lines[1].credit).toBe(0);
      expect(result.lines[1].debit).toBe(300000);
    });

    it("should detect alternative English header names", () => {
      const csv = `Account Code,Description,Debit amount,Credit amount
1001,Sales,0,500000`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].accountCode).toBe("1001");
      expect(result.lines[0].accountName).toBe("Sales");
    });

    it("should handle semicolon delimiters", () => {
      const csv = `Account Code;Description;Debit;Credit
1001;Revenue;0;500000`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].accountCode).toBe("1001");
    });
  });

  describe("Arabic headers", () => {
    it("should parse CSV with Arabic headers", () => {
      const csv = `رقم الحساب,اسم الحساب,مدين,دائن
1001,إيرادات عقارية,0,500000
2001,مصروفات عمومية,300000,0`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(2);
      expect(result.lines[0].accountCode).toBe("1001");
      expect(result.lines[0].accountName).toBe("إيرادات عقارية");
      expect(result.lines[0].debit).toBe(0);
      expect(result.lines[0].credit).toBe(500000);
      expect(result.lines[1].accountCode).toBe("2001");
      expect(result.lines[1].debit).toBe(300000);
    });

    it("should parse with Arabic variant headers", () => {
      const csv = `كود الحساب,البيان,مدينة,دائنة
1001,إيرادات,0,500000`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(1);
    });
  });

  describe("Edge cases", () => {
    it("should handle quoted values with commas", () => {
      const csv = `Account Code,Description,Debit,Credit
1001,"Sales Revenue, Net",0,500000`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(1);
      expect(result.lines[0].accountName).toBe("Sales Revenue, Net");
    });

    it("should handle negative values in parentheses", () => {
      const csv = `Account Code,Account Name,Debit,Credit
1001,Returns,(5000),0`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines[0].debit).toBe(-5000);
    });

    it("should handle empty rows", () => {
      const csv = `Account Code,Account Name,Debit,Credit
1001,Revenue,0,500000

2001,Expenses,300000,0
`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(2);
    });

    it("should handle tab delimiters", () => {
      const csv = "Account Code\tAccount Name\tDebit\tCredit\n1001\tRevenue\t0\t500000";

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(1);
    });

    it("should return error for empty text", () => {
      const result = parseCsvTrialBalance("");
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.lines).toHaveLength(0);
    });

    it("should return error for header-only CSV", () => {
      const result = parseCsvTrialBalance("Account Code,Name,Debit,Credit");
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.lines).toHaveLength(0);
    });

    it("should handle Arabic numerals (٠-٩)", () => {
      const csv = `Account Code,Name,Debit,Credit
1001,Revenue,٠,٥٠٠٠٠٠`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines[0].credit).toBe(500000);
    });

    it("should handle header matching with aliases (accountnumber)", () => {
      const csv = `AccountNo,Account Name,Debit,Credit
1001,Revenue,0,50000`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines[0].accountCode).toBe("1001");
    });
  });

  describe("Realistic TB data", () => {
    it("should parse a realistic trial balance extract", () => {
      const csv = `Account Code,Account Name,Debit,Credit
11000001,نقدية,5000000,0
12000001,مدينون,15000000,0
13000001,أصول ثابتة,50000000,0
21000001,دائنون,0,8000000
31000001,رأس المال,0,50000000
41000001,إيرادات عقارية,0,25000000
42000001,إيرادات تشغيل,0,20000000
51000001,رواتب وموظفين,10000000,0
52000001,تكلفة خدمات,7000000,0
52999999,مصروفات متنوعة,16000000,0`;

      const result = parseCsvTrialBalance(csv);
      expect(result.errors).toHaveLength(0);
      expect(result.lines).toHaveLength(10);
      expect(result.parsedRows).toBe(10);
      expect(result.totalRows).toBe(10);

      // Balance check: total debit (10M+7M+16M+5M+15M+50M) should equal total credit (8M+50M+25M+20M)
      // debit: 5000000 + 15000000 + 50000000 + 10000000 + 7000000 + 16000000 = 103,000,000
      // credit: 8000000 + 50000000 + 25000000 + 20000000 = 103,000,000
      const totalDebit = result.lines.reduce((s, l) => s + l.debit, 0);
      const totalCredit = result.lines.reduce((s, l) => s + l.credit, 0);
      expect(totalDebit).toBe(103000000);
      expect(totalCredit).toBe(103000000);
    });
  });
});

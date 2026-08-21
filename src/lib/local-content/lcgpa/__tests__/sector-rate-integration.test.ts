// ─── LCGPA Sector LC% Rate Integration Tests ───
// Verifies that sector rates from Appendix B are correctly surfaced
// through classification and lookup functions.
//
// NOTE: LCGPA_SECTORS stores lcRate as decimal (0-1), not percentage (0-100).
// The Appendix B official rates are: S01=0.60, P01=0.57, P09=0.50, etc.

import {
  getSectorLcRate,
  getAllSectorRates,
  classifySpendAgainstMandatoryList,
  importMandatoryListFromXlsx,
  clearMandatoryListStore,
} from "../mandatory-list";

describe("Sector LC% Rate Integration", () => {
  // ─── getSectorLcRate ───

  describe("getSectorLcRate", () => {
    it("returns the official LC rate for S01 (Housing & Rental)", () => {
      expect(getSectorLcRate("S01")).toBe(0.6);
    });

    it("returns the official LC rate for S20 (Other Services)", () => {
      expect(getSectorLcRate("S20")).toBe(0.35);
    });

    it("returns the official LC rate for P01 (Agriculture)", () => {
      expect(getSectorLcRate("P01")).toBe(0.57);
    });

    it("returns the official LC rate for P09 (Cement & Gypsum)", () => {
      expect(getSectorLcRate("P09")).toBe(0.5);
    });

    it("returns 0 for sector S23 (Foreign Services)", () => {
      expect(getSectorLcRate("S23")).toBe(0);
    });

    it("returns 0 for sector P15 (Foreign Supplier Products)", () => {
      expect(getSectorLcRate("P15")).toBe(0);
    });

    it("returns null for unknown sector code", () => {
      expect(getSectorLcRate("XX99")).toBeNull();
    });

    it("returns null for empty string", () => {
      expect(getSectorLcRate("")).toBeNull();
    });
  });

  // ─── getAllSectorRates ───

  describe("getAllSectorRates", () => {
    it("returns all 38 sectors", () => {
      const rates = getAllSectorRates();
      expect(rates.length).toBe(38);
    });

    it("returns 23 service sectors", () => {
      const rates = getAllSectorRates();
      const services = rates.filter(r => r.code.startsWith("S"));
      expect(services.length).toBe(23);
    });

    it("returns 15 product sectors", () => {
      const rates = getAllSectorRates();
      const products = rates.filter(r => r.code.startsWith("P"));
      expect(products.length).toBe(15);
    });

    it("all rates are between 0 and 1 (decimal format)", () => {
      const rates = getAllSectorRates();
      for (const r of rates) {
        expect(r.lcRate).toBeGreaterThanOrEqual(0);
        expect(r.lcRate).toBeLessThanOrEqual(1);
      }
    });

    it("S23 (Foreign Services) has lcRate of 0", () => {
      const rates = getAllSectorRates();
      const s23 = rates.find(r => r.code === "S23");
      expect(s23).toBeDefined();
      expect(s23!.lcRate).toBe(0);
    });
  });

  // ─── Classification with sector rate ───

  describe("classifySpendAgainstMandatoryList with sector rate", () => {
    beforeAll(() => {
      clearMandatoryListStore();

      // Import a minimal mandatory list so classification works
      importMandatoryListFromXlsx(
        "2026-Q1",
        "https://lcgpa.gov.sa/documents/test.xlsx",
        new Date("2026-01-01"),
        [
          {
            productCode: "ML-001",
            productNameAr: "أسمنت بورتلاندي عادي",
            productNameEn: "Ordinary Portland Cement",
            sectorCode: "P09",
            sectorNameAr: "منتجات الاسمنت والجبس",
            sectorNameEn: "Cement & Gypsum Products",
            effectiveDate: "2026-01-01",
          },
        ],
        "test-user",
      );
    });

    afterAll(() => {
      clearMandatoryListStore();
    });

    it("includes sector LC rate when product matches mandatory list", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameAr: "أسمنت بورتلاندي عادي",
        sectorCode: "P09",
      });
      expect(result.isMandatory).toBe(true);
      expect(result.sectorLcRate).toBe(0.5);
      expect(result.identifiedSectorCode).toBe("P09");
    });

    it("includes sector LC rate for sector-only match", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameAr: "some unknown product",
        sectorCode: "P09",
      });
      // Sector match returns isMandatory=false but includes sector rate
      expect(result.sectorLcRate).toBe(0.5);
      expect(result.identifiedSectorCode).toBe("P09");
    });

    it("includes sector LC rate even when no mandatory list match", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameEn: "Completely Unrelated Service",
        sectorCode: "S15",
      });
      expect(result.isMandatory).toBe(false);
      expect(result.sectorLcRate).toBe(0.2);
      expect(result.identifiedSectorCode).toBe("S15");
    });

    it("returns no sector rate when sector is unknown", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameEn: "Mystery Item",
        sectorCode: "XX99",
      });
      expect(result.sectorLcRate).toBeUndefined();
      expect(result.identifiedSectorCode).toBeUndefined();
    });

    it("returns no sector rate when sector is not provided", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameEn: "Item Without Sector",
      });
      expect(result.sectorLcRate).toBeUndefined();
      expect(result.identifiedSectorCode).toBeUndefined();
    });

    it("foreign sector S23 returns lcRate of 0", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameEn: "Foreign Imported Goods",
        sectorCode: "S23",
      });
      expect(result.sectorLcRate).toBe(0);
      expect(result.identifiedSectorCode).toBe("S23");
    });

    it("foreign product P15 returns lcRate of 0", () => {
      const result = classifySpendAgainstMandatoryList({
        productNameEn: "Foreign Manufactured Product",
        sectorCode: "P15",
      });
      expect(result.sectorLcRate).toBe(0);
      expect(result.identifiedSectorCode).toBe("P15");
    });
  });
});

import {
  isArabicText,
  getArabicCharCount,
  isBilingualText,
  detectReportLocale,
  normalizeArabicNumber,
} from "../arabic-pdf-support";

describe("arabic-pdf-support", () => {
  describe("isArabicText", () => {
    it("returns true for Arabic text", () => {
      expect(isArabicText("مرحبا بالعالم")).toBe(true);
      expect(isArabicText("القوائم المالية")).toBe(true);
    });

    it("returns false for English text", () => {
      expect(isArabicText("Hello World")).toBe(false);
      expect(isArabicText("Financial Statements")).toBe(false);
    });

    it("returns false for empty string", () => {
      expect(isArabicText("")).toBe(false);
    });

    it("returns true for mixed text with Arabic characters", () => {
      expect(isArabicText("مرحبا World")).toBe(true);
    });
  });

  describe("getArabicCharCount", () => {
    it("counts Arabic characters correctly", () => {
      expect(getArabicCharCount("مرحبا")).toBe(5);
      expect(getArabicCharCount("Hello")).toBe(0);
      expect(getArabicCharCount("Hello مرحبا")).toBe(5);
    });
  });

  describe("isBilingualText", () => {
    it("returns true for mixed Arabic-English text", () => {
      expect(isBilingualText("مرحبا World")).toBe(true);
    });

    it("returns false for pure Arabic text", () => {
      expect(isBilingualText("مرحبا")).toBe(false);
    });

    it("returns false for pure English text", () => {
      expect(isBilingualText("Hello")).toBe(false);
    });
  });

  describe("detectReportLocale", () => {
    it("detects English locale", () => {
      expect(detectReportLocale(["Hello", "World"])).toBe("en");
    });

    it("detects Arabic locale", () => {
      expect(detectReportLocale(["مرحبا", "عالم"])).toBe("ar");
    });

    it("detects bilingual locale", () => {
      expect(detectReportLocale(["Hello", "مرحبا"])).toBe("bilingual");
    });
  });

  describe("normalizeArabicNumber", () => {
    it("formats with Arabic locale", () => {
      const result = normalizeArabicNumber(1234567.89, "ar");
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    it("formats with English locale", () => {
      const result = normalizeArabicNumber(1234567.89, "en");
      expect(result).toBe("1,234,567.89");
    });
  });
});

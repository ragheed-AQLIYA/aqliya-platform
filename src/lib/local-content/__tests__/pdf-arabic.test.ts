import { formatPdfArabicNumber, pdfTextOptions } from "../pdf-arabic";

describe("pdf-arabic (LC-05)", () => {
  it("uses RTL alignment for Arabic", () => {
    expect(pdfTextOptions("ar").align).toBe("right");
  });

  it("formats numbers for ar-SA locale", () => {
    const formatted = formatPdfArabicNumber(1000);
    expect(formatted.length).toBeGreaterThan(0);
  });
});

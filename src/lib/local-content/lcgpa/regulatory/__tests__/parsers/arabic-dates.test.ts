import {
  ARABIC_MONTHS,
  normalizeArabicText,
  normalizeDigits,
  parseLcgpaDate,
} from "../../parsers/arabic-dates";

describe("LCGPA parsers :: Arabic date parsing (§45)", () => {
  it("parses the published Arabic long form", () => {
    const r = parseLcgpaDate("1 أغسطس 2026م");
    expect(r.error).toBeNull();
    expect(r.basis).toBe("ARABIC_LONG");
    expect(r.value?.toISOString()).toBe("2026-08-01T00:00:00.000Z");
  });

  it("parses every cohort start date published in the July 2026 schedule", () => {
    expect(parseLcgpaDate("1 أغسطس 2026م").value?.toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
    expect(parseLcgpaDate("1 أغسطس 2027م").value?.toISOString()).toBe(
      "2027-08-01T00:00:00.000Z",
    );
    expect(parseLcgpaDate("1 يونيو 2028م").value?.toISOString()).toBe(
      "2028-06-01T00:00:00.000Z",
    );
  });

  it("accepts Arabic-Indic digits", () => {
    expect(normalizeDigits("٢٠٢٦")).toBe("2026");
    expect(parseLcgpaDate("١ أغسطس ٢٠٢٦م").value?.toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
  });

  it("accepts spelling variants of month names", () => {
    expect(parseLcgpaDate("1 اغسطس 2026").value?.toISOString()).toBe(
      "2026-08-01T00:00:00.000Z",
    );
    expect(ARABIC_MONTHS["أغسطس"]).toBe(8);
    expect(ARABIC_MONTHS["اغسطس"]).toBe(8);
  });

  it("parses an Excel date cell as UTC midnight", () => {
    const r = parseLcgpaDate(new Date(Date.UTC(2020, 3, 7, 13, 45)));
    expect(r.basis).toBe("EXCEL_DATE");
    expect(r.value?.toISOString()).toBe("2020-04-07T00:00:00.000Z");
  });

  it("parses ISO strings, including the Excel export form", () => {
    expect(parseLcgpaDate("2022-12-18").value?.toISOString()).toBe(
      "2022-12-18T00:00:00.000Z",
    );
    expect(parseLcgpaDate("2022-12-18 00:00:00").value?.toISOString()).toBe(
      "2022-12-18T00:00:00.000Z",
    );
  });

  it("treats empty and «-» as UNKNOWN, not as an error and not as a date", () => {
    for (const v of [null, undefined, "", "   ", "-"]) {
      const r = parseLcgpaDate(v);
      expect(r.value).toBeNull();
      expect(r.error).toBeNull();
    }
  });

  it("REFUSES a locale-ambiguous numeric date", () => {
    const r = parseLcgpaDate("01/08/2026");
    expect(r.value).toBeNull();
    expect(r.error).toMatch(/DATE_FORMAT_UNRECOGNISED/);
  });

  it("REFUSES an unknown month name rather than guessing", () => {
    const r = parseLcgpaDate("1 شهر 2026م");
    expect(r.error).toMatch(/DATE_MONTH_UNKNOWN/);
  });

  it("REFUSES an impossible day", () => {
    expect(parseLcgpaDate("31 فبراير 2026م").error).toMatch(/DATE_INVALID/);
    expect(parseLcgpaDate("45 أغسطس 2026م").error).toMatch(
      /DATE_DAY_OUT_OF_RANGE|DATE_FORMAT_UNRECOGNISED/,
    );
  });

  it("strips directional marks and tatweel without altering meaning", () => {
    expect(normalizeArabicText("‏1 أغسطس 2026م‎")).toBe("1 أغسطس 2026م");
  });
});

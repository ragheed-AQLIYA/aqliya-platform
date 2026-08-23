// ─── LCGPA Regulatory Intelligence :: Arabic date parsing (§45) ───
//
// LCGPA publishes effective dates in two forms:
//   - ISO / Excel date cells                      → "2026-08-01T00:00:00.000Z"
//   - Arabic long form in a text cell             → "1 أغسطس 2026م"
//
// Both are parsed explicitly. Anything else returns an error rather than a
// guess: an unrecognised date is UNKNOWN, never today, never zero.

/** Arabic month names as LCGPA publishes them, including spelling variants. */
export const ARABIC_MONTHS: Record<string, number> = {
  "يناير": 1,
  "كانون الثاني": 1,
  "فبراير": 2,
  "شباط": 2,
  "مارس": 3,
  "آذار": 3,
  "اذار": 3,
  "أبريل": 4,
  "ابريل": 4,
  "نيسان": 4,
  "مايو": 5,
  "أيار": 5,
  "ايار": 5,
  "يونيو": 6,
  "حزيران": 6,
  "يوليو": 7,
  "تموز": 7,
  "أغسطس": 8,
  "اغسطس": 8,
  "آب": 8,
  "سبتمبر": 9,
  "أيلول": 9,
  "ايلول": 9,
  "أكتوبر": 10,
  "اكتوبر": 10,
  "تشرين الأول": 10,
  "نوفمبر": 11,
  "تشرين الثاني": 11,
  "ديسمبر": 12,
  "كانون الأول": 12,
};

/** Convert Arabic-Indic and Eastern Arabic-Indic digits to ASCII. */
export function normalizeDigits(input: string): string {
  return input.replace(/[٠-٩۰-۹]/g, (ch) => {
    const code = ch.charCodeAt(0);
    const base = code >= 0x06f0 ? 0x06f0 : 0x0660;
    return String(code - base);
  });
}

/**
 * Strip formatting noise that carries no meaning: the Hijri/Gregorian era
 * marker "م"/"هـ", RTL marks, tatweel, and repeated whitespace.
 */
export function normalizeArabicText(input: string): string {
  return normalizeDigits(input)
    .replace(/[‎‏‪-‮ـ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export interface DateParse {
  value: Date | null;
  error: string | null;
  /** How the value was recognised, for the audit trail. */
  basis: "EXCEL_DATE" | "ISO" | "ARABIC_LONG" | "NONE";
}

const NONE: DateParse = { value: null, error: null, basis: "NONE" };

/**
 * Parse an LCGPA-published date.
 *
 * Accepts a real Date (an Excel date cell), an unambiguous ISO string, or the
 * Arabic long form. Rejects everything else — including locale-ambiguous
 * numeric forms such as 01/08/2026.
 */
export function parseLcgpaDate(raw: unknown): DateParse {
  if (raw === null || raw === undefined) return NONE;

  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      return { value: null, error: "DATE_INVALID: Excel date cell is not a valid date", basis: "EXCEL_DATE" };
    }
    // Excel date cells are wall-clock dates; pin them to UTC midnight.
    return {
      value: new Date(Date.UTC(raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate())),
      error: null,
      basis: "EXCEL_DATE",
    };
  }

  const text = normalizeArabicText(String(raw));
  if (text === "" || text === "-") return NONE;

  // ISO-8601 (optionally with a time component, as Excel exports produce).
  const iso = /^(\d{4})-(\d{2})-(\d{2})(?:[T ].*)?$/.exec(text);
  if (iso) {
    const d = new Date(Date.UTC(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])));
    if (Number.isNaN(d.getTime())) {
      return { value: null, error: `DATE_UNPARSEABLE: "${raw}"`, basis: "ISO" };
    }
    return { value: d, error: null, basis: "ISO" };
  }

  // Arabic long form: "1 أغسطس 2026م" / "١ أغسطس ٢٠٢٦"
  const parts = text.replace(/م$/, "").trim();
  const arabic = /^(\d{1,2})\s+(.+?)\s+(\d{4})$/.exec(parts);
  if (arabic) {
    const day = Number(arabic[1]);
    const monthName = arabic[2].trim();
    const year = Number(arabic[3]);
    const month = ARABIC_MONTHS[monthName];
    if (month === undefined) {
      return {
        value: null,
        error: `DATE_MONTH_UNKNOWN: "${monthName}" is not a recognised month name`,
        basis: "ARABIC_LONG",
      };
    }
    if (day < 1 || day > 31) {
      return { value: null, error: `DATE_DAY_OUT_OF_RANGE: ${day}`, basis: "ARABIC_LONG" };
    }
    const d = new Date(Date.UTC(year, month - 1, day));
    if (d.getUTCMonth() !== month - 1) {
      return { value: null, error: `DATE_INVALID: ${day}/${month}/${year}`, basis: "ARABIC_LONG" };
    }
    return { value: d, error: null, basis: "ARABIC_LONG" };
  }

  return {
    value: null,
    error: `DATE_FORMAT_UNRECOGNISED: "${raw}" is not an ISO date or a recognised Arabic long-form date; effective dates are never guessed`,
    basis: "NONE",
  };
}

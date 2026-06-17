// ─── LocalContentOS Workbook — Missing Data Engine Tests ───

import { getTemplateLineByCode } from "../template";
import { WORKBOOK_TEMPLATE } from "../template";

describe("Missing Data Engine (logical)", () => {
  it("should detect that WRK-01 and WRK-02 have no TB patterns (autoFillable=false)", () => {
    const wrk01 = getTemplateLineByCode("WRK-01");
    const wrk02 = getTemplateLineByCode("WRK-02");
    expect(wrk01?.autoFillable).toBe(false);
    expect(wrk02?.autoFillable).toBe(false);
  });

  it("should identify evidence-required lines for data request", () => {
    const evidenceLines = WORKBOOK_TEMPLATE.lines.filter(
      (l) => l.evidenceRequired,
    );
    expect(evidenceLines.length).toBeGreaterThanOrEqual(6);
    for (const line of evidenceLines) {
      expect(line.evidenceTypes).toBeDefined();
      expect(line.evidenceTypes!.length).toBeGreaterThan(0);
    }
  });

  it("should have all autoFillable lines with tbAccountPatterns or formula", () => {
    const autoLines = WORKBOOK_TEMPLATE.lines.filter((l) => l.autoFillable);
    for (const line of autoLines) {
      if (line.formula) continue; // Formula-based lines don't need TB patterns
      expect(line.tbAccountPatterns).toBeDefined();
      expect(line.tbAccountPatterns!.length).toBeGreaterThan(0);
    }
  });

  it("should have declarations section for narrative/notes", () => {
    const declLines = WORKBOOK_TEMPLATE.lines.filter(
      (l) => l.section === "declarations",
    );
    expect(declLines.length).toBeGreaterThanOrEqual(3);
  });

  it("should compute total autoFillable vs non-autoFillable counts", () => {
    const autoCount = WORKBOOK_TEMPLATE.lines.filter((l) => l.autoFillable).length;
    const manualCount = WORKBOOK_TEMPLATE.lines.filter((l) => !l.autoFillable).length;
    expect(autoCount + manualCount).toBe(WORKBOOK_TEMPLATE.lines.length);
    expect(autoCount).toBeGreaterThan(0);
    expect(manualCount).toBeGreaterThan(0);
  });

  it("WRK-03 should have a formula for Saudization percentage", () => {
    const wrk03 = getTemplateLineByCode("WRK-03");
    expect(wrk03?.formula).toBe("WRK-01 / WRK-02 * 100");
    expect(wrk03?.formula).toBeDefined();
  });
});

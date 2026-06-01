import { describe, expect, it } from "@jest/globals";
import {
  buildInstitutionalLearningDrillDownHref,
  buildInstitutionalLearningRowHref,
  buildInstitutionalLearningTrendHref,
  institutionalLearningRowElementId,
  INSTITUTIONAL_LEARNING_FOCUS_PARAM,
} from "../institutional-learning-links";

describe("institutional-learning drill-down links (Wave 5)", () => {
  it("builds memory-tab drill-down with focus query param", () => {
    const href = buildInstitutionalLearningDrillDownHref("il-insight-1", "insight");
    expect(href).toContain("/sales/intelligence?");
    expect(href).toContain(`${INSTITUTIONAL_LEARNING_FOCUS_PARAM}=il-insight-1`);
    expect(href).toContain("type=insight");
    expect(href).toContain("#memory");
  });

  it("routes win_rate trends to revenue surface", () => {
    expect(
      buildInstitutionalLearningTrendHref({
        id: "il-trend-win-rate",
        trendType: "win_rate",
      }),
    ).toBe("/sales/revenue");
  });

  it("routes activity_volume trends to opportunities", () => {
    expect(
      buildInstitutionalLearningTrendHref({
        id: "il-trend-activity-volume",
        trendType: "activity_volume",
      }),
    ).toBe("/sales/opportunities");
  });

  it("routes signal_strength trends to memory drill-down", () => {
    const href = buildInstitutionalLearningTrendHref({
      id: "il-trend-signal-strength",
      trendType: "signal_strength",
    });
    expect(href).toContain("#memory");
    expect(href).toContain("il-trend-signal-strength");
  });

  it("routes recommendations to command center", () => {
    expect(
      buildInstitutionalLearningRowHref("recommendation", "il-rec-1"),
    ).toBe("/sales/command-center");
  });

  it("uses stable row element ids for focus scroll", () => {
    expect(institutionalLearningRowElementId("il-trend-win-rate")).toBe(
      "institutional-row-il-trend-win-rate",
    );
  });
});

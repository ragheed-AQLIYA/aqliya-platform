// @ts-nocheck
import { describe, expect, it } from "@jest/globals";
import { extractMeetingMetadataFromInteraction } from "../meeting-intelligence";

describe("meeting-intelligence metadata", () => {
  it("reads followUpTasks from interaction metadata", () => {
    const meta = extractMeetingMetadataFromInteraction({
      summary: "اجتماع",
      metadata: { followUpTasks: ["متابعة عرض"] },
    });
    expect(meta.followUpTasks).toEqual(["متابعة عرض"]);
  });

  it("infers follow-up from summary keyword", () => {
    const meta = extractMeetingMetadataFromInteraction({
      summary: "متابعة مع العميل الأسبوع القادم",
    });
    expect(meta.followUpTasks.length).toBeGreaterThan(0);
  });
});

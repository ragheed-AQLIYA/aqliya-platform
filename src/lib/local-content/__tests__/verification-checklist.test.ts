import {
  buildVerificationChecklistReport,
  mergeVerificationChecklistUpdate,
  parseVerificationChecklistFromMetadata,
} from "@/lib/local-content/verification-checklist";

describe("verification-checklist", () => {
  it("builds report with default Pending status", () => {
    const report = buildVerificationChecklistReport({});
    expect(report.itemCount).toBe(36);
    expect(report.pendingCount).toBe(36);
    expect(report.bySection.workforce).toBeDefined();
  });

  it("merges saved checklist progress from metadata", () => {
    const metadata = mergeVerificationChecklistUpdate({}, "LAB-01", {
      scale: "Verified",
      workingPaperRef: "WP-01",
    });
    const saved = parseVerificationChecklistFromMetadata(metadata);
    expect(saved["LAB-01"]?.scale).toBe("Verified");
    expect(saved["LAB-01"]?.workingPaperRef).toBe("WP-01");

    const report = buildVerificationChecklistReport(metadata);
    expect(report.completedCount).toBe(1);
    const lab01 = report.items.find((i) => i.id === "LAB-01");
    expect(lab01?.status).toBe("Verified");
    expect(lab01?.workingPaperRefResolved).toBe("WP-01");
  });
});

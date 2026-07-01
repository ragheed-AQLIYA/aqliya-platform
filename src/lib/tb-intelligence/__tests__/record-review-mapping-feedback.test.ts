import { recordReviewMappingFeedback } from "@/lib/tb-intelligence/firm-memory";

jest.mock("@/lib/tb-intelligence/firm-memory-engine", () => ({
  recordAuditFirmMemoryFromConfirmation: jest.fn(),
  lookupAuditFirmMemory: jest.fn(),
  FIRM_MEMORY_AUTO_SUGGEST_MIN_CONFIDENCE: 0.85,
  isFirmMemoryAutoSuggestEligible: jest.fn(),
}));

const { recordAuditFirmMemoryFromConfirmation } = jest.requireMock(
  "@/lib/tb-intelligence/firm-memory-engine",
);

describe("recordReviewMappingFeedback", () => {
  beforeEach(() => {
    recordAuditFirmMemoryFromConfirmation.mockClear();
  });

  it("marks wasAccepted=true when suggestion matches accepted", async () => {
    const result = await recordReviewMappingFeedback({
      organizationId: "org-1",
      engagementId: "eng-1",
      clientAccountCode: "1101",
      clientAccountName: "Cash",
      suggestedCanonicalId: "ca-1",
      acceptedCanonicalId: "ca-1",
      reviewerId: "rev-1",
    });

    expect(result.wasAccepted).toBe(true);
    expect(recordAuditFirmMemoryFromConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        wasAccepted: true,
        suggestedCanonicalId: "ca-1",
        acceptedCanonicalId: "ca-1",
      }),
    );
  });

  it("marks wasAccepted=false when reviewer overrides suggestion", async () => {
    const result = await recordReviewMappingFeedback({
      organizationId: "org-1",
      engagementId: "eng-1",
      clientAccountCode: "1101",
      clientAccountName: "Cash",
      suggestedCanonicalId: "ca-wrong",
      acceptedCanonicalId: "ca-right",
      reviewerId: "rev-1",
    });

    expect(result.wasAccepted).toBe(false);
    expect(recordAuditFirmMemoryFromConfirmation).toHaveBeenCalledWith(
      expect.objectContaining({
        wasAccepted: false,
        suggestedCanonicalId: "ca-wrong",
        acceptedCanonicalId: "ca-right",
      }),
    );
  });

  it("treats first-time mapping (no suggestion) as accepted", async () => {
    const result = await recordReviewMappingFeedback({
      organizationId: "org-1",
      engagementId: "eng-1",
      clientAccountCode: "1101",
      clientAccountName: "Cash",
      suggestedCanonicalId: null,
      acceptedCanonicalId: "ca-right",
      reviewerId: "rev-1",
    });

    expect(result.wasAccepted).toBe(true);
  });
});

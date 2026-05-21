import { describe, expect, it } from "@jest/globals";
import {
  buildAuditFindingPrompt,
  buildCommercialClaimReviewPrompt,
  buildEvidenceReviewPrompt,
  buildMappingRecommendationPrompt,
  buildStatementDraftingPrompt,
} from "../prompt-framework";

function expectPromptAssembly(
  result: ReturnType<typeof buildStatementDraftingPrompt>,
) {
  expect(result.layers.map((layer) => layer.layer)).toEqual([
    "system_doctrine",
    "product_doctrine",
    "governance",
    "evidence",
    "human_approval",
    "task_specific",
  ]);
  expect(result.layers.every((layer) => layer.content.trim().length > 0)).toBe(
    true,
  );
  expect(
    result.warnings.some((warning) =>
      warning.toLowerCase().includes("evidence"),
    ),
  ).toBe(true);
  expect(result.fullPrompt.toLowerCase()).not.toContain("final audit");
  expect(result.fullPrompt.toLowerCase()).not.toContain("guarantee");
}

describe("governance prompt framework", () => {
  it("assembles a governed statement drafting prompt", () => {
    const result = buildStatementDraftingPrompt({
      accountsMapped: false,
      trialBalanceValidated: false,
      evidenceCompleteness: "partial",
      hasPriorPeriodData: true,
      financialPeriod: "FY2025",
      accountingStandard: "IFRS",
    });

    expectPromptAssembly(result);
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Trial balance not yet validated"),
        expect.stringContaining("Accounts not yet fully mapped"),
      ]),
    );
  });

  it("assembles other governed prompt variants", () => {
    const mapping = buildMappingRecommendationPrompt({
      accountCount: 50,
      mappedCount: 45,
      lowConfidenceCount: 3,
      unmappedCount: 5,
    });
    const evidence = buildEvidenceReviewPrompt({
      evidenceItemsTotal: 20,
      evidenceItemsReviewed: 15,
      evidenceItemsVerified: 10,
      materialityThreshold: 50000,
    });
    const finding = buildAuditFindingPrompt({
      findingType: "material_misstatement",
      severity: "high",
      evidenceLinked: false,
      evidenceSufficient: false,
    });
    const commercial = buildCommercialClaimReviewPrompt({
      claimType: "capability",
      targetAudience: "prospect",
      isPilotResult: true,
      hasEvidenceSupport: true,
    });

    expectPromptAssembly(mapping);
    expectPromptAssembly(evidence);
    expectPromptAssembly(finding);
    expectPromptAssembly(commercial);
    expect(commercial.warnings).toEqual(
      expect.arrayContaining([expect.stringContaining("DRAFT-ONLY BOUNDARY")]),
    );
  });
});

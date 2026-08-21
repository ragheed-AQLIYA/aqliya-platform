// ─── LocalContentOS — LCGPA Reviewer Workflow Tests ───

import {
  compileSubmissionPackage,
  verifySubmissionIntegrity,
  generateSubmissionSummary,
} from "../reviewer-workflow";
import { computeLcgpaScore, computeFinancialEvaluation } from "../calculation-engine";
import type { LcPillarInputs, TenderEvaluationInputs } from "../types";

function makeFullInputs(): LcPillarInputs {
  return {
    goodsServices: {
      totalGoodsServicesCost: 1000000,
      suppliers: [
        {
          supplierId: "SUP-001",
          supplierName: "Saudi Supplier A",
          country: "SA",
          spend: 600000,
          localContentPercentage: 80,
        },
        {
          supplierId: "SUP-002",
          supplierName: "Foreign Supplier B",
          country: "AE",
          spend: 400000,
          localContentPercentage: 20,
        },
      ],
    },
    assetDepreciation: {
      totalAssetDepreciation: 200000,
      localAssetDepreciation: 150000,
      foreignAssetDepreciation: 50000,
    },
    laborCompensation: {
      totalLaborCompensation: 300000,
      saudiCompensation: 200000,
      expatCompensation: 100000,
    },
    capacityBuilding: {
      totalCapacityBuilding: 50000,
      saudiTrainingSpend: 30000,
      supplierDevelopmentSpend: 10000,
      rdInKsaSpend: 10000,
    },
  };
}

function makeTenderInputs(): TenderEvaluationInputs {
  return {
    tenderReference: "T-2026-001",
    tenderType: "supply",
    supplierId: "SUP-001",
    supplierName: "Saudi Supplier A",
    saudiOwnershipPct: 60,
    isLocalSme: false,
    isListedCompany: false,
    currentClassification: null,
    bidPrice: 1000000,
    lowestBidPrice: 950000,
    baselineLcPct: 45,
    targetedLcPct: 55,
    nationalProductShare: 0.5,
  };
}

describe("LCGPA Reviewer Workflow (WAVE 9)", () => {
  it("compileSubmissionPackage creates package with all required sections", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    expect(pkg.submissionId).toMatch(/^SUB-/);
    expect(pkg.tenderReference).toBe("T-2026-001");
    expect(pkg.supplierId).toBe("SUP-001");
    expect(pkg.overallLcPct).toBeGreaterThanOrEqual(0);
    expect(pkg.sections.length).toBeGreaterThanOrEqual(5); // At least 5 required sections
    expect(pkg.checklist.length).toBe(12); // 12 mandatory checklist items
    expect(pkg.integrityHash).toHaveLength(16);
    expect(pkg.compiledById).toBe("user-001");
  });

  it("compileSubmissionPackage marks required checklist items present", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    const requiredItems = pkg.checklist.filter(c => c.isRequired);
    const presentItems = requiredItems.filter(c => c.isPresent);
    expect(presentItems.length).toBe(requiredItems.length);
  });

  it("compileSubmissionPackage includes financial evaluation when provided", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const finResult = computeFinancialEvaluation({
      tenderReference: "T-2026-001",
      supplierId: "SUP-001",
      supplierName: "Saudi Supplier A",
      bidPrice: 1000000,
      lowestBidPrice: 950000,
      baselineLcPct: 45,
      targetedLcPct: 55,
      isListedCompany: false,
    });

    const pkg = compileSubmissionPackage(tenderInputs, lcResult, finResult, null, null, "user-001");
    const finSection = pkg.sections.find(s => s.sectionId === "SEC-07");
    expect(finSection).toBeDefined();
    expect(finSection!.isComplete).toBe(true);
  });

  it("compileSubmissionPackage has ready status when all required items present", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");
    expect(pkg.status).toBe("ready");
  });
});

describe("LCGPA Submission Integrity Verification", () => {
  it("verifySubmissionIntegrity confirms valid package", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    const verification = verifySubmissionIntegrity(pkg);
    expect(verification.isValid).toBe(true);
    expect(verification.errors).toHaveLength(0);
  });

  it("verifySubmissionIntegrity detects tampered hash", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    // Tamper with hash
    pkg.integrityHash = "tampered-hash-123";
    const verification = verifySubmissionIntegrity(pkg);
    expect(verification.isValid).toBe(false);
    expect(verification.errors).toContainEqual(expect.stringContaining("Integrity hash mismatch"));
  });

  it("verifySubmissionIntegrity detects incomplete required sections", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    // Mark required section incomplete
    const sec01 = pkg.sections.find(s => s.sectionId === "SEC-01");
    if (sec01) sec01.isComplete = false;
    const verification = verifySubmissionIntegrity(pkg);
    expect(verification.isValid).toBe(false);
    expect(verification.errors).toContainEqual(expect.stringContaining("Incomplete required sections"));
  });

  it("verifySubmissionIntegrity detects missing checklist items", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    // Mark required checklist item missing
    const cl01 = pkg.checklist.find(c => c.id === "CL-01");
    if (cl01) cl01.isPresent = false;
    const verification = verifySubmissionIntegrity(pkg);
    expect(verification.isValid).toBe(false);
    expect(verification.errors).toContainEqual(expect.stringContaining("Missing required checklist items"));
  });
});

describe("LCGPA Submission Summary Generation", () => {
  it("generateSubmissionSummary produces bilingual summary", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    const summary = generateSubmissionSummary(pkg);
    expect(summary.summaryAr).toContain("T-2026-001");
    expect(summary.summaryAr).toContain("Saudi Supplier A");
    expect(summary.summaryEn).toContain("T-2026-001");
    expect(summary.summaryEn).toContain("Saudi Supplier A");
    expect(summary.summaryEn).toContain("Local Content %");
  });

  it("generateSubmissionSummary includes completeness percentage", () => {
    const lcResult = computeLcgpaScore(makeFullInputs());
    const tenderInputs = makeTenderInputs();
    const pkg = compileSubmissionPackage(tenderInputs, lcResult, null, null, null, "user-001");

    const summary = generateSubmissionSummary(pkg);
    expect(summary.summaryEn).toContain("Checklist Completeness");
  });
});

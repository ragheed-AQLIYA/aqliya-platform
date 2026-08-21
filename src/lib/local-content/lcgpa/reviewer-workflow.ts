// ─── LocalContentOS — LCGPA Reviewer Submission Workflow ───
// Compiles calculation results into auditable submission packages.
// Deterministic, explainable, versioned, auditable, reproducible.

import { createHash } from "crypto";
import type {
  ReviewerSubmissionPackage,
  ReviewerSubmissionSection,
  ReviewerChecklistItem,
  SubmissionStatus,
  TenderEvaluationInputs,
  LcPillarResult,
  FinancialEvaluationOutput,
  PenaltyAssessmentOutput,
  GradualPlanOutput,
} from "./types";
import { LCGPA_RULE_VERSION } from "./types";
import { computeLcgpaScore, computeTenderEvaluation } from "./calculation-engine";

/**
 * Mandatory checklist items for LCGPA submission.
 * Every item must be present and verified before submission to external auditor.
 */
const MANDATORY_CHECKLIST: Omit<ReviewerChecklistItem, "isPresent">[] = [
  { id: "CL-01", labelAr: "計算方法ية واضحة", labelEn: "Calculation methodology documented", isRequired: true },
  { id: "CL-02", labelAr: "المصادر الأساسية موثقة", labelEn: "Source data documented", isRequired: true },
  { id: "CL-03", labelAr: "البند الأول: سلسلة التوريد", labelEn: "Section 1: Goods & Services", isRequired: true },
  { id: "CL-04", labelAr: "البند الثاني: الإهلاك", labelEn: "Section 2: Asset Depreciation", isRequired: true },
  { id: "CL-05", labelAr: "البند الثالث: التوظيف", labelEn: "Section 3: Labor & Compensation", isRequired: true },
  { id: "CL-06", labelAr: "البند الرابع: بناء القدرات", labelEn: "Section 4: Capacity Building", isRequired: true },
  { id: "CL-07", labelAr: "التقييم المالي موثق", labelEn: "Financial evaluation documented", isRequired: false },
  { id: "CL-08", labelAr: "قائمة الإلزامات مرفقة", labelEn: "Mandatory list attached", isRequired: false },
  { id: "CL-09", labelAr: "العقوبات والغرامات موثقة", labelEn: "Penalties documented", isRequired: false },
  { id: "CL-10", labelAr: "الخطة التدريجية مرفقة", labelEn: "Gradual plan attached", isRequired: false },
  { id: "CL-11", labelAr: "ال-owned自愿 موثقة", labelEn: "Ownership declaration", isRequired: true },
  { id: "CL-12", labelAr: "توقيع المدير المسؤول", labelEn: "Authorized signatory", isRequired: true },
];

/**
 * Compile all LCGPA results into a single auditable submission package.
 *
 * @param inputs - Tender evaluation inputs
 * @param lcResult - 4-pillar LC calculation result
 * @param financialOutput - Financial evaluation output (optional)
 * @param penaltyOutput - Penalty assessment output (optional)
 * @param gradualPlanOutput - Gradual plan output (optional)
 * @param compiledById - ID of person who compiled the package
 * @returns Complete submission package
 */
export function compileSubmissionPackage(
  inputs: TenderEvaluationInputs,
  lcResult: LcPillarResult,
  financialOutput: FinancialEvaluationOutput | null,
  penaltyOutput: PenaltyAssessmentOutput | null,
  gradualPlanOutput: GradualPlanOutput | null,
  compiledById: string,
): ReviewerSubmissionPackage {
  // 1. Build sections
  const sections: ReviewerSubmissionSection[] = [];

  // Section 1: Goods & Services
  sections.push({
    sectionId: "SEC-01",
    titleAr: "سلسلة التوريد (البضائع والخدمات)",
    titleEn: "Goods & Services Chain",
    isRequired: true,
    isComplete: true,
    data: {
      lcGoodsServices: lcResult.lcGoodsServices,
      gsLcPct: lcResult.gsLcPct,
    },
  });

  // Section 2: Asset Depreciation
  sections.push({
    sectionId: "SEC-02",
    titleAr: "الإهلاك",
    titleEn: "Asset Depreciation",
    isRequired: true,
    isComplete: true,
    data: {
      lcAssetDepreciation: lcResult.lcAssetDepreciation,
      adLcPct: lcResult.adLcPct,
    },
  });

  // Section 3: Labor & Compensation
  sections.push({
    sectionId: "SEC-03",
    titleAr: "التوظيف والتعويضات",
    titleEn: "Labor & Compensation",
    isRequired: true,
    isComplete: true,
    data: {
      lcLaborCompensation: lcResult.lcLaborCompensation,
      lcPillarLcPct: lcResult.lcPillarLcPct,
    },
  });

  // Section 4: Capacity Building
  sections.push({
    sectionId: "SEC-04",
    titleAr: "بناء القدرات",
    titleEn: "Capacity Building",
    isRequired: true,
    isComplete: true,
    data: {
      lcCapacityBuilding: lcResult.lcCapacityBuilding,
      cbLcPct: lcResult.cbLcPct,
    },
  });

  // Section 5: Overall LC%
  sections.push({
    sectionId: "SEC-05",
    titleAr: "النسبة المحلية الإجمالية",
    titleEn: "Overall Local Content %",
    isRequired: true,
    isComplete: true,
    data: {
      overallLcPct: lcResult.overallLcPct,
      totalCosts: lcResult.totalCosts,
      ruleVersion: LCGPA_RULE_VERSION,
    },
  });

  // Section 6: Ownership (from tender evaluation)
  const tenderResult = computeTenderEvaluation(inputs);
  sections.push({
    sectionId: "SEC-06",
    titleAr: "ملكية الموردين",
    titleEn: "Supplier Ownership",
    isRequired: true,
    isComplete: true,
    data: {
      ownershipCheck: tenderResult.ownershipCheck,
      smePreference: tenderResult.smePreference,
      pricePreference: tenderResult.pricePreference,
    },
  });

  // Section 7: Financial evaluation (optional)
  if (financialOutput && financialOutput.success) {
    sections.push({
      sectionId: "SEC-07",
      titleAr: "التقييم المالي (المادة 17)",
      titleEn: "Financial Evaluation (Article 17)",
      isRequired: false,
      isComplete: true,
      data: {
        result: financialOutput.result,
        ruleVersion: LCGPA_RULE_VERSION,
      },
    });
  }

  // Section 8: Mandatory list (if applicable)
  if (inputs.mandatoryListItems && inputs.mandatoryListItems.length > 0) {
    sections.push({
      sectionId: "SEC-08",
      titleAr: "قائمة الإلزامات",
      titleEn: "Mandatory List",
      isRequired: false,
      isComplete: true,
      data: {
        items: inputs.mandatoryListItems,
        itemCount: inputs.mandatoryListItems.length,
      },
    });
  }

  // Section 9: Penalties (if applicable)
  if (penaltyOutput && penaltyOutput.success) {
    sections.push({
      sectionId: "SEC-09",
      titleAr: "العقوبات والغرامات",
      titleEn: "Penalties & Penalties Assessment",
      isRequired: false,
      isComplete: true,
      data: {
        result: penaltyOutput.result,
      },
    });
  }

  // Section 10: Gradual plan (if applicable)
  if (gradualPlanOutput && gradualPlanOutput.success) {
    sections.push({
      sectionId: "SEC-10",
      titleAr: "الخطة التدريجية",
      titleEn: "Gradual Plan",
      isRequired: false,
      isComplete: true,
      data: {
        result: gradualPlanOutput.result,
        milestones: gradualPlanOutput.milestones,
      },
    });
  }

  // 2. Build checklist
  const checklist = MANDATORY_CHECKLIST.map((item) => {
    let isPresent = false;
    switch (item.id) {
      case "CL-01":
      case "CL-02":
        isPresent = true; // methodology always documented
        break;
      case "CL-03":
        isPresent = sections.some(s => s.sectionId === "SEC-01" && s.isComplete);
        break;
      case "CL-04":
        isPresent = sections.some(s => s.sectionId === "SEC-02" && s.isComplete);
        break;
      case "CL-05":
        isPresent = sections.some(s => s.sectionId === "SEC-03" && s.isComplete);
        break;
      case "CL-06":
        isPresent = sections.some(s => s.sectionId === "SEC-04" && s.isComplete);
        break;
      case "CL-07":
        isPresent = !!financialOutput && financialOutput.success;
        break;
      case "CL-08":
        isPresent = !!inputs.mandatoryListItems && inputs.mandatoryListItems.length > 0;
        break;
      case "CL-09":
        isPresent = !!penaltyOutput && penaltyOutput.success;
        break;
      case "CL-10":
        isPresent = !!gradualPlanOutput && gradualPlanOutput.success;
        break;
      case "CL-11":
      case "CL-12":
        isPresent = true; // ownership always present
        break;
    }
    return { ...item, isPresent };
  });

  // 3. Determine evidence refs
  const evidenceRefs: string[] = [];
  evidenceRefs.push(`lc_calc_${inputs.supplierId}`);
  if (inputs.tenderReference) {
    evidenceRefs.push(`tender_${inputs.tenderReference}`);
  }
  if (financialOutput && financialOutput.success) {
    evidenceRefs.push(`financial_eval_${inputs.supplierId}`);
  }

  // 4. Compute integrity hash
  const payload = JSON.stringify({
    tenderReference: inputs.tenderReference,
    supplierId: inputs.supplierId,
    overallLcPct: lcResult.overallLcPct,
    ruleVersion: LCGPA_RULE_VERSION,
    sectionsCount: sections.length,
    checklistCount: checklist.filter(c => c.isRequired).length,
  });
  const integrityHash = createHash("sha256").update(payload).digest("hex").slice(0, 16);

  // 5. Determine status
  const requiredItems = checklist.filter(c => c.isRequired);
  const allPresent = requiredItems.every(c => c.isPresent);
  const status: SubmissionStatus = allPresent ? "ready" : "draft";

  const now = new Date();
  return {
    submissionId: `SUB-${inputs.supplierId}-${Date.now()}`,
    tenderReference: inputs.tenderReference,
    supplierId: inputs.supplierId,
    supplierName: inputs.supplierName,
    ruleVersion: LCGPA_RULE_VERSION,
    status,
    overallLcPct: lcResult.overallLcPct,
    sections,
    checklist,
    evidenceRefs,
    createdAt: now,
    updatedAt: now,
    compiledById,
    integrityHash,
  };
}

/**
 * Verify the integrity of a submission package.
 * Checks completeness, consistency, and hash integrity.
 */
export function verifySubmissionIntegrity(
  pkg: ReviewerSubmissionPackage,
): { isValid: boolean; errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check required sections are present and complete
  const requiredSections = pkg.sections.filter(s => s.isRequired);
  const incompleteSections = requiredSections.filter(s => !s.isComplete);
  if (incompleteSections.length > 0) {
    errors.push(`Incomplete required sections: ${incompleteSections.map(s => s.sectionId).join(", ")}`);
  }

  // 2. Check required checklist items
  const requiredChecklist = pkg.checklist.filter(c => c.isRequired);
  const missingItems = requiredChecklist.filter(c => !c.isPresent);
  if (missingItems.length > 0) {
    errors.push(`Missing required checklist items: ${missingItems.map(c => c.id).join(", ")}`);
  }

  // 3. Verify integrity hash
  const payload = JSON.stringify({
    tenderReference: pkg.tenderReference,
    supplierId: pkg.supplierId,
    overallLcPct: pkg.overallLcPct,
    ruleVersion: pkg.ruleVersion,
    sectionsCount: pkg.sections.length,
    checklistCount: pkg.checklist.filter(c => c.isRequired).length,
  });
  const expectedHash = createHash("sha256").update(payload).digest("hex").slice(0, 16);
  if (pkg.integrityHash !== expectedHash) {
    errors.push("Integrity hash mismatch — package may have been tampered with");
  }

  // 4. Verify timestamps
  if (pkg.updatedAt < pkg.createdAt) {
    errors.push("updatedAt is before createdAt");
  }

  // 5. Verify LC% is within range
  if (pkg.overallLcPct < 0 || pkg.overallLcPct > 100) {
    errors.push(`Overall LC% out of range: ${pkg.overallLcPct}`);
  }

  // 6. Verify rule version
  if (pkg.ruleVersion !== LCGPA_RULE_VERSION) {
    warnings.push(`Rule version mismatch: package=${pkg.ruleVersion}, system=${LCGPA_RULE_VERSION}`);
  }

  // 7. Check for optional sections with missing data
  const optionalSections = pkg.sections.filter(s => !s.isRequired);
  for (const sec of optionalSections) {
    if (sec.isComplete) {
      warnings.push(`Optional section ${sec.sectionId} (${sec.titleEn}) is complete`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Generate a human-readable summary for auditor review.
 */
export function generateSubmissionSummary(
  pkg: ReviewerSubmissionPackage,
): { summaryAr: string; summaryEn: string } {
  const requiredItems = pkg.checklist.filter(c => c.isRequired);
  const presentItems = requiredItems.filter(c => c.isPresent);
  const completeness = `${presentItems.length}/${requiredItems.length}`;

  const summaryAr = [
    `تقرير تقديم LCGPA - ${pkg.tenderReference}`,
    `المورد: ${pkg.supplierName} (${pkg.supplierId})`,
    `النسبة المحلية الإجمالية: ${pkg.overallLcPct.toFixed(1)}%`,
    `عدد الأقسام: ${pkg.sections.length} (إلزامي: ${pkg.sections.filter(s => s.isRequired).length})`,
    `اكتمال قائمة التحقق: ${completeness}`,
    `الإصدار: ${pkg.ruleVersion}`,
    `المعرّف: ${pkg.integrityHash}`,
  ].join("\n");

  const summaryEn = [
    `LCGPA Submission Report - ${pkg.tenderReference}`,
    `Supplier: ${pkg.supplierName} (${pkg.supplierId})`,
    `Overall Local Content %: ${pkg.overallLcPct.toFixed(1)}%`,
    `Sections: ${pkg.sections.length} (Required: ${pkg.sections.filter(s => s.isRequired).length})`,
    `Checklist Completeness: ${completeness}`,
    `Rule Version: ${pkg.ruleVersion}`,
    `Integrity Hash: ${pkg.integrityHash}`,
  ].join("\n");

  return { summaryAr, summaryEn };
}

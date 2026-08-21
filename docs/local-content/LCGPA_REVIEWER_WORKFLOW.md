# LCGPA Reviewer Workflow — Submission Package

**Status:** COMPLETE (WAVE 9)  
**Date:** 2026-08-20  
**Owner:** LocalContentOS  
**Regulation:** Local Content & Government Procurement Authority (LCGPA)

---

## Purpose

Compiles all LCGPA calculation results into a single auditable submission package for external auditor review. Every number traceable to: Rule, Version, Inputs, Calculation, Result, Evidence, Timestamp, Actor.

## Architecture

```
ReviewerWorkflow
├── compileSubmissionPackage()     ← Builds complete submission package
├── verifySubmissionIntegrity()    ← Verifies hash + completeness
└── generateSubmissionSummary()    ← Bilingual executive summary
```

## Submission Package Structure

| Section | Title (AR) | Title (EN) | Required | Description |
|---------|-----------|------------|----------|-------------|
| SEC-01 | سلسلة التوريد | Goods & Services Chain | Yes | G&S pillar calculations |
| SEC-02 | الإهلاك | Asset Depreciation | Yes | AD pillar calculations |
| SEC-03 | التوظيف والتعويضات | Labor & Compensation | Yes | LC pillar calculations |
| SEC-04 | بناء القدرات | Capacity Building | Yes | CB pillar calculations |
| SEC-05 | النسبة المحلية الإجمالية | Overall LC% | Yes | Final LC% calculation |
| SEC-06 | ملكية الموردين | Supplier Ownership | Yes | Ownership + SME + Price prefs |
| SEC-07 | التقييم المالي | Financial Evaluation | No | Article 17 (if provided) |
| SEC-08 | قائمة الإلزامات | Mandatory List | No | Mandatory products (if provided) |
| SEC-09 | العقوبات والغرامات | Penalties | No | Penalty assessment (if provided) |
| SEC-10 | الخطة التدريجية | Gradual Plan | No | Gradual plan (if provided) |

## Checklist (12 Items)

| ID | Label (AR) | Label (EN) | Required | Auto-Present |
|----|-----------|------------|----------|--------------|
| CL-01 |计算方法ية واضحة | Methodology documented | Yes | Always |
| CL-02 | المصادر الأساسية موثقة | Source data documented | Yes | Always |
| CL-03 | البند الأول: سلسلة التوريد | Goods & Services | Yes | When SEC-01 complete |
| CL-04 | البند الثاني: الإهلاك | Asset Depreciation | Yes | When SEC-02 complete |
| CL-05 | البند الثالث: التوظيف | Labor & Compensation | Yes | When SEC-03 complete |
| CL-06 | البند الرابع: بناء القدرات | Capacity Building | Yes | When SEC-04 complete |
| CL-07 | التقييم المالي موثق | Financial evaluation | No | When financial eval provided |
| CL-08 | قائمة الإلزامات مرفقة | Mandatory list attached | No | When items provided |
| CL-09 | العقوبات والغرامات موثقة | Penalties documented | No | When penalty assessment provided |
| CL-10 | الخطة التدريجية مرفقة | Gradual plan attached | No | When gradual plan provided |
| CL-11 |Ownership declaration | Ownership declaration | Yes | Always |
| CL-12 | توقيع المدير المسؤول | Authorized signatory | Yes | Always |

## Usage

### Compile Package

```typescript
import { compileSubmissionPackage } from "@/lib/local-content/lcgpa";

const pkg = compileSubmissionPackage(
  tenderInputs,    // TenderEvaluationInputs
  lcResult,        // LcPillarResult (4-pillar calculation)
  financialOutput, // FinancialEvaluationOutput | null
  penaltyOutput,   // PenaltyAssessmentOutput | null
  gradualPlanOutput, // GradualPlanOutput | null
  "user-001",      // compiledById
);

// pkg.status === "ready" if all required items present
```

### Verify Integrity

```typescript
import { verifySubmissionIntegrity } from "@/lib/local-content/lcgpa";

const verification = verifySubmissionIntegrity(pkg);
// verification.isValid === true if all checks pass
// verification.errors — list of issues
// verification.warnings — non-blocking notes
```

### Generate Summary

```typescript
import { generateSubmissionSummary } from "@/lib/local-content/lcgpa";

const summary = generateSubmissionSummary(pkg);
// summary.summaryAr — Arabic executive summary
// summary.summaryEn — English executive summary
```

## Integrity Hash

The package includes a SHA-256 integrity hash (first 16 hex chars) computed from:
- tenderReference
- supplierId
- overallLcPct
- ruleVersion
- sectionsCount
- requiredChecklistCount

Any tampering with package contents will cause hash mismatch on verification.

## Status Transitions

```
draft → ready → submitted → reviewed → approved
```

- **draft**: Not all required items present
- **ready**: All required items present
- **submitted**: Package sent to external auditor
- **reviewed**: Auditor has reviewed
- **approved**: Auditor approved the submission

## Tests

- 10 tests covering compilation, integrity, and summary
- File: `src/lib/local-content/lcgpa/__tests__/reviewer-workflow.test.ts`

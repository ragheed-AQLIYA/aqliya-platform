# DATA MODEL AUDIT — AQLIYA
**Date:** 2026-06-20  
**Scope:** Prisma schema (220 models), migrations (42), seed data

---

## 1. Schema Overview

| Metric | Value |
|--------|-------|
| Total models | 220 |
| Enums | 24 |
| Relations | ~300+ |
| Indexes | ~250+ |
| Unique constraints | ~100+ |
| Migrations | 42 |
| Seed files | 6 |
| Schema lines | 5,158 |

## 2. Tenant Isolation Coverage

| Isolation Level | Models | Pattern |
|----------------|--------|---------|
| `organizationId` | ~110 | Legacy org scoping |
| `platformOrganizationId` | ~30 | New platform bridge |
| `workspaceId`/`clientWorkspaceId` | ~7 | Workspace-scoped |
| No tenant field | ~30 | System/base models (User, Role, PlatformOrganization) |

**Verdict:** Tenant isolation is consistently applied. All business-domain models carry at least one tenant identifier. No critical models lack tenant isolation.

## 3. Product-to-Model Mapping

| Product | Core Models | Status |
|---------|-------------|--------|
| **AuditOS** | 30+ (AuditOrganization, AuditClient, AuditEngagement, AuditTrialBalance, AuditAccountMapping, AuditFinancialStatement, AuditDisclosureNote, AuditEvidence, AuditFinding, AuditRecommendation, AuditReviewComment, AuditApprovalRecord, AuditPublicationPackage, AuditEvent, AuditAiOutput, AuditValidationRun, ReportingGraph, LeadSchedule, WorkingPaperIndex, SamplingPlan, MaterialityBenchmark, PlanningMateriality, PerformanceMateriality, ReviewNote, etc.) | ✅ L5 Pilot-ready |
| **DecisionOS** | 20+ (Decision, DecisionFramework, DecisionScenario, DecisionRiskAnalysis, Recommendation, Approval, DecisionOutcome, DecisionEvidence, DecisionReport, DecisionMonitoringSignal, DecisionRiskAlert, Sector, SectorBenchmark, SectorPattern, SectorPlaybook, SectorRule, etc.) | ✅ L4 |
| **LocalContentOS** | 25+ (LocalContentProject, LocalContentSupplier, LocalContentSpendRecord, LocalContentClassification, LocalContentEvidence, LocalContentFinding, LocalContentReview, LocalContentApproval, LocalContentReport, LocalContentAuditEvent, LcWorkbook, LcWorkbookLine, LcDataRequest, LcPatternSuggestion, LcMatchReview, LcIndustryPatternMemory, LcOrganizationMatchMemory, LcAiAuditEvent, LcRecommendation, LcSimulationResult, LcAiReviewRun, LcPatternHealthRecord, LcRecommendationOutcome) | ✅ L5 Pilot-ready |
| **SalesOS** | 10+ (SalesPipeline, SalesPipelineStage, SalesAccount, SalesDeal, SalesEvidenceLink, SalesInteraction, SalesContact, SalesProposal, SalesReview, SalesApproval, SalesAuditEvent) | ⚠️ L4 |
| **WorkflowOS** | 3+ (WorkflowTemplate, WorkflowRecord, WorkflowAuditEvent, WorkflowEvidence) | ⚠️ L3-L4 |
| **LocalContactOS** | 6+ (LocalContact, LocalContactRelation, LocalContactInteraction, ContactEvidence, ContactReview, ContactApproval, ContactExportRequest) | ✅ L4 |
| **Office AI** | 4 (OfficeAiTask, OfficeAiOutput, OfficeAiFile) | ✅ L4 |
| **Sunbul** | 6 (SunbulClient, SunbulUserMembership, SunbulRecord, SunbulDocument, SunbulReview, SunbulAuditEvent) | ✅ L4 |
| **ContentStudio** | 7 (ContentStudioProject, ContentStudioCampaign, ContentStudioSource, ContentStudioItem, ContentStudioReview, ContentStudioApproval, ContentStudioOutput) | ⚠️ L3 |
| **Platform/Core** | 20+ (PlatformOrganization, PlatformSecret, PlatformNotification, PlatformAuditLog, User, Organization, Invitation, Permission, Role, RolePermission, UserRoleAssignment, etc.) | ✅ L5 |
| **Security/Auth** | 10+ (SsoProvider, ScimProvisioningEvent, Session, Account, VerificationToken, VaultEntry, EncryptionKey, DownloadTicket, AbacPolicy, etc.) | ✅ L5 |
| **Quality/Independence** | 15+ (QualitySystemEvaluation, QualityObjective, QualityRisk, QualityResponse, QualityFinding, QualityRemediation, QualityMonitoringActivity, IndependenceRegister, IndependenceThreat, IndependenceSafeguard, etc.) | ⚠️ L3 |
| **Institutional Memory** | 5+ (InstitutionalMemoryEvent, InstitutionalMemoryCollection, IntelligenceGraphNode, IntelligenceGraphEdge, IntelligenceQuery) | ⚠️ L3 |

## 4. Governance Fields Coverage

| Field | Models With | Coverage |
|-------|-----------|----------|
| `id` | All 220 | 100% |
| `createdAt` | ~200 | ~91% |
| `updatedAt` | ~180 | ~82% |
| `createdById` | ~100 | ~45% — not all business models |
| `organizationId` | ~110 | ~50% |
| `status` | ~80 | ~36% |
| `metadata` (JSON) | ~90 | ~41% |
| `platformOrganizationId` | ~30 | ~14% |

**Gap:** `createdById` is present on ~45% of models but missing from some business models that should track ownership.

## 5. Audit Event Model Coverage

| Product | Has Audit Event Model | Quality |
|---------|----------------------|---------|
| DecisionOS | `AuditLog` | ✅ Full |
| AuditOS | `AuditEvent` | ✅ Full |
| LocalContentOS | `LocalContentAuditEvent` | ✅ Full |
| SalesOS | `SalesAuditEvent` | ✅ Full |
| WorkflowOS | `WorkflowAuditEvent` | ✅ Full |
| Sunbul | `SunbulAuditEvent` | ✅ Full |
| Office AI | Uses PlatformAuditLog | ✅ |
| Platform | `PlatformAuditLog` | ✅ Full |
| Contacts | Uses PlatformAuditLog | ✅ |
| ContentStudio | Uses PlatformAuditLog | ⚠️ Partial |

## 6. Migration Health

| Metric | Value | Assessment |
|--------|-------|------------|
| Total migrations | 42 | Healthy |
| Migration span | 2026-05-06 → 2026-06-18 | 6 weeks active development |
| Destructive migrations | None | ✅ All additive |
| Failed migrations | None | ✅ Clean history |
| Pending migrations | 0 | ✅ Up to date |
| Migration naming | Inconsistent | ⚠️ Mixed conventions |

## 7. Seed Data Health

| Seed File | Records | Quality |
|-----------|---------|---------|
| `seed.ts` | 3 users, 4 decisions, full DecisionOS | ✅ Good |
| `seed-audit.ts` | Full AuditOS engagement with TB, FS, findings | ✅ Excellent |
| `seed-local-content.ts` | Projects, workbooks, patterns | ✅ Excellent |
| `seed-office-ai.ts` | Tasks with outputs | ✅ Good |
| `seed-sales.ts` | Pipeline, deals, contacts | ✅ Good |
| `seed-organizations.ts` | Additional orgs | ✅ Minimal |

## 8. Schema Design Issues

| Issue | Models Affected | Severity |
|-------|----------------|----------|
| Legacy `AuditLog` vs `PlatformAuditLog` | Two event tables | MEDIUM — migration target |
| `organizationId` vs `platformOrganizationId` | Dual model causes confusion | MEDIUM — bridge pattern |
| Missing `createdById` | ~55% of models | LOW — additive fix |
| Some models lack `updatedAt` | ~18% | LOW |
| `metadata` JSON fields unvalidated | ~90 models | LOW — feature flexibility |

## 9. Recommendations

1. **Add `createdById` to remaining business models** — provides full audit ownership
2. **Consolidate audit event models** — migrate product-specific events to use `PlatformAuditLog` where feasible or ensure consistent `createdById`
3. **Add schema validation for key JSON fields** — reduce runtime errors
4. **Standardize migration naming** — establish convention (e.g., `YYYYMMDD_description` prefix)
5. **Add `platformOrganizationId` to remaining legacy models** — complete bridge migration
6. **Review governance fields** — ensure all business models have `status`, `createdAt`, `updatedAt`

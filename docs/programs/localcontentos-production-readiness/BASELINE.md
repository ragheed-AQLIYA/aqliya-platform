---
title: "LocalContentOS Production Readiness — Baseline"
status: active
program: "LocalContentOS Production Readiness"
phase: 0
version: "1.0"
date: 2026-06-27
author: OpenCode
classification: baseline-report
supersedes: none
---

# LocalContentOS Production Readiness — Baseline

**Program:** LocalContentOS Production Readiness  
**Phase:** 0 — Production Readiness Baseline  
**Date:** 2026-06-27  
**Method:** Measurement only — zero changes applied  

> All data collected from the committed repository state at HEAD (post-Repository Quality closure). No fixes or modifications applied during baseline collection.

---

## 1. Product Dimensions

| Metric | Value |
|--------|:-----:|
| Completion level (current) | L5 Pilot-ready — 100% (7/7 GREEN) |
| Completion level (target) | L6 Production-hardened |
| Product Status Matrix classification | Strategic second product under AQLIYA |
| Working routes (page) | **20** under `/local-content/*` |
| Working routes (API) | **2** (evidence download, report download) |
| Prisma models (core LCOS) | **14** (LocalContentProject, LocalContentSupplier, LocalContentSpendRecord, LocalContentClassification, LocalContentEvidence, LocalContentFinding, LocalContentReview, LocalContentApproval, LocalContentReport, LocalContentAuditEvent, LcWorkbook, LcWorkbookLine, LcDataRequest, LcDataRequestItem) |
| Prisma models (AI Advisor) | **9** (LcPatternSuggestion, LcMatchReview, LcIndustryPatternMemory, LcOrganizationMatchMemory, LcAiAuditEvent, LcRecommendation, LcSimulationResult, LcAiReviewRun, LcPatternHealthRecord, LcRecommendationOutcome) |
| Prisma models (Content Studio) | **7** (ContentStudioProject, ContentStudioCampaign, ContentStudioSource, ContentStudioItem, ContentStudioReview, ContentStudioApproval, ContentStudioOutput) |
| Server action files | **9** |
| UI components | **24** in `src/components/local-content/` |
| Library modules | **90** files in `src/lib/local-content/` (including ai/, content/, erp/ subdirectories) |
| Test files | **23** in `src/lib/local-content/` `__tests__/` directories |
| Test describe blocks | **83** |
| Test `it` blocks | **271** |
| Content Studio test files | **2** inside `content/__tests__/` |

---

## 2. Repository-Wide Quality (from Repository Quality Closure)

| Check | Result | Evidence |
|-------|:------:|----------|
| `npx tsc --noEmit` | ✅ 0 errors | Repository Quality closure, 2026-06-27 |
| `npm run build` | ✅ PASS — 142 pages | Repository Quality closure, 2026-06-27 |
| `npx eslint src/` | ✅ 0 errors, 418 warnings | All 418 documented in SECURITY_RULE_DECISION_LOG.md |
| `npm test` | ✅ 3,119 passed, 21 skipped, 1 pre-existing fail | Migration-evidence staleness (pre-existing) |

All ESLint warnings are security rules (`detect-object-injection`, `detect-non-literal-fs-filename`, `detect-possible-timing-attacks`, `detect-non-literal-regexp`) with 100% documented disposition in `docs/SECURITY_RULE_DECISION_LOG.md`. None are LocalContentOS-specific bugs.

---

## 3. Route Baseline

### 3.1 Page Routes (Governed Workspace — Protected)

| Route | Status | Type | Notes |
|-------|:------:|------|-------|
| `/local-content` | L4 | Dashboard | Project metrics from server actions |
| `/local-content/analytics` | L4 | Analytics | LC-06 org spend analytics |
| `/local-content/classification-rules` | L4 | Admin | LC-04 rule admin (read) |
| `/local-content/projects` | L4 | List/Create | Project list + create form |
| `/local-content/projects/[projectId]` | L4 | Detail | Project detail + sub-page navigation |
| `/local-content/projects/[projectId]/suppliers` | L4 | CRUD | Supplier/vendor records |
| `/local-content/projects/[projectId]/spend` | L4 | CRUD | Spend/procurement records |
| `/local-content/projects/[projectId]/classification` | L4 | Workflow | Classification workflow |
| `/local-content/projects/[projectId]/evidence` | L4 | CRUD + Upload | Evidence upload + protected download |
| `/local-content/projects/[projectId]/findings` | L4 | CRUD | Gap/risk findings |
| `/local-content/projects/[projectId]/review` | L4 | Workflow | Review workflow |
| `/local-content/projects/[projectId]/approval` | L4 | Workflow | Approval workflow |
| `/local-content/projects/[projectId]/reports` | L4 | Export | Report generation |
| `/local-content/projects/[projectId]/audit-trail` | L4 | Audit | Audit log viewer |
| `/local-content/projects/[projectId]/tender-match` | L4 | Feature | LC-02 tender matching |
| `/local-content/workbook` | L4 | Dashboard | Workbook list + score summary |
| `/local-content/workbook/[workbookId]` | L4 | Detail | 3 tabs (lines/missing/requests) + scoring UI |
| `/local-content/pilot-readiness` | L5 | Dashboard | 11-dimension operational readiness |
| `/local-content/review-center` | L5 | Review | AI review center + batch approve/reject |
| `/local-content/quality-dashboard` | L5 | Dashboard | AI Quality Score, confidence, time-series |
| `/local-content/settings/integrations` | L4 | Settings | ERP integration config |
| `/local-content/ai-advisor` | L4 | AI | AI Advisor overview page |
| `/local-content/outputs` | L4 | View | Content Studio outputs |

### 3.2 API Routes

| Route | Method | Auth | Audit | Status |
|-------|:------:|:----:|:-----:|:------:|
| `/api/local-content/projects/[projectId]/evidence/[evidenceId]/download` | GET | ✅ | ✅ | Active |
| `/api/local-content/projects/[projectId]/reports/[reportId]/download` | GET | ✅ | ✅ | Active |

---

## 4. Schema Baseline

### 4.1 Core LocalContentOS Models (14)

| Model | Key Fields | Relations |
|-------|------------|-----------|
| `LocalContentProject` | organizationId, name, reportingPeriod, status (11 states), localContentScore, createdById | → suppliers, spendRecords, classifications, evidence, findings, reviews, approvals, reports, auditEvents, workbooks |
| `LocalContentSupplier` | projectId, name, crNumber, localityClassification, localContentPercentage, ownershipType, workforceLocalPct, status | → spendRecords, classifications, evidenceItems |
| `LocalContentSpendRecord` | projectId, supplierId, amount, currency, category, period | → classifications, localContentEvidences |
| `LocalContentClassification` | projectId, supplierId?, spendRecordId?, localPercentage, classificationBasis, confidence (4 levels), reviewStatus | → — |
| `LocalContentEvidence` | projectId, supplierId?, spendRecordId?, findingId?, filename, fileType, mimeType, storageKey, fileHash, sizeBytes, evidenceType, status (6 states) | → — |
| `LocalContentFinding` | projectId, type (5), severity (4), title, description, status (5) | → evidenceItems |
| `LocalContentReview` | projectId, reviewerId, reviewerName, action (4), status (4) | → — |
| `LocalContentApproval` | projectId, approverId, approverName, decision (2), approvalSnapshot | → — |
| `LocalContentReport` | projectId, reportType (6), format (2), status (3), storageKey, disclaimer | → — |
| `LocalContentAuditEvent` | projectId, actorId, action, entityType, entityId, before?, after? | → — |

### 4.2 Workbook Engine Models (5)

| Model | Key Fields | Notes |
|-------|------------|-------|
| `LcWorkbook` | projectId, title, reportingPeriod, status (5), totalLines, autoFilledLines, missingLines, completionPct, lcScore, lcScoreComputedAt | Score persistence |
| `LcWorkbookLine` | workbookId, section (6), code, name, autoFillable, autoFilled, autoFillValue, autoFillSource, manualValue, source (3), confidence (3), evidenceRequired | Formula engine: GP-01, WRK-03, SPN-03 |
| `LcDataRequest` | workbookId, title, status (5) | Missing data collection |
| `LcDataRequestItem` | requestId, lineId?, fieldName, category (4), evidenceRequired, status (3), responseValue, responseFile | Granular data requests |

### 4.3 AI Advisor Models (10)

| Model | Key Fields | Notes |
|-------|------------|-------|
| `LcPatternSuggestion` | organizationId, workbookLineCode, currentPattern, suggestedPattern, confidence, status (3), acceptanceScore, successScore, falsePositiveRate, decayScore, healthScore | Learning loop |
| `LcMatchReview` | organizationId, workbookLineId?, accountCode, matchType (4), confidence, riskLevel (3), isFalsePositive, status (3) | False positive review |
| `LcIndustryPatternMemory` | industry (5), workbookLineCode, pattern, totalMatches, correctMatches, falsePositives, effectivenessPct | Industry memory |
| `LcOrganizationMatchHistory` | organizationId, workbookLineCode, accountCode, previousResult (3), manualOverride | Org memory |
| `LcAiAuditEvent` | organizationId, projectId?, action, providerId?, modelVersion?, promptVersion?, confidence, status (3), inputSummary, outputSummary, warningCount, durationMs | Full AI auditability |
| `LcRecommendation` | organizationId, workbookId, category (6), title, impactScore, priority (4), evidenceRefs, status (4), source (6), rationale, groundingConfidence | Recommendation engine |
| `LcSimulationResult` | organizationId, workbookId, scenarioType (4), scenarioLabel, parameters (Json), currentScore, projectedScore, delta, confidence, drivers (Json) | What-if simulations |
| `LcAiReviewRun` | organizationId, workbookId, status (3), explanationsGenerated, patternSuggestions, falsePositives, recommendationsGenerated | Review run tracking |
| `LcPatternHealthRecord` | organizationId, workbookLineCode, pattern, healthScore (0-100), acceptanceRate, successRate, falsePositiveRate, decayScore, status (5) | Health monitoring |
| `LcRecommendationOutcome` | organizationId, recommendationId, workbookId, scoreBefore, scoreAfter, realizedDelta, expectedDelta, accuracyScore | Feedback loop |

### 4.4 Content Studio Models (7)

| Model | Key Fields | Notes |
|-------|------------|-------|
| `ContentStudioProject` | organizationId, title, objective, audience, language, status | Content project |
| `ContentStudioCampaign` | contentProjectId, name, objective, channels, status | Multi-channel campaigns |
| `ContentStudioSource` | campaignId?, contentItemId?, title, type, url, credibility, status | Source management |
| `ContentStudioItem` | campaignId, title, format, body, aiGenerated, reviewRequired, status | Content items |
| `ContentStudioReview` | contentItemId, status, dimensions (Json) | Content review |
| `ContentStudioApproval` | contentItemId, approved, notes | Content approval |
| `ContentStudioOutput` | campaignId, title, status, includes, exportMetadata | Content output |

---

## 5. Server Action Baseline

| File | Exported Functions | Purpose |
|------|:------------------:|---------|
| `local-content-workspace-actions.ts` | ~8 | Project CRUD, supplier management, workspace navigation |
| `localcontent-actions.ts` | ~12 | Core LCOS mutations (spend, evidence, findings, reports) |
| `localcontent-ai-advisor-actions.ts` | ~6 | AI advisor pipeline, pattern suggestions |
| `localcontent-ai-advisor-v3-actions.ts` | ~8 | V3 AI actions (review runs, recommendations) |
| `localcontent-pilot-readiness-actions.ts` | ~4 | Pilot readiness dashboard data |
| `localcontent-quality-actions.ts` | ~4 | AI quality metrics aggregation |
| `localcontent-review-actions.ts` | ~6 | Review center batch approve/reject |
| `localcontent-review-export.ts` | ~2 | Bilingual PDF export for review center |
| `localcontent-workbook-actions.ts` | ~10 | Workbook population, scoring, recalculation |

---

## 6. Library Module Baseline

| Subdirectory | File Count | Key Modules |
|:------------:|:----------:|-------------|
| `root` | 18 | guards, import, export, scoring, workflow-gating, evidence, services, types, approval-routing, audit-events, classification-rules, pilot-readiness, pipeline-orchestrator, registry, tender-matching, verification-checklist, localization-rate-trends, spend-analytics |
| `ai/` | 18 | ai-advisor, ai-auto-review, ai-health, context-builder, csv-parser, learning-loop, missing-data, population, rag-integration, recommendation-engine, recommendation-feedback, scoring, simulation-engine, tb-loader, template, types (+ tests) |
| `content/` | 8 | content-studio-prisma-repository, content-studio service (+ tests) |
| `erp/` | 9 | connector-factory, connector interface, dynamics-connector, field-mapping, file-importer, import-pipeline, odoo-connector, oracle-connector, sap-connector (+ tests) |

---

## 7. Scoring Engine Baseline

| Metric | Formula | Weight |
|--------|---------|:------:|
| Revenue Local Content | REV-03 / REV-01 × 100 | 35% |
| Supplier Spend Local Content | SPN-03 / SPN-01 × 100 | 35% |
| Workforce Localization | WRK-03 (WRK-01 / WRK-02 × 100) | 20% |
| Asset Localization | AST-03 / AST-01 × 100 | 10% |
| **Composite Score** | Weighted average of all 4 metrics | 100% |

Formula engine also computes: GP-01 (REV-03 - COS-03), WRK-03 (WRK-01 / WRK-02 × 100), SPN-03 (SPN-01 + SPN-02).

---

## 8. Key Dependencies

| Dependency | Type | Status |
|------------|------|--------|
| PostgreSQL 16 | Database | Required |
| Next.js 16 + App Router | Framework | Active |
| Prisma 7 | ORM | Active |
| NextAuth v5 | Auth | Active |
| Shared RBAC middleware | Auth | Active (middleware.ts route matcher) |
| AI provider abstraction | AI | Active (AIOrchestrator) |
| Platform audit logger | Audit | Active (writePlatformAuditLog) |
| File storage (local/S3) | Storage | Active (STORAGE_PROVIDER config) |
| ERP import pipeline | Integration | Active (SAP/Oracle/CSV connectors) |

---

## 9. Unmeasured (Deferred to Matrix/Gap Register)

| Metric | Reason | Documented In |
|--------|--------|---------------|
| Test coverage percentage | Requires `--coverage` flag (slow) | GAP_REGISTER |
| Performance benchmarks | No established baseline | GAP_REGISTER |
| Production deployment runbook | Not yet documented | GAP_REGISTER |
| Disaster recovery procedure | Not documented | GAP_REGISTER |
| Backup/restore verification | Not tested for LCOS data | GAP_REGISTER |
| Alerting rules | None configured | GAP_REGISTER |
| Monitoring dashboard | None exists | GAP_REGISTER |
| Seed data for fresh deploy | Not tested end-to-end | GAP_REGISTER |
| CI/CD pipeline for LCOS | Not verified | GAP_REGISTER |
| Load test results | None performed | GAP_REGISTER |

---

## 10. Cross-Reference: Repository Quality Closure

| Quality Metric | Repository Quality Value | Current Value | Delta |
|----------------|:------------------------:|:-------------:|:-----:|
| TS errors | 0 | 0 | — |
| Build | PASS (142 pages) | PASS | — |
| Lint errors | 0 | 0 | — |
| Lint warnings | 418 (all classified) | 418 | — |
| Test pass | 3,119 | 3,119 | — |
| Test fail (pre-existing) | 1 (migration-evidence) | 1 | — |

This program operates from a clean quality baseline. No pre-existing build, lint, or type errors need resolution.

---

*Baseline v1.0. Phase 0 measurement complete — no changes applied. Ready for PRODUCTION_READINESS_MATRIX creation.*

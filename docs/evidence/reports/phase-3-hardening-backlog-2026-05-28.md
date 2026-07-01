# Priority Definitions

﻿# Phase 3 — Hardening Backlog 2026-05-28

**Status:** Controlled hardening backlog for first pilot execution
**Source:** `docs/reports/auditos-controlled-pilot-status-lock-2026-05-28.md`, `docs/reports/eid-build-sprint-2026-05-28.md`, product documentation review
**Authority:** `docs/official/aqliya-implementation-rules-v1.1.md`
**Last updated:** 2026-05-28 (Phase 3.5 closure — items #12, #17 downgraded)

---

## Priority Definitions

| Priority | Label | Meaning |
|----------|-------|---------|
| P0 | Pilot blocker | Must fix before first pilot customer goes active |
| P1 | Pilot friction | Significant negative impact on pilot experience; fix before second pilot |
| P2 | Quality improvement | Noticeable quality gap; address between pilots |
| P3 | Future product maturity | Important for L5/L6 but not blocking pilot execution |

---

## 1. Auth and Security

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 1 | In-memory rate limiting | AuditOS | P1 | Rate limiter state is lost on server restart. Not suitable for multi-instance. | `src/lib/audit/rate-limit.ts` — in-memory only |
| 2 | No SSO/OAuth | Platform | P2 | Credentials-only auth works for pilot but limits enterprise adoption. | Not implemented |
| 3 | No production malware scanning | Platform | P2 | Uploads blocked without SCANNER_PROVIDER. Fail-closed is correct for pilot. | Fail-closed, dev mock only |
| 4 | Protected-read mock fallback env switch exists | AuditOS | P2 | AUDIT_ALLOW_MOCK_FALLBACK=true can re-enable fallback. Architectural decision pending. | `src/lib/audit/services.ts` |
| 5 | Sensitive route hardening outside AuditOS | Platform | P1 | Wider repository has unhardened download routes. See security-public-api-hardening-2026-05-28.md | Multiple API routes |

---

## 2. Evidence Storage

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 6 | Local evidence storage default | Platform | P2 | Defaults to local filesystem unless STORAGE_PROVIDER is set to s3 or azure-blob. Acceptable for pilot. | `src/lib/audit/storage/index.ts` |
| 7 | Evidence files stored as metadata only | AuditOS | P2 | No binary file storage. File metadata tracked; actual files managed externally. Acceptable for pilot. | Schema references only |
| 8 | DecisionEvidence review/approval gates missing | DecisionOS | P2 | DecisionOS evidence can be uploaded but not reviewed or approved within DecisionOS workflow. | L3 gap |
| 9 | No checksum/immutability verification on evidence files | Platform | P3 | No file integrity verification. Important for L5/L6 but acceptable for pilot. | Not implemented |

---

## 3. Export Quality

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 10 | JSON-only exports (no PDF/DOCX) | AuditOS | P1 | JSON export works with status labels. PDF/DOCX is expected by customers. Customers may ask for PDF. | JSON only |
| 11 | No bilingual PDF rendering | Platform | P2 | Arabic PDF font rendering is a known quality gap. LocalContentOS has binary exports but Arabic font rendering needs improvement. | P2 from LocalContentOS v0.1 |
| 12 | Export approval bypass possible for some routes | Platform | P2 | Investigated — no bypass exists. Draft exports with visible labels are intentional design. Every route has auth+role+tenant+audit. See phase-3.5-closure-report-2026-05-28.md | Investigated — acceptable for pilot |

---

## 4. Review/Approval Gates

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 13 | DecisionOS lacks full review/approval workflow | DecisionOS | P2 | DecisionEvidence added but review and approval workflow not complete. Acceptable for pilot if DecisionOS is not primary focus. | L4 gap |
| 14 | No configurable approval thresholds | Platform | P3 | All approval gates are hard-coded. Would benefit from configurable rules per organization. | Not implemented |

---

## 5. Audit Logs

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 15 | Some mutations logged through product-specific audit only | Platform | P2 | LocalContentOS has dual audit (platform AuditEvent + product audit). Need consistency audit across all products. | Mixed pattern |
| 16 | No audit log retention policy implemented | Platform | P3 | Audit events accumulate without archiving or cleanup. Not blocking for pilot. | No retention |

---

## 6. Error Handling

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 17 | Error boundaries not consistently tested across all product routes | Platform | P2 | Investigated — `/audit` level had error.tsx already. Only gap was missing loading.tsx (now added). Sub-routes under [engagementId] have full coverage. See phase-3.5-closure-report-2026-05-28.md | Resolved — cosmetic loading.tsx added |
| 18 | Not-found states missing for some nested routes | Platform | P2 | While top-level routes have not-found, some nested dynamic routes may 404 without proper not-found UI. | Needs audit |

---

## 7. Loading States

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 19 | Loading states added for LocalContentOS top-level routes | LocalContentOS | P2 | Top-level loading.tsx exists. Some nested data-fetching paths may lack loading states. | Partial coverage |
| 20 | AuditOS loading states need verification | AuditOS | P1 | Verify loading states across all engagement sub-routes. Some pages may flash empty before data loads. | Needs audit |

---

## 8. Tenant Isolation

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 21 | Multi-tenant concurrent usage not tested | Platform | P2 | Only single-organization scenario verified. Pilot is single-tenant by design. | Acceptable |
| 22 | PlatformOrganizationId exists only on session interface | Platform | P2 | Not a Prisma User field. Intentional design but limits some query patterns. | Current design |

---

## 9. Observability

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 23 | No structured application logging (beyond audit events) | Platform | P2 | Audit events cover mutations. No request-level logging or metrics. Acceptable for pilot. | Audit events only |
| 24 | No health check endpoint for all products | Platform | P3 | AuditOS has audit:health script. Other products lack health check. | Partial |

---

## 10. Deployment Readiness

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 25 | No containerized CI for Jest tests | Platform | P2 | Jest tests require PostgreSQL. Currently not containerized in CI. | Manual run only |
| 26 | Backup not automated or scheduled | Platform | P2 | Manual backup only. Acceptable for pilot but should be automated before scaling. | Manual |
| 27 | No staging environment documented | Platform | P2 | Staging readiness plan exists but environment may not be configured. | Plan exists |

---

## 11. AI Service

| # | Item | Product | Priority | Detail | Current State |
|---|------|---------|----------|--------|---------------|
| 28 | AI path partially mock-backed | AuditOS | P1 | AI suggestions use pre-defined data in some paths. Real LLM call not implemented for all features. | `src/lib/audit/ai-service.ts` |
| 29 | No AI provider abstraction for non-Anthropic providers | Platform | P3 | Currently assumes specific provider pattern. Important for On-Prem/local AI future but not for pilot. | Not implemented |

---

## Summary: What to Fix Before First Pilot

### P0 — Must fix before first pilot

| # | Item | Why |
|---|------|-----|
| 12 | Export approval bypass possibility | Regulatory and governance risk for any customer-facing output |
| 17 | Error boundaries inconsistent | Pilot users will encounter errors; need consistent handling |

### P1 — Fix before second pilot

| # | Item | Why |
|---|------|-----|
| 1 | Rate limiting in-memory only | Scale concern for multiple concurrent users |
| 5 | Sensitive route hardening outside AuditOS | Surface area beyond AuditOS needs protection |
| 10 | JSON-only exports | Customer expectation for PDF/Word |
| 20 | AuditOS loading states need verification | User experience degradation |
| 28 | AI path partially mock-backed | Real pilot customers will expect real AI capability |

### What Can Wait (P2)

Items 2, 3, 4, 6, 7, 8, 11, 13, 15, 18, 19, 21, 22, 23, 25, 26, 27

### What Must NOT Be Touched Now (P3)

Items 9, 14, 16, 24, 29 — These are future product maturity items.
Do not build: SSO/OAuth, configurable approval thresholds, audit retention, health endpoints, multi-provider AI abstraction. These are speculative for Phase 3.

---

## Related Documents

| Document | Path |
|----------|------|
| Controlled Pilot Status Lock | `docs/reports/auditos-controlled-pilot-status-lock-2026-05-28.md` |
| Eid Build Sprint Report | `docs/reports/eid-build-sprint-2026-05-28.md` |
| Security Public API Hardening | `docs/reports/security-public-api-hardening-2026-05-28.md` |
| LocalContentOS L5 Report | `docs/reports/localcontentos-v0.1-l5-pilot-readiness-report.md` |
| PRODUCT_STATUS_MATRIX | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |
| Phase 3.5 Closure Report | `docs/reports/phase-3.5-closure-report-2026-05-28.md` |

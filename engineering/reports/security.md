# Security Report

**Agent:** security  
**Generated:** 2026-07-11T02:08:04.815Z  
**Score:** 65/100  
**Findings:** 64 (critical 0, high 27, medium 36, low 0, info 1)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 27 |
| medium | 36 |
| low | 0 |
| info | 1 |

## Disclaimer

Heuristic static review mapped to OWASP Top 10. **Not** a penetration test, SAST license scan, or production attestation.

## OWASP Top 10 Coverage (finding counts)

| ID | Category | Findings |
| -- | -------- | -------- |
| A01 | Broken Access Control | 48 |
| A02 | Cryptographic Failures | 4 |
| A03 | Injection | 4 |
| A04 | Insecure Design | 6 |
| A05 | Security Misconfiguration | 0 |
| A06 | Vulnerable Components | 0 |
| A07 | Identification and Authentication Failures | 1 |
| A08 | Software and Data Integrity Failures | 0 |
| A09 | Security Logging Failures | 0 |
| A10 | Server-Side Request Forgery (SSRF) | 1 |

## Surface Scanned

- Source files: 2848
- API routes sampled: 64
- Server action modules: 92
- Rate-limit modules: 18

## HIGH Findings

### F-0295 — Possible secret material (generic-secret)

- **Category:** A02
- **Files:** `src/lib/sales/vnext/learning-loop.ts`
- **Evidence:** Pattern generic-secret matched
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0296 — Dangerous API usage: eval

- **Category:** A04
- **Files:** `src/lib/platform/rate-limiter/redis-rate-limiter.ts`
- **Evidence:** Matched eval
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0298 — Possible secret material (generic-secret)

- **Category:** A02
- **Files:** `src/lib/local-content/erp/connector-factory.ts`
- **Evidence:** Pattern generic-secret matched
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0302 — Possible secret material (generic-secret)

- **Category:** A02
- **Files:** `src/lib/auth/sso-providers.ts`
- **Evidence:** Pattern generic-secret matched
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0304 — Possible secret material (generic-secret)

- **Category:** A02
- **Files:** `src/app/settings/retention/page.tsx`
- **Evidence:** Pattern generic-secret matched
- **Suggestion:** Move to env/Secrets Manager; rotate if real.

### F-0305 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/workflowos/escalation-check/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0306 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/workflowos/documents/[documentId]/download/route.ts`
- **Evidence:** organizationId not referenced

### F-0307 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0308 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/workflowos/clients/[clientId]/records/[recordId]/export/pdf/route.ts`
- **Evidence:** organizationId not referenced

### F-0309 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/scim/v2/Users/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0310 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/scim/v2/Users/[id]/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0311 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/scim/v2/Groups/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0312 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/scim/v2/Groups/[id]/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0313 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/platform/retention/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0315 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/pilot-review/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0316 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/office-ai/download/route.ts`
- **Evidence:** organizationId not referenced

### F-0317 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/notifications/stream/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0318 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/local-content/projects/[projectId]/reports/[reportId]/download/route.ts`
- **Evidence:** organizationId not referenced

### F-0319 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/local-content/projects/[projectId]/evidence/[evidenceId]/download/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0320 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/local-content/projects/[projectId]/audit/export/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0321 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/local-content/projects/[projectId]/audit/export/route.ts`
- **Evidence:** organizationId not referenced

### F-0324 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/custom-product-submit/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0325 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/auth/[...nextauth]/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0326 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/auth/saml/[providerId]/metadata/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0327 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/auth/saml/[providerId]/initiate/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0328 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0329 — Download/export route may lack tenant scope

- **Category:** A01
- **Files:** `src/app/api/audit/engagements/[engagementId]/exports/[format]/route.ts`
- **Evidence:** organizationId not referenced

## MEDIUM Findings

### F-0292 — Cookie security flags not obvious in auth module

- **Category:** A07
- **Files:** `src/lib/auth.ts`
- **Evidence:** httpOnly/sameSite/secure not clearly referenced in src/lib/auth.ts

### F-0293 — Dangerous API usage: child-process

- **Category:** A04
- **Files:** `src/__tests__/unit/db-backup-scheduler.test.ts`
- **Evidence:** Matched child-process
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0294 — Dangerous API usage: child-process

- **Category:** A04
- **Files:** `src/__tests__/i18n/no-english-strings.test.ts`
- **Evidence:** Matched child-process
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0297 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/lib/platform/monitoring/system-monitor.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0299 — Dangerous API usage: child-process

- **Category:** A04
- **Files:** `src/lib/governance-engine/shared/regex.ts`
- **Evidence:** Matched child-process
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0300 — Dangerous API usage: child-process

- **Category:** A04
- **Files:** `src/lib/governance-engine/registry/claim-registry.ts`
- **Evidence:** Matched child-process
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0301 — Dangerous API usage: child-process

- **Category:** A04
- **Files:** `src/lib/governance-engine/registry/loader.ts`
- **Evidence:** Matched child-process
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0303 — Dangerous API usage: dangerouslySetInnerHTML

- **Category:** A03
- **Files:** `src/app/layout.tsx`
- **Evidence:** Matched dangerouslySetInnerHTML
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0314 — Possible SSRF: fetch with dynamic input

- **Category:** A10
- **Files:** `src/app/api/pilot-review/route.ts`
- **Evidence:** fetch(variable) near request/input usage
- **Suggestion:** Allowlist hosts; block link-local/metadata IPs.

### F-0322 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/app/api/health/route.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0323 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/app/api/health/ready/route.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0330 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/ai-settings-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0331 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/approval.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0332 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/contact-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0333 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/contact-export-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0334 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/contact-review-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0335 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/content-evidence-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0336 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/decision-evidence-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0337 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/decision-outcomes.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0338 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/decision-signals-alerts.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0339 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/decision-templates.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0340 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/decisions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0341 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/ingestion-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0342 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/institutional-memory-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0343 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/localcontent-audit-admin-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0344 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/localcontent-review-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0345 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/localcontent-workbook-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0346 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/mfa.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0347 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/office-ai-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0348 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/registration-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0349 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/simulation.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0350 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/tenant-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0351 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/tender.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0352 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/workflowos-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0353 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/workflowos-export-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

### F-0354 — Mutating server action may lack explicit authorize guard

- **Category:** A01
- **Files:** `src/actions/workflowos-template-actions.ts`
- **Evidence:** Prisma write without authorize/guard keyword detected
- **Suggestion:** Use shared action-guard / authorize() pattern.

## INFO Findings

### F-0291 — CSRF handling not obvious in middleware

- **Category:** A01
- **Evidence:** Rely on NextAuth/framework CSRF; verify login + mutation paths

---

_AQLIYA Engineering Excellence · security_

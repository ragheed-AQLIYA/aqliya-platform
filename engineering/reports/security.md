# Security Report

**Agent:** security  
**Generated:** 2026-07-17T23:12:36.857Z  
**Score:** 89/100  
**Findings:** 9 (critical 0, high 2, medium 7, low 0, info 0)

> Engineering Excellence — findings only. OpenCode remains implementation authority. No automatic code changes.

## Summary

| Severity | Count |
| -------- | ----- |
| critical | 0 |
| high | 2 |
| medium | 7 |
| low | 0 |
| info | 0 |

## Disclaimer

Heuristic static review mapped to OWASP Top 10. **Not** a penetration test, SAST license scan, or production attestation.

## OWASP Top 10 Coverage (finding counts)

| ID | Category | Findings |
| -- | -------- | -------- |
| A01 | Broken Access Control | 2 |
| A02 | Cryptographic Failures | 0 |
| A03 | Injection | 6 |
| A04 | Insecure Design | 0 |
| A05 | Security Misconfiguration | 0 |
| A06 | Vulnerable Components | 0 |
| A07 | Identification and Authentication Failures | 1 |
| A08 | Software and Data Integrity Failures | 0 |
| A09 | Security Logging Failures | 0 |
| A10 | Server-Side Request Forgery (SSRF) | 0 |

## Surface Scanned

- Source files: 3062
- API routes sampled: 66
- Server action modules: 118
- Rate-limit modules: 19

## HIGH Findings

### F-0005 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/pilot-review/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

### F-0008 — API route may lack auth check

- **Category:** A01
- **Files:** `src/app/api/custom-product-submit/route.ts`
- **Evidence:** No authorize/session guard keywords detected
- **Suggestion:** Add server-side auth + tenant checks; return 401/404 safely.

## MEDIUM Findings

### F-0001 — Cookie security flags not obvious in auth module

- **Category:** A07
- **Files:** `src/lib/auth.ts`
- **Evidence:** httpOnly/sameSite/secure not clearly referenced in src/lib/auth.ts

### F-0002 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/lib/platform/monitoring/system-monitor.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0003 — Dangerous API usage: dangerouslySetInnerHTML

- **Category:** A03
- **Files:** `src/app/layout.tsx`
- **Evidence:** Matched dangerouslySetInnerHTML
- **Suggestion:** Sanitize / avoid; prefer safe framework APIs.

### F-0004 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/app/api/platform/health/route.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0006 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/app/api/health/route.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0007 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/app/api/health/ready/route.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

### F-0009 — Dangerous API usage: raw-sql

- **Category:** A03
- **Files:** `src/actions/admin-actions.ts`
- **Evidence:** Matched raw-sql
- **Suggestion:** Prefer parameterized Prisma queries; audit any RawUnsafe.

---

_AQLIYA Engineering Excellence · security_

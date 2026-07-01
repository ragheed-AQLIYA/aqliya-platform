# SECURITY FORENSICS REPORT — AQLIYA
**Date:** 2026-06-20

---

## 1. Security Architecture Overview

```
Internet → CloudFront/CDN → Next.js (Middleware) → App Router
                            ├── Rate Limiter (edge/memory)
                            ├── JWT Auth (NextAuth)
                            ├── RBAC Gate
                            ├── MFA Gate
                            ├── Security Headers
                            └── CSP Enforcement
                                    ↓
                            Route Handler / Server Action
                                    ↓
                            Service Layer (tenant guard)
                                    ↓
                            Prisma (tenant-scoped queries)
                                    ↓
                            PostgreSQL
```

**Defense in depth:** 4 layers (Middleware → Handler → Service → Database)

## 2. Environment Variable Security

| Finding | Status | Risk |
|---------|--------|------|
| `.env` gitignored | ✅ Correct | Low |
| `.env.example` documents all vars | ✅ Good | — |
| Production secrets in `.env` | ⚠️ Dev values only | Low for dev |
| `SCIM_API_KEY` weak test value | ⚠️ `test-scim-key-123` | Low for dev only |
| API keys (OpenAI, Anthropic) | ❌ Not configured | Config gap |
| Sentry DSN | ❌ Not configured | Config gap |
| SMTP credentials | ❌ Not configured | Config gap |

## 3. Authentication Analysis

| Mechanism | Status | Strength |
|-----------|--------|----------|
| JWT-based auth (NextAuth v5) | ✅ Implemented | Strong |
| Email/password with bcrypt | ✅ Implemented | Strong |
| MFA (TOTP) | ✅ Implemented | Strong |
| OAuth (Google, GitHub, Azure AD, Okta) | ✅ Config ready | Strong |
| SAML 2.0 (SP-initiated) | ✅ Implemented | Strong |
| SCIM v2 | ✅ Implemented | Strong |
| OAuth invite-only mode | ✅ Implemented | Safe |
| Session management | ✅ Implemented | Standard |

## 4. Authorization Analysis

| Mechanism | Status | Notes |
|-----------|--------|-------|
| Middleware RBAC | ✅ Implemented | 4 roles: viewer, operator, manager, admin |
| Route-to-role mapping | ✅ Implemented | 30+ path patterns mapped |
| MFA enforcement | ✅ Implemented | Admin + operator roles enforced |
| Tenant isolation (org ID) | ✅ Implemented | Service-level checks |
| Service-level guards | ✅ Implemented | Tenant guard, action guards |
| ABAC policies | ⚠️ Models exist | Not fully implemented |
| SoD rules | ⚠️ Models exist | Separation of duty rules defined |

## 5. API Route Protection

| Route Group | Middleware | Handler | Notes |
|------------|-----------|---------|-------|
| `/api/auth/*` | Public | NextAuth | ✅ Secure |
| `/api/auth/saml/*` | Public | SAML SP | ✅ With rate limit |
| `/api/audit/*` | viewer+ | Session verify | ✅ Evidence downloads with signed tokens |
| `/api/decisions/*` | viewer+ | Session verify | ✅ |
| `/api/local-content/*` | viewer+ | Session verify | ✅ |
| `/api/office-ai/*` | viewer+ | Rate limited | ✅ |
| `/api/sales/*` | ⚠️ NOT in matcher | Handler checks | ⚠️ Gap |
| `/api/notifications/*` | ⚠️ NOT in matcher | SSE stream | ⚠️ Gap |
| `/api/ai/*` | viewer+ | — | ✅ |
| `/api/platform/*` | admin | Admin check | ✅ |
| `/api/scim/*` | admin | Bearer token | ✅ |
| `/api/health/*` | Public | Public | ✅ |

## 6. Download Security

| Route | Token Auth | Session Auth | Tenant Check | Rate Limited |
|-------|-----------|-------------|-------------|-------------|
| Audit evidence download | ✅ Signed token | ✅ Fallback | ✅ 404-safe | ✅ |
| Decision evidence download | ✅ Signed token | ✅ Fallback | ✅ | ✅ |
| LC evidence download | ✅ Signed token | ✅ Fallback | ✅ | ✅ |
| LC report download | ✅ Signed token | ✅ Fallback | ✅ | ✅ |
| Office AI download | ❌ | ✅ Session | ✅ | ✅ |
| Sales export | ❌ | ✅ Session | ✅ | ✅ |
| WorkflowOS downloads | ❌ | ✅ Session | ✅ | ✅ |

## 7. CSP Analysis

| Source | Script-Src | Connect-Src | Notes |
|--------|-----------|-------------|-------|
| `next.config.mjs` | `'self' 'unsafe-inline'` | `'self' https://*.sentry.io` | Allows inline scripts |
| `middleware-security.ts` | `'self'` | `'self'` | **STRICTER** — no inline, no Sentry |

**Issue:** Middleware overrides CSP, removing Sentry from connect-src. Sentry error reporting may be broken.

## 8. Rate Limiting

| Tier | Max Requests | Window | Backend |
|------|-------------|--------|---------|
| Standard API | 100 | 60s | Memory (default) |
| Auth endpoints | 10 | 60s | Memory |
| AI endpoints | 30 | 60s | Memory |
| Export endpoints | 20 | 60s | Memory |
| SCIM endpoints | 15 | 60s | Memory |
| SSO callback | 20 | 60s | Memory |
| Health | 300 | 60s | Memory |

**Risk:** Memory rate limiter is per-process. Multi-instance production requires `RATE_LIMITER=redis`.

## 9. Secrets Management

| Finding | Status | Notes |
|---------|--------|-------|
| SSO client secrets encrypted | ✅ AES-256-GCM | `encryption.ts` |
| Vault model exists | ✅ `VaultEntry` model | Key-value encrypted store |
| Encryption key model | ✅ `EncryptionKey` | Key lifecycle management |
| Download token signing | ✅ HMAC-SHA256 | 5-minute expiry |
| Legacy plaintext detection | ✅ Handled | Backward compatible |

## 10. Known Issues (Documented)

| Issue | Location | Severity | Documented As |
|-------|----------|----------|---------------|
| SalesOS schema drift | `lib/sales/prisma-repository.ts` | HIGH | R-04 |
| DecisionOS `as any` in actions | `actions/decisions.ts` | MEDIUM | C3 |
| AuditDB `as any` casts | `lib/audit/db/index.ts` | MEDIUM | R-03 |
| RAG layer `prisma as any` | `lib/ai/` | LOW | Feature-flagged |
| CSP discrepancy | `next.config.mjs` vs middleware | MEDIUM | — |
| Memory-only rate limiter | Default config | MEDIUM | Documented |
| Missing middleware matcher | `/api/sales/*`, `/api/notifications/*` | LOW | — |

## 11. Security Score

| Dimension | Score | Details |
|-----------|-------|---------|
| Authentication | 9/10 | MFA, OAuth, SAML, SCIM all implemented |
| Authorization | 8/10 | RBAC + tenant isolation, ABAC partial |
| API Security | 7/10 | Coverage gaps, but handler-level checks |
| Download Security | 9/10 | Signed tokens, tenant-safe 404s |
| Data Protection | 8/10 | AES-256-GCM for secrets |
| CSP/Headers | 7/10 | Good but Sentry broken by override |
| Rate Limiting | 7/10 | Memory-only default |
| Secrets Safety | 8/10 | Encrypted at rest, gitignored |
| No hardcoded secrets | 10/10 | Clean |
| Known issues documented | 8/10 | R-03, R-04, C3 documented |
| **Overall** | **8.1/10** | **Production-capable with documented gaps** |

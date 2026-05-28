# AuditOS v0.1 — Security Posture

**Date:** 2026-05-28  
**Classification:** Honest operational security summary — not a certification document

---

## Explicit Non-Claims

AuditOS v0.1 is **not**:

- SOC 2 certified
- ISO 27001 certified
- Independently penetration tested for production
- Enterprise security certified
- Suitable for unchecked public internet exposure without operator hardening

Approved context: **controlled deployment only** — internal rehearsal, limited pilot, founder/operator walkthrough.

---

## What Exists

### Authentication and session

| Control               | Implementation                                             | Location                      |
| --------------------- | ---------------------------------------------------------- | ----------------------------- |
| Session auth          | NextAuth v5 JWT sessions                                   | `src/lib/auth-config.ts`      |
| Route protection      | Middleware JWT check on workspace routes                   | `src/middleware.ts`           |
| Credentials login     | Email + bcrypt password hash                               | `User.passwordHash` in Prisma |
| Public demo isolation | `/auditos/*` mock-only; separate from `/audit/*` workspace | Route strategy docs           |

### Authorization and tenant isolation

| Control             | Implementation                                       | Location                                           |
| ------------------- | ---------------------------------------------------- | -------------------------------------------------- |
| AuditOS org scoping | `assertEngagementAccess`, `assertOrganizationAccess` | `src/lib/audit/tenant-guard.ts`                    |
| Role checks         | `requireRole` on server actions                      | `src/actions/audit-actions.ts` and related         |
| Rate limiting       | Per-org/per-actor limits on sensitive actions        | `src/lib/audit/rate-limit.ts`                      |
| Download auth       | Session or signed HMAC token with org binding        | `src/app/api/audit/evidence/.../download/route.ts` |
| Tenant-safe 404     | Cross-org resource access returns not found          | Download and evidence routes                       |

### Audit trail

| Control                | Implementation                                                   |
| ---------------------- | ---------------------------------------------------------------- |
| Audit events           | `AuditEvent` model + `auditLogger` platform helper               |
| Mutation logging       | Server actions record actor, target, metadata                    |
| Creator accountability | `createdById` on core entities (Phase 6 governance pass)         |
| AI assistive boundary  | AI outputs logged; human review required; no autonomous approval |

### Storage protections

| Control                   | Implementation                                        |
| ------------------------- | ----------------------------------------------------- |
| Path traversal prevention | Storage keys normalized and bounded to base directory |
| Permissioned downloads    | Auth + org check before file serve                    |
| Signed token expiry       | 5-minute HMAC download tokens                         |
| Private cache headers     | `Cache-Control: private, no-store` on downloads       |

### HTTP security headers

Applied via `next.config.mjs` and middleware security helper:

- Content-Security-Policy (restrictive baseline)
- X-Frame-Options
- X-Content-Type-Options
- Referrer-Policy
- `poweredByHeader: false`

### Error monitoring (optional)

Sentry integration available when `SENTRY_DSN` configured. Not required for controlled deployment.

---

## What Does Not Exist

| Capability                                   | Status                                  |
| -------------------------------------------- | --------------------------------------- |
| SSO / SAML / LDAP / Active Directory         | Not implemented                         |
| MFA / TOTP                                   | Not implemented                         |
| WAF / DDoS protection                        | Operator responsibility (reverse proxy) |
| Integrated virus scanning                    | Stub only — files accepted without scan |
| Object storage encryption at rest (S3/Azure) | Providers not integrated                |
| Field-level encryption                       | Not implemented                         |
| SIEM integration                             | Not implemented                         |
| Automated secret rotation                    | Manual operator process                 |
| SOC 2 / ISO audit                            | Not performed                           |
| Independent pen test                         | Not performed for v0.1                  |
| Air-gapped deployment package                | Strategic direction only                |
| Kubernetes network policies                  | Not applicable to v0.1 single instance  |

---

## Auth Boundaries

```
Public (no auth)
  /, /products/*, /auditos/* (demo), /api/health, /api/auth/*

Protected workspace (middleware JWT required)
  /audit/*, /decisions/*, /local-content/*, /assistant/*, /workflowos/*

Protected API (middleware + server-side checks)
  /api/audit/*, /api/local-content/*, /api/decisions/* (where applicable)
```

Middleware returns **401 JSON** for unauthenticated API access (no silent data leak).

---

## Tenant Isolation Model

1. Platform `User` belongs to `Organization` with optional `platformOrganizationId`.
2. AuditOS `AuditUser` belongs to `AuditOrganization`.
3. Engagements, clients, evidence scoped by `organizationId`.
4. Server actions call `assertEngagementAccess` before reads/writes.
5. Cross-tenant ID probing receives access denied or tenant-safe 404.

**Limitation:** Isolation depends on correct server-side guards on every mutation path. UI hiding alone is not sufficient — guards are implemented server-side for AuditOS core flows.

---

## Storage Protections and Gaps

**Protected:**

- Keys cannot escape base upload directory
- Downloads require auth or valid signed token with org match

**Gaps (disclosed):**

- Local filesystem storage — OS-level permissions are operator responsibility
- Evidence rejection does not delete physical files
- No at-rest encryption layer beyond filesystem/DB host defaults
- `STORAGE_PROVIDER=s3|azure-blob` throws — do not use until integrated

---

## AI Security Boundary

Trust principle: **AI assists. Humans decide. Evidence governs.**

- AI review suggestions do not auto-approve engagements
- Approval requires explicit human action
- AI provider keys optional; assistive features degrade gracefully if unset
- External AI routing must not receive production secrets (per AGENTS.md toolchain policy)

---

## Known Limitations

| Limitation                 | Risk level                 | Mitigation for controlled deployment                             |
| -------------------------- | -------------------------- | ---------------------------------------------------------------- |
| Credentials-only auth      | Medium for public exposure | Use VPN or internal network; plan SSO before external pilot      |
| No virus scan integration  | Medium                     | Accept only trusted uploads in rehearsal; scan offline if needed |
| Pre-approval draft exports | Low (policy)               | Train operators; exports labeled as draft                        |
| JWT secret in env          | Standard                   | Strong `AUTH_SECRET`; separate per environment                   |
| Single instance            | Availability               | Accept downtime for v0.1; not HA                                 |
| Docker env alignment       | Resolved (Track C.1)       | `AUTH_SECRET`, upload volume, standalone output aligned          |

---

## Non-Goals (v0.1)

- Enterprise multi-tenant SaaS hardening
- Compliance certification packaging
- Automated disaster recovery
- Zero-trust micro-segmentation
- Autonomous audit decision-making

---

## References

- Environment inventory: `docs/deployment/auditos-v0.1-environment-inventory.md`
- Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`
- Governance review: `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`
- Route strategy: `docs/source-of-truth/ROUTE_STRATEGY.md`

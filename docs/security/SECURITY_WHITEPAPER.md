# AQLIYA Security Whitepaper
# الورقة البيضاء لأمن عقلية

**Status:** Active | **Version:** 1.0 | **Date:** 2026-07-25
**Owner:** Security Team | **Last Reviewed:** 2026-07-25
**Classification:** Public — for customers, prospects, and auditors
**Audience:** CISOs, IT managers, compliance officers, procurement

> **Important:** This whitepaper describes the security architecture of AQLIYA Cloud as implemented in the current v0.1 operational baseline. AQLIYA is **not** SOC2 or ISO 27001 certified today — these are roadmap items. Penetration testing is scheduled but not yet completed. See `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` for full context.

---

## Executive Summary — الملخص التنفيذي

AQLIYA is a **Private Governed Institutional Intelligence Platform** built with defense-in-depth security. The platform processes sensitive institutional data — financial records, local content classifications, decision logs, and relationship intelligence — and therefore security is not an afterthought. It is embedded in the architecture from authentication to audit trail.

This whitepaper documents:

- Platform architecture and deployment model
- Authentication and authorization mechanisms
- Data encryption at rest and in transit
- Tenant isolation guarantees
- Immutable audit trail with cryptographic tamper evidence
- AI governance and prompt security
- Infrastructure security and network architecture
- Compliance roadmap

All claims in this document are verifiable against the AQLIYA codebase (`src/`) and deployment configuration (`infra/terraform/`).

---

## 1. Architecture Overview — نظرة عامة على البنية

### 1.1 Technology Stack — المجموعة التقنية

| Layer — الطبقة | Technology — التقنية | Version — الإصدار |
|----------------|---------------------|-------------------|
| **Application** | Next.js (App Router) | 16 |
| **Language** | TypeScript (strict mode) | 5.x |
| **Database** | PostgreSQL | 16 |
| **Cache / Rate Limiter** | Redis (ElastiCache) | 7.x |
| **ORM** | Prisma | 7.x |
| **Authentication** | NextAuth.js | v5 |
| **File Storage** | AWS S3 (or local `./uploads`) | — |
| **Malware Scanning** | ClamAV (sidecar) | Latest stable |
| **Runtime** | Node.js | 22 |
| **Container Orchestration** | AWS ECS Fargate | — |

### 1.2 Deployment Architecture — بنية النشر

```
                     ┌──────────────────┐
                     │   AWS WAF + CDN   │ ← Rate limiting, SQLi/XSS protection, IP reputation
                     │  (CloudFront)     │
                     └────────┬─────────┘
                              │ TLS 1.3
                     ┌────────▼─────────┐
                     │ Application Load │
                     │    Balancer       │
                     └────────┬─────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
     ┌────────▼────────┐ ┌───▼────┐ ┌───────▼────────┐
     │  ECS Fargate    │ │ Redis  │ │  RDS PostgreSQL │
     │  (Next.js App)  │ │(Cache) │ │   (Primary)     │
     │  + ClamAV       │ └────────┘ └────────────────┘
     │  sidecar        │
     └────────┬────────┘
              │
     ┌────────▼────────┐
     │    AWS S3       │ ← Evidence files, exports, static assets
     └─────────────────┘
```

All components run within an AWS **Virtual Private Cloud (VPC)** with private subnets for database and cache layers. Application containers run in private subnets behind the Application Load Balancer. No database or cache instance is directly exposed to the internet.

---

## 2. Authentication — المصادقة

### 2.1 NextAuth v5 — إطار المصادقة

AQLIYA uses **NextAuth.js v5** (`src/lib/auth-config.ts`) as its authentication framework.

| Feature — الميزة | Implementation — التنفيذ |
|------------------|--------------------------|
| **Session strategy** | JWT (stateless, no server-side session store required) |
| **Session cookie** | `httpOnly: true`, `sameSite: "lax"`, `secure: true` (in production) |
| **Secret management** | `AUTH_SECRET` environment variable; never hardcoded or exposed to client |
| **Token claims** | `id`, `email`, `name`, `role`, `organizationId`, `platformOrganizationId`, `mfaEnabled` |
| **Password hashing** | bcrypt (`bcryptjs`) with built-in salting |
| **Host trust** | `trustHost: true` — only trusted deployment domains |

### 2.2 Multi-Factor Authentication (MFA) — المصادقة متعددة العوامل

MFA is supported natively:

- `mfaEnabled` flag on every user record in the database.
- MFA enforcement is configurable per organization.
- MFA setup and verification routes at `/settings/mfa`.
- TOTP-based (Time-based One-Time Password) via standard authenticator apps.

### 2.3 Single Sign-On (SSO) — الدخول الموحد

Enterprise customers can configure SSO via:

| Provider — المزود | Protocol — البروتوكول | Configuration — الإعداد |
|-------------------|----------------------|-------------------------|
| **Google** | OAuth 2.0 / OIDC | Self-service UI at `/settings/sso` |
| **GitHub** | OAuth 2.0 | Self-service UI |
| **Azure AD / Entra ID** | OIDC | Self-service UI |
| **Okta** | OIDC | Self-service UI |
| **Custom OIDC** | OpenID Connect | Self-service UI |
| **SAML 2.0** | SAML | Operator-configured (`@node-saml/node-saml`) |
| **SCIM v2** | Provisioning | API key auth at `/api/scim/v2/Users` and `/api/scim/v2/Groups` |

SSO client secrets are encrypted at rest using **AES-256-GCM** (`src/lib/auth/encryption.ts`). Secrets are stored with an `enc:` prefix to distinguish encrypted values from legacy plaintext, enabling safe migration.

---

## 3. Authorization — الصلاحيات

### 3.1 Edge-Layer RBAC — صلاحيات طبقة الحافة

AQLIYA enforces authorization at the **middleware layer** (`src/middleware.ts`) before any request reaches application code.

| Aspect — الجانب | Detail — التفصيل |
|-----------------|------------------|
| **Protected route entries** | 42 route prefixes with minimum role requirements |
| **Role hierarchy** | `viewer` (0) → `operator` (1) → `manager` (2) → `admin` (3) |
| **Public routes** | Login, marketing pages, public demo (`/auditos/*`), health endpoint, SCIM API |
| **Admin-only routes** | `/settings/sso`, `/organizations`, `/monitoring`, `/api/scim`, `/api/platform`, `/operator` |
| **Enforcement** | Server-side middleware on every request; role hierarchy checked numerically |

Route coverage includes all product workspaces:

| Product — المنتج | Route Prefix — بادئة المسار | Min Role — الحد الأدنى |
|------------------|---------------------------|----------------------|
| AuditOS | `/audit` | viewer |
| LocalContentOS | `/local-content` | viewer |
| DecisionOS | `/decisions` | viewer |
| SalesOS | `/sales` | viewer |
| WorkflowOS | `/workflowos` | viewer |
| Office AI Assistant | `/assistant`, `/office-ai` | viewer |
| ContentStudio | `/content-studio` | viewer |
| LocalContactOS | `/contacts` | viewer |
| RiskOS | `/risk` | viewer |
| Knowledge Foundation | `/knowledge-foundation` | viewer |
| Institutional Memory | `/institutional-memory` | viewer |

### 3.2 Server-Side Authorization — الصلاحيات على مستوى الخادم

Edge-layer RBAC is a **first gate** — not the only gate. Every server action and API route performs:

1. **Session validation** — `getCurrentUser()` from `src/lib/auth.ts` verifies the JWT session.
2. **Role verification** — `hasRequiredRole()` checks the user''s role against the required level.
3. **Tenant scoping** — All database queries include `organizationId` filtering.
4. **Ownership verification** — Mutations verify the acting user owns or is authorized on the target resource.

The pattern is:

```
Client Component → Server Action → getCurrentUser() → hasRequiredRole() → tenant-scoped query
```

No client-side role check is trusted. All authorization decisions happen server-side before data access.

---

## 4. Data Encryption — تشفير البيانات

### 4.1 Encryption at Rest — التشفير في حالة السكون

| Data — البيانات | Encryption — التشفير | Method — الطريقة |
|-----------------|---------------------|-------------------|
| **SSO client secrets** | AES-256-GCM | `src/lib/auth/encryption.ts` — `createCipheriv()` with random 16-byte IV + auth tag |
| **User passwords** | bcrypt | `bcryptjs` with built-in salting |
| **PostgreSQL (RDS)** | AES-256 | AWS RDS encryption at rest (enabled at instance creation) |
| **S3 objects** | SSE-S3 / SSE-KMS | AWS server-side encryption |
| **Redis (ElastiCache)** | AES-256 | AWS ElastiCache encryption at rest |
| **Backups** | Encrypted | RDS automated backups, S3 bucket encryption |

**AES-256-GCM implementation detail** (`src/lib/auth/encryption.ts`):

- Encryption key derived from `AUTH_SECRET` using SHA-256.
- Random 16-byte initialization vector (IV) per encryption operation.
- Authentication tag for integrity verification (GCM mode).
- Format: `iv:authTag:ciphertext` (hex-encoded).

### 4.2 Encryption in Transit — التشفير أثناء النقل

| Path — المسار | Protocol — البروتوكول |
|---------------|----------------------|
| **Client → CloudFront** | TLS 1.3 (minimum TLS 1.2) |
| **CloudFront → ALB** | TLS 1.3 |
| **ALB → ECS Fargate** | TLS (VPC internal) |
| **App → RDS PostgreSQL** | TLS 1.3 (enforced) |
| **App → ElastiCache Redis** | TLS (encryption in transit enabled) |
| **App → S3** | TLS 1.3 (HTTPS endpoint) |

All external endpoints enforce HTTPS. HTTP requests are redirected (301) to HTTPS at the CloudFront and ALB layers.

---

## 5. Tenant Isolation — عزل المستأجرين

AQLIYA is a multi-tenant platform. Every customer (organization) must be strictly isolated from every other customer.

### 5.1 Isolation Mechanism — آلية العزل

| Layer — الطبقة | Mechanism — الآلية |
|----------------|-------------------|
| **Database** | Every business table includes `organizationId` as a foreign key to `Organization`. All queries filter by the authenticated user''s `organizationId`. |
| **Session** | JWT token includes `organizationId` — never derived from client input. |
| **File storage** | S3 objects are prefixed by organization ID; access is gated by server-side authorization. |
| **API routes** | Every API handler validates the session and scopes data access to the user''s organization. |
| **Server actions** | All mutations inject `organizationId` from the session, never from form data. |

### 5.2 Cross-Tenant Protection — الحماية من التسرب بين المستأجرين

- **No shared queries**: Every Prisma query includes a `where: { organizationId }` clause.
- **No tenant enumeration**: Attempting to access another organization''s resources returns a generic "not found" (404) rather than "forbidden" (403), preventing tenant enumeration.
- **Download routes**: All 11 file download routes (`/api/download/*`) verify tenant ownership before serving files.
- **Demo isolation**: The public demo (`/auditos/*`) uses mock data only — no access to real customer data.

---

## 6. Audit Trail — سجل التدقيق

### 6.1 PlatformAuditLog — سجل تدقيق المنصة

Every mutation, approval, export, and sensitive read operation is recorded in the `PlatformAuditLog` model.

| Field — الحقل | Purpose — الغرض |
|---------------|----------------|
| `id` | Unique event identifier |
| `action` | Event type (e.g., `audit.engagement.created`, `localcontent.workbook.approved`) |
| `actorId` | User who performed the action |
| `organizationId` | Tenant scope |
| `entityType` | Affected model (e.g., `Engagement`, `Workbook`) |
| `entityId` | Affected record ID |
| `metadata` | JSON payload with operation context |
| `createdAt` | Immutable timestamp |

Audit events are created via `writePlatformAuditLog()` and are **append-only** — no update or delete operations exist on the audit log.

### 6.2 Hash Chain Tamper Evidence — سلسلة التجزئة كدليل على عدم التلاعب

AQLIYA implements a **cryptographic hash chain** (`src/lib/platform/audit/hash-chain.ts`) to provide tamper evidence for the audit trail:

| Component — المكون | Detail — التفصيل |
|-------------------|------------------|
| **Hash algorithm** | SHA-256 |
| **Chain structure** | Each `HashChainEntry` links to the previous entry via `previousHash` |
| **Hash input** | `previousHash | auditLogId | action | actorId | timestamp | nonce` |
| **Verification** | `verifyAllChains()` recomputes every hash and validates the entire chain |
| **Proof-of-work** | Optional nonce mining with configurable difficulty (e.g., `0000` prefix) for additional tamper resistance |

This means:

- Any tampering with a single audit log entry **breaks** the chain — the next entry''s `previousHash` will not match.
- Full chain verification can prove the integrity of the entire audit trail since a known-good checkpoint.
- The hash chain is stored in the database alongside audit log entries and can be exported as evidence.

### 6.3 Audit Trail Outputs — مخرجات سجل التدقيق

- **Platform audit log dashboard** at `/settings/audit-logs` (admin access).
- **JSON export** of filtered audit events with chain verification status.
- **Integration with product-specific audit views** (e.g., engagement audit trail, workbook activity log).

---

## 7. AI Governance — حوكمة الذكاء الاصطناعي

AQLIYA operates under the trust principle:

> **AI assists. Humans decide. Evidence governs.**
> **الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.**

### 7.1 Prompt Sanitization — تنقية الأوامر

All LLM prompts pass through `sanitizePromptInput()` (`src/lib/security/prompt-sanitization.ts`) before dispatch to any AI provider:

| Sanitization — التنقية | Purpose — الغرض |
|------------------------|-----------------|
| **Injection stripping** | Removes `` ``` `` code fences, `=== SECTION ===` separators, and role-prefix injection patterns (`System:`, `Assistant:`, `User:`, `AI:`, `ADMIN:`) |
| **Tool call stripping** | Removes `<|tool|>` and similar tool-call syntax |
| **Length limits** | Truncates values at configurable maximum length |
| **Null/non-string handling** | Converts `null`/`undefined` to `"(none)"`; objects are JSON-serialized |
| **Recursive sanitization** | Applies to all string values in nested input objects |

### 7.2 Human Review Gate — بوابة المراجعة البشرية

Every AI-generated output must pass through a **human review gate** before becoming actionable:

| Attribute — السمة | Implementation — التنفيذ |
|-------------------|--------------------------|
| **Output status** | All AI outputs are marked as `suggestion`, `draft`, or `analysis` — never `final` |
| **Review workflow** | AI-generated content enters review pipeline (e.g., `needs_review` → `reviewed` → `approved`/`rejected`) |
| **Confidence scoring** | AI outputs include a confidence score (0–100%) displayed to the reviewer |
| **Evidence linking** | AI outputs link back to source evidence and reasoning |
| **Approval required** | No AI output can be exported, published, or actioned without human approval |
| **Audit trail** | All AI generation events and review decisions are logged in `PlatformAuditLog` |

### 7.3 AI Governance Metadata — بيانات حوكمة الذكاء الاصطناعي

Every AI output includes `AIGovernanceMetadata`:

- **Provider**: Which AI provider generated the output (deterministic, cloud LLM, local runtime).
- **Prompt version**: Which prompt template version was used.
- **Confidence**: Numeric confidence score.
- **Review status**: Whether the output has been reviewed.
- **Source references**: Links to evidence or input data that informed the generation.

---

## 8. Infrastructure Security — أمن البنية التحتية

### 8.1 Network Security — أمن الشبكة

| Control — التحكم | Implementation — التنفيذ |
|------------------|--------------------------|
| **WAF (Web Application Firewall)** | AWS WAF attached to CloudFront distribution — SQLi, XSS, rate-based rules |
| **DDoS protection** | AWS Shield Standard (CloudFront) |
| **VPC** | Private subnets for RDS, ElastiCache, ECS tasks; public subnets for ALB only |
| **Security groups** | Least-privilege: ECS → RDS (port 5432), ECS → Redis (port 6379), ALB → ECS (port 3000) |
| **Network ACLs** | Stateless deny-by-default; explicit allow rules only |

### 8.2 Content Security Policy (CSP) — سياسة أمن المحتوى

AQLIYA deploys a strict Content Security Policy:

| Directive — التوجيه | Value — القيمة | Rationale — المبرر |
|--------------------|----------------|---------------------|
| `script-src` | `'self'` | No `unsafe-eval` or `unsafe-inline` — blocks XSS |
| `style-src` | `'self'` | No inline styles |
| `connect-src` | `'self'` + API endpoints | Restricts fetch/XHR to known origins |
| `worker-src` | `'none'` | Blocks service worker abuse |
| `manifest-src` | `'self'` | Restricts manifest to own origin |
| `frame-ancestors` | `'none'` | Prevents clickjacking |
| `form-action` | `'self'` | Prevents form redirection attacks |

### 8.3 Rate Limiting — تقييد المعدل

| Layer — الطبقة | Implementation — التنفيذ |
|----------------|--------------------------|
| **Edge (CloudFront/WAF)** | IP-based rate limiting; blocking after threshold |
| **Application (Redis)** | `ioredis`-backed rate limiter with automatic fallback to in-memory store |
| **Auth endpoints** | Stricter limits on `/api/auth/*` (login, signup) |
| **SCIM API** | Separate rate limiting for provisioning endpoints |

### 8.4 File Security — أمن الملفات

| Control — التحكم | Detail — التفصيل |
|------------------|------------------|
| **Upload validation** | File type allowlisting, size limits, extension verification |
| **Malware scanning** | ClamAV sidecar container in ECS task definition (configurable via `SCANNER_PROVIDER=clamav`) |
| **Storage isolation** | S3 objects prefixed by `organizationId`; access gated by server-side auth |
| **Download protection** | All 11 download routes require authentication + tenant ownership verification + audit trail |
| **Checksums** | File metadata includes checksums for integrity verification |

### 8.5 Secrets Management — إدارة الأسرار

- **No hardcoded secrets**: Zero secrets in source code — verified by security audit (Sprint 10, 2026-07-16).
- **Environment variables**: All secrets via `.env` (development) or AWS Secrets Manager / ECS task definition (production).
- **`AUTH_SECRET`**: Used for JWT signing and AES-256-GCM encryption key derivation.
- **Rotation**: Secrets rotation runbook at `docs/runbooks/SECRETS_AND_ROTATION_RUNBOOK.md`.

---

## 9. Operational Security — الأمن التشغيلي

### 9.1 Monitoring & Alerting — المراقبة والتنبيه

| Capability — القدرة | Detail — التفصيل |
|--------------------|------------------|
| **Application health** | `/api/platform/health` — DB latency, kernel plugin status; 200/503 semantics |
| **Structured logging** | JSON-formatted logs via `createLogger()` factory (`src/lib/observability/logger.ts`) |
| **Error tracking** | Sentry integration (client/server/edge configs; 20% trace sampling in production) |
| **CloudWatch** | 4 dashboards, 5 alarms, 2 log groups, WAF metrics |
| **Audit log monitoring** | Alert on hash chain verification failure; alert on unusual access patterns |

### 9.2 Backup & Recovery — النسخ الاحتياطي والاستعادة

| Component — المكون | Backup — النسخ الاحتياطي |
|--------------------|--------------------------|
| **PostgreSQL** | RDS automated backups (daily, 7-day retention; configurable) |
| **S3** | Cross-region replication (configurable); versioning enabled |
| **Restore drill** | Scripted at `scripts/platform/restore-drill.mjs` — spot-checks row counts, generates JSON report |

### 9.3 Deployment Security — أمن النشر

| Control — التحكم | Detail — التفصيل |
|------------------|------------------|
| **Infrastructure as Code** | Terraform (`infra/terraform/environments/prod/`) — all infrastructure changes are versioned and reviewed |
| **CI/CD** | GitHub Actions with `promote.yml` for true N-1 rollback capability |
| **Immutable deployments** | ECS Fargate task definitions are replaced, not updated in-place |
| **Pre-deployment checks** | TypeScript compilation (`npx tsc --noEmit`), lint (`npm run lint`), test suite (`npm test`), security audit (`npm audit`) |

---

## 10. Compliance Roadmap — خارطة طريق الامتثال

### 10.1 Current Status — الحالة الحالية

| Standard — المعيار | Status — الحالة | Notes — ملاحظات |
|--------------------|-----------------|------------------|
| **SOC2 Type II** | **Roadmap** | Readiness program prepared; external audit not yet engaged |
| **ISO 27001** | **Roadmap** | Gap assessment completed; certification not initiated |
| **NCA (Saudi Arabia)** | **Roadmap** | Essential Cybersecurity Controls (ECC) alignment in progress |
| **PDPL (Saudi Arabia)** | **Roadmap** | Personal Data Protection Law — data residency and processing controls documented |
| **Penetration Test** | **Scheduled** | Scope defined (`docs/security/PENETRATION_TEST_SCOPE.md`); external firm not yet engaged |

### 10.2 Controls Mapped to SOC2 Trust Services Criteria — ربط الضوابط بمعايير SOC2

| TSC Category — الفئة | AQLIYA Controls — ضوابط عقلية |
|----------------------|------------------------------|
| **Security** | WAF, CSP, rate limiting, encryption, RBAC, MFA, SSO, VPC, least-privilege security groups |
| **Availability** | 99.5% uptime SLA (Enterprise), CloudWatch monitoring, RDS automated backups, restore drills |
| **Processing Integrity** | Hash chain tamper evidence, audit trail, append-only logs, input validation |
| **Confidentiality** | Tenant isolation, AES-256-GCM encryption at rest, TLS 1.3 in transit, S3 access controls |
| **Privacy** | Data minimization, role-based access, consent model documentation, PDPL alignment |

### 10.3 Timeline — الجدول الزمني

| Milestone — المعلم | Target — المستهدف | Status — الحالة |
|--------------------|------------------|------------------|
| Penetration test | TBD | Scope documented |
| SOC2 Type II readiness | TBD | Program prepared |
| ISO 27001 gap assessment | TBD | Completed |
| NCA ECC alignment | TBD | In progress |

---

## 11. Shared Responsibility Model — نموذج المسؤولية المشتركة

### 11.1 AQLIYA Responsibility — مسؤولية عقلية

AQLIYA is responsible for:

- Platform application security (code, dependencies, configurations).
- Infrastructure security (network, compute, storage, databases).
- Authentication and authorization mechanisms.
- Data encryption at rest and in transit.
- Monitoring, logging, and incident response for the platform layer.
- Regular security updates and patch management.

### 11.2 Customer Responsibility — مسؤولية العميل

The customer is responsible for:

- Managing user accounts, roles, and permissions within their organization.
- Configuring and enforcing MFA policies for their users.
- Protecting their SSO identity provider credentials.
- Secure handling of exported data, reports, and evidence files.
- Compliance with their industry-specific regulations for data stored in AQLIYA.
- Reviewing AI-generated outputs before acting on them.

---

## 12. Reporting a Security Issue — الإبلاغ عن مشكلة أمنية

If you discover a security vulnerability in AQLIYA, please report it responsibly:

- **Email**: security@aqliya.com
- **PGP Key**: Available on request
- **Response time**: Acknowledgment within 24 hours (business days)
- **Disclosure**: Coordinated disclosure — please allow 90 days for remediation before public disclosure

We do not operate a public bug bounty program at this time. Responsible disclosures are acknowledged (with permission).

---

## 13. Related Documents — وثائق ذات صلة

| Document | Path |
|----------|------|
| Penetration Test Scope | `docs/security/PENETRATION_TEST_SCOPE.md` |
| Penetration Test Preparation | `docs/security/PENTEST_PREPARATION.md` |
| What We Do Not Claim | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` |
| Production Deployment Runbook | `docs/runbooks/production-deployment-runbook.md` |
| Secrets & Rotation Runbook | `docs/runbooks/SECRETS_AND_ROTATION_RUNBOOK.md` |
| Backup & Restore Drill | `docs/runbooks/BACKUP_RESTORE_DRILL.md` |
| Access Control Matrix | `docs/runbooks/ACCESS_CONTROL_MATRIX.md` |
| Product Status Matrix | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` |

---

## Change Log — سجل التغييرات

| Date | Version | Change |
|------|---------|--------|
| 2026-07-25 | 1.0 | Initial security whitepaper — based on v0.1 operational baseline; verifiable against codebase |

---

*This whitepaper reflects the AQLIYA Cloud platform as of July 2026. Security is continuous work — this document will be updated as new controls are implemented, certifications are achieved, and the platform evolves.*
*تعكس هذه الورقة البيضاء منصة عقلية السحابية كما في يوليو 2026. الأمن عمل مستمر — سيتم تحديث هذه الوثيقة مع تنفيذ ضوابط جديدة وتحقيق الشهادات وتطور المنصة.*

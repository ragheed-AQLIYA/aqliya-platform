---
name: eng-security-audit
description: Comprehensive security audit — auth, RBAC, tenant isolation, secret leakage, dependency vulns, download routes, AI security
version: 1.0
date: 2026-07-13
status: active
owner: Layer 4 — Security
inputs: Module, route, or product to audit
outputs: Security findings with OWASP-aligned severity and remediation steps
dependencies: engineering/agents/security.mjs, engineering/os/COMPLIANCE.md, .skills/aqliya/aqliya-security-gate.md
---

# Engineering Security Audit

> **Purpose:** Validate security posture of a module, route, or product against AQLIYA's security standards.

---

## Audit Checklist

### 1. Authentication (Critical)

```
□ Is the route protected by middleware?
□ Is the route in the middleware matcher?
□ Is the route in the public exclusions list? (if intentional)
□ Does the action verify session before processing?
□ Are API routes auth-gated? (check route.ts handlers)
```

**Middleware reference:** `src/middleware.ts`

---

### 2. Authorization / RBAC (Critical)

```
□ Does every mutating action call enforce() or authorize()?
□ Are roles checked server-side (not just UI hiding)?
□ Is the role check appropriate for the operation?
  - ADMIN: platform configuration, user management
  - OPERATOR: product workflow operations
  - VIEWER: read-only access
□ Are role checks bypassed by any code path?
```

**Enforce:** `engineering/os/COMPLIANCE.md` → ACTIONS_USE_ENFORCE (currently 52% — improvement area)

---

### 3. Tenant Isolation (Critical)

```
□ Does every query include organizationId?
□ Is organizationId validated server-side (not trusted from client)?
□ For multi-product queries: is there cross-org leakage risk?
□ Are download routes tenant-scoped? (404, not 403)
```

**Enforce:** `engineering/os/COMPLIANCE.md` → DOWNLOAD_ROUTES_TENANT_SCOPED

---

### 4. Secret & Credential Safety (Critical)

```
□ Are any API keys, tokens, or secrets hardcoded?
□ Are environment variables accessed safely?
□ Are secrets ever logged? (console.log, error messages)
□ Are credentials stored encrypted at rest? (AES-256-GCM per SSO service)
```

---

### 5. Dependency Vulnerabilities (High)

```
□ Run: npm audit
□ Are there critical/high CVEs in dependencies?
□ Are dependencies recently maintained?
□ Are there unpinned version ranges?
```

---

### 6. Injection Prevention (High)

```
□ SQL Injection: Are all DB queries parameterized via Prisma?
□ Prompt Injection: Is AI input sanitized? (src/lib/security/prompt-sanitization.ts)
□ XSS: Is user input rendered safely? (React's default escaping)
□ SSRF: Are external URLs validated before fetch?
□ File Upload: Are file types validated server-side?
```

---

### 7. Audit Trail Integrity (High)

```
□ Are all mutations logged? (writePlatformAuditLog or domain audit event)
□ Is the audit trail tamper-evident?
□ Can audit events be deleted without trace?
□ Are exports logged with audit events?
```

---

### 8. AI Security (High — if applicable)

```
□ Is AI output marked as "assistive only"?
□ Does AI have autonomous decision capability? (MUST NOT)
□ Are AI prompts sanitized before dispatch?
□ Is there a human review gate before AI output becomes actionable?
□ Are AI provider keys scoped to least privilege?
```

**Enforce:** `.skills/aqliya/aqliya-ai-feature-gate.md`

---

## Output Format

```md
## Security Audit: <scope>

### Critical Findings
| # | Category | Finding | Location | Remediation |
|---|----------|---------|----------|-------------|

### High Findings
| # | Category | Finding | Location | Remediation |
|---|----------|---------|----------|-------------|

### Medium/Low Findings
| # | Category | Finding | Location | Remediation |
|---|----------|---------|----------|-------------|

### Security Score: X/100

### Required Actions Before Release
1. ...
2. ...
```

---

## Integration

Load when:
- New route or API endpoint is created
- Auth/RBAC changes are made
- Download/export functionality is added
- AI features are introduced or modified
- Dependencies are updated
- Before release (release gate)

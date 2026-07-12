# AQLIYA Penetration Test Scope

**Status:** Ready for scheduling | **Target:** `https://app.aqliya.com`

---

## Scope

### In Scope

| Target | URL | Purpose |
|--------|-----|---------|
| Production application | `https://app.aqliya.com` | Main product surface |
| Public API endpoints | `https://app.aqliya.com/api/*` | Health, AI, metrics (unauthenticated) |
| Authentication | `https://app.aqliya.com/login` | Login form, session handling |
| Static assets | `https://app.aqliya.com/_next/*` | Next.js assets, JS bundles |
| CloudFront | `https://d24gqdc5iosl4w.cloudfront.net` | CDN cache behavior |

### Out of Scope

| Target | Reason |
|--------|--------|
| `dev.aqliya.com` | Dev environment, not production |
| AWS infrastructure | Managed by AWS (shared responsibility) |
| Third-party SaaS (Sentry) | External dependency |
| Physical security | AWS data centers |

---

## Test Focus Areas

| Area | Priority | Notes |
|------|----------|-------|
| **Authentication** | High | Session hijacking, CSRF, brute force, OAuth flows |
| **Authorization** | High | IDOR, privilege escalation, role bypass |
| **API security** | High | Injection (SQL, NoSQL, command), rate limiting, input validation |
| **File upload** | Medium | S3 uploads, malware scanning (ClamAV), path traversal |
| **CloudFront/WAF** | Medium | WAF bypass, cache poisoning, origin exposure |
| **TLS/HTTPS** | Low | Certificate validation, protocol downgrade |
| **Headers** | Low | CSP, HSTS, XFO, CORS misconfiguration |

---

## Known Configurations (for testers)

### WAF Rules (CloudFront)

| Rule | Action | Details |
|------|--------|---------|
| Rate limiting | Block | 5000 requests per 5 minutes per IP |
| AWS Managed Common | Count | SizeRestrictions_BODY overridden to count |

### Health Endpoint (Unauthenticated)

```
GET https://app.aqliya.com/api/health → 200
```

### Security Headers Present

- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload`
- `Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'`
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`

---

## Testing Guidelines

1. **Rate limits:** WAF blocks at 5000 req/5min per IP — coordinate testing to avoid false positives
2. **File uploads:** ClamAV scans uploads — test with EICAR test file
3. **Sensitive data:** No real PII/PCI in scope — use test accounts
4. **DoS:** No volumetric DoS testing without prior approval
5. **Timing:** Schedule during maintenance window (production live)

---

## Deliverables

1. Vulnerability report with CVSS scores
2. Proof of concept for each finding
3. Remediation recommendations
4. Retest after fixes

---

## Contact

**Platform Admin:** Via repository owner
**Emergency stop:** `domain_ready = false` in Terraform

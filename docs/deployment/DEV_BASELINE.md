# AQLIYA Dev Environment — Deployment Baseline

**Status:** Active | **Last updated:** 2026-07-08 | **Environment:** `dev`

## Public URLs

| Entry point | URL | Status |
|-------------|-----|--------|
| Public domain | `https://dev.aqliya.com` | ✅ Live |
| ALB (direct HTTP) | `http://aqliya-dev-alb-344890748.eu-north-1.elb.amazonaws.com` | ✅ Internal |
| CloudFront direct | `https://d2ixpyifowellz.cloudfront.net` | ⚠️ Requires `Host: dev.aqliya.com` |
| Health endpoint | `https://dev.aqliya.com/api/health` | ✅ Returns 200 |

---

## Topology

```
User → DNS (Route53)
         → CloudFront (CDN + WAF + HSTS + Security Headers)
              → ALB (HTTPS → ECS)
                   → ECS Fargate (app + ClamAV)
                        → RDS PostgreSQL
                        → ElastiCache Redis
                        → S3 (uploads + static)
```

## Request flow

1. `dev.aqliya.com` resolves via Route53 to CloudFront
2. CloudFront terminates TLS, applies WAF rules, adds security headers
3. CloudFront forwards to ALB over HTTPS
4. ALB forwards to ECS Fargate tasks
5. App connects to RDS (with SSL `no-verify`) and Redis

---

## WAF Rules

| Rule | Action | Priority |
|------|--------|----------|
| Rate limiting (5000/IP) | Block | 0 |
| AWS Managed Common Rule Set | Count (SizeRestrictions_BODY overridden) | 1 |

**Implementation note:** WAF attached to CloudFront via `web_acl_id` inside `aws_cloudfront_distribution`, NOT via `aws_wafv2_web_acl_association`. See ADR-DEPLOY-001.

---

## Cache Behavior

| Path Pattern | Origin | TTL | Cache |
|-------------|--------|-----|-------|
| Default (`/`) | S3 (static) | 1h / 1d max | GET, HEAD, OPTIONS |
| `/_next/*` | ALB (app) | 1d / 1y max | GET, HEAD, OPTIONS (immutable assets) |
| `/api/*` | ALB (app) | 0s (no cache) | All methods, cookies forwarded, no TTL |

---

## Security Headers (CloudFront Response Headers Policy)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; connect-src 'self' https://*.sentry.io; ...` |

---

## Robots.txt

Public routes allowed. Internal routes disallowed:
- `/api/*`, `/audit/*`, `/decisions/*`, `/login/*`
- `/settings/*`, `/sales/*`, `/organizations/*`, `/intelligence/*`
- Sitemap: `https://aqliya.com/sitemap.xml` (production sitemap reference)

---

## TLS / ACM

| Region | Domain | Status | Validation |
|--------|--------|--------|------------|
| eu-north-1 | `*.dev.aqliya.com` + `dev.aqliya.com` | PENDING_VALIDATION | DNS (CNAME) |
| us-east-1 | `*.dev.aqliya.com` + `dev.aqliya.com` | PENDING_VALIDATION | DNS (CNAME) |

Validation records deployed in Route53 zone `dev.aqliya.com` + NS delegation in `aqliya.com`.

---

## Environment Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `NODE_ENV` | `production` | Next.js runtime mode (must always be production in container) |
| `APP_ENV` | `dev` | Deployment environment label for observability |
| `NEXT_PUBLIC_DEPLOY_ENV` | `dev` | Client-side env for UI badges/behaviors |

**Rule:** Always keep `NODE_ENV=production` in the container. Use `APP_ENV` to distinguish deployment environments.

---

## Compute

| Resource | Spec |
|----------|------|
| ECS Task CPU | 512 (.5 vCPU) |
| ECS Task Memory | 1024 MB |
| Container | app (Next.js 16.2.4) + ClamAV (sidecar, cpu=128, memory=256) |
| Desired count | 1 |
| Auto-scaling | CPU + Memory (target 70%/75%) |

---

## Data Layer

| Resource | Spec | Backup |
|----------|------|--------|
| RDS PostgreSQL | `db.t4g.micro`, 20GB gp3 | 1 day (pending maint window) |
| ElastiCache Redis | `cache.t4g.small`, 1 node | — |
| S3 (uploads) | Private, encrypted, versioned | Lifecycle: 365d expiration |
| S3 (static) | Public via CloudFront OAI, versioned | — |

---

## Backup Plan

| Rule | Schedule | Retention |
|------|----------|-----------|
| Daily | 02:00 UTC | 1 day |
| Weekly (Sunday) | 03:00 UTC | 4 days |
| Monthly (1st) | 04:00 UTC | 12 days |

---

## Smoke Tests (baseline 2026-07-08)

```bash
# Domain + TLS
curl -I https://dev.aqliya.com                # → 200

# Health
curl https://dev.aqliya.com/api/health         # → {"status":"ok","database":true}

# Auth pages
curl -o /dev/null -w '%{http_code}' https://dev.aqliya.com/login    # → 200
curl -o /dev/null -w '%{http_code}' https://dev.aqliya.com/signup   # → 200

# Public pages
curl -o /dev/null -w '%{http_code}' https://dev.aqliya.com/         # → 200

# Protected API
curl -o /dev/null -w '%{http_code}' https://dev.aqliya.com/api/metrics  # → 401 (expected)
```

---

## Architecture Decisions

1. **CloudFront WAF attachment** via `web_acl_id` in distribution — see `docs/adr/ADR-DEPLOY-001-CLOUDFRONT-WAF-ATTACHMENT.md`
2. **Domain delegation**: `dev.aqliya.com` is a subdomain with NS delegation in the `aqliya.com` zone
3. **Secrets resolution**: ECS task definition uses full secret ARN with random suffix via `data.aws_secretsmanager_secret`
4. **SSL mode**: `sslmode=no-verify` for dev (no CA bundle in Alpine)

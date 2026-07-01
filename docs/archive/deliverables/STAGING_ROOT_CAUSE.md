# Staging Root Cause

**Generated:** 2026-06-22  
**Method:** `scripts/platform/staging-probe.mjs`, `nslookup`, workflow/domain cross-check in repo.

---

## Probes Executed

| Host | DNS | HTTP |
|------|-----|------|
| `staging.aqliya.com` | **FAIL** — `getaddrinfo ENOTFOUND` | Not reached |
| `staging.aqliya.ai` | **FAIL** — `getaddrinfo ENOTFOUND` | Not reached |
| `dev.aqliya.com` | **FAIL** — `Non-existent domain` | Not reached |
| `aqliya.com` (control) | **OK** → `216.198.79.1` | **200** `/api/health` |

Tool: `node scripts/platform/staging-probe.mjs` (default host `staging.aqliya.com`).

---

## Classification

**Primary root cause: A) DNS**

No A/AAAA/CNAME records exist for staging hostnames in public DNS (resolver returned *Non-existent domain*).

**Contributing: F) Legacy / inconsistent documentation**

| Source | Staging hostname |
|--------|------------------|
| `infra/terraform/environments/staging/terraform.tfvars` | `staging.aqliya.com` |
| `.github/workflows/deploy.yml` post-deploy smoke | `https://staging.aqliya.com` |
| `.github/workflows/promote.yml` health check | `https://staging.aqliya.com` |
| `docker-compose.staging.yml` `NEXTAUTH_URL` | `https://staging.aqliya.ai` |
| `runbooks/staging-environment.md` | `staging.aqliya.ai` |

Two different legacy hostnames; **neither resolves**.

---

## Ruled Out (with current evidence)

| Option | Verdict | Reason |
|--------|---------|--------|
| B) Missing Project | Cannot confirm | No DNS → cannot reach any deployment |
| C) Missing Deployment | Cannot confirm | Same |
| D) SSL | N/A | TLS never attempted — DNS fails first |
| E) Wrong Domain | Partial | Ops docs split `.com` vs `.ai`; both dead in DNS |

---

## Impact

- `promote.yml` staging validation **will fail** at curl step.
- `deploy.yml` on `staging` branch post-deploy smoke targets dead URL.
- Remote tabletop / staging Exit Gate **not runnable** until DNS + deployment exist.

---

## Fix (execution steps)

1. **Decide canonical staging hostname** — align terraform (`staging.aqliya.com`), compose, runbooks to one FQDN.
2. **Create DNS record** — CNAME to Vercel (`cname.vercel-dns.com`) **or** ALB/CloudFront if using AWS path in `deploy.yml`.
3. **Attach domain** in Vercel project (if Vercel staging) or ALB listener (if ECS).
4. **Set env** — `NEXTAUTH_URL`, `DATABASE_URL` for staging DB (separate from production).
5. **Verify** — `STAGING_BASE_URL=https://<host> node scripts/platform/staging-probe.mjs` exit 0.

# Staging Forensics Report

**Generated:** 2026-06-23  
**Scope:** Phase G — findings only; no fixes attempted  
**Method:** DNS probes, repo config grep, workflow/terraform review

---

## 1. Where staging should be hosted

### Canonical (infrastructure-as-code)

| Source | Staging host | Platform |
|--------|--------------|----------|
| `infra/terraform/environments/staging/terraform.tfvars` | `staging.aqliya.com` | AWS ECS Fargate (me-south-1) |
| `.github/workflows/deploy.yml` L186 | `https://staging.aqliya.com` | Post-deploy smoke `BASE_URL` for non-`main` branch |
| `.github/workflows/promote.yml` | `https://staging.aqliya.com/api/health` | Promotion gate |
| `scripts/platform/staging-probe.mjs` | `staging.aqliya.com` (default) | Operator probe |
| `docs/operations/production-deployment-runbook.md` | `staging.aqliya.com` | Tier-3 smoke |

**Terraform staging intent:** ECS + RDS + S3 + Route53 for `staging.aqliya.com`.

### Production reality (live evidence)

| Host | DNS | Platform |
|------|-----|----------|
| `aqliya.com` | **RESOLVES** → `216.198.79.1` | **Vercel** (`server: Vercel`, health commit = HEAD) |
| `staging.aqliya.com` | **ENOTFOUND** | Not provisioned |
| `staging.aqliya.ai` | **ENOTFOUND** | Not provisioned |
| `dev.aqliya.com` | **ENOTFOUND** | Not provisioned |

**Finding:** Production migrated to Vercel; staging was designed for AWS ECS but **DNS was never provisioned** for canonical host.

---

## 2. Vercel project staging config

### `vercel.json` (repository)

```json
{
  "framework": "nextjs",
  "installCommand": "npm install --ignore-scripts",
  "buildCommand": "npx prisma generate && npm run build",
  "outputDirectory": ".next"
}
```

| Check | Result |
|-------|--------|
| Staging domain in `vercel.json` | **None** |
| Staging branch config in repo | **None** |
| Environment-specific Vercel config file | **Not found** in repository |

**Finding:** No repository evidence of Vercel staging domain binding. Vercel CLI not available on audit host — dashboard may have uncommitted preview/staging domains; repo alone shows production path only.

Production proof: `docs/deliverables/VERCEL_INFRA_AUDIT.md` — `aqliya.com` 200, commit sync.

---

## 3. ECS/AWS path — active or abandoned?

| Signal | Interpretation |
|--------|----------------|
| `infra/terraform/environments/staging/` exists with `domain_name = "staging.aqliya.com"` | **Designed, not proven live** |
| `.github/workflows/deploy.yml` triggers on `main` and `staging` branches | **Workflow active in repo** |
| Deploy requires `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY` | Prior audit: **fails without credentials** |
| Production serves from Vercel, not ECS | **ECS production path appears superseded for app traffic** |
| Terraform README documents staging apply commands | **Ops path documented, not verified deployed** |

**Finding:** AWS/ECS staging path is **configured in repo but not evidenced as live**. Production traffic is on Vercel. ECS deploy workflow is **latent / misaligned** with current production hosting.

---

## 4. Why both `staging.aqliya.com` and `staging.aqliya.ai`

### Domain migration context

`CLAUDE.md` / platform docs: production domain migrated from `aqliya.ai` → `aqliya.com` (2026-06-09).

### Reference map

| Host | Where referenced | Role |
|------|------------------|------|
| `staging.aqliya.com` | Terraform, deploy.yml, promote.yml, staging-probe, runbooks (newer) | **Canonical staging target** |
| `staging.aqliya.ai` | `docker-compose.staging.yml` L15 (`NEXTAUTH_URL`), `runbooks/staging-environment.md`, cycle-6 validation docs | **Legacy / local-docker staging label** |

### `docker-compose.staging.yml` (legacy drift)

```yaml
NEXTAUTH_URL=https://staging.aqliya.ai
DATABASE_URL=postgresql://postgres:postgres@db:5432/aqliya_staging
```

Local docker staging stack uses **`.ai`** while IaC and CI smoke use **`.com`**.

**Root cause:** Incomplete domain migration cleanup. `.com` is canonical for infra/CI; `.ai` persists in docker-compose and older operator docs.

---

## 5. Live DNS probe (2026-06-23)

```text
staging.aqliya.com FAIL ENOTFOUND
staging.aqliya.ai FAIL ENOTFOUND
dev.aqliya.com FAIL ENOTFOUND
aqliya.com OK 216.198.79.1
```

```text
node scripts/platform/staging-probe.mjs
→ DNS FAIL: staging.aqliya.com — getaddrinfo ENOTFOUND staging.aqliya.com
```

---

## 6. Staging state classification

| Criterion | Assessment |
|-----------|------------|
| DNS resolves | **NO** |
| HTTPS reachable | **NO** |
| Deploy pipeline target exists | **Partial** (workflows reference URL; infra not proven) |
| Config consistency | **NO** (.com vs .ai drift) |
| Production parity | **NO** (prod on Vercel; staging on neither Vercel nor ECS) |

**STAGING_STATE = NOT_PROVISIONED**

(Sub-class: **MISCONFIGURED** at repo level due to `.com`/`.ai` drift and dual AWS/Vercel paths, but primary blocker is **DNS/host not provisioned**.)

---

## 7. Findings summary (no fixes)

1. Staging was planned on **AWS ECS** at `staging.aqliya.com`; DNS never created.
2. **Production runs on Vercel** — staging was not mirrored to Vercel in repo config.
3. **Legacy `staging.aqliya.ai`** references remain in docker-compose and cycle-6 docs.
4. CI/deploy workflows still assume `https://staging.aqliya.com` for non-main smoke — will fail until DNS + deploy exist.
5. Local alternative documented: `docker-compose.staging-local.yml` / cycle-6 Docker on localhost — not remote staging.

---

## Recommended next actions (documentation only)

1. Decide single staging platform: **Vercel preview/staging project** vs **AWS ECS** (align with production).
2. Provision DNS `staging.aqliya.com` → chosen host.
3. Remove or update all `staging.aqliya.ai` references to canonical `.com`.
4. Run `migrate deploy` + `seed` on staging RDS before declaring staging live.

# CLAUDE.md

Operational context for Claude Cowork / Claude Code sessions in the AQLIYA repository.

## Primary Role

- OpenCode is the primary implementation environment for this repository.
- Claude is a secondary reviewer, analyst, and assistant unless the user explicitly instructs Claude to implement changes directly.
- Do not assume Claude should take over product ownership, architecture ownership, or broad refactors by default.

## Read Before Acting

Read these files in this order before analysis, editing, or review:

1. `docs/DOCUMENTATION_AUTHORITY.md`
2. `docs/official/AQLIYA_MASTER_REFERENCE.md`
3. `AGENTS.md`
4. `README.md`
5. `docs/official/aqliya-vision-v1.1.md`
6. `docs/official/aqliya-product-taxonomy-v1.1.md`
7. `docs/official/aqliya-implementation-rules-v1.1.md`
8. `docs/official/aqliya-agent-context-v1.1.md`
9. `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`
10. `docs/source-of-truth/ROUTE_STRATEGY.md`
11. `docs/source-of-truth/ROUTE_REGISTRY.md`
12. `docs/source-of-truth/READINESS_GATES.md`
13. `docs/operations/production-deployment-runbook.md`
14. `docs/operations/ha-dr-plan.md`
15. `infra/terraform/README.md`

If documentation conflicts:

- Use `docs/official/*` for identity, governance, trust principles, and strategic positioning.
- Use code reality, `AQLIYA_MASTER_REFERENCE.md`, `PRODUCT_STATUS_MATRIX.md`, and `ROUTE_STRATEGY.md` for implementation status and route reality.
- Do not silently invent a third interpretation.

## AQLIYA Identity

- AQLIYA is a **Private Governed Institutional Intelligence Platform**.
- Trust principle: **AI assists. Humans decide. Evidence governs.**
- AQLIYA is not AuditOS only, not SaaS only, not a generic chatbot, not a CRM, and not a collection of disconnected demos.
- **Production domain: `aqliya.com`** (migrated from `aqliya.ai` 2026-06-09).
- **Staging domain: `staging.aqliya.com`**.
- Cloud deployment is real (AWS ECS Fargate). Private / On-Prem and Air-Gapped are strategic directions, not implemented production packages.

## Product Taxonomy And Current Status

| Area                    | Classification          | Current Status                 | Boundary                                                      |
| ----------------------- | ----------------------- | ------------------------------ | ------------------------------------------------------------- |
| **AQLIYA**              | Platform/company        | Active platform                | Parent platform, not a single product                         |
| **AuditOS**             | Product                 | L5 pilot-ready                 | Governed audit workspace at `/audit/*`                        |
| **auditos demo**        | Demo                    | L1 public demo                 | Sanitized guided demo at `/auditos/*`                         |
| **DecisionOS**          | Adjacent product/system | L4 usable v0.1                 | Governed workspace at `/decisions/*`                          |
| **LocalContentOS**      | Product                 | L5 pilot-ready with conditions | Governed workspace at `/local-content/*`, ERP integration     |
| **Office AI Assistant** | Shared application      | L4 usable v0.1                 | Shared governed app at `/assistant/*`, not standalone product |
| **WorkflowOS**          | Custom/client workspace | L4→L5 partial                 | Governed workspace at `/workflowos/*`                         |
| **Sunbul**              | Legacy alias            | Redirect only                  | Redirect alias to WorkflowOS, not a separate product          |
| **SalesOS**             | Active prototype (L4+) | L4+ (prototype, 270 lib files, 82 components) | `/sales` workspace, documented schema drift R-04, not released |
| **RiskOS**              | Prototype (contradicts docs) | L2 routes exist         | `/risk/*` routes + middleware entry — contradicts "do not build" in AGENTS.md |
| **ContentStudio**       | Active surface          | L3 prototype                   | `/content-studio/*` workspace, undocumented in official taxonomy |
| **SimulationOS**        | Marketing label         | L1 marketing only              | Redirects to `/products`, not a standalone system             |
| **LocalContactOS**      | Governed workspace      | L4→L5 partial                 | `/contacts/*` with evidence, review, export                   |
| **SSO (SAML/OIDC)**     | Enterprise auth         | L4 usable v0.1                 | `/settings/sso`, provider CRUD, login buttons                 |
| **SCIM Provisioning**   | Identity management     | L4 usable v0.1                 | `/api/scim/v2/*`, API key auth, audit trail                   |
| **AQLIYA Studio**       | Strategic layer         | L0 future                      | Do not claim implemented                                      |

Keep these distinctions explicit. Do not collapse AQLIYA into AuditOS. Do not present SimulationOS, or AQLIYA Studio as implemented products.

## Route Boundaries

| Route | Type | Purpose |
|-------|------|---------|
| `/audit/*` | Protected | AuditOS governed workspace |
| `/auditos/*` | Public | Sanitized, mock-backed, read-only guided demo |
| `/decisions/*` | Protected | DecisionOS governed workspace |
| `/local-content/*` | Protected | LocalContentOS workspace (+ `/local-content/settings/integrations` for ERP) |
| `/assistant/*` | Protected | Office AI Assistant workspace |
| `/workflowos/*` | Protected | WorkflowOS governed workspace |
| `/sunbul/*` | Redirect | Redirect alias to `/workflowos/*` |
| `/contacts/*` | Protected | LocalContactOS workspace |
| `/sales/*` | Protected | SalesOS workspace (intelligence, forecast, pipeline, ICP, CRM settings) |
| `/risk/*` | Protected | RiskOS workspace (prototype, routes exist per middleware matcher) |
| `/content-studio/*` | Protected | Content Studio workspace |
| `/intelligence/*` | Protected | Intelligence Core workspace |
| `/governance-hub/*` | Protected | Governance Hub dashboard |
| `/operator/*` | Protected | Operator admin dashboard |
| `/(dashboard)/overview` | Protected | Platform overview dashboard |
| `/(dashboard)/notifications` | Protected | Platform notifications center |
| `/settings/sso` | Protected | SSO provider configuration UI |
| `/settings/audit-logs` | Protected | Platform audit log viewer |
| `/settings/platform-organization` | Protected | Platform organization admin |
| `/settings/workspaces` | Protected | Workspace admin |
| `/monitoring` | Protected | Platform monitoring dashboard |
| `/products/*` | Public | Marketing pages |
| `/insights/*` | Public | Blog/insights |
| `/buyers/*` | Public | Buyer persona pages |
| `/custom-product` | Public | Commercial funnel |
| `/api/scim/v2/*` | Protected | SCIM provisioning API (API key auth) |
| `/api/integration/*` | Protected | Integration APIs |
| `/api/custom-product-submit` | Public | Custom product inquiry API |
| `/api/pilot-review` | Public | Pilot review submission |
| `/api/sales/*` | Protected | SalesOS API (export) |
| `/api/notifications/*` | Protected | Platform notifications SSE stream |

Sensitive `/api/*` routes must remain permissioned. All protected routes are enforced by `src/middleware.ts` matcher + RBAC.

### Redirects (defined in `next.config.mjs`)
| From | To | Type |
|------|----|------|
| `/sunbul` | `/workflowos` | permanent |
| `/sunbul/admin` | `/workflowos/admin` | permanent |
| `/sunbul/clients/*/records/*` | `/workflowos/clients/*/records/*` | permanent |
| `/products/simulation` | `/products` | permanent |
| `/solutions` | `/products` | temporary |
| `/executive-briefing` | `/executive-brief` | permanent |
| `/decision` | `/decisions` | permanent |
| `/decision/gov` | `/decisions/gov` | permanent |
| `/decision/gov/:path*` | `/decisions/gov/:path*` | permanent |
| `/buyers/procurement` | `/procurement-pack` | permanent |

If route scope changes, update `docs/source-of-truth/ROUTE_STRATEGY.md` and `docs/source-of-truth/ROUTE_REGISTRY.md`. Preserve truthful status labels.

## Demo Vs Workspace Rules

- `/auditos/*` is the only intentionally public AuditOS route family.
- `/auditos/*` must stay sanitized, mock-only, read-only, and clearly labeled as a demo unless explicitly reclassified later.
- Do not use real customer data, uploads, mutations, exports, tenant state, or operational audit workflows on `/auditos/*`.
- Governed workspaces must be authenticated, permissioned, auditable, and scoped to the correct tenant or organization.
- Marketing pages must not imply that demos, prototypes, or future systems are live operational products.

## Deployment & Infrastructure

### Production Architecture
- **Cloud**: AWS (me-south-1 primary, eu-central-1 DR).
- **Compute**: ECS Fargate (3 tasks min, 10 max; 1 vCPU / 2 GB per task).
- **Database**: RDS PostgreSQL (Multi-AZ, deletion protection, 30-day backup retention, cross-region DR).
- **Cache**: ElastiCache Redis (caching, rate limiting, queues).
- **Storage**: S3 (uploads + static assets), CloudFront CDN.
- **Monitoring**: CloudWatch (logs, alarms), Sentry (error tracking).
- **Orchestration**: Terraform IaC at `infra/terraform/`.

### Deployment Pipeline (GitHub Actions — `.github/workflows/deploy.yml`)
1. **Test**: `npx tsc --noEmit` on push to `main` or `staging`.
2. **Terraform**: Init → Validate → Plan (artifact uploaded).
3. **Build & Push**: Docker multi-stage build → push to ECR.
4. **Deploy**: Terraform apply → ECS service update.
5. **Post-Deploy**: Comprehensive smoke test (`scripts/post-deploy-smoke.mjs`).

### Vercel (Alternative)
- Configured via `vercel.json` (standalone Next.js output).
- Build: `npx prisma generate && npm run build`.
- Excluded from build: `docs/`, `scripts/`, `runbooks/`, `backups/`, `infra/`, `cypress/`.

### Docker
- Multi-stage production build (`Dockerfile`).
- Output: Next.js standalone mode (`next.config.mjs` → `output: "standalone"`).
- Runs as unprivileged `nextjs` user.

### Security Headers
Configured in `next.config.mjs`:
- `Content-Security-Policy` (restrictive)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `poweredByHeader: false`

## Mandatory Development Rules

- Prefer the smallest correct change.
- Do not change application code, schema, routes, or infrastructure unless the task explicitly requires it.
- Do not change the Prisma schema unless an active concrete feature requires it and the user has asked for that scope.
- Do not refactor unrelated systems.
- Preserve tenant isolation, RBAC, audit trails, evidence linkage, and human review requirements.
- AI features must remain assistive only. No autonomous final decisions.
- Preserve Arabic-first, RTL-aware product behavior where relevant.
- Before changing Next.js code, check the relevant docs in `node_modules/next/dist/docs/` and verify server/client boundaries.
- Do not claim unimplemented capabilities as live.
- When changing infrastructure (`infra/terraform/`, `Dockerfile`, `vercel.json`, `.github/workflows/`), run `npx tsc --noEmit` and verify Terraform plan.
- When changing deployment configuration, update `docs/operations/production-deployment-runbook.md`.

## Low-Load Execution Protocol

Start with light context gathering only:

- `git status --short`
- `git log --oneline -10`
- `git diff --stat`
- targeted file reads and searches

Allowed light validation when relevant:

- `npx tsc --noEmit`
- targeted grep/read checks

Do not run heavy commands unless the user explicitly asks or clearly approves:

- `npm run build`
- `npm run lint`
- `npm test`
- `npm install <package>`
- `npx prisma generate`
- `npx prisma migrate dev`
- `terraform plan` / `terraform apply`

Never inspect or print secrets. Never use destructive git commands.

## Validation Policy

- For docs-only tasks, verify scope with file diff and status. Heavy validation is not required by default.
- For code tasks, run the minimum relevant validation and report exactly what was and was not run.
- For infrastructure tasks (`infra/terraform/`, `Dockerfile`, `deploy.yml`), validate with `npx tsc --noEmit` and `terraform validate` in the relevant directory.
- Never say validation passed unless the command actually ran.
- Never claim readiness levels above what the repo proves.

## Forbidden Behaviors

- Describing AQLIYA as AuditOS only, SaaS only, or a generic chatbot.
- Claiming SalesOS, LocalContactOS, or AQLIYA Studio as released production products when they are not.
- Claiming SimulationOS is a standalone product (marketing label only, redirects to `/products`).
- Claiming RiskOS is production-ready (routes exist but contradict "do not build" directive).
- Treating `/auditos/*` as a real workspace.
- Introducing real customer data or mutations into `/auditos/*` without explicit reclassification.
- Bypassing auth, RBAC, tenant isolation, audit logging, or review gates.
- Claiming On-Prem, Air-Gapped, Local AI runtime, SSO/LDAP/AD, SIEM, or Kubernetes are implemented without code proof.
- Making autonomous AI decisions or evidence-free final outputs.
- Refactoring unrelated code, changing schema speculatively, or hiding known limitations.

## Required Response Format After Any Task

Use this structure after analysis, review, or implementation:

```md
Status: DONE | DONE_WITH_CONCERNS | BLOCKED | NEEDS_CONTEXT

Summary

- ...

Files Changed

- `path` — what changed

Commands Run

- `command`

Code Changed

- Yes/No

Schema Changed

- Yes/No

Validation

- `command` — Pass/Fail/Not run

Risks / Limitations

- ...
```

When relevant, also state whether the work affected route status, product status, governance, docs authority, or infrastructure/deployment configuration.

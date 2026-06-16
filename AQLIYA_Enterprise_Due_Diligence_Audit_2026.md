# AQLIYA — ULTIMATE ENTERPRISE DUE DILIGENCE & STRATEGIC TRANSFORMATION AUDIT
### Full-Spectrum Assessment: Architecture · Security · AI · Governance · Acquisition Readiness
**Audit Date:** 2026-06-09 | **Repo HEAD:** `18366fc` | **Analyst Council:** Board · CTO · CISO · SRE · Investor · M&A · Compliance · AI Architect

---

> **FRAMING STATEMENT.** This audit was conducted by inspecting 1,581 TypeScript/TSX source files, 127 Prisma models, all infrastructure Terraform modules, all official documentation (15+ files across 8 hierarchy levels), GitHub Actions workflows, security audit reports, WIP cluster reports, build stabilization reports, and live `.env` configuration. Every finding is grounded in observed evidence. No assumptions of correctness have been made. This is not a friendly review — it is a stress-test from the perspective of an attacker, an acquirer, an enterprise CISO, and a regulator.

---

## PHASE 1 — EXECUTIVE ASSESSMENT

### Overall Score: **54 / 100**

| Dimension | Score | Verdict |
|-----------|-------|---------|
| Enterprise Readiness | 38/100 | Pre-pilot. Not enterprise-ready. |
| Production Readiness | 42/100 | L5 partial on one product (AuditOS). Not hardened. |
| Security Maturity | 41/100 | Structurally sound design; critical implementation gaps remain. |
| Compliance Maturity | 28/100 | No SOC2. No ISO27001. No external pen test. No GDPR DPA. |
| Architecture Maturity | 62/100 | Coherent platform design. Significant monolith risk. |
| AI Maturity | 55/100 | Good governance wrapper; fully cloud-dependent; no sovereign path. |
| Operational Maturity | 36/100 | No runbook drills. No automated backups. No on-call. |
| Scalability Maturity | 48/100 | Infrastructure design is sound; untested at any real load. |
| Commercial Readiness | 35/100 | One pilot-ready product. No customer contracts. No validated ICP. |
| Investment Readiness | 44/100 | Strong vision; insufficient traction and evidence of scale. |
| Acquisition Readiness | 40/100 | Interesting asset, but multiple deal-killers present. |

---

### TOP 25 STRENGTHS

1. **Documentation hierarchy is exceptional.** An 8-level authority system (`DOCUMENTATION_AUTHORITY.md` → official docs → source-of-truth → reports) with explicit conflict-resolution rules. Rare at this stage. Evidence: `docs/DOCUMENTATION_AUTHORITY.md`.
2. **Governance-first design philosophy is architecturally enforced.** "AI assists. Humans decide. Evidence governs." is not just a slogan — it is implemented via `requireHumanApproval`, `auditLogger`, `writeOutputAuditEvent`, and `AIOrchestrator` governance context injection.
3. **Multi-tenant isolation architecture is coherent.** `PlatformOrganization → Organization → ClientWorkspace → Project` hierarchy with `platformOrganizationId` FK chains and `requireOrgAccess` / `requireClientAccess` guards on server actions.
4. **AuditOS is genuinely pilot-ready.** Full engagement lifecycle (trial balance → mapping → statements → evidence vault → findings → review → approval → export) with audit trail, bilingual PDF/XLSX export, and a Go/No-Go decision process completed 2026-05-28.
5. **AI cost control is production-grade.** `budget-manager.ts` with per-tenant monthly spend/request/token caps, alert thresholds, and `checkBudgetQuota()` called before every generation. Evidence: `src/lib/ai/budget-manager.ts`.
6. **AI observability exists.** `src/lib/ai/observability.ts` with provider routing event logging, circuit breaker pattern (`provider-circuit-breaker.ts`), spend tracking, and `writePlatformAuditLog` after every generation.
7. **Arabic-first, RTL-aware implementation.** Arabic as first language (not translation layer), bilingual exports (Arabic PDF via `arabic-pdf-support.ts`), and Arabic validation rules. Rare competitive advantage in Gulf markets.
8. **Infrastructure design is enterprise-grade on paper.** CloudFront + WAFv2 + ALB + ECS Fargate spread across 3 AZs + RDS Multi-AZ + ElastiCache Redis + S3 + cross-region DR to eu-central-1. Terraform IaC. RTO < 30 min, RPO < 5 min documented.
9. **Provider abstraction layer is sovereign-AI-ready in structure.** `AIOrchestrator` abstracts over OpenAI, Anthropic, Cloud, Local, and Deterministic providers. The architecture supports swapping providers — the local implementation is a stub but the interface exists.
10. **Evidence chain is end-to-end traceable.** Evidence upload → storage key → `AuditEvidence` model → `createdById` → `AuditEvent` log → review assignment → approval gate → export with audit trail. No AI output can bypass this chain.
11. **Readiness gates are documented and honest.** The `READINESS_GATES.md` file explicitly distinguishes Internal Reviewable / Demo Ready / Pilot Ready / Commercial Ready with blockers stated for each tier. No false claims.
12. **Product status matrix is truthful.** `PRODUCT_STATUS_MATRIX.md` accurately labels L0/L1/L3/L4/L5 for each product. "Do not claim as live" and "Do not show as implemented" labels are applied where warranted.
13. **Security headers are implemented (post-fix).** `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `poweredByHeader: false`, and a CSP are in `next.config.mjs`. Evidence: `next.config.mjs` headers config.
14. **Docker is production-hardened in structure.** Multi-stage build, unprivileged `nextjs:1001` user, `NODE_ENV=production`, standalone Next.js output, no development dependencies in runner stage.
15. **Rate limiting exists (post P0 fix).** Memory-based rate limiter at Edge via `rate-limit-edge.ts`, Redis-based on server-only paths. Middleware is active. Evidence: `src/middleware.ts`, `src/middleware-rate-limit.ts`.
16. **MFA is architecturally supported.** `isMFARequiredForRoleName`, `/settings/mfa` route, MFA exemption prefix list in middleware. TOTP/MFA verification flow at `/api/auth/mfa/verify`.
17. **SCIM v2 provisioning is implemented (L4).** Full `/api/scim/v2/Users` and `/api/scim/v2/Groups` with API key auth and `ScimProvisioningEvent` audit trail. Evidence: `PRODUCT_STATUS_MATRIX.md` SCIM row.
18. **SSO (SAML/OIDC) is implemented (L4).** OAuth providers (Google, GitHub, Azure AD, Okta, Custom OIDC) + SAML via PrismaAdapter. Provider CRUD at `/settings/sso`. Evidence: `auth-config.ts`, `.env.example`.
19. **ERP and CRM connector interfaces are built.** SAP/Oracle/CSV ERP importers (`LC-08`), HubSpot/Salesforce CRM connectors (`S7-03`), field mapping and sync orchestrator. Not production but interfaces are real.
20. **Husky + lint-staged are configured.** Pre-commit hooks prevent committing code without lint check. Evidence: `.husky/` directory.
21. **pgvector RAG with JSON fallback.** Embedding vectors stored as `Unsupported("vector(1536)")` with `embeddingJson` fallback, `isPgvectorAvailable()` runtime check. Similarity search degrades gracefully.
22. **Sector intelligence is implemented.** `DecisionOS` has sector benchmark patterns, `/intelligence/sectors/[id]` route, cross-product signals, connected to real governance context (2026-06-02 milestone).
23. **Export gating is enforced.** Evidence exports require `OUTPUT_PUBLISHED` audit event and `OPERATOR` role. WorkflowOS exports require approval. LocalContentOS Arabic PDF requires review. No ungated export paths found.
24. **The vision is coherent and differentiating.** "Private Governed Institutional Intelligence" targeting regulated industries with governance-first, evidence-based, Arabic-first positioning is a genuine white space, not a commodity play.
25. **Domain migration was executed cleanly.** aqliya.ai → aqliya.com migration completed 2026-06-09 with documentation update, route strategy update, and master reference update in a coordinated pass.

---

### TOP 25 WEAKNESSES

1. **CSP is critically weak.** `unsafe-inline` and `unsafe-eval` in the Content-Security-Policy negate XSS protection entirely. Evidence: `next.config.mjs` headers config. An attacker who achieves DOM injection can execute arbitrary scripts.
2. **No HSTS header anywhere.** HTTP Strict Transport Security is absent from `next.config.mjs` headers. Any downgrade attack or HTTP interception is possible before first HTTPS redirect. Evidence: `next.config.mjs` — no `Strict-Transport-Security` entry.
3. **X-Frame-Options is SAMEORIGIN, not DENY.** For a B2B governance platform with no legitimate cross-origin framing use case, SAMEORIGIN creates unnecessary clickjacking risk. Evidence: `next.config.mjs`.
4. **No automated backup with tested restore.** `READINESS_GATES.md` explicitly lists "Backup not automated (manual only)" as a Pilot-ready blocker. No restore drill has been executed. Evidence: `READINESS_GATES.md`.
5. **No external penetration test has been conducted.** `READINESS_GATES.md`: "No external penetration test executed." Internal security audit exists but has acknowledged gaps. Evidence: `READINESS_GATES.md`, `SECURITY_AUDIT_2026-05-23.md`.
6. **SalesOS has significant uncommitted TypeScript errors.** `.salesos-ts-errors.txt` contains 40+ TypeScript errors in vnext Sales components (`property does not exist`, `missing required properties`, `module not found`). These are not build-blocking currently (using `--ts-nocheck` on v02 archive) but indicate deep design drift.
7. **524 uncommitted WIP paths in the working tree.** `WIP_CLUSTER_REPORT.md` documents 524 uncommitted paths (+4,891/−10,648 lines), including 272 SalesOS paths and overlays on committed production files (`audit-actions.ts`, `localcontent-actions.ts`). Any accidental merge would destabilize main.
8. **Rate limiting is per-instance, not global.** Middleware uses in-memory rate limiter. In ECS Fargate with 3+ tasks, each instance has an independent counter. A distributed attacker gets 60 × N req/min per IP where N = task count. Evidence: `BUILD_STABILIZATION_REPORT.md` Risk Areas.
9. **ESLint CI bypass is active.** Commit `6a6ce42`: "CI — إزالة eslint من CI مؤقتاً (13k pre-existing errors)". ESLint is run with `--quiet` (suppressing 158 warnings). CI does not enforce lint quality. Evidence: git log.
10. **npm test was removed from CI temporarily.** Commit `393deb2`: "CI — إزالة npm test من deploy مؤقتاً (1 pre-existing fail)". Tests are not enforced in the deployment pipeline. Evidence: git log, `.github/workflows/deploy.yml` — no `npm test` step.
11. **`.env` file is present in repository root** with what appears to be a real AUTH_SECRET (`SWPbmu3Vn4pYC0wUo+O2GpHXCIwaG2K6GMnV68spl8o=`) and `SCIM_API_KEY=test-scim-key-123`. `.gitignore` excludes `.env` but the file is physically present and accessible. Evidence: `.env` file read.
12. **SMTP_FROM is hardcoded to old domain.** `SMTP_FROM=noreply@aqliya.ai` in `.env.example` — the old domain post migration. Outbound notification emails will misrepresent the sender. Evidence: `.env.example`.
13. **Local AI provider is a permanent stub.** `LocalAIProvider.execute()` always throws: "Local AI is not implemented." The sovereign AI claim is architecturally possible but operationally zero. Evidence: `src/lib/ai/providers/local-provider.ts`.
14. **No blue/green or canary deployment.** ECS service uses `rolling update` with 100% min health. There is no blue/green, canary, or feature-flag-controlled rollout. Any bad deployment affects all traffic. Evidence: `infra/terraform/modules/compute/main.tf`.
15. **ECR image tags are MUTABLE.** `image_tag_mutability = "MUTABLE"` means tags (including `latest`) can be overwritten. Supply chain attacks or accidental tag collision can deploy wrong images silently. Evidence: `infra/terraform/modules/compute/main.tf`.
16. **No Permissions-Policy header.** Browser permissions (camera, microphone, geolocation) are not explicitly restricted. Evidence: `next.config.mjs` — no `Permissions-Policy` entry.
17. **`middleware.ts` (now proxy) deprecation unresolved.** Build log shows: `The "middleware" file convention is deprecated. Please use "proxy" instead.` (Next.js 16). Not currently breaking but will break in a future Next.js upgrade. Evidence: `BUILD_FAILURE_MATRIX.md` P3-001.
18. **Test suite relies on mocked Prisma.** Jest `moduleNameMapper` replaces `@prisma/client` with `src/__mocks__/prisma-client-mock.js`. No integration tests run against a real database in CI. Previous security audit explicitly flagged this. Evidence: `jest.config.js`.
19. **SalesOS phantom module history reveals design instability.** The "SalesOS Phantom Imports Gate" (2026-06-02) required creating 21 missing platform modules across 8 domains to make the build pass. 36 phantom imports existed in production code. This indicates the SalesOS architecture was never validated before being committed. Evidence: `PRODUCT_STATUS_MATRIX.md` Reality Notes.
20. **On-Prem/Air-Gapped are marketed on the website but not implemented.** `/deployment` page and multiple docs reference Cloud/Private/Air-Gapped models. The implementation reality is cloud-only. Any enterprise buyer evaluating on-prem deployment will discover this gap during technical due diligence.
21. **No Kubernetes support.** Explicitly noted as "not implemented" in `AQLIYA_MASTER_REFERENCE.md §9`. Most large enterprise and government IT departments require Kubernetes for standardized container management.
22. **AI provider API keys are a single point of configuration failure.** If `AI_CLOUD_API_KEY` is invalid or exhausted, all AI features silently fall back to the deterministic provider with no user notification. Budget monitoring works post-call, not as a pre-flight check. Evidence: `src/lib/ai/orchestrator.ts`.
23. **Terraform plans are never applied in CI.** `deploy.yml` runs `terraform plan` and uploads the artifact, then runs `terraform apply` in a subsequent job — but the apply job downloads the plan and applies it without a human approval gate. Any Terraform drift causes unreviewed infrastructure changes on push to main.
24. **`next.config.mjs` wraps Sentry with a try/catch fallback.** Sentry SDK import is wrapped in a try/catch that silently degrades to `(config) => config` if import fails. This means error monitoring could silently fail without any alert. Evidence: `next.config.mjs`.
25. **No Subresource Integrity (SRI) for third-party scripts.** No SRI hashes are present in the application. Combined with `unsafe-inline` in CSP, any CDN-delivered third-party script is trusted without verification.

---

### TOP 25 RISKS

1. **CRITICAL — CSP `unsafe-eval` + `unsafe-inline` allows full XSS.** Any XSS payload can execute arbitrary JavaScript. For a platform processing financial audit data, this is a complete confidentiality/integrity breach. Risk: CRITICAL.
2. **HIGH — SCIM API key in `.env` file.** `SCIM_API_KEY=test-scim-key-123` in committed `.env` suggests test credentials may be promoted to staging/production. SCIM controls user provisioning — a leaked key grants attacker full user management. Risk: HIGH.
3. **HIGH — No external pen test on a platform targeting regulated industries.** Any Big Four firm, government agency, or financial institution will require a CREST/OSCP-certified penetration test report as a procurement condition. Absence is a hard blocker for enterprise sales.
4. **HIGH — Rate limiting not globally coordinated.** Multi-instance deployment with per-process memory rate limiting means DDoS/brute-force attacks are only partially mitigated. API authentication endpoints are most exposed.
5. **HIGH — 524 uncommitted WIP paths with overlays on committed production files.** Accidental `git add .` or merge of the working tree would corrupt committed baselines for AuditOS and LocalContentOS server actions. Risk of silent regression on L5 products.
6. **HIGH — No runbook drill or DR test has been executed.** HA/DR plan documents RTO < 30 min but has never been tested. First time it is tested may be during an actual incident in production with real customer data.
7. **HIGH — AI provider fallback to deterministic is silent.** If real AI is configured but fails mid-engagement, outputs silently degrade to rule-based placeholders. Users may not know their "AI review" is actually a template. No explicit degradation indicator in UI. Risk: HIGH for trust/governance.
8. **MEDIUM — Mutable ECR image tags enable supply chain attack.** `latest` tag can be overwritten. If ECR credentials are compromised, an attacker can replace the production image.
9. **MEDIUM — No HSTS.** First-time visitors connecting over HTTP will not be automatically upgraded before the server sends a redirect. Man-in-the-middle attacks possible on initial connection.
10. **MEDIUM — Terraform apply without human approval gate.** Infrastructure changes go live on push to `main` after a `terraform plan` artifact. A misconfigured Terraform change that passes `validate` and `plan` will be applied automatically.
11. **MEDIUM — Tests excluded from deployment CI.** `npm test` removal from deploy workflow means tests are not enforced before production deployment. A regression can be deployed undetected.
12. **MEDIUM — SalesOS vnext code has 40+ TypeScript errors.** Though currently not in the build path, this code is in the active working tree. Future promotion without a full type-check pass will break the build.
13. **MEDIUM — pgvector is not in the standard schema.** `embedding Unsupported("vector(1536)")` requires pgvector PostgreSQL extension. Standard RDS PostgreSQL does not have pgvector pre-installed. Enabling it requires a reboot and parameter group change not documented in the Terraform modules.
14. **MEDIUM — Sentry SDK import failure is silent.** If Sentry fails to load in production, errors are not monitored and the failure itself is invisible. Could result in a production incident going undetected.
15. **MEDIUM — `SMTP_FROM` hardcoded to old domain.** Email notifications sent from `noreply@aqliya.ai` after migration to aqliya.com will trigger DMARC/SPF failures and appear suspicious to recipients.
16. **MEDIUM — No audit log tamper detection.** `AuditEvent` records are stored in the application database. A compromised application layer can modify or delete audit records. No write-once or append-only audit store (e.g., AWS CloudTrail, separate WORM storage) is implemented.
17. **MEDIUM — No data classification or DLP.** Evidence files uploaded to S3/local storage are not classified, scanned for sensitive data, or protected by field-level encryption. A compromised storage layer exposes all evidence.
18. **MEDIUM — No formal incident response process.** No SIEM, no alert routing, no on-call rotation, no incident commander designation. CloudWatch alarms exist but no human workflow is documented for incident response.
19. **LOW-MEDIUM — pgvector JSON fallback for similarity search.** Without pgvector, the RAG capability degrades to application-level filtering with `embeddingJson`. This is not semantically equivalent — query quality drops significantly.
20. **LOW-MEDIUM — SalesOS CRM connector is types+interface only.** Marketed as a CRM sync capability but the implementation is an interface facade with no real HubSpot/Salesforce API calls. If a customer discovers this, it is a trust issue.
21. **LOW — Prisma migration safety.** `migrate deploy` is recommended in the runbook, but CI does not run migrations automatically. Manual migration step creates a window where the code is ahead of the schema (or vice versa) in production.
22. **LOW — `dotenv/config` imported in `auth-config.ts`.** Server-side config imports dotenv which reads `.env` from disk. In containerized environments where env is injected via ECS task definitions, this creates a potential precedence conflict.
23. **LOW — Cypress E2E tests require MFA bypass env flag.** `760b789` shows Cypress needed a special `MFA e2e mode` for sampling tests. Any testing-specific auth bypass in a shared codebase is a risk surface if the flag leaks to production.
24. **LOW — `AuthSecret` length minimum not enforced at runtime.** While `validate-env.mjs` likely checks for it, the Docker build-time placeholder `build-time-placeholder-minimum-32-characters` is exactly 32 chars and would pass length validation. Placeholder promotion is a plausible ops error.
25. **LOW — No key rotation policy enforced.** `PlatformSecret` model has `rotationPeriodDays` and `lastRotatedAt` fields, but no automated rotation trigger or alert is wired up. Secret rotation is aspirational, not operational.

---

### TOP 25 OPPORTUNITIES

1. **Category creation: "Institutional Operating System."** AQLIYA has an opportunity to own the category of governed AI for regulated industries in MENA and beyond. No direct competitor holds this positioning today.
2. **Big Four regional partnerships.** The audit product positioning maps directly to the digital transformation agendas of Deloitte, PwC, EY, and KPMG in Saudi Arabia and the Gulf. A reseller or white-label arrangement with one Big Four firm would transform the commercial trajectory.
3. **Saudi Vision 2030 alignment.** Local content compliance (LocalContentOS) and governance-first AI directly serve Vision 2030 mandates. Government procurement channels are an underexplored revenue stream.
4. **On-Prem/Air-Gapped as a true differentiator.** If the sovereign AI roadmap is executed, AQLIYA becomes the only platform in its category that can run in a classified government network with no external API calls. This is a moat that no SaaS-first competitor can replicate quickly.
5. **Arabic-first is a genuine moat.** No major audit software (AuditBoard, Workiva, CaseWare) has Arabic as a first-class language. The Arabic legal/regulatory domain (IFRS for SMEs, ZATCA, Saudi Companies Law) is an underserved compliance intelligence layer.
6. **Evidence Graph as strategic asset.** The evidence linking chain (finding → evidence → source → audit event → approver) is a traversable knowledge graph that competitors lack. This could become a basis for institutional memory and cross-engagement intelligence.
7. **ERP Integration (LC-08) opens procurement/supply chain market.** LocalContentOS with SAP/Oracle ERP integration targets a large underserved market in government procurement compliance and local content reporting.
8. **SOC2 Type II certification path.** The platform's audit trail, governance controls, and RBAC architecture provide a strong foundation for SOC2 Type II. Certification would unlock enterprise and government procurement. The `/soc2-roadmap` page shows customer-facing honesty about this gap — closing it converts a weakness into a trust signal.
9. **Multi-product expansion from shared governance core.** The platform-first architecture (AQLIYA Intelligence Core) allows launching RiskOS, ComplianceOS, LegalOS, and GovOS rapidly once the core is proven. Each product shares auth, audit logs, RBAC, AI governance, and exports.
10. **Deterministic provider enables fully offline demo and PoC.** No AI keys needed for a convincing demo. This dramatically reduces friction in regulated-industry sales cycles where AI provider due diligence would otherwise be a blocker.
11. **pgvector + Institutional Memory.** Once implemented, cross-engagement institutional memory (precedents, findings, patterns) creates a compound data moat that improves with each engagement.
12. **Bilingual export + IFRS/local standards.** Arabic PDF export for financial statements and audit reports is a product differentiation no SaaS competitor has built for MENA. Expanding to GCC accounting standards (GASB, SOCPA) would deepen the moat.
13. **Pilot framework as a sales asset.** The `/pilot-proof` page with 28 evaluation criteria and `/pilot-outcomes` page is a sophisticated enterprise procurement enablement tool. Formalizing a paid pilot program with a clear 90-day success framework would accelerate conversion.
14. **WorkflowOS as a platform extensibility product.** The governed workflow platform (WorkflowOS) could be positioned as a low-code governed workflow builder for custom institutional use cases — competing with ServiceNow/Pega at a fraction of the cost in the MENA market.
15. **AI budget management as a compliance feature.** Per-tenant AI spend caps, token quotas, and alert thresholds are exactly what a CFO wants when approving AI tools. This should be a front-page feature in enterprise sales decks.
16. **Sector intelligence as a data network effect.** DecisionOS sector benchmarks and patterns become more valuable as more clients use the platform. First-mover advantage in a sector creates a defensible data network effect.
17. **Procurement pack as a deal accelerator.** `/procurement-pack` (DPA, residency, SOW, security brief) is already a deal accelerator. Adding a pre-filled security questionnaire (CAIQ, SIG Lite) would eliminate a 4-6 week bottleneck in enterprise procurement.
18. **Platform-first repositioning (just completed) is strategically correct.** The June 2026 repositioning from "product company" to "institutional operating platform" is the right strategic move at this stage. It enables land-and-expand instead of product-by-product sales.
19. **Modular pricing model.** The platform architecture supports per-module/per-OS pricing. An "Intelligence Core + AuditOS" base with add-on LocalContentOS, DecisionOS, and WorkflowOS creates a natural expansion revenue model.
20. **Government air-gapped market.** If On-Prem/Air-Gapped delivery is executed with local AI, AQLIYA becomes directly addressable to the Saudi intelligence/defense/classified government market — a sector with enormous budgets and no credible local alternative.
21. **OpenCode agents as a delivery accelerator.** The `.opencode/agents/` directory shows a multi-agent development system already in use. This is a form of AI-assisted platform development that could be productized as AQLIYA Studio — the builder for custom institutional OS deployments.
22. **Acquisition target for Oracle, SAP, or ServiceNow.** The governance-first institutional AI stack, Arabic-first implementation, and MENA regional coverage are strategic assets that Oracle (NetSuite/Fusion MENA), SAP, or ServiceNow could acquire to enter the Gulf governance market.
23. **Compliance automation as a new revenue stream.** ZATCA (Saudi e-invoicing), NCA ECC (Saudi cybersecurity), and PDPL (Saudi personal data protection) compliance automation layers on top of the existing platform could generate standalone product revenue.
24. **Diagnostic-first sales model.** The "احجز جلسة تشخيص" (Book a Diagnostic Session) CTA is a high-conviction enterprise sales motion. A formal diagnostic-to-pilot-to-deploy funnel with published pricing would reduce sales cycle length.
25. **Open-source governance framework.** Open-sourcing the `GovernanceEngine` and `AuditTrail` core while keeping the specialized OS products proprietary would drive developer adoption, third-party integrations, and academic credibility — a long-term brand moat.

---

## PHASE 2 — VISION, MISSION & STRATEGY REVIEW

### Vision Coherence: STRONG (with execution risk)

**Mission:** "Give institutions governed intelligence that runs on their data, within their environment, under their permissions, evidence rules, and audit controls."

**Verdict:** The vision is **coherent, specific, and differentiated.** It is not "AI for enterprise" — it is specifically "governed AI for regulated institutional workflows." This is a defensible niche.

**Strategic coherence assessment:**

The vision claims four pillars: governance-first, evidence-based, Arabic-first, and sovereign/private deployment. The code delivers on the first three. The fourth (sovereign deployment) is architecturally aspired but functionally unimplemented. This is the primary vision-execution gap.

**Contradictions identified:**

1. **Sovereign AI is marketed, not built.** The `/deployment` page and docs reference "Private / On-Prem" and "Air-Gapped" models. The `LocalAIProvider` always throws. The gap between marketing claim and code reality is material.

2. **Platform-first positioning was just established.** The June 2026 repositioning is correct but very recent. Marketing content, product naming, and internal code (`PRODUCTS_KEY` enum, product-centric route naming) still reflect the old paradigm. There is documentation authority for the new position but incomplete execution.

3. **SalesOS is marketed on the website (`/products/sales`) but is a prototype.** The product reference page for SalesOS implies a real product. The actual implementation is an L3 prototype with 40+ TypeScript errors in vnext code. This is a gap between marketing reality and code reality.

4. **SimulationOS is named but redirects to `/products`.** Listing it as a product without any implementation creates market confusion about platform breadth.

**Execution alignment:** The roadmap phases (0-10 completed through June 2026) show disciplined execution. Each phase is tagged, documented, and validated. The issue is that the roadmap has prioritized breadth (many L4 products) over depth (one L6 product). An investor will challenge this.

---

## PHASE 3 — EXISTENTIAL REVIEW

### Why should this platform exist?

Legitimate answer: Regulated institutions in the Arab world are being forced to adopt AI but have no governed, evidence-based, bilingual platform that respects their compliance requirements. AQLIYA fills this gap. The gap is real. The need is validated by ZATCA, Vision 2030, and Big Four digital transformation mandates.

### What would make it obsolete?

- **Workiva launches an Arabic UI with MENA compliance modules.** Workiva has the distribution, the Big Four relationships, and the capital. A localization investment would directly threaten AuditOS.
- **Microsoft Copilot for Finance goes deep on Arabic + GCC compliance.** Microsoft's relationship with Saudi government and enterprise is extensive. An Azure-native governance layer with Arabic support would commoditize the underlying workflow.
- **OpenAI/Anthropic builds native document governance.** If foundational AI providers build document-level provenance, audit trails, and approval workflows into their platforms, the governance wrapper becomes less differentiated.

### What would kill it within 3 years?

1. A competitor with a Big Four distribution partnership launches an Arabic-first audit product.
2. No progress on sovereign/local AI delivery — enterprise customers start requiring on-prem and AQLIYA cannot deliver.
3. A security breach before SOC2 is achieved — destroys trust in a trust-dependent market.
4. Founder dependency becomes a bus factor — platform knowledge is concentrated in one or two individuals.
5. SalesOS and the broader platform suite never reach L5 — AQLIYA remains a one-product company (AuditOS) with a large brand claim.

### What would kill it within 10 years?

1. Commoditization of governed AI workflows by hyperscalers.
2. Failure to build institutional memory and data network effects — the evidence graph never becomes a learning asset.
3. Remaining in MENA only — the governance platform category requires global scale to attract the enterprise deals that justify the infrastructure investment.
4. Technical debt accumulates until the monolith cannot be refactored without a rewrite.

### What parts could AI commoditize?

- Standard audit workflow (trial balance → statements → finding drafting) — commoditizable by general-purpose AI in 3-5 years.
- Document intelligence and evidence review — already being built by multiple vendors.
- Boilerplate governance wrappers (RBAC, audit logs, approval flows) — commoditizable via platform services.

### What parts create lasting value?

- **Arabic-first institutional knowledge graph** with domain-specific vocabulary, regulatory terminology, and GCC compliance ontology.
- **Evidence chain with institutional memory** — cross-engagement learning from real audit outcomes.
- **Relationships with Big Four and government in MENA** — distribution moat, not technology moat.
- **Certifications** (SOC2, ISO 27001, NCA ECC) — compliance moat that takes 18+ months to replicate.

### Existential Risk Register

| Risk | Probability | Severity | Survival Strategy |
|------|------------|----------|-------------------|
| Workiva/AuditBoard Arabic launch | Medium (3yr) | Critical | Deepen Arabic regulatory intelligence moat; certify before they do |
| Microsoft Copilot GCC compliance | Medium (3-5yr) | High | Partner or vertical specialization in gov/regulated sectors |
| Security breach pre-SOC2 | Low-Medium | Critical | Accelerate pen test, SOC2, and security hardening immediately |
| Founder dependency failure | Medium | High | Document platform knowledge, build engineering team, formalize processes |
| SalesOS never reaches L5 | High | Medium | Deprioritize SalesOS; focus on AuditOS + LocalContentOS depth |
| Capital runs out before traction | Unknown | Critical | Validate one paying pilot customer first; derisk fundraise |

---

## PHASE 4 — CATEGORY CREATION ANALYSIS

### What is this platform REALLY?

Current category (self-defined): "Private Governed Institutional Intelligence Platform."
Current category (market perception): "Arabic audit software startup."
True category (structural): **Institutional Compliance Operating System.**

AQLIYA is building the operating layer through which regulated Arab institutions will run AI-assisted governance workflows. The analogy is ServiceNow for institutional governance in the Arab world — but with a governance-first, evidence-based design philosophy.

### Category Strategy

| Stage | Category | Leadership Potential |
|-------|----------|---------------------|
| Now (2026) | Arabic Audit AI | #1 in a near-empty category |
| 2027-2028 | Institutional Governance OS for MENA | Plausible #1 with 2-3 paying enterprise clients |
| 2029-2030 | Governed Enterprise AI Platform | Competitive against ServiceNow/Oracle in MENA; requires capital |
| 2032+ | Sovereign AI Operating System (if on-prem delivered) | Unique global position |

**Category creation requires:** One high-profile Big Four or Saudi government reference customer, published case study, a SOC2 Type II certificate, and an Arabic-language category narrative.

---

## PHASE 5 — BUSINESS MODEL ANALYSIS

### ICP Assessment

**Documented ICP:** Audit firms (Big Four affiliates), government agencies, large enterprises in KSA/Gulf.

**Evidence of validation:** No confirmed paying customers are referenced in any documentation. The "pilot outcomes" page is explicitly labeled as a placeholder "until ≥2 completed pilots." The `/engagement-models` page describes pricing bands but no actual customer has been disclosed.

**Revenue model:** Not publicly defined in documentation. Implied: diagnostic session → paid pilot → deployment license. No recurring revenue, usage-based pricing, or seat-based pricing model is formalized in the codebase or documentation.

**ICP weaknesses:**
- Government procurement cycles are 12-24 months minimum.
- Big Four have proprietary tool preferences and significant internal IT governance to navigate.
- Mid-size audit firms may be an underexplored faster-moving segment.

**Business model risks:**
- Professional services-heavy model (diagnostic → pilot) is not scalable.
- No self-serve onboarding path — every customer requires manual setup.
- No documented customer acquisition cost or LTV framework.
- Pricing tied to regulatory complexity (ZATCA, Vision 2030) creates geographic concentration risk.

**Revenue opportunities not currently pursued:**
- Marketplace of compliance templates (IFRS, GASB, SOCPA).
- Training and certification programs for Arab auditors on AI-assisted audit.
- White-label/OEM partnerships with regional accounting software vendors.

---

## PHASE 6 — PRODUCT ASSESSMENT

### Product Hierarchy

| Product | Maturity | Commercial Status | Honest Assessment |
|---------|----------|-------------------|-------------------|
| AuditOS | L5 (Conditional GO) | Demo-safe, pilot-candidate | Genuine product. Full workflow. Needs L6 hardening. |
| LocalContentOS | L5 (with conditions) | Demo-safe with explanation | Strong second product. ERP integration is interface-only. |
| DecisionOS | L4 | Demo-safe with explanation | Functional but missing export approval gates. |
| WorkflowOS | L4→L5 partial | Internal demo | Solid governed workspace foundation. |
| Office AI Assistant | L4 | Demo-safe with explanation | Useful shared app. Not a standalone product. |
| SalesOS | L3 | Internal demo only | Prototype with significant TypeScript errors. Not demo-ready externally. |
| SimulationOS | L1 | Do not show | Marketing label. Redirects to /products. |
| LocalContactOS | L4→L5 partial | Internal only | Reasonable governed contacts workspace. |

**Missing capabilities (critical for enterprise):**
- No two-factor authentication enforcement across all workspace sessions (MFA is configured but not universally enforced).
- No data export/deletion capability for GDPR right-to-erasure.
- No self-service onboarding or tenant provisioning.
- No in-app support, ticketing, or escalation workflow.
- No API documentation for enterprise integration (no OpenAPI/Swagger spec).
- No webhook system for external system notifications.
- No mobile-responsive design documented.

**Redundant/overlapping capabilities:**
- WorkflowOS and SalesOS share governance patterns but have separate implementations — duplication risk.
- Multiple export mechanisms (pdfkit, xlsx, PDF API routes) with no shared export service abstraction.

---

## PHASE 7 — PLATFORM ARCHITECTURE ASSESSMENT

### Is this truly a platform?

**Verdict: Architecture says yes. Implementation says partially.**

The taxonomy is clear: `AQLIYA Intelligence Core` provides shared services (AI Orchestration, Governance Engine, Workflow Engine, Evidence Graph, RBAC, Audit Logs, Document Intelligence, Reporting Engine, Deployment Layer). Products are built on top.

**Evidence of real platform-ness:**
- `PlatformOrganization` model bridges all product workspaces.
- `ClientWorkspace` with `workspaceType` enum hosts multiple product contexts.
- `writePlatformAuditLog` is used across all products.
- `AIOrchestrator` is shared across AuditOS, DecisionOS, and LocalContentOS.
- `StorageProvider` abstraction (`local` / `s3`) is used platform-wide.

**What remains application-centric:**
- SalesOS has its own parallel Prisma models, service layer, and type definitions that diverge from the platform core.
- LocalContactOS is partially isolated from the main workspace hierarchy.
- Export engines are product-specific (audit PDF ≠ localcontent PDF ≠ decision PDF) with no shared export service.
- The `src/lib/` directory has product-specific subdirectories (`audit/`, `sales/`, `local-content/`) that don't consistently use shared platform services.

**What must be transformed:**
- Unified export service (shared PDF/XLSX rendering pipeline with product-specific templates).
- Cross-product notification service (currently product-specific).
- Centralized API gateway for external integrations (currently ad hoc route handlers).
- Plugin/extension system for WorkflowOS custom workflows (currently hardcoded).

---

## PHASE 8 — SOURCE CODE AUDIT

### Code Quality Summary

| Dimension | Assessment | Evidence |
|-----------|------------|---------|
| Type safety | Good baseline; 40+ errors in SalesOS vnext | `.salesos-ts-errors.txt` |
| Test coverage | Partial; mocked Prisma; no integration tests in CI | `jest.config.js`, CI workflow |
| ESLint compliance | 158 warnings suppressed; some bypassed in CI | `BUILD_FAILURE_MATRIX.md` |
| Module boundaries | Good separation in lib/; SalesOS drift | `src/lib/` structure |
| Server/client boundary | Generally respected; some risk areas | Next.js middleware deprecation |
| Error handling | Server actions use `try/catch`; some silent failures | `orchestrator.ts` Sentry |
| Code comments | High quality in governance/AI layer; sparse in UI | `orchestrator.ts`, `budget-manager.ts` |
| Dead code | `local-provider.ts` is intentional stub; v02 archive with `@ts-nocheck` | Confirmed |

### Technical Debt Register

| ID | Area | Debt | Severity | Effort |
|----|------|------|----------|--------|
| TD-01 | CSP | `unsafe-inline`/`unsafe-eval` in production CSP | Critical | Medium (requires nonce/hash strategy) |
| TD-02 | Middleware | `middleware.ts` → `proxy.ts` migration pending (Next.js 16 deprecation) | High | Low |
| TD-03 | SalesOS | 40+ TypeScript errors in vnext code, 272 uncommitted paths | High | High |
| TD-04 | Testing | Prisma mocked in all tests; no real DB integration tests in CI | High | Medium |
| TD-05 | Rate limiting | Per-instance memory rate limiter; not globally coordinated | Medium | Medium |
| TD-06 | ESLint | 158 suppressed warnings (unused vars, type issues) | Medium | Medium |
| TD-07 | Export | No shared export service; product-specific PDF/XLSX implementations | Medium | High |
| TD-08 | AI fallback | Silent degradation to deterministic when cloud AI fails | Medium | Low |
| TD-09 | HSTS | Missing Strict-Transport-Security header | High | Low |
| TD-10 | X-Frame | SAMEORIGIN should be DENY for institutional platform | Low | Low |
| TD-11 | Permissions-Policy | Missing browser permissions restriction header | Medium | Low |
| TD-12 | Auth | `dotenv/config` in `auth-config.ts` may conflict with container env injection | Low | Low |
| TD-13 | pgvector | Not in standard Terraform DB parameter group; requires manual extension | Medium | Low |
| TD-14 | ECR | Mutable image tags enable tag overwrite attacks | Medium | Low |
| TD-15 | Sentry | Try/catch silent degradation in `next.config.mjs` | Medium | Low |
| TD-16 | SMTP | `noreply@aqliya.ai` hardcoded post domain migration | Medium | Low |
| TD-17 | Audit log | No tamper-proof/append-only audit store | High | High |
| TD-18 | WIP | 524 uncommitted paths including production file overlays | High | Medium |
| TD-19 | Local AI | Provider stub always throws; sovereign AI claim is aspirational only | High | Very High |
| TD-20 | Backup | No automated backup; manual only | High | Medium |

---

## PHASE 9 — REPOSITORY & STRUCTURE REVIEW

### Current Structure Assessment

```
aqliya/
├── src/
│   ├── app/                    ← Next.js App Router (marketing + dashboard route groups)
│   ├── actions/                ← Server actions (flat, product-grouped by file prefix)
│   ├── components/             ← UI components (product-grouped subdirs)
│   ├── lib/                    ← Business logic (platform/ + product subdirs)
│   └── __tests__/              ← Jest unit tests
├── prisma/                     ← Schema (127 models, 2,943 lines)
├── infra/terraform/            ← IaC (modules: networking/compute/database/storage/monitoring)
├── .github/workflows/          ← CI/CD (deploy, ci, preview, promote, backup)
├── docs/                       ← Documentation hierarchy (8 levels)
├── scripts/                    ← Deploy scripts, smoke tests
├── messages/                   ← i18n message files (next-intl)
├── i18n/                       ← i18n request configuration
└── cypress/                    ← E2E tests
```

**Strengths:** Clear separation between marketing and dashboard route groups, `lib/` follows product-subdirectory convention, `actions/` mirrors product scope.

**Weaknesses:**
- `actions/` is flat (no subdirectory grouping); grows unwieldy with more products.
- No `packages/` or workspace structure — growing a monorepo to include backend services would require a restructure.
- `prisma/schema.prisma` is 2,943 lines with 127 models. No schema splitting or module separation.
- `src/__tests__/unit/` and `src/lib/ai/__tests__/` are inconsistently co-located.
- `.data/` directory contains JSON fixture files that should be in `src/fixtures/` or `prisma/seed-data/`.

**Recommended future structure:**

```
aqliya/
├── apps/
│   └── platform/               ← Current Next.js app
├── packages/
│   ├── governance-core/        ← Governance engine, audit log, RBAC (shareable)
│   ├── ai-orchestrator/        ← AI layer (shareable, potentially open-sourceable)
│   ├── evidence-graph/         ← Evidence chain data layer
│   └── export-engine/          ← Unified PDF/XLSX export service
├── prisma/                     ← Schema (consider schema splitting by domain)
├── infra/                      ← Terraform (unchanged)
└── docs/                       ← Documentation (unchanged)
```

---

## PHASE 10 — DOCUMENTATION REVIEW

### Documentation Maturity Score: **78 / 100**

**Exceptional strengths:**
- 8-level authority hierarchy with explicit conflict-resolution rules — rare and highly mature.
- Source-of-truth files (`PRODUCT_STATUS_MATRIX.md`, `ROUTE_STRATEGY.md`, `READINESS_GATES.md`) are accurate and current.
- Multiple official docs (`aqliya-vision-v1.1.md`, `aqliya-product-taxonomy-v1.1.md`, `aqliya-implementation-rules-v1.1.md`, `aqliya-agent-context-v1.1.md`) are internally consistent.
- `DOCUMENTATION_AUTHORITY.md` solves the eternal "which doc do I trust" problem with a clear ruleset.
- Documentation is maintained in Arabic and English.

**Gaps identified:**
- No public-facing API documentation (OpenAPI/Swagger spec absent).
- No developer onboarding guide (DEVELOPER.md exists but `CONTRIBUTING.md` quality unknown).
- Security runbook exists (`SECURITY_REVIEW.md`) but is marked as historical; current security state document is `docs/reports/security-auth-coverage-lock-2026-05-24.md` — cross-referencing is non-obvious.
- Backup/restore runbook exists but no restore drill has been performed.
- DR plan is documented but never tested — documentation claims RTO < 30 min with no evidence.
- No SLA documentation for enterprise customers.
- `AQLIYA_NOTION_MODERNIZATION_PROGRAM.md` in root directory appears out of place — organizational artifact that should not be in the codebase root.

**Documentation roadmap priorities:**
1. OpenAPI/Swagger spec for all `/api/*` routes (blocker for enterprise integration).
2. Developer onboarding guide with local setup, test execution, and first PR process.
3. Tested restore runbook (perform actual restore, document timestamps and commands).
4. Security state document (single authoritative current security posture).
5. SLA/uptime commitment document for enterprise customer agreements.

---

## PHASE 11 — SECURITY ASSESSMENT

### Security Risk Matrix

| Finding | Severity | OWASP Category | Status |
|---------|----------|----------------|--------|
| CSP `unsafe-inline`/`unsafe-eval` | CRITICAL | A03:2021 Injection (XSS) | Open |
| No HSTS header | HIGH | A05:2021 Security Misconfiguration | Open |
| X-Frame-Options SAMEORIGIN not DENY | MEDIUM | A05:2021 Security Misconfiguration | Open |
| No Permissions-Policy | MEDIUM | A05:2021 Security Misconfiguration | Open |
| Per-instance rate limiting only | HIGH | A07:2021 Auth Failures (brute force) | Open |
| SCIM key as test value in `.env` | HIGH | A02:2021 Cryptographic Failures | Open |
| Mocked Prisma in all tests | HIGH | A09:2021 Security Logging & Monitoring | Open |
| No audit log tamper detection | HIGH | A09:2021 Security Logging & Monitoring | Open |
| Mutable ECR image tags | MEDIUM | A08:2021 Software Supply Chain | Open |
| No external pen test | HIGH | N/A (Gap) | Open |
| No SOC2/ISO27001 | HIGH | Compliance gap | Open |
| MFA not universally enforced | MEDIUM | A07:2021 Auth Failures | Partial |
| Sentry silent degradation | MEDIUM | A09:2021 Monitoring | Open |
| Pre-auth document enumeration (Sunbul) | HIGH | A01:2021 Broken Access Control | Fixed (2026-05-24) |
| No middleware/security headers | CRITICAL | A05:2021 | Fixed (current code) |

### Security Hardening Plan (Priority Order)

**Immediate (0-30 days):**
1. Fix CSP: implement nonce-based CSP removing `unsafe-inline` and `unsafe-eval`.
2. Add HSTS: `Strict-Transport-Security: max-age=31536000; includeSubDomains`.
3. Change X-Frame-Options to DENY.
4. Add Permissions-Policy: `camera=(), microphone=(), geolocation=()`.
5. Rotate `.env` AUTH_SECRET if it was ever used in any environment.
6. Fix SMTP_FROM domain.

**Short-term (30-90 days):**
7. Implement Redis-backed distributed rate limiting on auth endpoints.
8. Commission CREST-certified external penetration test.
9. Implement tamper-proof audit log (separate write-only store or CloudTrail forwarding).
10. Enforce MFA universally for OPERATOR and ADMIN roles.

**Medium-term (90-180 days):**
11. Set ECR image tags to IMMUTABLE.
12. Implement human approval gate for Terraform apply in CI.
13. Enable automated backup with weekly restore drills.
14. Implement SRI for any CDN-delivered assets.
15. Begin SOC2 Type II readiness assessment.

---

## PHASE 12 — PRIVACY & COMPLIANCE REVIEW

### Compliance Gap Analysis

| Framework | Current Status | Gap |
|-----------|---------------|-----|
| **GDPR** | Privacy policy exists (`/privacy`); no DPA; no erasure mechanism | Missing: DPA template, right-to-erasure API, data residency proof |
| **PDPL (Saudi)** | Mentioned in positioning; no PDPL compliance documentation | Missing: PDPL compliance statement, data localization proof (me-south-1 is Bahrain, not KSA) |
| **NCA ECC** | Mentioned as future; not implemented | Full gap |
| **ISO 27001** | Architecture has many ISO 27001 controls; no certification | ISMS, risk register, Statement of Applicability missing |
| **SOC2 Type I/II** | `/soc2-roadmap` page honestly states not certified | Q-target roadmap exists; no audit started |
| **ZATCA** | No ZATCA-specific compliance module | Gap for KSA enterprise customers |

**Critical compliance finding:** AWS `me-south-1` region is **Bahrain**, not Saudi Arabia. Saudi government customers requiring data residency within KSA borders cannot be served by the current infrastructure. The `eu-central-1` DR region compounds this — it is outside MENA entirely. This is a potential deal-killer for Saudi government procurement. A KSA-region (Riyadh) deployment option must be planned.

**Compliance Readiness Score: 24/100.** The platform has the architectural building blocks (audit log, RBAC, evidence chain) but lacks all certifications.

**Compliance Roadmap (Priority):**
1. Commission PDPL gap assessment (0-60 days).
2. Add right-to-erasure and data export APIs (GDPR/PDPL).
3. Publish DPA template (procurement enabler).
4. Evaluate AWS Local Zones in KSA or Riyadh DC for data residency.
5. Begin SOC2 Type I readiness (90 days).
6. ISO 27001 gap assessment (6 months).
7. NCA ECC technical assessment (6 months).

---

## PHASE 13 — DEVOPS REVIEW

### CI/CD Assessment

**Pipeline:** `test → terraform → build-and-push → deploy → post-deploy`

**Strengths:**
- Terraform validate + plan + apply in CI is enterprise-grade IaC management.
- Post-deploy smoke test (`scripts/post-deploy-smoke.mjs`) runs after every deployment.
- Multi-stage Docker build produces a lean production image.
- ECR scan on push is enabled.

**Gaps identified:**

1. **npm test not in CI deploy pipeline.** Regression can be deployed without test gate.
2. **ESLint `--quiet` suppresses warnings in CI.** Quality degradation is invisible.
3. **No staging promotion gate.** `staging` and `main` branches deploy independently without a formal promotion workflow. `promote.yml` exists but is not integrated into the main pipeline.
4. **Terraform apply is automated without human approval.** For a production system managing customer data, infrastructure changes should require at minimum a manual approval step.
5. **No database migration step in CI.** Prisma `migrate deploy` must be run manually, creating a deployment window where app and schema versions are mismatched.
6. **No rollback step.** If the post-deploy smoke test fails, there is no automated rollback. Manual ECS task reversion is required.
7. **`sleep 60` in post-deploy is fragile.** Waiting 60 seconds before smoke testing assumes ECS task startup time. ECS Fargate cold start + health check convergence can exceed 60 seconds under load.

**Recommended pipeline enhancements:**
```
test → terraform plan → [manual approval for infra changes] → build+push → migrate → deploy → smoke test → rollback on failure
```

---

## PHASE 14 — INFRASTRUCTURE & DEPLOYMENT REVIEW

### Cloud Readiness: HIGH (design-level)

**Architecture:** CloudFront → WAFv2 → ALB → ECS Fargate (3 AZs) → RDS Multi-AZ + ElastiCache + S3. Documented. Terraform IaC exists. Evidence that it is deployed and working: smoke tests reference `https://aqliya.com` and `https://staging.aqliya.com`.

### Private Cloud / On-Prem Readiness: NONE

No on-prem deployment package, no Docker Compose production stack, no Kubernetes manifests, no Helm charts, no offline installer. The Terraform is AWS-specific. Customer IT teams cannot install, configure, or operate AQLIYA without AWS access.

### Can enterprise IT teams do the following?

| Task | Possible? | Evidence |
|------|-----------|---------|
| Install | No (AWS-only) | No on-prem package |
| Configure | Partially (Terraform) | Docs exist for AWS deployment |
| Operate | Partially | Runbooks exist; no drill |
| Trust | Not yet | No SOC2, no pen test |
| Upgrade | Manual | No zero-downtime upgrade procedure |
| Audit | Partially | Audit log exists; no SIEM export wired |
| Backup | Manual | No automated backup |
| Recover | Not tested | DR plan exists; never drilled |

### Infrastructure Readiness Score: **46/100**

Key missing: on-prem deployment option, tested DR, automated backup, immutable ECR tags, Kubernetes support, and data residency in KSA (not Bahrain).

---

## PHASE 15 — RELIABILITY & SRE REVIEW

### Reliability Score: **42/100**

**Documented SLOs:** RTO < 30 min, RPO < 5 min. Neither has been verified by drill.

**Monitoring:** CloudWatch dashboards + alarms in `modules/monitoring/main.tf`. Sentry for error tracking. `/api/health` and `/api/health/db` endpoints. `/monitoring` dashboard route.

**Gaps:**
- No on-call rotation or escalation policy.
- CloudWatch alarms exist but no documented alert routing (PagerDuty/OpsGenie absent).
- No SLO measurement or error budget tracking.
- No chaos engineering or fault injection tests.
- ECS minimum 3 tasks, maximum 10-12 — no capacity planning for burst traffic.
- ElastiCache Redis cluster mode disabled — single shard, no horizontal scale.
- `FARGATE_SPOT` capacity provider configured but `weight=1, base=1` means spot tasks will be used in production (spot interruptions can cause task termination mid-request).

**SRE Roadmap (Priority):**
1. Document and test DR procedure — measure actual RTO/RPO.
2. Configure PagerDuty/OpsGenie for CloudWatch alarm routing.
3. Remove FARGATE_SPOT from production capacity providers (or set weight=0).
4. Define and publish SLOs (e.g., 99.9% availability, 500ms p95 API response time).
5. Enable Redis cluster mode for horizontal cache scaling.
6. Implement automated backup with weekly restore drill.

---

## PHASE 16 — DATABASE & DATA ARCHITECTURE REVIEW

### Schema Assessment

**Size:** 127 models, 2,943 lines. This is a large monolithic schema. For context, most mature SaaS platforms would split this across multiple schemas or services by this model count.

**Multi-tenancy model:** `PlatformOrganization → Organization/AuditOrganization/SunbulClient → Product-specific entities`. The bridge table pattern is coherent but introduces join complexity at every product query.

**Strengths:**
- `createdById` added to all major entities (2026-05-28) for creator accountability.
- `deletedAt` soft-delete on `ClientWorkspace` (platform-level deletion without data loss).
- `AuditEvent` model with rich metadata (`targetType`, `targetId`, `severity`, `status`, `sourceSystem`).
- `PlatformSecret` model with `encryptedValue`, `rotationPeriodDays`, `lastRotatedAt` — secret management is architecturally correct.
- `ScimProvisioningEvent` model for SCIM audit trail.
- pgvector support with JSON fallback for embeddings.

**Risks:**
- No foreign key constraints on `createdById` — it is a `String?` referencing `User.id` by convention, not by FK. Orphaned references are possible.
- `DecisionStatus`, `AuditAction`, etc. are PostgreSQL enums — adding new values requires a migration and redeployment.
- 127 models in one schema file creates merge conflict risk as teams grow.
- No read replica routing in the application layer — all queries hit the primary. Read replica is provisioned in Terraform but the app only has one `DATABASE_URL`.
- `metadata Json?` fields on multiple models create schema-less data pockets that are hard to query and index.
- No database-level row-level security (RLS) — tenant isolation is enforced entirely at the application layer. A SQL injection or ORM misconfiguration could leak cross-tenant data.

**Bottlenecks:**
- `AuditEvent` table will grow unboundedly — no partition strategy or archival policy documented.
- `EmbeddingDocument` with `vector(1536)` requires pgvector index (IVFFlat or HNSW) for performant similarity search — not documented in schema or Terraform.
- Complex multi-table joins for audit engagement views (engagement → accounts → mappings → statements → notes → evidence → findings) will degrade at scale without materialized views or caching.

---

## PHASE 17 — AI ARCHITECTURE REVIEW

### AI Maturity Score: **55/100**

**Architecture Strengths:**
- Provider abstraction (`AIOrchestrator`) supports OpenAI, Anthropic, Cloud, Deterministic, and (stub) Local.
- Governance context is injected into every prompt via `getGovernanceContext()` and `injectGovernedRagIntoRequest()`.
- Cost-based provider routing (`selectOptimalProvider`) when `ai.real-providers` feature flag is enabled.
- Per-tenant budget caps with alert thresholds — production-grade cost control.
- Circuit breaker pattern for AI provider failures (`provider-circuit-breaker.ts`).
- AI eval suites exist (`src/lib/ai/eval/suites/`) for testing AI output quality.
- Prompt registry (`prompt-registry.ts`) with type-safe prompt builders.
- RAG pipeline: ingestion → embedding → similarity search → context builder → orchestrator injection.

**Gaps:**
- **Local AI provider is permanently disabled.** `LocalAIProvider.execute()` always throws. Sovereign AI claim is architecturally aspired but functionally nonexistent.
- **No AI output versioning.** Generated outputs are not version-tracked. If a model changes behavior (provider update, prompt change), historical outputs cannot be reproduced.
- **No hallucination detection.** No confidence scoring for factual claims in generated outputs. No grounding check against evidence.
- **Deterministic provider silently substitutes.** When real AI fails or is disabled, deterministic templates are returned without user notification. This is functionally correct governance but misleading to end users.
- **No model governance registry.** Explicitly listed as L0/not implemented in `PRODUCT_STATUS_MATRIX.md`. No tracking of which model version produced which output.
- **pgvector RAG degrades to JSON.** Without pgvector, similarity search falls back to application-level filtering — not semantically equivalent.
- **No prompt injection defense.** Prompts are assembled from user inputs + governance context. No input sanitization or injection-resistance layer documented.
- **AI observability is implemented but not wired to alerting.** `observability.ts` logs AI calls but there is no alert on anomalous AI spend, unusual output rates, or provider errors.

### AI Roadmap

| Priority | Item | Effort |
|----------|------|--------|
| P0 | Implement user-facing AI degradation indicator | Low |
| P0 | Add prompt injection sanitization | Medium |
| P1 | Wire AI observability to CloudWatch alarms | Low |
| P1 | Implement model version tracking in AuditEvent | Medium |
| P2 | Evaluate local LLM (Ollama/vLLM) for on-prem roadmap | High |
| P2 | Implement hallucination detection/confidence scoring | High |
| P3 | Open AI output versioning for auditability | Medium |

---

## PHASE 18 — SOVEREIGN AI REVIEW

### AI Independence Score: **12/100**

**Can OpenAI be removed?** Architecturally yes (swap provider in `AIOrchestrator`). Operationally: all real AI features depend on cloud APIs. Remove OpenAI and AI features silently degrade to deterministic templates.

**Can Anthropic be removed?** Yes — it is a thin adapter over `CloudAIProvider`. Removing it has no functional impact since neither is the default provider.

**Can local models replace cloud models?** No. `LocalAIProvider` always throws. No Ollama, vLLM, or Llama integration exists. This is explicitly documented as a stub.

**What dependencies are dangerous?**
- `AI_CLOUD_API_KEY` is a single API key for all tenants. If this key is revoked or rate-limited, all tenants lose AI features simultaneously.
- No per-tenant API key management — all AI calls share one cloud provider credential.
- Embedding provider (`openai-embedding-provider.ts`) is OpenAI-specific — RAG depends on OpenAI embeddings exclusively.

### Sovereign AI Roadmap

| Phase | Item | Timeline |
|-------|------|----------|
| Phase 1 | Per-tenant AI provider configuration | 3 months |
| Phase 2 | Ollama integration for `LocalAIProvider` | 6 months |
| Phase 3 | On-prem embedding model (e.g., nomic-embed) to replace OpenAI embeddings | 6-9 months |
| Phase 4 | Air-gapped deployment package with local AI | 12-18 months |
| Phase 5 | GPU infrastructure option for on-prem LLM inference | 18-24 months |

---

## PHASE 19 — PERFORMANCE REVIEW

### Performance Assessment

**Frontend:**
- Next.js standalone output with `optimizePackageImports` for lucide-react, radix-ui, recharts — good.
- Avif/WebP image formats with responsive device sizes — good.
- `removeConsole` in production (preserving `error`/`warn`) — good.
- No bundle analysis results available; `ANALYZE=false` in `.env.example`.
- No Core Web Vitals benchmarks documented (`.lighthouserc.json` exists but no results).

**Backend:**
- `@prisma/adapter-pg` with native PostgreSQL driver — faster than default Prisma engine.
- No query optimization documentation.
- No caching strategy documented for read-heavy routes (engagement list, audit trail views).
- No database connection pooling configuration visible in Terraform (RDS default: 100 connections for db.r6g.large; ECS 3 tasks × N connections could exhaust pool under load).

**AI workloads:**
- `selectOptimalProvider` uses cost-based routing — no latency-based routing documented.
- No streaming responses for AI generation — users wait for full completion before seeing output.

**Performance risks at scale:**
- AuditEvent table unbounded growth → slow audit trail queries as engagement count grows.
- Evidence file downloads without CDN caching (signed URLs from S3 via application layer — not CloudFront direct).
- Redis cache-aside pattern requires documented cache invalidation strategy (absent).

---

## PHASE 20 — UX/UI & CUSTOMER EXPERIENCE REVIEW

### UX Score: **58/100**

**Strengths:**
- Arabic-first RTL layout is a genuine differentiator — not a translation afterthought.
- Bilingual exports (Arabic PDF via `arabic-pdf-support.ts`) are enterprise-ready.
- Next-intl for i18n with `messages/` directory — clean internationalization architecture.
- Radix UI + Tailwind v4 + CVA — accessible component primitives with modern styling.
- Guided demo (`/auditos`) allows prospects to experience the product without credentials.

**Gaps:**
- No documented accessibility audit (WCAG 2.1 AA compliance unknown for RTL Arabic layouts).
- No mobile/tablet responsive design validation documented.
- Error states and loading states are inconsistently implemented (DecisionOS had loading states added as a stabilization task — suggests others may be missing).
- No user onboarding flow, tooltips, or in-app help — critical for a governance-heavy product where workflows are non-obvious.
- AI output presentation has no confidence indicator, degradation signal, or "how was this generated?" transparency layer for end users.
- No dark mode support documented.

### Enterprise UX Requirements Not Yet Met

- Role-specific dashboard views (an auditor's view ≠ an operator's view ≠ an admin's view).
- Bulk operations (select multiple findings, bulk approve, bulk export).
- Keyboard navigation audit for compliance with accessibility mandates.
- Print/PDF view of every governed workspace for physical audit trail requirements.

---

## PHASE 21 — WEBSITE & MARKET POSITIONING REVIEW

### Assessment

The June 2026 website repositioning to platform-first is strategically correct. The platform-first navigation (المنصة | القطاعات | الإثبات | الحوكمة | عن عقلية) and diagnostic-first CTA ("احجز جلسة تشخيص") are the right enterprise sales motion.

**Trust signal strengths:**
- `/soc2-roadmap` page is honest about not being SOC2 certified — this is counterintuitively a trust signal.
- `/pilot-proof` with 28 evaluation criteria is an enterprise procurement enablement tool.
- `/procurement-pack` with DPA, residency, SOW, security brief — accelerates enterprise procurement.
- `/proof-library` with sample outputs on mock data — reduces "show me a demo" friction.
- `/executive-brief` in Arabic and English — maps to how Arab institutional decision-makers consume information.

**Gaps:**
- `/case-studies` is explicitly a placeholder ("Simulated scenarios + reference #1 placeholder") — a competitor or enterprise evaluator will notice.
- `/pilot-outcomes` is explicitly labeled "Honest placeholder until ≥2 completed pilots" — no evidence of completed pilots visible.
- No customer logos, testimonials, or reference customers.
- No analyst recognition (Gartner, Forrester, IDC) — expected by Big Four procurement.
- No pricing page — for enterprise this is fine, but the absence makes it harder for procurement to build a budget case.
- English version (`/en/*`) is a "marketing MVP" — incomplete site localization limits reach outside Arabic markets.
- `/products/sales` markets SalesOS as a real product when it is an L3 prototype.

**SEO Assessment:**
- Static pages with Next.js Server Components generate good SEO foundations.
- `schema-dts` package present for structured data — positive.
- Arabic content with proper Unicode support should index well for Arabic-language queries.
- No sitemap generator or `robots.txt` validation documented.

---

## PHASE 22 — COMPETITIVE ANALYSIS

### Competitive Positioning Matrix

| Dimension | AQLIYA | AuditBoard | Workiva | CaseWare | TeamMate+ | DataSnipper |
|-----------|--------|------------|---------|---------|-----------|-------------|
| Arabic-first | ✅ Native | ❌ | ❌ | ❌ | ❌ | ❌ |
| On-prem/Air-gapped | 🔶 Roadmap | ❌ | ❌ | ✅ (limited) | ✅ | ❌ |
| Governance-first AI | ✅ | ❌ | ❌ | 🔶 | ❌ | ❌ |
| Evidence chain | ✅ | 🔶 | ✅ | ✅ | ✅ | 🔶 |
| Multi-product platform | ✅ | ❌ | ✅ | ✅ | ❌ | ❌ |
| SOC2 certified | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| ISO 27001 | ❌ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Big Four penetration | ❌ | ✅✅ | ✅✅ | ✅✅ | ✅ | ✅ |
| MENA presence | ✅✅ | 🔶 | 🔶 | ✅ | 🔶 | ❌ |
| Local content compliance | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Pricing | Unknown | $$$$$ | $$$$$ | $$$$ | $$$$ | $$$ |
| Maturity | L5 pilot | Enterprise GA | Enterprise GA | Enterprise GA | Enterprise GA | GA |

**Against each competitor:**

**AuditBoard:** AQLIYA's governance-first design and Arabic-first implementation are direct differentiators. AuditBoard has no MENA presence, no Arabic support, no local content compliance. AQLIYA wins on positioning; loses on certification, customer base, and product completeness.

**Workiva:** Workiva is the most dangerous competitor due to financial reporting capabilities, Big Four penetration, and capital to localize. If Workiva invests in Arabic and MENA compliance, AQLIYA's differentiation weakens. AQLIYA must build certification and customer reference before Workiva invests.

**CaseWare:** CaseWare has on-prem capability and some MENA presence (partner network). AQLIYA's AI governance layer and Arabic-first UX are differentiators. CaseWare's UI is notably dated — UX is a competitive lever.

**TeamMate+:** Focused on internal audit, older generation product, limited AI. AQLIYA competes directly with a superior AI and governance story. TeamMate's parent (Wolters Kluwer) has deep distribution in professional services — a risk if they invest in AI.

**DataSnipper:** Excel-native, focused on evidence ticking and financial audit. AQLIYA's full engagement lifecycle is more comprehensive. DataSnipper's ease of adoption (Excel plugin) is an onboarding advantage AQLIYA lacks.

---

## PHASE 23 — MOAT ANALYSIS

| Moat Type | Strength | Evidence | Verdict |
|-----------|----------|---------|---------|
| **Arabic-first product moat** | High | No competitor has native Arabic UI for institutional governance | Real moat — 3-5 year lead |
| **Evidence chain moat** | Medium | `AuditEvidence`, `DecisionEvidence`, `createdById` chains | Real but not yet data-dense enough to be a barrier |
| **Workflow moat** | Low | Competitors have workflow engines | Not differentiated enough yet |
| **Data moat** | Low | No institutional memory yet | Aspirational — pgvector + memory = future moat |
| **AI moat** | Low | Cloud AI providers are commodity | Governance wrapper is real; underlying AI is not owned |
| **Compliance moat** | Low (current) | No certifications | Future moat — 18 months to SOC2 + NCA ECC |
| **Ecosystem moat** | None | No marketplace, no partner program, no integrations | Must be built |
| **Sovereign AI moat** | Aspirational | Local provider is a stub | Potentially the biggest moat if executed; nonexistent today |

**Defensible advantages today:** Arabic-first UI, governance-first design, MENA regional focus, multi-product platform architecture, honest positioning.

**Fake moats to stop claiming:** On-prem delivery, Sovereign AI, full SalesOS, air-gapped deployment.

---

## PHASE 24 — ENTERPRISE ADOPTION REVIEW

### Why would each stakeholder reject?

**CIO would reject because:**
- No SOC2 Type II certificate.
- No on-prem/Kubernetes deployment option.
- No OpenAPI spec for integration with existing IT systems.
- No SLA documentation with financial penalties.
- AWS infrastructure in Bahrain (not KSA) for Saudi data residency requirements.

**CISO would reject because:**
- CSP has `unsafe-inline`/`unsafe-eval` — fails any basic security scan.
- No HSTS header — fails security header audit.
- No external penetration test report.
- No NCA ECC compliance documentation.
- No data classification or DLP controls.
- Per-instance rate limiting insufficient for enterprise-grade abuse prevention.
- Mutable ECR image tags — supply chain risk.

**IT would reject because:**
- No self-hosted deployment option.
- No Helm chart or Kubernetes manifest.
- No SSO documentation with screenshots (only code-level implementation).
- No upgrade procedure documented.
- No API documentation for system integration.

**Audit Partner would reject because:**
- No reference customers or Big Four adoption evidence.
- Demo is convincing but no completed engagements demonstrated.
- `/pilot-outcomes` is explicitly a placeholder.
- No third-party validation of AI output quality.

**End users would reject because:**
- No onboarding flow or in-app help.
- MFA experience not documented or tested for RTL users.
- Loading states and error states inconsistently implemented.
- No bulk operations for efficiency at scale.

### Adoption Risk Register (Top 5 Immediate Actions)

1. Fix CSP (CISO blocker — 3 days).
2. Commission pen test (CISO + Audit Partner blocker — 60 days).
3. Create OpenAPI spec (CIO + IT blocker — 30 days).
4. Begin SOC2 Type I readiness (CIO + CISO gate — 90 days start).
5. Complete one paid pilot and publish an anonymized case study (Audit Partner blocker — ongoing).

---

## PHASE 25 — FOUNDER DEPENDENCY REVIEW

### Founder Dependency Score: **HIGH RISK**

**Evidence:**
- Commit messages are in Arabic, indicating a single primary author with deep context in both Arabic and English.
- Documentation is extraordinarily thorough (8-level authority system, per-product readiness gates, WIP cluster reports) — this level of documentation discipline suggests a single owner maintaining coherence.
- 524 uncommitted WIP paths in one working tree suggests centralized development.
- The `.opencode/agents/` multi-agent system is a productivity multiplier for a solo developer but creates opaque complexity for a new engineer.

**Bus factor assessment:** 1-2 people. If the primary developer is unavailable, the documentation quality mitigates risk somewhat, but the architectural knowledge of 127 Prisma models, the AI governance layer, and the multi-product platform is concentrated.

**Decentralization plan:**
1. Extract critical architectural decisions into Architecture Decision Records (ADRs).
2. Create onboarding documentation for the 5 most complex subsystems (AI Orchestrator, Governance Engine, Evidence Chain, Multi-tenancy, Export Engine).
3. Establish code review requirement (minimum one reviewer per PR) before fundraise.
4. Move WIP work from a single working tree into tracked feature branches.
5. Consider CODEOWNERS expansion to enforce review coverage by domain.

---

## PHASE 26 — PLATFORM LONGEVITY REVIEW

### Scalability Assessment

| User Scale | Readiness | Bottlenecks |
|------------|-----------|-------------|
| 100 users | Ready | None significant |
| 1,000 users | Mostly ready | AuditEvent table growth, connection pool sizing |
| 10,000 users | Requires work | DB connection pooling (PgBouncer), caching strategy, read replica routing, rate limiting distributed |
| 100,000 users | Significant architecture work | Schema decomposition, microservices boundaries, CDN for evidence files, distributed search |

### Multi-geography, multi-language, multi-regulation:

- **Multiple countries:** Infrastructure is single-region (Bahrain + DR Frankfurt). MENA expansion requires region planning (KSA, UAE, Egypt).
- **Multiple languages:** English partial (`/en/*` MVP), Arabic full. No Turkish, Urdu, or French (relevant for MENA markets).
- **Multiple regulations:** ZATCA, NCA ECC, PDPL are not yet compliance-certified. Cross-jurisdiction compliance is aspirational.
- **Multiple AI providers:** Architecture supports it; per-tenant provider config is not implemented.

### Longevity Score: **52/100**

Healthy foundation with clear scale bottlenecks. The architecture will support the next 24-36 months of growth without a rewrite, but connection pooling, AuditEvent archival, and distributed rate limiting must be addressed before 1,000 concurrent users.

---

## PHASE 27 — ACQUISITION READINESS REVIEW

### Acquisition Readiness Score: **38/100**

**Assumed acquirers:** Deloitte, PwC, EY, KPMG regional firms; Oracle NetSuite MENA; SAP; ServiceNow; regional SIFs (Saudi sovereign investment vehicles).

### Value Drivers (for an acquirer)

1. **Arabic-first institutional governance IP** — unique in market, 3-5 year lead.
2. **Platform architecture with multiple OS products** — not a single-product acquisition; a platform company.
3. **Evidence chain and audit trail design** — defensible IP for regulated industry workflows.
4. **Saudi/Gulf market presence and positioning** — strategic for any global vendor seeking MENA entry.
5. **AI governance framework** — reusable across acquirer's product portfolio.
6. **Bilingual (Arabic/English) codebase** — rare engineering capability.

### Red Flags (for an acquirer)

1. **No paying customers demonstrated.** No revenue, no ARR, no customer logos.
2. **No SOC2 / ISO 27001 / NCA ECC certification.** Enterprise acquirers require these for portfolio companies.
3. **CSP and HSTS security gaps.** Would fail any acquisition security scan.
4. **Mutable ECR image tags and no pen test.** Supply chain and security diligence failures.
5. **SalesOS phantom import history suggests architectural instability.** Due diligence would uncover the 36 phantom imports requiring 21 new modules — evidence of rapid prototyping without design validation.
6. **524 uncommitted WIP changes.** A clean working tree is expected at acquisition.
7. **Founder dependency.** Acquirers need to know the platform will survive without the founder.

### Deal Killers (must be resolved before any acquisition process)

1. No revenue / no paying customers.
2. Missing security certifications.
3. Outstanding security header vulnerabilities (CSP, HSTS).
4. No external pen test.
5. Data residency gap (Bahrain infrastructure, not KSA).

### Pre-Acquisition Hardening (6-month plan before any M&A process)

1. Close one paid pilot → reference customer.
2. Commission and complete pen test.
3. Fix CSP, HSTS, X-Frame-Options.
4. Commit all WIP or discard.
5. Begin SOC2 Type I.
6. Document all architecture decisions.
7. Set up code review process.
8. Immutable ECR tags.
9. Automated backup with tested restore.

---

## PHASE 28 — STRATEGIC ASSET MAPPING

| Capability | Classification | Recommendation |
|-----------|---------------|----------------|
| Arabic-first governance UI | **Strategic Asset** | Deepen, document, expand to more Arabic standards |
| AI Orchestrator (governance wrapper) | **Core Asset** | Consider open-sourcing governance framework |
| Evidence Chain (AuditEvidence + Events) | **Core Asset** | Expand to institutional memory network |
| AuditOS workflow (L5) | **Core Asset** | Harden to L6, seek first paying customer |
| LocalContentOS (L5) | **Strategic Asset** | Vision 2030 alignment; prioritize ERP integration |
| pgvector RAG pipeline | **Strategic Asset** | Enable institutional memory; requires pgvector in production |
| Multi-tenant platform bridge | **Core Asset** | Foundation for all future products |
| DecisionOS (L4) | **Supporting Asset** | Strengthen to L5; evidence-based decision governance is differentiating |
| WorkflowOS (L4) | **Supporting Asset** | Potential low-code platform play |
| SCIM v2 + SSO | **Supporting Asset** | Required for enterprise — already implemented |
| Terraform IaC | **Supporting Asset** | Good foundation; needs immutable tags, approval gates |
| SalesOS (L3) | **Technical Liability** | Freeze feature work; resolve TypeScript errors; validate architecture before resuming |
| SimulationOS (L1 redirect) | **Commodity** | Remove from marketing until real implementation |
| Local AI provider (stub) | **Technical Liability** | Implement or remove the claim |
| `.env` with exposed secrets | **Technical Liability** | Rotate, gitignore-enforce, implement secret scanning |
| 524 uncommitted WIP | **Technical Liability** | Branch, review, merge or discard |

---

## PHASE 29 — FUTURE VISION VALIDATION

### Readiness Assessment

| Future Capability | 2030 Readiness | 2035 Readiness | Gap |
|-------------------|---------------|---------------|-----|
| AI-Native Firms | Medium | High | Need local AI, model governance, institutional memory |
| Autonomous Operations | Low | Medium | AI is assistive-only; good for governance but limits automation |
| Continuous Audit | Low | Medium | AuditOS is workflow-based; continuous monitoring requires data feeds |
| Continuous Compliance | Low | Medium | No compliance OS yet; NCA ECC and ZATCA modules absent |
| Knowledge Graphs | Medium | High | pgvector RAG is the foundation; institutional memory needs building |
| Multi-Agent Systems | High | High | `.opencode/` multi-agent system already in use; can be productized as AQLIYA Studio |
| Private Enterprise AI | Low | High | Architecture supports it; local AI implementation missing |

**Verdict for 2030:** AQLIYA is on the right trajectory but needs sovereign AI delivery (local models, on-prem), institutional memory (cross-engagement learning), and continuous compliance modules to be relevant to the AI-native enterprise of 2030.

**Verdict for 2035:** If the sovereign AI and institutional memory roadmap is executed, AQLIYA could be the operating system for AI-assisted governance in Arab institutions — a meaningful and defensible position. If not executed, AQLIYA becomes a niche Arabic audit SaaS acquired by a larger vendor.

---

## PHASE 30 — TRANSFORMATION BLUEPRINT

### State Definitions

**Current State (2026-06):** One pilot-ready product (AuditOS L5), four L4 products, comprehensive documentation, sound architecture, critical security gaps, no paying customers, no certifications, full cloud dependency.

**Next State (2026-12):** One paying pilot customer, security hardening complete (CSP, HSTS, pen test), SOC2 Type I readiness begun, automated backup, SalesOS stabilized or frozen, institutional memory MVP.

**Target State (2027-06):** Two paying enterprise customers, SOC2 Type II in progress, LocalContentOS L6 with ERP integration, AuditOS L6, one Big Four or government reference, full distributed rate limiting.

**Strategic State (2028):** SOC2 Type II certified, NCA ECC compliant, local AI MVP (Ollama), PDPL compliant, 5+ enterprise customers, MENA market leader positioning with analyst recognition.

**Category Leader State (2030):** ISO 27001 certified, KSA data residency option, air-gapped deployment available, institutional memory compound network effect, 20+ enterprise customers, Arabic-first governance platform recognized by Gartner or IDC.

---

### Transformation Roadmap

#### 30-Day Plan (Security & Stability First)

| Priority | Action | Owner Domain | Effort |
|----------|--------|-------------|--------|
| P0 | Fix CSP: remove `unsafe-inline`/`unsafe-eval`, implement nonces | Security | 3 days |
| P0 | Add HSTS header to `next.config.mjs` | Security | 1 day |
| P0 | Change X-Frame-Options to DENY | Security | 1 day |
| P0 | Add Permissions-Policy header | Security | 1 day |
| P0 | Fix SMTP_FROM domain (`aqliya.com`) | Operations | 1 day |
| P0 | Rotate AUTH_SECRET if used in any environment | Security | 1 day |
| P1 | Freeze SalesOS vnext WIP on a branch | Engineering | 1 day |
| P1 | Commit or discard all non-SalesOS WIP (524 paths) | Engineering | 3 days |
| P1 | Set ECR image tags to IMMUTABLE | Infrastructure | 1 day |
| P1 | Add `npm test` back to CI deploy pipeline | Engineering | 1 day |
| P1 | Commission external penetration test (initiation) | Security | 1 day |
| P2 | Fix `middleware.ts` → `proxy.ts` migration (Next.js 16) | Engineering | 1 day |

#### 90-Day Plan (Reliability & Compliance)

| Priority | Action |
|----------|--------|
| P0 | Complete external penetration test, remediate critical findings |
| P0 | Implement automated backup with weekly tested restore |
| P0 | Add distributed Redis rate limiting for auth endpoints |
| P1 | Begin SOC2 Type I readiness assessment |
| P1 | Execute and document DR drill — measure actual RTO/RPO |
| P1 | Implement database migration step in CI pipeline |
| P1 | Create OpenAPI spec for all `/api/*` routes |
| P1 | Add PDPL gap assessment |
| P2 | Implement human approval gate for Terraform apply in CI |
| P2 | Enable Redis cluster mode (ElastiCache) |
| P2 | Wire AI observability alarms to CloudWatch |
| P2 | Implement user-facing AI degradation indicator |
| P2 | Deploy PgBouncer connection pooler for RDS |

#### 6-Month Plan (Enterprise Readiness)

- Complete AuditOS L6 hardening (automated backups, DR tested, pen test clean).
- Close first paid pilot customer.
- SOC2 Type I audit completed.
- NCA ECC technical assessment started.
- LocalContentOS ERP integration (SAP/Oracle) moved from interface-only to functional (one real connector).
- Evaluate AWS Riyadh Local Zone or KSA-region option for data residency.
- Publish anonymized pilot case study.
- Create developer onboarding guide and architecture decision records.
- Move SalesOS to its own branch; resolve all TypeScript errors before next feature work.

#### 12-Month Plan (Commercial Traction)

- 2-3 paying enterprise customers.
- SOC2 Type II in progress.
- Institutional memory MVP (cross-engagement pattern learning via pgvector).
- Ollama/local LLM integration for `LocalAIProvider` (first sovereign AI capability).
- PDPL compliance certification or formal documentation.
- Big Four partner program or distribution agreement.
- Series A fundraise preparation (traction + SOC2 + pen test + paying customers).

#### 24-Month Plan (Market Leadership)

- SOC2 Type II certified.
- NCA ECC compliance documentation published.
- KSA data residency option available.
- On-prem deployment package (Docker Compose + Helm) launched.
- Local AI operational (Ollama with Arabic-capable model).
- 10+ enterprise customers across KSA, UAE, and one Big Four regional affiliate.
- Analyst recognition (IDC or Gartner MENA).
- AQLIYA Studio MVP launched as a low-code governance builder.

#### 36-Month Plan (Strategic Position)

- ISO 27001 certification.
- Air-gapped deployment option.
- Institutional memory with compound data network effects.
- Category leader in "Institutional Governance AI" for MENA.
- Global expansion framework (Turkey, Egypt, Southeast Asia).
- Acquisition or Series B.

---

## FINAL RECOMMENDATIONS

### By Priority

**IMMEDIATE (block everything else — do this week):**
1. Fix CSP — remove `unsafe-inline`/`unsafe-eval`. Every other marketing effort is undermined if a security scan shows this.
2. Add HSTS header. Trivial change, enormous security posture improvement.
3. Rotate AUTH_SECRET if the one in `.env` was ever used in staging/production.
4. Freeze SalesOS vnext on a branch. Stop accumulating uncommitted TypeScript errors on main.

**SHORT-TERM (30-90 days):**
5. Commission external pen test now. This is the single biggest enterprise sales unlocker.
6. Add `npm test` back to CI. Tests that aren't enforced aren't tests.
7. Begin SOC2 Type I readiness. Start the clock — 12 months to Type II.
8. Implement automated backup with tested restore. A single data loss incident before backup is automated is catastrophic.

**STRATEGIC (6-12 months):**
9. Close one paying pilot customer. Everything else is accelerated by a reference customer.
10. Evaluate KSA region for data residency. The current Bahrain infrastructure is a blocker for Saudi government procurement.
11. Implement Ollama local AI. Turn the sovereign AI claim into a reality.
12. Build one real ERP connector (SAP or Oracle). The interface-only CRM/ERP connectors are a trust liability if discovered.

**LONG-TERM (12-36 months):**
13. SOC2 Type II certification. Opens every enterprise and government procurement door.
14. Air-gapped deployment package. The single highest-value differentiator if executed.
15. Open-source the governance framework core. Creates developer ecosystem and defensible IP recognition.

---

## EXECUTIVE ACTION PLAN

### For the Board / CEO

The platform vision is correct, coherent, and differentiated. AQLIYA addresses a real, underserved need in a market with favorable regulatory tailwinds. The architecture is sound. The documentation is exceptional. The biggest risks are: (1) security gaps that would fail any enterprise evaluation, (2) no paying customers to validate the business model, and (3) critical capabilities (sovereign AI, on-prem) that are marketed but unbuilt. The 30-day security hardening plan must be executed before any new enterprise demo. The 90-day compliance plan must be initiated before any funding round. The 6-month pilot plan must produce one reference customer or the commercial risk becomes existential.

### For the CTO / Chief Architect

The architecture is strong. The debt is manageable. The three highest-priority technical investments are: (1) CSP nonce implementation (3 days, critical security), (2) distributed rate limiting (2 weeks, enterprise security requirement), and (3) test enforcement in CI (1 day, quality assurance). The SalesOS working tree is a liability — branch it, test it cleanly, or freeze it. The AI governance layer is a genuine asset and should be documented and protected. The pgvector/RAG layer is underutilized — the institutional memory roadmap should be accelerated once AuditOS L6 is achieved.

### For the CISO

Five immediate actions: (1) Fix CSP. (2) Add HSTS. (3) Commission pen test. (4) Verify `.env` AUTH_SECRET exposure. (5) Implement tamper-proof audit log storage. The platform has good application-layer security design (tenant isolation, RBAC, audit trail) but multiple infrastructure-level security header failures that any basic scanner will catch. These must be resolved before any enterprise security questionnaire is submitted.

### For Investors

AQLIYA is a pre-revenue platform with one pilot-ready product, sound architecture, genuine market differentiation in a large underserved market, and a competent, honest founder who has built a sophisticated documentation and governance system. The risk is execution: the gap between the vision (sovereign AI, multi-OS platform, Big Four adoption) and current reality (one L5 product, no paying customers, no certifications) is large. Investment thesis requires: (1) security hardening completed before any enterprise intro, (2) one paying pilot within 6 months of investment, (3) SOC2 process started within 90 days. If those gates are met, this is a compelling Series A candidate in the MENA enterprise AI governance market.

---

*Audit completed: 2026-06-09 | Evidence base: 1,581 source files, 127 Prisma models, 15+ documentation files, infrastructure Terraform, CI/CD workflows, security audit reports, WIP cluster analysis, build stabilization reports, live environment configuration.*

# AQLIYA — Enterprise Gap Analysis
**Phase 0 Reality Audit | Generated: 2026-06-24**

---

## Purpose

This document identifies gaps between AQLIYA's current implementation and the requirements of an enterprise-ready, institutionally trustworthy platform. Each gap is assessed against three dimensions: Security, Governance, and Operational Maturity.

Gaps are classified as:
- **G-SEC**: Security gap
- **G-GOV**: Governance gap
- **G-OPS**: Operational gap
- **G-AI**: AI readiness gap
- **G-ENT**: Enterprise readiness gap (compliance, contracts, certifications)

---

## 1. Security Gaps

### G-SEC-001 — ABAC Not Enforced by Default
**Impact: High**

ABAC (attribute-based access control) is implemented but disabled. `FF_ABAC_ENFORCE=false` by default. The system operates on role-based access only (viewer/operator/manager/admin). Fine-grained resource-level access control is not enforced.

**Enterprise requirement**: Institutional clients require verifiable, attribute-level access constraints — especially for multi-department deployments where auditors must not access each other's engagements.

**Gap**: ABAC shadow mode has been running but enforcement is never triggered. DB models exist (`AbacPolicy`, `AbacPolicyAssignment`). No evidence of production ABAC policies being configured.

**Remediation target**: Phase 2.

---

### G-SEC-002 — MFA Not Universally Required
**Impact: High**

MFA enforcement is role-based (`mfa-roles.ts`). Not all users are required to complete MFA enrollment. For institutional clients where all operators handle sensitive data, universal MFA is a minimum expectation.

**Gap**: `mfaEnabled` and `mfaVerified` are token fields — optional. MFA gate allows bypass based on role.

**Remediation target**: Phase 5.

---

### G-SEC-003 — No Automated Security Scanning in CI
**Impact: High**

The CI pipeline (`ci.yml`) runs TypeScript check, lint, and unit tests. There is no:
- SAST (static application security testing)
- Dependency vulnerability scanning (e.g., `npm audit`)
- Secret scanning
- OWASP ZAP or equivalent DAST

**Gap**: Security vulnerabilities in dependencies or code are only discoverable manually or after breach.

**Remediation target**: Phase 5.

---

### G-SEC-004 — SIEM Integration Unverified in Production
**Impact: Medium**

`src/lib/platform/siem/` implements SIEM export and delivery. Tests exist for formatters and delivery service. However, there is no production evidence that SIEM events are being successfully delivered to an external SIEM system.

**Gap**: SIEM is architected but delivery confirmation is absent. The `settings/siem` route exists but is under `settings/` (admin only).

**Remediation target**: Phase 3.

---

### G-SEC-005 — Secrets Management Partially Implemented
**Impact: Medium**

`src/lib/platform/secrets/` (vault.ts) and `VaultEntry`, `PlatformSecret` DB models exist. However, secrets are also managed via environment variables directly (`AI_CLOUD_API_KEY`, `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, etc.).

**Gap**: Two secrets systems in parallel — env vars and vault. No evidence that the vault is the primary secret store in production. Rotation of env-var secrets requires deployment; vault-based secrets can rotate without deployment.

**Remediation target**: Phase 5.

---

### G-SEC-006 — No Rate Limiting on AI Endpoints per Tenant
**Impact: Medium**

The platform rate limiter applies globally. The AI budget manager tracks spend per organization. However, there is no hard per-tenant rate limit on AI API endpoints that would prevent one tenant from consuming disproportionate AI capacity.

**Gap**: AI cost overruns by one tenant can degrade the platform for all.

**Remediation target**: Phase 4.

---

### G-SEC-007 — ClamAV File Scanning Not Verified in Production
**Impact: Medium**

`src/lib/audit/clamav-client.ts` and `file-scanner.ts` exist. `CLAMAV_HOST` and `CLAMAV_PORT` are env vars. ClamAV must be co-deployed for file scanning to function. No confirmation that ClamAV is running in the production ECS cluster.

**Gap**: If ClamAV is not deployed, file upload scanning silently falls back to a permissive state (depending on `SCANNER_PROVIDER` env var).

**Remediation target**: Phase 5.

---

## 2. Governance Gaps

### G-GOV-001 — Feature Flags Have No Governance
**Impact: High**

17+ feature flags (`FF_*`) control significant platform behavior. There is no:
- Centralized flag registry
- Owner per flag
- Expiry date per flag
- Audit trail for flag changes
- Documentation of current production flag state

**Gap**: It is impossible to know from the codebase which flags are active in production. Flags can accumulate indefinitely. Changing a flag requires a deployment with no audit trail of who changed it or why.

**Remediation target**: Phase 3.

---

### G-GOV-002 — Undocumented Products Lack Governance Rules
**Impact: High**

ContentStudio, Institutional Memory, Sampling, and Knowledge Foundation operate as active governed workspaces with no entry in the official taxonomy (`CLAUDE.md`). This means:
- No declared owner
- No readiness gate
- No route governance rules (demo vs workspace distinction unclear)
- No migration or schema change policy for these areas

**Gap**: Any developer can extend these systems without accountability to a governance framework.

**Remediation target**: Phase 3.

---

### G-GOV-003 — AI Governance Metrics Not Surfaced Operationally
**Impact: Medium**

`src/lib/core/ai/governance-metrics.ts` and `src/lib/platform/model-governance/` exist. The `AiModelRegistry`, `AiModelGovernanceReview`, `AiModelDeployment` models are present. However:
- The `monitoring/ai` route exists but its operational completeness is unverified
- No evidence that governance reviews are being triggered on model changes
- No evidence that `AiModelGovernanceReview` records are being created in production

**Gap**: AI governance infrastructure exists but operational usage is unclear.

**Remediation target**: Phase 4.

---

### G-GOV-004 — RiskOS Governance Conflict
**Impact: Medium**

`AGENTS.md` says "do not build" for RiskOS. Live routes, page files, and middleware matchers exist for `/risk/*`. This is an unresolved governance conflict.

**Gap**: The system operates in a governance gray zone — routes serve content that has no declared owner and contradicts a written directive.

**Remediation target**: Phase 6.

---

### G-GOV-005 — Audit Trail Coverage Not Verified Across All Products
**Impact: Medium**

`PlatformAuditLog`, `AuditLog`, and `HashChainEntry` exist. Platform-level dual-write verification scripts exist (`platform:auditos-dual-write`, `platform:decisionos-dual-write`). However, equivalent verification for SalesOS, ContentStudio, LocalContactOS, and Institutional Memory is not documented.

**Gap**: Audit trail completeness is unverified for newer products.

**Remediation target**: Phase 3.

---

## 3. Operational Gaps

### G-OPS-001 — No Load / Performance Testing
**Impact: High**

No load tests, performance benchmarks, or throughput targets exist in the codebase. The `scripts/platform/pilot-rate-limit-load.mjs` script exists but targets rate-limit behavior only, not general application performance.

**Gap**: Unknown behavior under load. ECS Fargate auto-scaling configuration exists (3–10 tasks) but no tested thresholds for when scaling kicks in.

**Remediation target**: Phase 5.

---

### G-OPS-002 — No Disaster Recovery Drill Evidence
**Impact: High**

`scripts/platform/restore-drill.mjs` and `docs/operations/ha-dr-plan.md` exist. The restore drill script exists. However, no evidence of it being run against staging with recorded outcomes.

**Gap**: DR plan is documented but untested. Recovery Time Objective (RTO) and Recovery Point Objective (RPO) are asserted but not validated.

**Remediation target**: Phase 5.

---

### G-OPS-003 — Integration Tests Require Manual Docker Setup
**Impact: Medium**

Integration tests (`src/__tests__/integration/`) require `docker compose -f docker-compose.test.yml up -d && npx prisma migrate deploy` before running. This is not automated in CI (`ci.yml` does not include this step).

**Gap**: Integration tests are developer-laptop-only. They do not run in CI, meaning database-level correctness is not verified on every push.

**Remediation target**: Phase 5.

---

### G-OPS-004 — No Runbook for SalesOS, ContentStudio, LocalContactOS
**Impact: Medium**

`docs/operations/production-deployment-runbook.md` exists. However, product-specific operational runbooks (incident response, rollback, data recovery) do not exist for SalesOS, ContentStudio, LocalContactOS, or newer products.

**Gap**: If an incident occurs in these products, operators have no documented response procedure.

**Remediation target**: Phase 5.

---

### G-OPS-005 — Background Job Visibility
**Impact: Medium**

Bull queues (via Redis) are used for background jobs. `src/lib/platform/operations/queue-runtime.ts` manages the queue. However, there is no visible dashboard for queue health, job failure rates, or backlog. The `/monitoring` route exists but its coverage of background jobs is unverified.

**Gap**: Failed background jobs may go undetected.

**Remediation target**: Phase 3.

---

### G-OPS-006 — `--forceExit` in Jest Hides Resource Leaks
**Impact: Medium**

See TD-015. Background: if tests are not cleaning up DB connections, Redis connections, or timers, `--forceExit` silently terminates rather than surfacing the leak. This causes flaky test behavior in CI and masks real implementation bugs.

**Remediation target**: Phase 5.

---

## 4. AI Readiness Gaps

### G-AI-001 — No Golden Datasets for AI Regression Testing
**Impact: High**

The eval framework (`src/lib/ai/eval/eval-runner.ts`, `eval-types.ts`, `suites/`) exists. `src/app/api/ai/eval-gate/` route exists. However, there are no committed golden datasets — ground-truth input/output pairs for AI workflows (trial balance classification, decision recommendations, local content analysis, etc.).

**Gap**: AI output quality cannot be verified automatically. Regressions in AI behavior (prompt changes, model upgrades, provider switches) are undetectable without running the system and manually reviewing outputs.

**Remediation target**: Phase 4.

---

### G-AI-002 — No Hard AI Spend Limits
**Impact: High**

The budget manager (`src/lib/core/ai/budget-manager.ts`) tracks spend and has per-org budget configuration. However, there is no evidence of hard limits being enforced (i.e., requests being rejected after a budget threshold is exceeded). The system tracks but may not block.

**Gap**: Runaway AI spend is possible if a workflow enters an unexpected loop or a misconfigured batch job triggers excessive model calls.

**Remediation target**: Phase 4.

---

### G-AI-003 — Local AI (Ollama) Not Production-Confirmed
**Impact: Medium**

`src/lib/core/ai/providers/local-provider.ts` implements Ollama integration. `AI_LOCAL_BASE_URL`, `AI_LOCAL_MODEL`, `AI_LOCAL_EMBED_MODEL` env vars exist. The hybrid router can route to local. However:
- No production deployment evidence of Ollama running alongside ECS Fargate
- No sidecar or separate service definition in Terraform for local AI
- `VLLM_BASE_URL` and `VLLM_MODEL` exist for self-hosted vLLM — also unverified in production

**Gap**: Local AI is marketed in deployment options but not deployed. Using `AI_MODE=local` in production would fail silently or error.

**Remediation target**: Phase 4.

---

### G-AI-004 — AI Observability Not Externally Exposed
**Impact: Medium**

`src/lib/core/ai/observability.ts` tracks latency, errors, tokens, costs. `src/app/(dashboard)/monitoring/ai/` route exists. However, no evidence that observability metrics are exported to CloudWatch, Datadog, or any external monitoring system. Metrics live only in the application layer.

**Gap**: AI performance degradation (latency spikes, provider errors, cost anomalies) is not externally alertable.

**Remediation target**: Phase 4.

---

### G-AI-005 — Skill Runtime Has No Production Safety Gate
**Impact: Medium**

`src/lib/skill-runtime/` implements a skill evaluation and execution system. Skills can be evaluated via `/api/skills/evaluate`. The eval endpoint is admin-gated. However, there is no evidence of:
- Sandboxing of skill execution
- Input validation before skill runs
- Output review gate before skill results are used

**Gap**: Skills as a mechanism for extending AI behavior need a governance gate equivalent to the base AI eval gate.

**Remediation target**: Phase 4.

---

## 5. Enterprise Readiness Gaps

### G-ENT-001 — No SOC2 Certification
**Impact: High**

A `/soc2-roadmap` marketing page exists. No SOC2 report is referenced anywhere in the codebase or documentation. This is one of the most common enterprise procurement blockers.

**Gap**: Enterprise clients (especially financial institutions, government procurement) require SOC2 Type II or equivalent assurance.

**Remediation target**: Begin preparation in Phase 5. Full certification is a 6–12 month process beyond the 90-day window — but readiness preparation can start.

---

### G-ENT-002 — On-Premises / Air-Gapped Deployment Not Implemented
**Impact: High**

CLAUDE.md acknowledges: "Private / On-Prem and Air-Gapped are strategic directions, not implemented production packages." However, these are marketed in `src/app/(marketing)/deployment/`.

**Gap**: If a client requests an on-prem deployment, no tested package exists. The gap between marketing claims and delivery capability is a commercial risk.

**Remediation target**: Not within 90-day scope, but must be disclosed accurately in sales materials.

---

### G-ENT-003 — API Versioning Strategy Absent
**Impact: Medium**

62 API routes exist under `/api/`. No version prefix (e.g., `/api/v1/`) is used. No API versioning strategy is documented.

**Gap**: As the platform matures and enterprise clients integrate with the API, breaking changes have no migration path. Clients cannot pin to a stable API version.

**Remediation target**: Phase 3.

---

### G-ENT-004 — No Data Processing Agreement (DPA) Implementation Tracking
**Impact: Medium**

`src/app/print/dpa-summary/` exists as a print/PDF view. This is a document, not an implementation. There is no programmatic tracking of DPA terms (e.g., data residency enforcement, right to erasure implementation, retention enforcement).

**Gap**: DPA compliance requires both a signed document and verified technical implementation of its terms.

**Remediation target**: Phase 3 (retention policy enforcement), Phase 5 (erasure implementation review).

---

### G-ENT-005 — Multi-Region Read Traffic Not Load Balanced
**Impact: Medium**

Primary region is me-south-1 (Bahrain). DR region is eu-central-1 (Frankfurt). The DR region has a read replica but no active traffic routing. There is no evidence of active-active or read-replica routing for read-heavy workloads.

**Gap**: All traffic hits the primary region. Read-heavy analytics workloads could degrade write performance.

**Remediation target**: Phase 5.

---

## Gap Summary

| ID | Category | Severity | Phase |
|---|---|---|---|
| G-SEC-001 | Security | High | Phase 2 |
| G-SEC-002 | Security | High | Phase 5 |
| G-SEC-003 | Security | High | Phase 5 |
| G-SEC-004 | Security | Medium | Phase 3 |
| G-SEC-005 | Security | Medium | Phase 5 |
| G-SEC-006 | Security | Medium | Phase 4 |
| G-SEC-007 | Security | Medium | Phase 5 |
| G-GOV-001 | Governance | High | Phase 3 |
| G-GOV-002 | Governance | High | Phase 3 |
| G-GOV-003 | Governance | Medium | Phase 4 |
| G-GOV-004 | Governance | Medium | Phase 6 |
| G-GOV-005 | Governance | Medium | Phase 3 |
| G-OPS-001 | Operations | High | Phase 5 |
| G-OPS-002 | Operations | High | Phase 5 |
| G-OPS-003 | Operations | Medium | Phase 5 |
| G-OPS-004 | Operations | Medium | Phase 5 |
| G-OPS-005 | Operations | Medium | Phase 3 |
| G-OPS-006 | Operations | Medium | Phase 5 |
| G-AI-001 | AI | High | Phase 4 |
| G-AI-002 | AI | High | Phase 4 |
| G-AI-003 | AI | Medium | Phase 4 |
| G-AI-004 | AI | Medium | Phase 4 |
| G-AI-005 | AI | Medium | Phase 4 |
| G-ENT-001 | Enterprise | High | Phase 5 |
| G-ENT-002 | Enterprise | High | Disclose, out of 90-day scope |
| G-ENT-003 | Enterprise | Medium | Phase 3 |
| G-ENT-004 | Enterprise | Medium | Phase 3/5 |
| G-ENT-005 | Enterprise | Medium | Phase 5 |

**Total gaps: 28**
**High severity: 9**
**Medium severity: 19**

---

*Enterprise Gap Analysis generated from live code and infrastructure configuration — 2026-06-24.*

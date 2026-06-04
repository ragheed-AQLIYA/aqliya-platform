# Roadmap Conflict Matrix — v1.2

**Purpose:** Document every contradiction between roadmap sources and repository reality.
**Method:** Source A vs Source B vs Code Reality. Final authority = repository evidence.
**Date:** 2026-06-03
**Prerequisite:** ENTERPRISE_COMPLETION_ROADMAP.md, aqliya-roadmap-v1.1.md, PRODUCT_STATUS_MATRIX.md

---

## Conflict 1: L0 Platform Foundation — What Was "Missing" Is Now Built

| Aspect | Detail |
|--------|--------|
| **Source A** | ENTERPRISE_COMPLETION_ROADMAP.md §Layer 0: "Key gap: No staging environment, no IaC, no scheduled backup automation (scripts exist). Rate limiter is in-memory (Redis class stubbed)." Also lists 8 missing foundations in §Part A assessment. |
| **Source B** | L6_PRODUCTION_ROADMAP.md §Missing foundations: job/queue, object storage, API contract, migration governance, test infra, secrets/KMS, notifications/email, feature flags. |
| **Code Reality** | OpenCode built all 8 missing foundations AND more: Secrets vault (AES-256-GCM, `src/lib/platform/secrets/vault.ts`), Notifications engine (`src/lib/platform/notifications/engine.ts`), Feature flags (`src/lib/platform/feature-flags/registry.ts`), Queue runtime (Bull, `src/lib/platform/operations/queue-runtime.ts`), Redis client + rate limiter (`src/lib/platform/redis-client.ts`, `src/lib/platform/rate-limiter/`), S3 storage (`src/lib/platform/storage/s3-storage-provider.ts`), System monitoring (`src/lib/platform/monitoring/system-monitor.ts`), Logger (`src/lib/platform/logger.ts`), Email (`src/lib/platform/email/sender.ts`), Staging docker-compose (`docker-compose.staging.yml`), Audit event service (`src/lib/platform/audit-event-service.ts`), Auth encryption + MFA (`src/lib/auth/encryption.ts`, `src/lib/auth/mfa.ts`). |
| **Resolution** | **Docs are stale.** All 8 missing foundations now exist. L0 Platform Foundation maturity must be reassessed from L4 to L5-capable. Remaining gaps: IaC, HA/DR, SSO/SCIM, scheduled backup automation, penetration test. |
| **Final Authority** | Repository reality |

---

## Conflict 2: L0.5 Intelligence Core — Cost, Eval, Observability All Now Exist

| Aspect | Detail |
|--------|--------|
| **Source A** | ENTERPRISE_COMPLETION_ROADMAP.md §Layer 0.5: "No RAG engine, no eval framework, no cost controls/budgeting, no AI observability dashboard, real LLM providers stubbed." |
| **Source B** | AI Capability Matrix: "Evaluation framework: None. Cost controls: None. AI observability: None." |
| **Code Reality** | OpenCode built the full layer: Provider factory with OpenAI/Anthropic (`src/lib/ai/provider-factory.ts`), Health-checked provider router with cost estimation (`src/lib/ai/provider-router.ts`), Spend tracker from audit logs (`src/lib/ai/spend-tracker.ts`), Cost mapping per model (`src/lib/ai/cost-mapping.ts`), Governed AI executor with human-approval gates (`src/lib/ai/governed-ai-executor.ts`), Eval gate with test suites (`src/lib/ai/eval-gate.ts`), Governance metrics (review rates, overrides) (`src/lib/ai/governance-metrics.ts`), Dedicated Anthropic + OpenAI provider implementations. |
| **Resolution** | **Docs are stale.** Cost controls, eval framework, observability, and provider hardening all exist. Remaining gaps: RAG/pgvector, embeddings, active LLM wiring (env-gated), streaming. |
| **Final Authority** | Repository reality |

---

## Conflict 3: SalesOS — Documented as Frozen, Active in Code

| Aspect | Detail |
|--------|--------|
| **Source A** | ENTERPRISE_COMPLETION_ROADMAP.md §Layer 7: "SalesOS (L3→L4). Freeze as internal tool. 26+ routes and 11 models exist but no further feature work." Also §Layer sequencing rules: "L4–L7 are frozen or internal-only until L1–L3 earn revenue." |
| **Source B** | aqliya-roadmap-v1.1.md Phase 10: "Active workspace hardening." |
| **Code Reality** | 100+ files modified, 50 files deleted (entire v02/ directory), ~20 new files. Active migration from v02 to vnext. New contacts module (`src/app/sales/contacts/`, `src/lib/sales/contacts.ts`, `src/actions/sales-contact-actions.ts`). 18 error.tsx + loading.tsx boundaries added across all SalesOS routes. PrismaRepository refactored. Account brief + pilot handoff export parity. Evidence layer (evidence-links.ts, evidence-resolver.ts). `_v02/` backup created. **This is not frozen behaviour.** |
| **Resolution** | **Docs contradict code.** SalesOS is actively developed. New status: **ACTIVE_WITH_CAUTION** — bug fixes, hardening, architecture improvements allowed; major expansion, new sub-products, new intelligence domains, commercial positioning not allowed. |
| **Final Authority** | Repository reality |

---

## Conflict 4: DecisionOS Maturity — L4 vs L5

| Aspect | Detail |
|--------|--------|
| **Source A** | aqliya-roadmap-v1.1.md Phase 3: "Active" — no specific L level. |
| **Source B** | ENTERPRISE_COMPLETION_ROADMAP.md: "L4→L5 (closer to L5 on gates)." PRODUCT_STATUS_MATRIX.md: L4. |
| **Code Reality** | DecisionOS has real engines: decision-engine.ts, framework.ts, scenarios.ts, risk-analysis.ts, recommendation.ts, learning-engine.ts, sector-benchmark.ts. DecisionEvidence model with full CRUD server actions. Publishing gate with bilingual PDF export. Publish→approve→export gate operational. Missing: outcome-tracking dashboard, monitoring signal automation. |
| **Resolution** | **L4 is conservative; L5-conditional is more accurate.** The gap is UI (outcome dashboard) and signal automation, not engine depth. |
| **Final Authority** | Repository reality → L5-conditional |

---

## Conflict 5: LocalContentOS Maturity

| Aspect | Detail |
|--------|--------|
| **Source A** | aqliya-roadmap-v1.1.md Phase 7: "L5 pilot-ready with conditions / usable v0.1." |
| **Source B** | ENTERPRISE_COMPLETION_ROADMAP.md: "L5-conditional." PRODUCT_STATUS_MATRIX.md: "L5 Pilot-ready with conditions." |
| **Code Reality** | No significant changes in triage. Workspace routes, mutations, governance, seed data. 16 routes. Binary PDF/XLSX exports. Loading/error/not-found states. Mutation feedback loop verified. Missing: supplier scoring depth, tender matching automation, multi-reviewer approval routing. |
| **Resolution** | **Consistent across sources.** L5-conditional remains correct. No change needed. |
| **Final Authority** | All sources aligned |

---

## Conflict 6: Office AI Classification — Product vs Shared Application

| Aspect | Detail |
|--------|--------|
| **Source A** | aqliya-roadmap-v1.1.md Phase 4: "Active foundation." |
| **Source B** | ENTERPRISE_COMPLETION_ROADMAP.md: "Application on the Intelligence Core, not a standalone product. Keep as shared utility." PRODUCT_STATUS_MATRIX.md: "Shared governed application." |
| **Code Reality** | Minor changes only. No new building. 7 lines changed in office-ai-actions.ts. Deterministic generators. |
| **Resolution** | **Correct as documented.** Shared application classification accurately reflects code reality. |
| **Final Authority** | All sources aligned |

---

## Conflict 7: WorkflowOS Status

| Aspect | Detail |
|--------|--------|
| **Source A** | aqliya-roadmap-v1.1.md: "Canonical governed workspace." |
| **Source B** | ENTERPRISE_COMPLETION_ROADMAP.md: L4, "Freeze." PRODUCT_STATUS_MATRIX.md: "L4 Usable v0.1." |
| **Code Reality** | Only minor change: workflowos-actions.ts modified. No new building. CRUD, workflow states, audit trail, file storage, PDF export at L4. |
| **Resolution** | **Correct as documented.** Internal/stable. No active expansion. |
| **Final Authority** | All sources aligned |

---

## Conflict 8: L0 Security Posture — MFA, Encryption, Rate Limiting

| Aspect | Detail |
|--------|--------|
| **Source A** | ENTERPRISE_COMPLETION_ROADMAP.md §Security Roadmap: "MFA exists but not enforced per role. Rate limiter in-memory. No vault." |
| **Source B** | PRODUCT_STATUS_MATRIX.md §Phase 13: "Security hardening (MFA/SSO implementation, HSTS headers, rate-limit improvements)." |
| **Code Reality** | MFA fully implemented (TOTP + backup codes, `src/lib/auth/mfa.ts`). Encryption utility (`src/lib/auth/encryption.ts`). Redis rate limiter built (`src/lib/platform/rate-limiter/redis-rate-limiter.ts`). Secrets vault built (`src/lib/platform/secrets/vault.ts`). Security headers (HSTS) in middleware. Rate-limit module improved. |
| **Resolution** | **Docs partially stale.** MFA, rate limiter, secrets vault now exist. Remaining: SSO/SCIM, pentest, enforcement rules, role-based MFA policy. |
| **Final Authority** | Repository reality |

---

## Conflict Summary

| # | Conflict | Source A | Source B | Code Reality | Resolution |
|---|----------|----------|----------|-------------|------------|
| 1 | L0 Foundation gaps | 8 missing | 8 missing | **All 8 built** + more | Docs stale → update |
| 2 | L0.5 Intelligence gaps | Cost/evals/obs missing | Cost/evals/obs missing | **All 3 built** + router | Docs stale → update |
| 3 | SalesOS status | Frozen (enterprise) | Active (v1.1) | **100+ changes, active** | ACTIVE_WITH_CAUTION |
| 4 | DecisionOS level | L4→L5 | L4 | **L5-capable engines** | L5-conditional |
| 5 | LocalContentOS | L5-conditional | L5-conditional | **Unchanged** | Aligned |
| 6 | Office AI classification | Shared app | Shared app | **Unchanged** | Aligned |
| 7 | WorkflowOS status | L4 frozen | L4 internal | **Unchanged, stable** | Aligned |
| 8 | L0 Security posture | Partial | In progress | **MFA + vault + Redis** | Docs partially stale |

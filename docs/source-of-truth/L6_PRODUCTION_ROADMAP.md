# AQLIYA L6 Production Roadmap — Build & Engineering Plan

> **⚠ SUPERSEDED — 2026-06-03**
> This document is superseded by `docs/official/AQLIYA_ROADMAP_v1.2.md` and `docs/source-of-truth/L6_COMPLETION_PROGRAM.md`.
> Retained in-source for historical reference. Do not use as authority for planning or status decisions.

**Purpose:** Take AQLIYA from "pilot-ready candidate" to **real, production-certified (L6) products** — as an engineering and production program (historical plan — now superseded).
**Explicitly excluded:** customers, revenue, pricing, GTM, pilots, demos. This is a build/production/development plan only.
**Method:** Code reality first. Every "exists" / "missing" is verified against the repository (`prisma/schema.prisma`, `src/lib/*`, `src/app/*`, `.github/workflows/ci.yml`).
**Date:** 2026-06-03 (superseded same date)
**Trust principle:** AI assists. Humans decide. Evidence governs.

> L6 = production-certified: full feature depth, measurable quality gates met, isolation-tested, recoverable, observable, and governed. No product in the repo is L6 today.

---

## Part A — Assessment of the Proposed Roadmap

**Overall grade: 7.5 / 10 — strong skeleton, right instincts, but four structural errors and several missing foundations.**

### What the proposed roadmap gets right
- **Foundation-first is correct.** Building product depth on an unstable platform is the classic failure mode. Platform L6 before product L6 is the right call.
- **Dependency direction is mostly sound:** Platform → AuditOS → LocalContentOS → DecisionOS is a defensible value/maturity order.
- **Coverage is comprehensive** across security, auditability, reliability, AI, and per-product depth.
- **The AuditOS "missing engines" (Sampling / Materiality / Risk) are a correct, code-verified catch** — no such models or real engines exist today.

### Where it is wrong or risky (evidence-based corrections)

| # | Issue in proposed roadmap | Code reality | Correction |
| --- | --- | --- | --- |
| C1 | **Local Models listed as mandatory Platform Foundation L6** (before any product) | `local-provider.ts` throws by design; no runtime, no eval parity | **Move local models to the Air-Gapped layer.** Foundation = OpenAI/Anthropic + deterministic default only. Otherwise the whole program stalls on a runtime nobody needs yet |
| C2 | **RAG / Vector placed only under Office AI L6** | No pgvector/embeddings anywhere; evidence grounding needed by AuditOS, DecisionOS, LocalContentOS too | **RAG + vector storage is a shared Platform AI capability**, not an Office-AI silo. Build once at platform level; Office AI consumes it |
| C3 | **Tenant Provisioning / Billing / Lifecycle parked under "Organizations L6" (near-last)** | Tenant guards + `platformOrganizationId` exist, but no provisioning/lifecycle engine | **Tenant lifecycle belongs in Platform Core.** Multi-tenant AuditOS L6 cannot exist without it. Move provisioning up; leave only org hierarchy/admin UI in the Organizations layer. (Billing is excluded entirely — no revenue scope) |
| C4 | **Compliance (SOC2/ISO/PDPL/NCA) placed strictly after all products** | Audit-event layer exists but is not immutable/tamper-evident/retained | **Split compliance in two:** *compliance-by-design* (immutability, retention, access reviews, encryption) is built into Platform Foundation now; *certification* (the audits themselves) comes later. You cannot retrofit control instrumentation after eight products |
| C5 | **Strict serial chain implies one product at a time** | Products share `src/lib/governance`, `src/lib/ai`, platform audit | The chain is a **dependency order, not an execution order.** Once Platform L6 lands, AuditOS/LocalContentOS/DecisionOS depth can progress in parallel because they reuse the same foundation |
| C6 | **DecisionOS framed as shallow / "less deep than AuditOS"** | Real `decision-engine`, `framework`, `scenarios`, `risk-analysis`, `learning-engine`, `sector-benchmark` files exist | DecisionOS already has substantial engine code at L4. Its gap is **governance gates (review/approval/export) + UI depth**, not missing engines. Effort is smaller than implied |
| C7 | **SalesOS framed as "largest separate project" deserving full CRM+RevIntel+AI L6** | Just unblocked from phantom imports; intelligence tabs stubbed; internal tool | In a no-customer build plan, SalesOS-to-L6 is the **highest-effort / lowest-leverage** track (it competes with mature commercial CRMs). Recommend capping at hardened L4 internal unless it is a declared product line |

### Missing foundations the proposed roadmap omits entirely
These are not optional — products cannot reach honest L6 without them:

1. **Background job / queue runtime.** Exports, batch AI, sampling, scheduled backups are synchronous today. No worker/queue exists. **Required** before any "engine" (sampling, materiality, batch reports).
2. **Object storage abstraction.** File storage is local disk (`LOCAL_STORAGE_DIR`). Blocks multi-instance, HA, and DR. Must move to S3-compatible storage.
3. **API contract layer.** No OpenAPI spec, no versioning on `/api/*`. "Real product" needs stable, documented, versioned contracts.
4. **Migration & schema governance.** History shows enums reverted to `String` to unblock builds. Need a migration discipline + a forward enum/type strategy before depth piles on.
5. **Test infrastructure as a platform gate.** Integration tests require manual Docker Postgres; Cypress E2E is thin. Need CI-native integration DB + coverage thresholds + E2E gates — platform-wide, not just "AI regression."
6. **Secrets/KMS + field-level PII encryption.** Today `.env` + `validate-env`. No vault, no at-rest field encryption for sensitive audit/financial data.
7. **Notification/email infrastructure.** WorkflowOS automation, escalations, and approvals need it; none exists.
8. **Feature-flag / config service** for safe progressive rollout of L6 engines.

---

## Part B — Corrected L6 Production Roadmap

### Execution model

```
LAYER 0    Platform Foundation L6  ─────────────►  (hard gate: pure infra/security plumbing)
                │   auth mechanics, sessions, secrets/KMS, infra/IaC, reliability,
                │   jobs/queue, object storage, API contract, test infra, tenant lifecycle
                ▼
LAYER 0.5  AQLIYA Intelligence Core L6  ─────────►  (hard gate: shared governed-intelligence substrate)
                │   unified RBAC/policy/ABAC · governance (approval/escalation/SoD/provenance)
                │   AI orchestration + evals + cost + observability · shared RAG/vector
                │   ★ shared Workflow Engine (states/SLA/escalation) — promoted from WorkflowOS
                │   sector intelligence · reporting · document handling
                ▼
LAYER 1  AuditOS L6  ─┐
LAYER 2  LocalContentOS L6  ─┤  (parallelizable once 0 + 0.5 done — shared substrate)
LAYER 3  DecisionOS L6  ─┘
                ▼
LAYER 4  WorkflowOS L6 (product UI: visual builder + client workspace) ─┐
LAYER 5  Office AI L6 (consumes shared RAG + agents)                     ─┤  (parallelizable)
LAYER 6  Organizations L6                                                ─┘
                ▼
LAYER 7  SalesOS L6  (optional / declared-product-only — lowest build leverage)
                ▼
LAYER 8  Enterprise Hardening L6   (HA, DR, multi-region, SSO/SCIM, pentest program)
                ▼
LAYER 9  Compliance Certification  (SOC2 / ISO 27001 / PDPL / NCA ECC — design-built earlier, certified here)
                ▼
LAYER 10 Air-Gapped / On-Prem + Local AI Runtime  (heaviest; build last)
```

**Rule:** Layers 0 and 0.5 are serial and blocking — **0.5 is the shared substrate every product consumes, so it must follow 0 and precede all products.** Layers 1–6 parallelize across teams on top of 0 + 0.5. Layers 8–10 are independent hardening tracks that begin design in Layer 0 and complete late.

---

## LAYER 0 — Platform Foundation L6 (blocking)

Must complete before any product is certified L6. Grouped by domain with code reality and L6 definition-of-done.

### 0.1 Security — Authentication
| Capability | Reality | L6 target |
| --- | --- | --- |
| MFA enforcement | ✅ MFA enforced by role via MFA_REQUIRED_ROLES env var (default: ADMIN) | Done 2026-06-03 |
| Session revocation | JWT sessions, no revocation list | Server-side session/refresh revocation + device list |
| Password policies | bcrypt, basic | Complexity, rotation, breach-check, lockout |
| Device trust | None | Trusted-device registration + step-up auth |

### 0.2 Security — Authorization
| Capability | Reality | L6 target |
| --- | --- | --- |
| RBAC | Real but **per-product** (`sales/permissions.ts`, platform access) | **Unified RBAC engine** — one policy module all products call |
| Policy engine | Scattered checks | Central policy evaluation (deny-by-default, testable) |
| ABAC | None | Attribute-based rules (org, role, sensitivity, ownership) |

### 0.3 Enterprise Identity
| Capability | Reality | L6 target |
| --- | --- | --- |
| OIDC | OAuth Google/GitHub invite-only | Generic OIDC IdP support |
| SAML / LDAP / SCIM | None | Build at platform level; **does not block product engines** — runs as a parallel identity track |

### 0.4 Auditability
| Capability | Reality | L6 target |
| --- | --- | --- |
| Audit events | `PlatformAuditEvent` + per-product events | **Immutable** append-only store |
| Tamper detection | None | Hash-chained / signed audit records |
| Retention policies | `createdById` lineage only | Policy-driven retention + purge automation |
| Export pipelines | Per-product exports | Unified audit export (SIEM-ready format) |

### 0.5 Governance Layer
| Capability | Reality | L6 target |
| --- | --- | --- |
| Approval workflows | `approval-state.ts` exists | Generalized, reused by every product |
| Escalation | `escalation.ts` exists | Policy-driven escalation across products |
| Separation of Duties | **None found** | SoD enforcement (maker ≠ checker) in policy engine |

### 0.6 Reliability — Infrastructure
| Capability | Reality | L6 target |
| --- | --- | --- |
| IaC | None | Terraform/Pulumi for staging + prod + DR |
| Automated provisioning | None | One-command environment build |
| Staging | None | Persistent staging mirroring prod |
| Production | Vercel managed | Hardened prod with rollback |
| DR environment | None | Standby + documented RTO/RPO |

### 0.7 Reliability — Operations
| Capability | Reality | L6 target |
| --- | --- | --- |
| Monitoring | Sentry, `/api/health`, `/api/metrics` | Golden-signals dashboards |
| Alerting | None wired | On-call alerts (errors, latency, backup failure) |
| Observability | Errors only | Traces + structured logs + metrics |
| Backups | Manual scripts | **Automated + scheduled** |
| Restore validation | None | **Tested restore drill** (recurring, documented) |

### 0.8 AI Foundation
| Capability | Reality | L6 target |
| --- | --- | --- |
| Providers (OpenAI/Anthropic) | Real, opt-in | Production hardening: retry, timeout, streaming, fallback |
| Local models | Stub (throws) | **Deferred to Layer 10** — not a foundation blocker |
| Prompt registry + versioning | Registry exists | Versioned prompts + change-review workflow |
| Prompt approval workflow | None | Governed prompt promotion (dev→prod) |
| Evaluation / benchmark framework | None | Golden-set evals per task type |
| Regression testing (AI) | None | Eval regression gate in CI |
| Hallucination controls | Human-review + evidence linkage | Grounding/citation enforcement |
| Cost tracking | None | Per-tenant token budgets + alerts |
| Latency / quality metrics | None | AI observability dashboard |
| **RAG + vector storage (shared)** | **None** | **pgvector on existing Postgres — shared platform service** (corrects C2) |

### 0.9 Missing platform infra (from Part B gaps)
| Capability | Reality | L6 target |
| --- | --- | --- |
| Job/queue runtime | None (synchronous) | Worker + queue for batch AI, exports, engines, backups |
| Object storage | Local disk | S3-compatible storage abstraction |
| API contract | No OpenAPI/versioning | Versioned OpenAPI for `/api/*` |
| Migration governance | Enum→String reverts | Forward migration + type strategy, no destructive drift |
| Test infra | Manual Docker PG, thin E2E | CI-native integration DB + coverage gates + E2E |
| Secrets/KMS + PII encryption | `.env` only | Vault/KMS + field-level encryption for financial/PII |
| Tenant lifecycle (provisioning) | Guards only | **Provisioning + lifecycle engine** (corrects C3) |
| Notifications | None | Email/notification service |
| Feature flags | None | Config/flag service for safe rollout |

**Layer 0 Exit Gate (L6 foundation DoD):**
`tsc`+`lint`+`test`+`build` green; CI runs integration DB; cross-tenant isolation test suite passes; automated backup with a passed restore drill; alerting live on golden signals + backup failure; immutable audit *store* with retention; object storage + job queue in use; versioned API contract published; tenant lifecycle/provisioning engine live; staging environment live.

> **Note:** §0.2 Authorization, §0.5 Governance, and §0.8 AI Foundation are *built* on Layer 0 infra but *belong to and are certified in Layer 0.5 (Intelligence Core)* below — they are product-facing shared services, not raw plumbing. Layer 0 ships their substrate (storage, jobs, policy hooks); Layer 0.5 ships the governed engines.

---

## LAYER 0.5 — AQLIYA Intelligence Core L6 (blocking, between Foundation and products)

The shared governed-intelligence substrate every product consumes. **Already a named architectural layer** in `aqliya-glossary-v1.1.md` ("governance, workflow, AI orchestration, permissions, audit logs, document handling, reporting") and `PRODUCT_STATUS_MATRIX.md` (currently **L4 — shared services only**). This layer takes it to L6 **once**, so no product reimplements approvals, AI, or workflow.

### 0.5.1 Unified permissions & policy
| Capability | Reality | L6 target |
| --- | --- | --- |
| RBAC engine | Per-product (`sales/permissions.ts`, platform access) | **One policy engine** all products call (deny-by-default, testable) |
| ABAC | None | Attribute rules (org, role, sensitivity, ownership) |

### 0.5.2 Governance runtime
| Capability | Reality | L6 target |
| --- | --- | --- |
| Approval / escalation | `governance/approval-state.ts`, `escalation.ts` exist | Generalized, reused by every product |
| Separation of Duties | **None** | SoD enforcement (maker ≠ checker) in the policy engine |
| Provenance / actor lineage | `provenance.ts`, `actor-lineage.ts` exist | Signed provenance on every governed action |

### 0.5.3 AI orchestration & governance
| Capability | Reality | L6 target |
| --- | --- | --- |
| Orchestrator + providers | Real (`orchestrator.ts`, OpenAI/Anthropic) | Production hardening: retry/timeout/streaming/fallback |
| Prompt registry + versioning + approval | Registry exists | Versioned prompts + governed dev→prod promotion |
| Evaluation / regression | **None** | Golden-set evals per task type, CI regression gate |
| Cost / latency / quality observability | **None** | Per-tenant token budgets + AI dashboards |
| **Shared RAG + vector store** | **None** | pgvector service consumed by AuditOS/DecisionOS/LocalContentOS/Office AI |

### 0.5.4 ★ Shared Workflow Engine (promoted from WorkflowOS — Recommendation 1)
| Capability | Reality | L6 target |
| --- | --- | --- |
| Workflow/state machinery | `lib/workflowos/services.ts` — **consumed only by its own routes today** | **Extract into a shared engine**: states, transitions, SLA timers, escalation hooks |
| Audit + storage + export | `workflowos/{audit,storage,export}.ts` exist | Generalized so every product's review/approval flow runs on it |
| Consumers | WorkflowOS only | AuditOS sign-off chain, DecisionOS gates, LocalContentOS approvals all reuse it |

> **Scope discipline:** Only the *engine* is promoted here. The WorkflowOS **product UI** (visual builder, client workspace) stays at Layer 4. This avoids building a full product before the products.

### 0.5.5 Shared reporting, documents & sector intelligence
| Capability | Reality | L6 target |
| --- | --- | --- |
| Reporting / export | Per-product pdfkit/xlsx | Shared bilingual report+export service |
| Document handling | Per-product storage | Shared document service on Layer 0 object storage |
| Sector intelligence | `Sector*` models + `decision/sector*.ts` | Cross-product benchmarks/patterns/playbooks/rules as a shared service |

**Layer 0.5 Exit Gate (L6 Intelligence Core DoD):**
Unified RBAC + SoD enforced and tested across ≥2 products; governance approval/escalation/provenance generalized and reused; shared workflow engine drives at least AuditOS *and* one other product's review flow; AI eval regression gate active + per-tenant cost caps live; shared RAG service answers with cited evidence; shared reporting/document/sector services consumed by ≥2 products. No product proceeds to L6 on private copies of these services.

---

## LAYER 1 — AuditOS L6 (current ≈ L5)

Closest to production. Highest build leverage.

| Workstream | Reality | L6 target |
| --- | --- | --- |
| **Sampling engine** | **No model/engine** (keyword only) | Statistical + judgmental sampling with parameters + reproducibility |
| **Materiality engine** | None | Overall + performance + clearly-trivial thresholds, period-aware |
| **Risk engine** | None | Risk assessment model → linkage to procedures |
| Review workflow | Review comments + approval records exist | Full reviewer→manager→partner sign-off chain at scale |
| Evidence — versioning | EvidenceLink exists | Versioned evidence with diff history |
| Evidence — traceability | Traceability surfaces exist | Target-specific, label-complete traceability |
| Evidence — chain of custody | Partial (createdById, events) | Signed chain of custody on every evidence transition |
| Executive / committee / regulatory reports | PDF export exists | Three report classes, bilingual, audit-logged |
| Collaboration (reviewer/manager/partner) | Roles exist | Role-scoped workspaces |
| **Client portal** | **None** | External-user portal (new auth scope, tenant-isolated) |
| Analytics (portfolio/engagement/firm) | None | Three dashboard tiers |

**Exit gate:** sampling/materiality/risk engines produce reproducible, evidence-linked outputs; full sign-off chain audited; bilingual report classes export with audit events; isolation tests green; Arabic PDF font fidelity resolved.

---

## LAYER 2 — LocalContentOS L6 (current ≈ L5-conditional)

| Workstream | Reality | L6 target |
| --- | --- | --- |
| Compliance rule engine | Classification model + actions | Dynamic rule engine with versioned rules |
| Dynamic scoring | Basic | Configurable scoring + threshold management |
| Supplier intelligence | Supplier model exists | Profiles + risk scoring + historical performance |
| Project intelligence | Single-project | Multi-project comparison + trend + forecasting |
| Reports (gov/exec/contractor) | PDF/XLSX export exists | Three report classes, bilingual, audit-logged |

**Exit gate:** rule engine drives scoring; supplier risk reproducible; multi-project analytics live; Arabic PDF fidelity resolved; isolation tests green.

---

## LAYER 3 — DecisionOS L6 (current ≈ L4, deeper than assumed — corrects C6)

| Workstream | Reality | L6 target |
| --- | --- | --- |
| Framework engine | `framework.ts`, templates exist | Framework library + custom builder UI |
| Scenario engine | `scenarios.ts` exists | Modeling + side-by-side comparison |
| Risk engine | `risk-analysis.ts` exists | Risk scoring + sensitivity analysis |
| Decision governance | Bilingual report + PDF export + audit; **gates at L3** | Review/approval/escalation gates (the real gap) |
| Outcome tracking | `learning-engine.ts`, outcome models exist | Decision-vs-outcome loops surfaced in UI |

**Exit gate:** review→approval→export gate enforced + audited; scenario comparison + sensitivity live; outcome loops visible; bilingual parity across tabs.

---

## LAYER 4 — WorkflowOS L6 (product UI; engine lives in Layer 0.5)

> The reusable workflow **engine** (states, SLA, escalation) was promoted to Intelligence Core (§0.5.4). This layer is the **product surface** built on that engine — not a reimplementation.

| Workstream | Reality | L6 target |
| --- | --- | --- |
| Visual workflow builder | Fixed workflows | Drag-build conditional logic + SLA rules **over the shared engine** |
| Automation UI | Manual | Notifications + escalations + delegation (via Layer 0 notifications + 0.5 engine) |
| Monitoring | None | SLA tracking + throughput analytics |
| Client workspace | `Sunbul*` workspace at L4 | Multi-client governed workspace, tenant-isolated |

**Exit gate:** product configures workflows on the shared engine (no private workflow code); automation fires via platform notifications; throughput + SLA dashboards live.

---

## LAYER 5 — Office AI L6 (current ≈ L4 shared app)

| Workstream | Reality | L6 target |
| --- | --- | --- |
| Knowledge layer | Deterministic task service | Enterprise search + **RAG over shared platform vector store** (consumes Layer 0.8) |
| Agent layer | None | Task / research / review agents (governed, bounded) |
| Governance | Human-review by design | Human approval + evidence references on every agent output |

**Exit gate:** RAG answers cite evidence; agents are bounded + human-approved; no autonomous final actions; eval thresholds met.

---

## LAYER 6 — Organizations L6 (current ≈ L2/L3 mock)

| Workstream | Reality | L6 target |
| --- | --- | --- |
| Organization management | **Mock constants** | Real CRUD + hierarchies + departments |
| Administration | None | Roles + licenses + quotas admin |
| Tenant management | Provisioning moved to Layer 0 | Org-facing lifecycle UI on top of platform provisioning |

**Exit gate:** mock replaced by Prisma-backed org model; hierarchy + admin console live; consumes platform tenant lifecycle.

---

## LAYER 7 — SalesOS L6 (optional / declared-product-only — corrects C7)

**Recommendation:** In a no-customer build program, cap SalesOS at **hardened L4 internal** unless it is a declared product line. Full CRM + revenue intelligence + AI to L6 competes with mature commercial CRMs and is the lowest-leverage L6 investment. If pursued: CRM core (done at L4) → revenue intelligence (forecasting, pipeline health, territory) → AI intelligence (deal risk exists; next-best-action, objection analysis exist as agents) → governance (approval, revenue controls, audit trail exist) → executive analytics. Build only after Layers 1–6 are L6.

---

## LAYER 8 — Enterprise Hardening L6

Begins design in Layer 0; completes as an independent track.

- HA (multi-AZ DB, redundancy), DR (standby + tested failover), multi-region.
- SSO (SAML/OIDC) + SCIM provisioning productionized.
- Pentest program + vulnerability management program (recurring, not one-off).
- Deployment models: SaaS hardened; Private Cloud packaging prepared (On-Prem/Air-Gapped → Layer 10).

**Exit gate:** failover drill passes RTO/RPO; pentest highs/criticals closed; SCIM provisions/deprovisions verified.

---

## LAYER 9 — Compliance Certification (design-built in Layer 0)

- SOC 2 Type I → Type II; ISO 27001 control mapping → certification.
- PDPL (Saudi) + NCA ECC self-assessment → alignment evidence.
- Control evidence repository maintained continuously (not retrofitted).

**Exit gate:** external audit underway/passed; control evidence current; access reviews recurring.

---

## LAYER 10 — Air-Gapped / On-Prem + Local AI Runtime (heaviest, last)

- On-prem packaging; offline licensing; sealed update channel; zero-egress validation.
- **Local AI runtime** (Ollama/vLLM/Qwen/Llama) — the deferred item from C1: implement `local-provider`, achieve eval parity with cloud providers, in-Kingdom hosting option.
- Data residency proofs for government deployment.

**Exit gate:** reproducible air-gapped install; zero external egress verified; local-model eval parity with cloud baseline.

---

## Verification Discipline (applies to every layer)

Run before claiming any layer's exit gate; record date + commit hash:

```bash
npx tsc --noEmit
npm run lint -- --quiet
npm test            # incl. CI-native integration DB once Layer 0 lands
npm run build
npm run audit:action-guards
# + layer-specific: isolation tests, restore drill, AI eval suite
```

**No layer is L6 until its exit gate commands actually pass and are recorded.** No capability is marketed or documented as live above the maturity its code proves — update `PRODUCT_STATUS_MATRIX.md` first, then this file.

---

## Summary of Corrections to the Proposed Roadmap

1. **Local models → Layer 10**, not Foundation (C1).
2. **RAG/vector → shared Intelligence Core service**, not Office-AI silo (C2).
3. **Tenant provisioning/lifecycle → Platform Core**; only org admin/hierarchy stays in Organizations (C3).
4. **Compliance split:** by-design in Foundation, certification in Layer 9 (C4).
5. **Dependency order ≠ serial execution:** Layers 1–6 parallelize on shared foundation (C5).
6. **DecisionOS is deeper than assumed** — gap is gates+UI, not engines (C6).
7. **SalesOS L6 is optional/low-leverage** in a no-customer build plan (C7).
8. **Added eight missing foundations:** job queue, object storage, API contract, migration governance, test infra, secrets/KMS+PII encryption, notifications, feature flags.

## Adopted Recommendations (Ragheed, 2026-06-03)

- **R-A — AQLIYA Intelligence Core as an explicit layer (ACCEPTED).** Added **Layer 0.5** between Foundation and products. Honors the existing official architecture (glossary/taxonomy/master-reference/status-matrix already name it as the shared platform layer at L4). Centralizes RBAC/policy, governance (approval/escalation/SoD/provenance), AI orchestration+evals+cost+RAG, reporting/documents, and sector intelligence so no product reimplements them. Blocking gate: must reach L6 before any product.
- **R-B — WorkflowOS raised early (ACCEPTED with precision).** Only the **workflow engine** (states/SLA/escalation/approval orchestration) is promoted into Intelligence Core (§0.5.4) as shared substrate — consumed by AuditOS sign-off, DecisionOS gates, LocalContentOS approvals. The **WorkflowOS product UI** (visual builder, client workspace) remains at Layer 4. Rationale: `lib/workflowos/services.ts` is real but currently consumed only by its own routes; it must be abstracted before it is foundational, and elevating the whole product would rebuild the "product-before-products" trap.

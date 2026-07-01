# Governance, Compliance & Deployment Gap Report (Agent 5)

**Date:** 2026-05-29
**Agent:** 5 — Governance, Compliance, and Deployment Models
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Program:** AQLIYA Full Institutional Platform Build (Agent 0 master plan: `docs/reports/aqliya-full-platform-build-program-plan.md`)
**Classification (unchanged, not upgraded):** Controlled pilot ready with conditions
**Trust principle:** AI assists. Humans decide. Evidence governs.

> **Scope discipline.** DOCUMENTATION-ONLY pass. No application code edited, no schema migrated. Single-owner files (`PRODUCT_STATUS_MATRIX.md`, `AGENTS.md`, `aqliya-product-taxonomy-v1.1.md`) untouched. All schema/enforcement changes are listed as **APPROVAL-GATED proposals** (not applied). Per Agent 0: On-Prem / Air-Gapped / Local AI are **strategic directions**, not implemented.

---

## 1. Scope Inspected

### 1.1 Authority & source-of-truth docs read
- `docs/reports/aqliya-full-platform-build-program-plan.md` (Agent 0 master plan)
- `docs/source-of-truth/READINESS_GATES.md`, `README.md`
- `docs/governance/SECURITY_REVIEW.md`
- `docs/product/pilot-control-pack/customer-data-handling-rules.md`
- `docs/operations/backup-schedule.md`
- `docs/archive/DEPLOYMENT.md`
- `docs/theoretical-reference/12-01-deployment-flexibility-thesis.md`, `12-10-regulated-deployment-readiness.md` (aspirational doctrine)

### 1.2 Code reality inspected (narrow Glob/Read/Grep — no scans)
- Access control: `src/middleware.ts`, `src/lib/platform/require-platform-admin.ts`, `src/lib/governance/actor-lineage.ts`
- Audit: `src/lib/platform/audit-log.ts`, `audit-logger.ts`; `prisma/schema.prisma` (`PlatformAuditLog` model, `UserRole` enum)
- Governance: `src/lib/governance/{approval-state,provenance,escalation}.ts` (+ examples/tests index)
- Export/download: `src/lib/platform/{download,export}.ts`
- Deployment artifacts: `Dockerfile`, `docker-compose.yml`, `.env.example`
- AI/deployment: `src/lib/ai/providers/local-provider.ts`

### 1.3 Not run (Low-Load Execution Protocol)
`npm run build/lint/test`, `npx tsc --noEmit`, `prisma generate/validate/migrate`, dev server, Docker, browser, dependency installs, broad repo scans.

---

## 2. Current Reality — Classification

Legend: **IMPLEMENTED · PARTIAL · PROTOTYPE · DOCUMENTATION-ONLY · MISSING**.

### 2.1 Governance & Compliance

| Pillar | Classification | Evidence |
| ------ | -------------- | -------- |
| Authentication perimeter | IMPLEMENTED | `src/middleware.ts` (allowlist + matcher, 401/redirect), NextAuth v5 |
| Authorization / RBAC | PARTIAL | `UserRole` enum (`schema.prisma:9`); per-product guards; `canMutateByLineage`; no central enforcer |
| Tenant isolation | PARTIAL | tenant fields + AuditOS `assertEngagementAccess` (`SECURITY_REVIEW.md` §2); cross-org test pending |
| Auditability | IMPLEMENTED | `PlatformAuditLog` (`schema.prisma:162`), `writePlatformAuditLog`, `auditLogger` |
| Audit integrity (tamper-evident) | MISSING | no hash chain/signing; default safe-mode can drop events (`audit-log.ts:143`) |
| Approval trails | IMPLEMENTED | `approval-state.ts` (AI-forbidden transitions, human-approval gate) |
| Evidence integrity | PARTIAL | `provenance.ts` + upload checksums/scan; no cryptographic signing |
| Data retention/deletion | DOCUMENTATION-ONLY | `customer-data-handling-rules.md`; no enforcing code/purge job |
| Export logs | PARTIAL | reviewer-gated export rule + audit-action records; no `ExportRecord` entity |
| Risk flags / escalation | IMPLEMENTED (library) | `escalation.ts`, escalation levels gate finalization |
| Policy enforcement (regulatory rule packs) | DOCUMENTATION-ONLY | doctrine 12.10; no rule engine |

### 2.2 Deployment Models

| Model | Status | Evidence |
| ----- | ------ | -------- |
| Cloud (AQLIYA Cloud) | **REAL** (controlled pilot) | `Dockerfile`, `docker-compose.yml`, `docs/archive/DEPLOYMENT.md`, `.env.example` |
| Private Cloud | **PARTIAL** | same artifact + customer Postgres + local storage; no validated runbook |
| On-Prem | **ASPIRATIONAL** | generic Docker only; no installer/offline bundle/local AI |
| Air-Gapped | **FUTURE** | Local AI stub throws; no offline update; no signed portable evidence |
| Local AI runtime | MISSING | `local-provider.ts` `execute()` throws "not implemented" |

Full matrix: `docs/source-of-truth/DEPLOYMENT_MODELS.md` §3.

---

## 3. Gaps

**G-1 — Centralized RBAC absent (governance, High).** Enforcement is per-product (`require-platform-admin.ts`, AuditOS `requireRole`, `canMutateByLineage`). No shared `PermissionEnforcer`; correctness depends on each product. Blocks confident multi-customer institutional claims.

**G-2 — Audit trail not tamper-evident (governance, High).** `PlatformAuditLog` rows are independent; no hash chain/signature, and default writes are safe-mode (silent failure). Contradicts the "auditor-verifiable, self-contained evidence" doctrine (12.10) — which is aspirational.

**G-3 — Data retention/deletion unenforced (compliance, High).** Strong documented policy (pilot+30d, 7-day deletion, 24h incident notice) with **no code enforcement** — no retention field, no purge job, manual deletion only. A real compliance exposure for multi-customer use.

**G-4 — Evidence integrity has no cryptographic signing (governance, Medium).** Provenance + checksums exist; portable signed evidence does not.

**G-5 — Export accountability rides on audit actions only (compliance, Medium).** No dedicated export-record entity (content hash, recipient, approver).

**G-6 — Deployment beyond Cloud is unproven (deployment, High).** Private Cloud is plausible-but-unvalidated; On-Prem/Air-Gapped are doctrine-only; Local AI is a stub. The deployment-flexibility doctrine must not be read as capability.

**G-7 — Regulatory readiness is doctrine-only (compliance, Medium).** No rule packs, compliance evidence map, or regulatory dashboard (doctrine 12.10).

**G-8 — Cloud is not production-grade (deployment, Medium).** Monitoring/alerting, automated backup with tested restore, and external pen-test are open (`READINESS_GATES.md` "Commercial Ready").

---

## 4. Proposed Framework & Deployment Posture

Two source-of-truth documents were created as the governance/deployment baseline:

- `docs/source-of-truth/GOVERNANCE_FRAMEWORK.md` — pillars matrix, access-control model, audit integrity, approval/evidence governance, retention/export/risk, policy-enforcement layers, multi-customer readiness, explicit boundaries, and APPROVAL-GATED proposals.
- `docs/source-of-truth/DEPLOYMENT_MODELS.md` — honest per-model status, deployment readiness matrix (model × capability × status × evidence), per-model gaps, AI provider reality, explicit non-claims.

**Posture:** govern at **controlled-pilot** maturity honestly; treat centralization, tamper-evidence, retention enforcement, and non-Cloud topologies as **gated future work**, not current capability.

### 4.1 APPROVAL-GATED proposals (DO NOT APPLY)
Per `AGENTS.md` §13 (no schema for hypothetical On-Prem/Air-Gapped; changes must tie to active features). All deferred, owner-approval + Agent 5 sequencing required:

| ID | Proposal | Type | Need |
| -- | -------- | ---- | ---- |
| GP-1 | `previousHash` + `entryHash` on `PlatformAuditLog` (tamper-evident chain) | Schema | Audit integrity |
| GP-2 | Default governance-critical audit writes to strict mode | Code | Prevent silent gaps |
| GP-3 | `RetentionPolicy` + `deleteAfter` + governed purge job | Schema + ops | Enforce retention |
| GP-4 | `ExportRecord` entity (hash, recipient, approver, org) | Schema | Export accountability |
| GP-5 | Consolidate role strings → canonical `UserRole` behind shared enforcer | Code | Centralized RBAC |

No deployment-driven schema is proposed (forbidden by `AGENTS.md` §13). Deployment maturation is infra/ops work, not data-model change.

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/source-of-truth/GOVERNANCE_FRAMEWORK.md` | **Created** — governance framework baseline |
| `docs/source-of-truth/DEPLOYMENT_MODELS.md` | **Created** — honest deployment-model readiness + matrix |
| `docs/reports/governance-compliance-deployment-gap-report.md` | **Created** — this report |

No application code, schema, route, or config changes. Single-owner files untouched.

---

## 6. Commands Run

```text
(MCP) move_agent_to_root → C:\Users\PC\Documents\Aqliya
Read/Glob/Grep (read-only): master plan, READINESS_GATES, SECURITY_REVIEW,
  customer-data-handling-rules, backup-schedule, DEPLOYMENT, doctrine 12-01/12-10,
  middleware.ts, require-platform-admin.ts, actor-lineage.ts, approval-state.ts,
  provenance.ts, audit-log.ts, audit-logger.ts, download.ts, export.ts,
  local-provider.ts, Dockerfile, .env.example, schema.prisma (PlatformAuditLog, UserRole)
```

No heavy commands (no build/lint/test/tsc/prisma/docker/dev-server/installs/scans).

---

## 7. Validation Result

| Check | Result |
| ----- | ------ |
| Read-only inspection of governance/deployment surfaces | **Run — Pass** (state captured) |
| Markdown deliverables created (3) | **Pass** |
| `npx tsc --noEmit` / `prisma validate` / build / lint / test | **Not run** (Low-Load; delegate to QA Agent 13) |

**Interpretation:** Documentation-only change; no engineering validation required or claimed. Classification remains **controlled pilot ready with conditions** (not upgraded).

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| R1 | Over-claiming compliance/On-Prem/Air-Gapped from doctrine | High | Explicit non-claim boundaries in both source-of-truth docs |
| R2 | Audit gaps under DB failure (safe-mode writes) | Medium | GP-2 (strict mode) — approval-gated |
| R3 | Unenforced retention → compliance exposure | High | GP-3 — approval-gated; meanwhile retention stays a documented manual procedure |
| R4 | Schema-proposal scope creep | Medium | All proposals deferred + gated per `AGENTS.md` §13; Agent 5 sequences before Wave 5 |
| R5 | Doctrine (12.x) mistaken for capability by downstream agents | High | Aspirational labeling throughout; matrix uses code evidence only |

---

## 9. Next Lowest-Load Step

Owner reviews the five APPROVAL-GATED proposals (GP-1…GP-5) and decides which (if any) become a scoped, sequenced Agent 5 schema/code pass **before Wave 5** portfolio work. The cheapest immediate win is **GP-2** (default strict-mode audit writes on governance-critical paths) — a code-only change with no migration. No build/test work should begin until the owner resolves Agent 0's P0-1 working-tree question and the QA agent re-validates on a committed tree.

---

## Agent 5 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | DONE — documentation-only |
| **Code changed** | No |
| **Schema changed** | No (5 proposals listed, none applied) |
| **Classification** | Controlled pilot ready with conditions (unchanged) |
| **Deliverables** | `GOVERNANCE_FRAMEWORK.md`, `DEPLOYMENT_MODELS.md`, this report |

*Agent 5 — Governance, Compliance, and Deployment Models. Cloud is real; Private Cloud is plausible-but-unvalidated; On-Prem is aspirational; Air-Gapped is future. AI assists. Humans decide. Evidence governs.*

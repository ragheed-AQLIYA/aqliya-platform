# AQLIYA — AI Entry Point

> **Read this first.** This is the only document every AI assistant must read before making any change to the AQLIYA repository.
>
> **Status:** Permanent | **Version:** 1.1 | **Date:** 2026-07-19 | **Owner:** Documentation Team | **Authority:** Highest — orientation only, does not override `DOCUMENTATION_AUTHORITY.md` | **Last Reviewed:** 2026-07-19
>
> **Canonical path:** `docs/AI_ENTRYPOINT.md` (this file). Mirror pointer: `docs/official/AI_ENTRYPOINT.md`. Governance: **ADR-109**.

---

## What AQLIYA Is

AQLIYA is a **Private Governed Institutional Intelligence Platform**.

> **Arabic:** عقلية هي منصة ذكاء مؤسسي خاص ومحكوم تساعد الجهات على بناء وتشغيل أنظمة مؤسسية ذكية داخل بيئة مضبوطة، مع حوكمة، أدلة، صلاحيات، وسجل تدقيقي.
>
> **English:** AQLIYA is a Private Governed Institutional Intelligence Platform that helps institutions build governed, evidence-based intelligent systems across cloud and private environments.

### Trust Principle

> **AI assists. Humans decide. Evidence governs.**
>
> Arabic: الذكاء الاصطناعي يساعد. الإنسان يقرر. الدليل يحكم.

### What AQLIYA is NOT

- Not AuditOS only
- Not SaaS only
- Not an AI chatbot
- Not a CRM
- Not a generic workflow tool
- Not a collection of disconnected demos
- Not a marketing website without operational systems

---

## Repository Purpose

| Area | Location | Purpose |
|------|----------|---------|
| Platform Core | `src/` | Next.js 16 App Router, TypeScript, Prisma, NextAuth v5 |
| Database | `prisma/` | PostgreSQL schema, migrations, seeds |
| Documentation | `docs/` | Architecture, governance, products, deployment, AI |
| Agent Skills | `.skills/aqliya/` | Operating skills for AI agents |
| Monitoring | `monitoring/` | Observability configuration |
| Infrastructure | `infra/` | Docker, CI/CD, cloud provisioning |
| Scripts | `scripts/` | Database utilities, validation, platform operations |
| Architecture ADRs | `docs/architecture/adr/ADR-1xx-*.md` | Platform governance decisions (ADR-100–109) |

---

## Current Project Status (P0 governance freeze — 2026-07-19)

| Dimension | Status |
|-----------|--------|
| Platform Identity | Established — v1.1 |
| AuditOS | **L5 Pilot-ready (conditional)** — commercial wedge |
| LocalContentOS | **L5 Pilot-ready (conditional)** — commercial wedge |
| DecisionOS | **L4–L5 usable / pilot-conditional** |
| WorkflowOS | **L5 Pilot-ready (conditional)** |
| Office AI Assistant | **L4–L5** governed shared application |
| SalesOS | **L4–L5 internal** — **not sold in pilot** |
| RiskOS | Audit-adjacent — **not marketed standalone** |
| Sunbul | Redirect alias → WorkflowOS |
| Unrestricted L6 / enterprise-certified | **Suspended** until pen-test + ops gates (ADR-109) |
| On-Prem / Air-Gapped | **L0** — do not sell |
| Build / Test | Follow CI; do not assume green without running checks |

**Commercial boundaries:** `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` (binding).

---

## Official Sources of Truth

| Layer | Location | What It Contains |
|-------|----------|-----------------|
| **L0 — Conflict Resolution** | `docs/DOCUMENTATION_AUTHORITY.md` | Rules for resolving any documentation conflict |
| **L1 — Master Reference** | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity, product list, status summary |
| **L2 — Doctrine Docs** | `docs/official/` (v1.1 series) | Vision, taxonomy, architecture, glossary, roadmap |
| **L3 — Operational Truth** | `docs/source-of-truth/` | Current state, product status matrix, architecture, routes |
| **L4 — Agent Contract** | `AGENTS.md` | Operating contract for all AI agents |
| **L5 — Commercial Boundaries** | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | What must never be claimed as implemented |
| **L6 — Product Detail** | `docs/products/` | Per-product documentation and operator manuals |
| **L7 — Operations** | `docs/operations/`, `infra/`, `monitoring/` | Deployment and operational runbooks |

---

## Reading Order (Mandatory Reading for Every Session)

| # | File | Why | Est. Time |
|---|------|-----|-----------|
| 0 | `docs/AI_ENTRYPOINT.md` | ★ This file — platform identity and orientation | 2 min |
| 1 | `docs/DOCUMENTATION_AUTHORITY.md` | Highest authority — conflict resolution rules | 2 min |
| 2 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity, product list, status | 5 min |
| 3 | `AGENTS.md` | Agent operating contract, all rules | 10 min |
| 4 | `docs/official/aqliya-vision-v1.1.md` | Platform vision and strategic direction | 3 min |
| 5 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Product definitions and boundaries | 3 min |
| 6 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | ★ Operational truth — most recent snapshot | 5 min |
| 7 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Detailed per-product completion status | 3 min |
| 8 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Route architecture and ownership | 3 min |
| 9 | `README.md` | Project overview and setup | 5 min |
| 10 | `docs/official/aqliya-implementation-rules-v1.1.md` | Implementation constraints and rules | 3 min |
| 11 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Critical commercial boundaries | 2 min |
| 12 | `docs/official/AI_KNOWLEDGE_MAP.md` | Full documentation navigation | 5 min |
| 13 | `docs/architecture/adr/ADR-109-DOCUMENTATION-GOVERNANCE.md` | Doc/maturity governance | 2 min |

---

## Where Key Information Lives

| Need | Go To |
|------|-------|
| **Architecture ADRs** | `docs/architecture/adr/ADR-100` … `ADR-109`, `ARCHITECTURE_DECISION_INDEX.md` |
| **Architecture** | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md`, Kernel under `src/lib/kernel/` |
| **Deployment** | `infra/`, `docs/operations/production-deployment-runbook.md`, `docs/deployment/` |
| **Governance** | `AGENTS.md`, `docs/architecture/AQLIYA_ARCHITECTURE_CONSTITUTION.md` |
| **Security** | `.skills/aqliya/aqliya-security-gate.md`, `docs/audits/` |
| **Historical** | `docs/archive/` |

---

## Quick Reference: Agent Operating Contract

1. **Classify the task** before coding (AGENTS.md §34)
2. **Respect ADRs 100–109** — no product↔product coupling; Kernel-only shared imports
3. **Check commercial exclusions** before any claim language
4. **Check security gate** — auth, tenant isolation, audit trail
5. **Validate** before claiming done
6. **Report** honestly (AGENTS.md §25)

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — AI Entry Point v1.0 | OpenCode |
| 2026-07-19 | P0: Canonical path at `docs/AI_ENTRYPOINT.md`; maturity freeze; ADR-109; SalesOS not sold | Engineering Team |

# AQLIYA — AI Entry Point

> **Read this first.** This is the only document every AI assistant must read before making any change to the AQLIYA repository.
>
> **Status:** Permanent | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Authority:** Highest — orientation only, does not override `DOCUMENTATION_AUTHORITY.md` | **Last Reviewed:** 2026-06-26

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

This repository contains the full-stack implementation of the AQLIYA platform:

| Area | Location | Purpose |
|------|----------|---------|
| Platform Core | `src/` | Next.js 16 App Router, TypeScript, Prisma, NextAuth v5 |
| Database | `prisma/` | PostgreSQL schema, migrations, seeds |
| Documentation | `docs/` | Architecture, governance, products, deployment, AI |
| Agent Skills | `.skills/aqliya/` | Operating skills for AI agents |
| Monitoring | `monitoring/` | Observability configuration |
| Infrastructure | `infra/` | Docker, CI/CD, cloud provisioning |
| Scripts | `scripts/` | Database utilities, validation, platform operations |

---

## Current Project Status

| Dimension | Status |
|-----------|--------|
| Platform Identity | ✅ Established — v1.1 |
| AuditOS | ✅ L5 Pilot-ready |
| LocalContentOS | ✅ L5 Pilot-ready |
| DecisionOS | ✅ L4 Usable |
| SalesOS | ✅ L5 Pilot-ready |
| Office AI Assistant | ✅ L4 Usable governed assistant |
| Sunbul | 🔀 Redirect alias (permanent 302 to WorkflowOS) |
| Build Health | ✅ Clean — zero errors, zero lint warnings |
| Test Health | ✅ Passing suite |
| Security Hardening | ✅ R-01 through R-07 complete |
| Documentation System | ✅ AI Knowledge Map established |

**Last verified:** 2026-06-26 (updated: SalesOS L5, Sunbul redirect, bootstrap reading order)

---

## Official Sources of Truth

The documentation system is governed by a strict authority hierarchy. **Do not skip this.**

### Authority Layers

| Layer | Location | What It Contains |
|-------|----------|-----------------|
| **L0 — Conflict Resolution** | `docs/DOCUMENTATION_AUTHORITY.md` | Rules for resolving any documentation conflict |
| **L1 — Master Reference** | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity, product list, status summary |
| **L2 — Doctrine Docs** | `docs/official/` (v1.1 series) | Vision, taxonomy, architecture, glossary, roadmap, implementation rules, agent context, skill context |
| **L3 — Operational Truth** | `docs/source-of-truth/` | Current state, product status matrix, architecture, system taxonomy, route strategy |
| **L4 — Agent Contract** | `AGENTS.md` | Operating contract for all AI agents — 1767 lines of mandatory rules |
| **L5 — Commercial Boundaries** | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | What must never be claimed as implemented |
| **L6 — Product Detail** | `docs/systems/`, `docs/products/` | Per-product documentation and operator manuals |
| **L7 — Operations** | `runbooks/`, `infra/`, `monitoring/` | Deployment, infrastructure, monitoring, and operational runbooks |

*Canonical hierarchy defined in `docs/DOCUMENTATION_GOVERNANCE_v2.md §9`.*

### Documentation Governance

The full governance system is defined in:
- `docs/DOCUMENTATION_GOVERNANCE_v2.md` — Document lifecycle, ownership, naming, versioning, deprecation
- `docs/AI_KNOWLEDGE_MAP.md` — Complete inventory and navigation (updated 2026-06-26)

---

## Reading Order (Mandatory Reading for Every Session)

Every AI assistant must read these files, in this order, at the start of every session:

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
| 12 | `docs/AI_KNOWLEDGE_MAP.md` | Full documentation navigation | 5 min |

**Total estimated reading time: ~52 minutes (first session) / ~17 minutes (subsequent sessions)**

---

## Where Key Information Lives

| Need | Go To |
|------|-------|
| **Architecture** | `docs/official/aqliya-core-architecture-v1.1.md`, `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` |
| **Deployment** | `infra/`, `docs/operations/production-deployment-runbook.md`, `docs/deployment/` |
| **Governance** | `docs/official/aqliya-implementation-rules-v1.1.md`, `docs/DOCUMENTATION_GOVERNANCE_v2.md` |
| **AI Documentation** | `docs/official/aqliya-skill-context-v1.1.md`, `docs/official/aqliya-agent-context-v1.1.md`, `.skills/aqliya/` |
| **Product Documentation** | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`, `docs/systems/`, `docs/products/` |
| **Security** | `docs/DOCUMENTATION_AUTHORITY.md` §8, `AGENTS.md` §11, §12, §18, `.skills/aqliya/aqliya-security-gate.md` |
| **Historical** | `docs/archive/` |
| **Roadmaps** | `docs/official/AQLIYA_ROADMAP_v1.2.md` (active), `docs/official/aqliya-roadmap-v1.1.md` (partially superseded) |

---

## Documents That Must Never Be Treated as Source of Truth

| Document | Reason |
|----------|--------|
| `docs/archive/**` | Historical only — may contain outdated terminology, old brand, stale claims |
| `docs/theoretical-reference/**` | Background research, not authoritative |
| `docs/runtime-prototypes/**` | Experimental observations, not binding |
| `docs/pilot/**` | Session reports, not governing documents |
| `docs/deliverables/**` | Generated outputs, may be stale |
| Root-level report files (\*_MATRIX.md, \*_REPORT.md, \*_ANALYSIS.md) | Stale snapshots — check `docs/source-of-truth/` for current status |
| `docs/official/aqliya-roadmap-v1.1.md` | Partially superseded by `AQLIYA_ROADMAP_v1.2.md` |
| `docs/official/aqliya-core-architecture-v1.1.md` | Partially superseded by newer architecture docs in `docs/source-of-truth/` |
| `docs/DOCUMENTATION_GOVERNANCE.md` | Superseded by `docs/DOCUMENTATION_GOVERNANCE_v2.md` |
| `README.md` alone | Overview only — missing detailed governance and product status |
| `CLAUDE.md` | Outdated agent context — use `AGENTS.md` and `docs/official/aqliya-agent-context-v1.1.md` |

---

## Quick Reference: Agent Operating Contract

Every AI agent operating on this repository must follow:

1. **Classify the task** before coding (§34 of AGENTS.md)
2. **Check ownership** — who owns the affected files
3. **Load relevant skills** from `.skills/aqliya/`
4. **Check security gate** — auth, tenant isolation, audit trail
5. **Check demo gate** — if touching `/auditos` demo route
6. **Validate** — `npx tsc --noEmit`, `npm run lint`, `npm run build`
7. **Report** — using the mandatory format (§25 of AGENTS.md)

---

## How This Document Fits

```
AI_ENTRYPOINT.md  ← YOU ARE HERE
    ├── AI_KNOWLEDGE_MAP.md  (complete inventory)
    ├── DOCUMENTATION_AUTHORITY.md  (L0 authority)
    ├── AGENTS.md  (agent contract)
    ├── DOCUMENTATION_GOVERNANCE_v2.md  (document lifecycle)
    ├── AI_READING_PROFILES.md  (per-tool reading plans)
    ├── AI_STARTUP_CURRICULUM.md  (progressive learning path)
    ├── DOCUMENTATION_AUTHORITY_MATRIX.md  (full document registry)
    ├── DOCUMENTATION_CLEANUP_PLAN.md  (cleanup recommendations)
    ├── REPOSITORY_DOCUMENTATION_ANOMALIES.md  (known issues)
    └── DOCUMENTATION_VALIDATION_REPORT.md  (validation evidence)
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — AI Entry Point v1.0 | OpenCode |
| 2026-06-26 | Fix: SalesOS L5, Sunbul redirect, bootstrap #0 in reading order | OpenCode |

---

# AQLIYA — AI Startup Curriculum

> **Purpose:** Progressive reading path for new AI agents or engineers joining the AQLIYA project.
>
> **Status:** Active | **Version:** 1.0 | **Date:** 2026-06-26 | **Owner:** Documentation Team | **Last Reviewed:** 2026-06-26
>
> **Design:** Each level builds on the previous. Complete levels sequentially. Estimated times are for first-time reading.

---

## How to Use This Curriculum

1. Start at **Level 0** and progress sequentially
2. Complete each level before moving to the next
3. Estimated times are for careful reading with comprehension
4. Return to earlier levels as needed for reference
5. After completing all levels, you should be able to work independently on any AQLIYA task

---

## Level 0 — Project Overview

**Goal:** Understand what AQLIYA is and how the repository is organized.
**Estimated time:** 20 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 0.1 | `docs/AI_ENTRYPOINT.md` | What AQLIYA is, repository purpose, current status | 5 min |
| 0.2 | `README.md` | Project setup, stack, validation commands | 5 min |
| 0.3 | `docs/AI_KNOWLEDGE_MAP.md` (Quick Start + 1-2) | Documentation landscape overview | 5 min |
| 0.4 | Repository root exploration | `src/`, `docs/`, `prisma/`, `scripts/` directories | 5 min |

**Level 0 Checkpoint:** You can describe what AQLIYA does and where the main code lives.

---

## Level 1 — Business & Identity

**Goal:** Understand AQLIYA's market position, products, and commercial boundaries.
**Estimated time:** 30 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 1.1 | `docs/official/aqliya-vision-v1.1.md` | Platform vision and strategic direction | 5 min |
| 1.2 | `docs/official/aqliya-product-taxonomy-v1.1.md` | Product definitions, boundaries, naming | 5 min |
| 1.3 | `docs/official/aqliya-glossary-v1.1.md` | Terminology reference | 5 min |
| 1.4 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Current product completion levels | 5 min |
| 1.5 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Critical commercial boundaries | 5 min |
| 1.6 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | Platform identity and product list summary | 5 min |

**Level 1 Checkpoint:** You can name all products, their status, and what cannot be claimed.

---

## Level 2 — Architecture

**Goal:** Understand the technical architecture, layers, and system relationships.
**Estimated time:** 40 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 2.1 | `docs/official/aqliya-core-architecture-v1.1.md` | Foundation architecture (layers, principles) | 10 min |
| 2.2 | `docs/source-of-truth/AQLIYA_ARCHITECTURE.md` | Detailed architecture, component relationships | 10 min |
| 2.3 | `docs/source-of-truth/AQLIYA_SYSTEM_TAXONOMY.md` | System boundaries and cross-product concerns | 5 min |
| 2.4 | `docs/source-of-truth/ROUTE_STRATEGY.md` | Route architecture, URL structure, ownership | 5 min |
| 2.5 | `docs/official/AQLIYA_ROADMAP_v1.2.md` | Architecture layers (10-layer model) | 5 min |
| 2.6 | `prisma/schema.prisma` (key models only) | Data model overview | 5 min |

**Level 2 Checkpoint:** You can explain the 10-layer architecture, route strategy, and system taxonomy.

---

## Level 3 — Products

**Goal:** Understand each product's workflow, governance, and documentation.
**Estimated time:** 45 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 3.1 | `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md` | Full product detail (revisited) | 3 min |
| 3.2 | `docs/systems/AUDITOS_OPERATOR_MANUAL.md` | AuditOS workflows and governance | 10 min |
| 3.3 | `docs/systems/local-content-os/README.md` | LocalContentOS overview and workflow guide | 10 min |
| 3.4 | `docs/systems/decisionos/decisionos-core-engine.md` | DecisionOS architecture and workflows | 10 min |
| 3.5 | `docs/clients/sunbul/sunbul-organization-workspace-report.md` | Sunbul client workspace overview | 5 min |
| 3.6 | Product route exploration | `src/app/audit/`, `src/app/local-content/`, `src/app/decisions/` | 7 min |

**Level 3 Checkpoint:** You can describe the workflow for each product and where its routes live.

---

## Level 4 — AI & Governance

**Goal:** Understand how AI operates on AQLIYA, including constraints, skills, and governance rules.
**Estimated time:** 60 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 4.1 | `AGENTS.md` (full) | Agent operating contract — all 37 sections | 15 min |
| 4.2 | `docs/DOCUMENTATION_AUTHORITY.md` | Documentation authority hierarchy | 5 min |
| 4.3 | `docs/DOCUMENTATION_GOVERNANCE_v2.md` | Document lifecycle and governance | 5 min |
| 4.4 | `docs/official/aqliya-agent-context-v1.1.md` | Agent roles and responsibilities | 5 min |
| 4.5 | `docs/official/aqliya-skill-context-v1.1.md` | AI skill system overview | 5 min |
| 4.6 | `docs/official/aqliya-implementation-rules-v1.1.md` | Implementation governance and constraints | 5 min |
| 4.7 | `.skills/aqliya/aqliya-security-gate.md` | Security gate rules | 5 min |
| 4.8 | `.skills/aqliya/aqliya-demo-safety.md` | Demo route safety rules | 5 min |
| 4.9 | `.skills/aqliya/aqliya-opencode-agent.md` | OpenCode-specific rules | 5 min |
| 4.10 | `.skills/aqliya/aqliya-product-completion.md` | Product completion gates | 5 min |

**Level 4 Checkpoint:** You understand the full agent contract, governance rules, and skill system.

---

## Level 5 — Deployment & Infrastructure

**Goal:** Understand deployment architecture, infrastructure, and operational procedures.
**Estimated time:** 30 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 5.1 | `docs/deployment/auditos-v0.1-deployment-guide.md` | Current deployment readiness | 5 min |
| 5.2 | `runbooks/README.md` | Deployment procedures and runbook index | 10 min |
| 5.3 | `docker-compose.yml` | Local development setup | 5 min |
| 5.4 | `.env.example` | Environment configuration | 3 min |
| 5.5 | `infra/` directory overview | Infrastructure as code | 5 min |
| 5.6 | `.github/workflows/` overview | CI/CD pipeline | 2 min |

**Level 5 Checkpoint:** You can run the project locally and understand the deployment pipeline.

---

## Level 6 — Governance & Security

**Goal:** Deep understanding of security, RBAC, audit, and compliance requirements.
**Estimated time:** 35 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 6.1 | `AGENTS.md` §11, §12, §18 | Governance, AI feature rules, security rules | 10 min |
| 6.2 | `.skills/aqliya/aqliya-security-gate.md` | Security gate in detail | 5 min |
| 6.3 | `src/lib/auth/` overview | Auth implementation | 5 min |
| 6.4 | `src/middleware.ts` overview | Middleware, route protection | 5 min |
| 6.5 | `docs/commercial/WHAT_WE_DO_NOT_CLAIM.md` | Compliance boundaries (revisited) | 5 min |
| 6.6 | `AGENTS.md` §35 | Security/Demo/Docs gates quick reference | 5 min |

**Level 6 Checkpoint:** You can identify security requirements for any new feature.

---

## Level 7 — Operations & Maintenance

**Goal:** Understand monitoring, scripts, database operations, and maintenance procedures.
**Estimated time:** 25 minutes

| Step | File | Topic | Time |
|------|------|-------|------|
| 7.1 | `monitoring/` directory overview | Monitoring and alerting | 5 min |
| 7.2 | `scripts/` directory overview | Maintenance and utility scripts | 5 min |
| 7.3 | `scripts/db-utils/` | Database utilities | 5 min |
| 7.4 | `scripts/platform/` | Platform scripts | 5 min |
| 7.5 | `AGENTS.md` §33 | Low-load execution protocol | 5 min |

**Level 7 Checkpoint:** You understand monitoring, script operations, and load-aware execution.

---

## Quick Reference: Reading Time Summary

| Level | Title | Est. Time | Cumulative |
|-------|-------|-----------|------------|
| L0 | Project Overview | 20 min | 20 min |
| L1 | Business & Identity | 30 min | 50 min |
| L2 | Architecture | 40 min | 1 hr 30 min |
| L3 | Products | 45 min | 2 hr 15 min |
| L4 | AI & Governance | 60 min | 3 hr 15 min |
| L5 | Deployment | 30 min | 3 hr 45 min |
| L6 | Governance & Security | 35 min | 4 hr 20 min |
| L7 | Operations | 25 min | **4 hr 45 min** |

---

## Day 1 Quick Start (Minimum Viable Knowledge)

If you need to start working within 30 minutes:

| Step | File | Time |
|------|------|------|
| 1 | `docs/AI_ENTRYPOINT.md` | 5 min |
| 2 | `docs/DOCUMENTATION_AUTHORITY.md` | 2 min |
| 3 | `README.md` | 5 min |
| 4 | `AGENTS.md` (sections 1-6, 34) | 8 min |
| 5 | `docs/official/AQLIYA_MASTER_REFERENCE.md` | 5 min |
| 6 | `docs/source-of-truth/AQLIYA_CURRENT_STATE.md` | 5 min |

**Total: 30 minutes** — you can start with basic tasks.

---

## Curriculum Map

```
Level 0: Project Overview
    │
    ▼
Level 1: Business & Identity ◄── Commercial boundaries
    │
    ▼
Level 2: Architecture ◄── Layers, routes, systems
    │
    ▼
Level 3: Products ◄── Per-product workflows
    │
    ▼
Level 4: AI & Governance ◄── Agent contract, skills, gates
    │
    ▼
Level 5: Deployment ◄── Infrastructure, CI/CD
    │
    ▼
Level 6: Governance & Security ◄── Auth, RBAC, audit
    │
    ▼
Level 7: Operations ◄── Monitoring, scripts, maintenance
```

---

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-06-26 | Initial creation — AI Startup Curriculum v1.0 | OpenCode |

---

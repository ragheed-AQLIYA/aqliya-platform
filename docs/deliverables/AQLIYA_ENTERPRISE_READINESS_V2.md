# AQLIYA Enterprise Readiness V2

**Classification:** Board-grade enterprise readiness reassessment  
**Date:** 2026-06-21  
**Last updated:** 2026-06-21 — score trajectory tied to ratified tiers  
**Scope:** Full platform post-stabilization  
**Method:** Code inspection + prior assessments (`ENTERPRISE_READINESS_FINAL.md` 2026-06-19, validation snapshots, PRODUCT_STATUS_MATRIX)  
**Score trajectory:** Tier 1 complete → ~68 · Tier 2 complete → ~72 · Tier 3 → 85+ (with pentest + DR) · `EXECUTIVE_RECOMMENDATION_2026.md`  
**Supersedes:** Partial scores in strategic due diligence 2026-06-19 where repository state has improved

---

## Overall Verdict

| Classification | Status | Score |
|----------------|--------|------:|
| **Pilot Ready** | **YES** — with written exclusions | 82/100 |
| **Commercial Ready** | **CONDITIONAL** — staging, pen test, support model gaps | 58/100 |
| **Enterprise Ready (RFP-grade)** | **NO** — 90–180 days minimum | 42/100 |

**Platform Enterprise Readiness Score: 62/100** (↑ from 58/100 on 2026-06-19, driven by audit unification completion, product L5 portfolio, TypeScript/build/test green)

---

## Scoring Rubric

| Range | Meaning |
|-------|---------|
| 0–39 | Not ready — fundamental gaps |
| 40–59 | Conditional — usable with documented exclusions |
| 60–79 | Pilot/commercial approaching — known gaps manageable |
| 80–89 | Strong — minor gaps only |
| 90–100 | Enterprise-grade — externally validated |

---

## Dimension Scores

### 1. Architecture — 68/100

| Evidence | Detail |
|----------|--------|
| Modular monolith | Next.js 16 App Router, `src/lib/` domain separation |
| Intelligence Core | De facto core in governance/ai/platform/rag — not yet `src/lib/core/` |
| Product boundaries | 8 L5 products on shared platform; clear taxonomy in PRODUCT_STATUS_MATRIX |
| Technical debt | SalesOS v02 archived; signal layer removed (regression) |
| Build health | TypeScript clean, build passing, 2462+ tests passing (per AGENTS.md §28.1) |

**Risks:**
- Core fragmentation increases cost of every new product feature
- Signal deletion broke cross-product task runtime
- No event bus — tight coupling through direct imports

**Recommended actions:**
1. Execute Intelligence Core P0–P1 (see `INTELLIGENCE_CORE_EXECUTION_BACKLOG.md`)
2. Restore signal engine before marketing cross-product intelligence
3. Defer Studio/plugin architecture until Core extracted

---

### 2. Governance — 78/100

| Evidence | Detail |
|----------|--------|
| Trust principle | "AI assists. Humans decide. Evidence governs." — structural in code |
| Human review gates | `governedAIExecute`, Office AI lifecycle, AI review gate |
| Approval workflows | WorkflowOS export gating, DecisionOS committee flow, LC review center |
| Export controls | Gated PDF exports across DecisionOS, WorkflowOS, LC, Contacts |
| Governance runtime | `governance/retrieval-router.ts` — 12 task types, real |
| AGENTS.md contract | Comprehensive agent operating contract |

**Risks:**
- Governance engine not universally invoked — products bypass for speed
- Model Governance implemented but documented as L0 in matrix
- Evidence platform service is stub

**Recommended actions:**
1. Wire governance context on all AI entry points via product-ai-bridge
2. Sync PRODUCT_STATUS_MATRIX for Model Governance (L4+ reality)
3. Implement evidence registry facade (IC-P0-04)

---

### 3. Security — 72/100

| Evidence | Detail |
|----------|--------|
| Auth | NextAuth v5, OAuth/OIDC/SAML, MFA challenge UI |
| RBAC middleware | ~40 route prefixes with role hierarchy |
| CSRF | Custom login removed (2026-06-17) |
| CSP | Hardened — unsafe-eval/inline removed |
| SSO secrets | AES-256-GCM at rest |
| File scanning | ClamAV client integrated |
| SCIM | v2 API with API key auth |
| Sensitive routes | Download routes auth + tenant-safe 404 |
| `/api/test-token` | Deleted |

**Risks:**
- ABAC engine unwired — attribute rules not enforced
- `CoreAccessControl` not adopted in production paths
- DB RBAC `hasPermission()` missing org scope
- Pen test not scheduled (E-01)
- ClamAV daemon not verified in production (I-04)
- Redis rate limiter mode unverified multi-instance (I-03)

**Recommended actions:**
1. ABAC Phase 1 — unified authorization gate (see `ABAC_READINESS_ASSESSMENT.md`)
2. Schedule penetration test before commercial contracts
3. Verify ClamAV + Redis in staging/production ECS

---

### 4. Knowledge — 45/100

| Evidence | Detail |
|----------|--------|
| Knowledge Foundation | 292 files, 56 Priority 1 standards production-admitted |
| Runtime loaders | IFRS + SOCPA only |
| LocalContentOS | 7-source context builder, grounded AI (100% pilot readiness) |
| RAG | Implemented, FF-gated, legally blocked for embedding |
| LCGPA | Staging only; 3 parallel representations |

**Risks:**
- ISA/ISQM Foundation disconnected from runtime
- Broken `$schema` references in Foundation artifacts
- knowledge-foundation not in DOCUMENTATION_AUTHORITY hierarchy
- Commercial overclaim risk on standards breadth

**Recommended actions:**
1. Knowledge K1–K2 remediation (see `KNOWLEDGE_GOVERNANCE_AUDIT_V2.md`)
2. Add Foundation to documentation authority
3. Do not claim full ISA/IFRS coverage in RFPs — cite admitted catalog

---

### 5. Audit — 85/100

| Evidence | Detail |
|----------|--------|
| PlatformAuditLog | Canonical cross-product sink — unification program complete |
| Hash chain | HashChainEntry append on writes |
| Chain verification | Operator dashboard built |
| Cross-product search | Unified audit query |
| SIEM export | HTTP/Splunk/file/S3 adapters |
| Dual-write | SalesOS, LC, WorkflowOS, DecisionOS, AuditOS main flows |
| Retention | PlatformAuditLog 365d policy documented |

**Risks:**
- 9 legacy `platform-audit.ts` call sites remain
- WorkflowAuditEvent direct writes skip dual-write
- Product audit tables excluded from retention policies
- No correlationId across events

**Recommended actions:**
1. Complete IC-P0-01 legacy migration
2. Extend retention policies to product audit tables
3. Define event contract (IC-P3-05) before event bus

---

### 6. Operations — 55/100

| Evidence | Detail |
|----------|--------|
| Production | aqliya.com live, health endpoint, smoke 28/30 (2026-06-18) |
| CI/CD | 5 workflows, Postgres service in CI, npm audit |
| Runbooks | production-deployment-runbook v1.3 |
| Restore drill script | `scripts/platform/restore-drill.mjs` exists |
| Node 22 | Dockerfile aligned |
| Monitoring | `/monitoring`, Sentry, CloudWatch in IaC |

**Risks:**
- Staging DNS ENOTFOUND (blocker for commercial)
- Live RDS restore drill not run (I-01)
- ECS/RDS/Redis live audit not run (I-02)
- No load testing evidence
- On-call founder-dependent

**Recommended actions:**
1. Fix staging environment
2. Run restore drill on actual RDS
3. Document customer support tier and escalation matrix

---

### 7. Products — 75/100

| Product | Level | Demo safe? |
|---------|-------|------------|
| AuditOS | L5 Pilot-ready | Yes |
| LocalContentOS | L5 (100% pilot readiness) | Yes |
| DecisionOS | L5 | Yes |
| WorkflowOS | L5 | Yes |
| SalesOS | L5 | Yes |
| LocalContactOS | L5 | Yes |
| Office AI Assistant | L5 | Yes |
| Institutional Memory | L5 | Yes |
| RiskOS | L5 | Yes with context |
| ContentStudio | L4 | Internal |
| Organizations | L5 | Yes |
| Generic /settings | L2 | Internal only |

**Risks:**
- 8 L5 products create support surface area beyond ops capacity
- SalesOS in-memory dashboard fallback
- ContentStudio missing tests and export
- AQLIYA Studio, ComplianceOS, LegalOS, GovOS — L0 (correctly not built)

**Recommended actions:**
1. Prioritize ops runbooks for top 3 revenue products (AuditOS, LC, DecisionOS)
2. Complete SalesOS dashboard Prisma path
3. Do not start new products until Core consolidated

---

### 8. AI — 70/100

| Evidence | Detail |
|----------|--------|
| Orchestration | AIOrchestrator, governedAIExecute, 4 providers |
| Governance injection | retrieval-router connected to AI path |
| Budget/cost | budget-manager, spend-tracker |
| Eval | Skill evaluation 25/25 pass; LC AI 95% acceptance |
| Local AI | Ollama hybrid routing L4 pilot |
| RAG | intelligence-core-rag.ts — product-agnostic |
| Review gates | ai-review-gate, human review required |

**Risks:**
- No tool/MCP registry in production
- No autonomous agent loops (correct by design — but limits "agent platform" claims)
- External provider routing policy must be enforced for sensitive tasks
- Model governance service not wired to execution path

**Recommended actions:**
1. Wire model governance approval before cloud provider calls in production mode
2. Maintain external routing restrictions per AGENTS.md §37
3. Defer agent platform until tool registry exists

---

### 9. Authorization — 52/100

| Evidence | Detail |
|----------|--------|
| Middleware RBAC | Real, ~40 routes |
| Tenant isolation | organizationId patterns in L5 products |
| DB RBAC + ABAC schema | Built |
| ABAC evaluator | Built, unwired |
| Unified gate | Designed, 0 production imports |
| Workspace isolation | Diagnostic only |
| Contacts sensitivity gate | Best attribute-like control |

**Risks:**
- Triple role system (User, AuditUser, DB Role)
- Evidence download permissions seeded but not enforced
- Authorization decisions not audited uniformly

**Recommended actions:**
1. Full ABAC program Phase 0–2 (see assessment doc)
2. Fix hasPermission org scope immediately
3. Audit all denial paths to PlatformAuditLog

---

### 10. Scalability — 48/100

| Evidence | Detail |
|----------|--------|
| Architecture | Modular monolith — appropriate for current scale |
| Database | PostgreSQL, Prisma 7, multi-AZ RDS in Terraform |
| Rate limiting | Memory + Redis modes — Redis unverified in prod |
| Queue | Bull exists — in-memory default, email only |
| Caching | No distributed cache layer documented |
| Load testing | No evidence |
| Multi-instance | Rate limiter + queue consistency unverified |

**Risks:**
- In-memory rate limiter breaks with multi ECS task
- No horizontal scaling validation
- Product audit tables unbounded without retention
- Full build RAM pressure on large CI runs

**Recommended actions:**
1. Verify Redis rate limiter in production ECS (I-03)
2. Persistent queue for async operations (IC-P3-04)
3. Baseline load test on audit + LC paths before commercial SLA

---

## Score Summary

| Dimension | Score | Trend vs 2026-06-19 |
|-----------|------:|---------------------|
| Architecture | 68 | ↑ (audit unification) |
| Governance | 78 | → |
| Security | 72 | ↑ (CSP, SSO encryption) |
| Knowledge | 45 | → (Foundation mature, runtime gap) |
| Audit | 85 | ↑↑ (unification complete) |
| Operations | 55 | → |
| Products | 75 | ↑↑ (8 L5 products) |
| AI | 70 | ↑ (LC quality mission) |
| Authorization | 52 | → (ABAC still dormant) |
| Scalability | 48 | → |
| **Weighted average** | **62** | **↑ +4** |

---

## Classification Matrix

| Dimension | Pilot | Commercial | Enterprise |
|-----------|-------|------------|------------|
| Architecture | ✅ | ⚠️ | ❌ |
| Governance | ✅ | ✅ | ⚠️ |
| Security | ✅ | ⚠️ | ❌ |
| Knowledge | ⚠️ | ⚠️ | ❌ |
| Audit | ✅ | ✅ | ⚠️ |
| Operations | ⚠️ | ❌ | ❌ |
| Products | ✅ | ⚠️ | ❌ |
| AI | ✅ | ⚠️ | ❌ |
| Authorization | ⚠️ | ❌ | ❌ |
| Scalability | ⚠️ | ❌ | ❌ |

---

## External Validation Gaps (Enterprise Blockers)

| ID | Item | Status |
|----|------|--------|
| E-01 | Penetration test | Not scheduled |
| E-02 | SOC2 Type II | Not started |
| E-03 | ISO 27001 gap assessment | Not started |
| I-01 | Live RDS restore drill | Script only |
| I-02 | ECS/RDS/Redis live audit | Not run |
| I-03 | Redis rate limiter in prod | Unverified |
| I-04 | ClamAV daemon in prod | Unverified |

---

## Honest Commercial Claims (2026-06-21)

**May claim:**
- Pilot-ready governed platform with 8+ operational products
- Unified audit trail with hash chain verification
- AI-assisted workflows with mandatory human review
- SAML/OIDC SSO and SCIM provisioning (operator setup required)
- LocalContentOS 100% pilot readiness (evidence-based, 2026-06-17 mission)

**May NOT claim:**
- Enterprise-ready / RFP-grade without E-01–E-03
- Full IFRS/ISA/ISQM/SOCPA regulatory coverage
- Production on-prem / air-gapped / local AI L6
- ABAC enforcement (engine exists, not wired)
- Event-driven architecture
- 99.9% SLA without load testing and staging validation

**Document status:** DONE — Enterprise Readiness V2 for board and executive planning.

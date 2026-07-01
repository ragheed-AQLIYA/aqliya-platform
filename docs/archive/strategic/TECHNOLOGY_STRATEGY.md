# AQLIYA Technology Strategy

**Classification:** Board CTO Assessment  
**Date:** 2026-06-19  
**Evidence:** Forensic audit ACTUAL_ARCHITECTURE_MODEL, Truth Reconciliation validation, build reports 2026-06-18/19, TECHNICAL_RISK_REGISTER, recovery strategy

---

## Technology Verdict

AQLIYA has **credible enterprise-grade architecture design** executed as a **modular monolith** with **real domain depth**. Build and test hygiene recovered (tsc/build/lint/test PASS). Technical debt is **concentrated in SalesOS sprawl and ops verification gaps**, not in fundamental architecture failure.

**Invest in:** pilot delivery, ops hardening, SalesOS freeze—not rewrites.

---

## Architecture Assessment

| Aspect | Rating | Evidence |
|--------|--------|----------|
| **Pattern choice** | Strong | Next.js 16 App Router monolith; correct for stage |
| **Modularity** | Good | `src/lib/{product}/` separation; shared governance |
| **Server/client boundaries** | Good | Post-hardening; Prisma server-only |
| **Multi-tenancy** | Good | organizationId; tenant guards in actions |
| **Data model** | Strong but heavy | ~214 Prisma models; multi-product scale |
| **API surface** | Adequate | 46 routes; permissioned downloads |
| **Infra as code** | Designed | ECS/RDS/Redis/CloudFront in Terraform |

**Decision:** Keep modular monolith. **Do not** microservice split in next 12 months.

---

## Code Quality Assessment

| Metric | Status (2026-06-19) |
|--------|----------------------|
| TypeScript | PASS (0 errors) |
| Build | PASS (131 routes) |
| Lint | PASS (0 errors, ~241 warnings) |
| Tests | PASS (2462 tests, 249 suites) |
| Cypress | 162 pass |
| ESLint scope | Fixed (was 33K false signal) |

**Quality hotspots (pay down, don't rewrite):**
- SalesOS `v02/_v02/vnext` trees (358 lib files)
- Content Studio schema drift (documented tech debt)
- Dual DecisionOS route trees (redirect candidate)
- ~241 lint warnings (non-blocking)

---

## Technical Debt Priority (12 months)

| Priority | Debt | Action | ROI |
|----------|------|--------|-----|
| P0 | Staging + live ops verification | Operator sprint | Unblocks commercial |
| P1 | SalesOS freeze + eventual merge | Week 7+ consolidation | Velocity + clarity |
| P2 | Redis rate limiter in ECS | Config change | Scale correctness |
| P3 | Content Studio schema alignment | 3-day refactor when customer appears | Remove `as any` |
| P4 | Decision route consolidation | Redirect plan | Maintenance |
| P5 | Lint warnings to zero | Background | CI signal quality |

**Do not prioritize:** knip dead-code sweep, theoretical doc cleanup, platform "Core v2", microservices.

---

## AI Maturity Assessment

| Layer | Maturity | Notes |
|-------|----------|-------|
| **Governance** | L4–L5 | Orchestrator, metadata, review gates, deterministic default |
| **Deterministic handlers** | L5 | Production default; intentional |
| **Local AI (Ollama)** | L4 pilot | Smoke PASS; qwen3:8b; 87% TB benchmark |
| **Cloud LLM** | L3 | Adapters exist; not production-default |
| **RAG/pgvector** | L4 | Feature-flagged; LC context-builder wired |
| **Evaluation framework** | L4 | 25 skills; scoring calibrated |
| **Model governance product** | L0 | Do not build |

**Decision:** Cloud AI as **optional assist** behind flags; deterministic + human review remains default for 12 months.

---

## Local AI Assessment

| Claim | Reality |
|-------|---------|
| "Local AI implemented" | ✅ Ollama integration real |
| "Production local AI" | ⚠️ Operator must run Ollama; 12–32s latency |
| "Air-gapped AI" | ❌ Not packaged |
| "Private inference" | ⚠️ Possible with Ollama; not productized |

**Investment:** Async queue pattern for long-running local inference (Q4 2026)—not GPU packaging.

---

## DevOps Assessment

| Item | Status |
|------|--------|
| GitHub Actions CI | ✅ tsc, test, audit |
| Deploy pipeline | ✅ Defined; production live |
| Docker multi-stage | ✅ Node 22 |
| Post-deploy smoke | ✅ 28/30 prod |
| Terraform validate | ❌ Blocked locally |
| Vercel alternative | ✅ vercel.json exists |
| Preview workflow | ⚠️ Was broken; verify current state |

**Investment:** Complete ENTERPRISE_OPS_CHECKLIST (10 items)—highest DevOps ROI.

---

## Scalability Assessment

| Concern | Current | 12-month need |
|---------|---------|---------------|
| ECS Fargate 3–10 tasks | Designed | Adequate for pilots |
| RDS Multi-AZ | Designed | Adequate |
| Edge rate limit memory | Risk at scale | **Fix: Redis mode** |
| Monolith build ~170s | Acceptable | Monitor only |
| Ollama sync calls | Bottleneck | Queue/async |
| 214 Prisma models | Query complexity | Index review per product |

**Decision:** Scales to **50–100 concurrent pilot users** on current design. Enterprise scale (1000+) requires ops verification + load test—not architecture rewrite.

---

## Justified Technology Investments (Next 12 Months)

| Investment | Effort | ROI | Quarter |
|------------|--------|-----|---------|
| **Enterprise ops closure** (staging, restore, Redis, ClamAV verify) | 2–3 eng-weeks | Commercial gate | Q3 2026 |
| **LocalContent pilot hardening** (ERP, onboarding, export) | 8–10 eng-weeks | Revenue | Q3–Q4 2026 |
| **AuditOS stability + Shalfa-class accuracy** | 4–6 eng-weeks | Revenue + proof | Q3–Q4 2026 |
| **Async AI job queue** | 2–3 eng-weeks | UX at scale | Q4 2026 |
| **Pen test remediation** | 2–4 eng-weeks | Enterprise path | Q1 2027 |
| **SalesOS tree merge** | 3–4 eng-weeks | Velocity | Q1 2027 |
| **Load test baseline** | 1 eng-week | Reliability proof | Q2 2027 |

**Not justified (12 months):**
- Microservices extraction
- Kubernetes migration
- On-Prem packaging
- AQLIYA Studio
- New product schemas (ComplianceOS, etc.)
- Full platform rewrite
- GPU/local inference appliance

---

## Technology Score

| Dimension | Score |
|-----------|------:|
| Architecture fit | 78 |
| Code quality (current) | 76 |
| Technical debt manageability | 58 |
| AI engineering | 72 |
| DevOps maturity | 62 |
| Scalability (proven) | 65 |
| **Technology strategy score** | **68/100** |

---

*Validation artifacts: `docs/reports/2026-06-18-*`, `docs/reports/2026-06-19-final-*.txt`*

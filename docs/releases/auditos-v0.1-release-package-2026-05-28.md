# AuditOS v0.1 — Controlled Pilot Release Package

**Release date:** 2026-05-28  
**Classification:** Controlled Pilot Baseline Ready  
**Product:** AuditOS under AQLIYA  
**Trust principle:** AI assists. Humans decide. Evidence governs.

---

## 1. Executive Summary

AuditOS v0.1 is a **governed financial audit workspace** at `/audit/*`, backed by PostgreSQL, NextAuth credentials, RBAC, evidence storage, human review/approval gates, and audit trails.

This release package marks the transition from **real program build** to **stable controlled pilot baseline** after:

- Full validation gate (build + 213 tests)
- Docker single-instance rehearsal (Track C.1–C.2)
- Internal rehearsal C.5 **11/11 PASS** on Docker Compose
- Post-C.5 operator polish (Arabic nav, export feedback, deploy guidance)

**This is not:** enterprise-scale production, certified audit opinion software, or autonomous audit automation.

---

## 2. Validated Capabilities

| Capability                                       | Status                        |
| ------------------------------------------------ | ----------------------------- |
| Authenticated workspace (`/audit/*`)             | ✅ Validated                  |
| Engagement lifecycle (create, status, archive)   | ✅ Validated                  |
| Trial balance upload/import                      | ✅ Validated                  |
| Account mapping                                  | ✅ Validated                  |
| Financial statements + traceability              | ✅ Validated (C.4 Docker fix) |
| Notes, evidence vault, findings                  | ✅ Validated                  |
| Review workflow                                  | ✅ Validated                  |
| Human approval gates (no auto-approve)           | ✅ Validated                  |
| Draft PDF/XLSX export (pre-approval allowed)     | ✅ Validated                  |
| Audit trail                                      | ✅ Validated                  |
| Health endpoints (`/api/health`, `audit:health`) | ✅ Validated                  |
| Docker Compose single-instance deploy            | ✅ Validated                  |
| Governance (RBAC, tenant scoping, audit events)  | ✅ Intact                     |

---

## 3. Deployment Classification

> **Controlled Single-Instance Deployment Ready**

Supported models:

- Docker Compose on one host (recommended for rehearsal/pilot)
- Bare-metal Node.js + PostgreSQL on VPS/private VM
- Local controlled rehearsal

**Not supported in v0.1:** Kubernetes, multi-region HA, SSO/LDAP, S3/Azure storage, horizontal scaling.

**Primary guide:** `docs/deployment/auditos-v0.1-deployment-guide.md`

---

## 4. Governance Boundaries

- **Human decisions required** for final approval — AI assists only.
- **Evidence linkage** expected for audit outputs; exports carry draft/status disclaimers.
- **RBAC enforced server-side** — UI gates are not sufficient alone.
- **Tenant isolation** via organization/workspace scoping.
- **Audit events** logged for mutations and sensitive actions.
- **Download routes** permissioned with auth + tenant-safe 404.
- **Draft exports before approval** — intentional for internal review; not certified final deliverables.

---

## 5. Docker Validation Summary

| Track                                                   | Result                           |
| ------------------------------------------------------- | -------------------------------- |
| C.1 Compose alignment                                   | PASS                             |
| C.2 Image build                                         | PASS                             |
| C.3 Internal rehearsal                                  | 10/11 — statements blocker       |
| C.4 Statements fix (`DOMMatrix` / server-only boundary) | PASS                             |
| C.5 Final rehearsal                                     | **11/11 PASS** with hard refresh |

**Operational note:** After app image rebuild, operators must **hard refresh** browsers to avoid stale Server Action IDs and infinite loading.

---

## 6. Internal Rehearsal Summary

- **Engagement:** `eng-gulf-2025` (Gulf Trading Co., FY2025)
- **Credentials (rehearsal):** `admin@aqliya.com` / `admin123`
- **Steps:** Login → all 11 workflow tabs → export → audit trail
- **Approval:** Correctly blocked by governance prerequisites (expected)
- **Reports:**
  - `docs/reports/auditos-v0.1-internal-rehearsal-c5-2026-05-28.md`
  - `docs/deployment/auditos-v0.1-internal-rehearsal.md`

---

## 7. Known Limitations

- Single instance only — no HA/failover guidance
- Credentials auth only — no SSO/LDAP
- Local storage default — S3/Azure not integrated
- Virus scanning stub — `SCANNER_PROVIDER` not production-grade
- Platform project link optional on seed engagements (info note, not blocking)
- Dashboard N+1 fetch pattern (P2 performance, non-blocking)
- Backup/restore is operator responsibility — scripts exist, scheduling does not
- Mixed EN technical labels in some platform context rows (Workspace/Project/Org)
- Not SOC2/ISO certified

---

## 8. Approved Use Scope

- Controlled internal rehearsal on Docker or bare-metal
- Limited external pilot with **one organization** and seeded or real engagement data under operator supervision
- Operator walkthroughs demonstrating governed audit workflow
- Draft export for internal review before human approval
- Training and onboarding for audit operators

---

## 9. Non-Approved Use Scope

- Production multi-tenant SaaS at scale
- Regulatory certification or signed audit opinion replacement
- Autonomous AI approval or evidence-free conclusions
- Public unauthenticated access to workspace data
- Using `/auditos/*` demo routes as operational workspace
- Claiming On-Prem/Air-Gapped/SSO/SIEM as implemented
- Skipping human approval for final deliverables to external parties

---

## 10. Operator Prerequisites

| Requirement | Detail                                                            |
| ----------- | ----------------------------------------------------------------- |
| Role        | Admin or operator with audit permissions                          |
| Browser     | Modern Chromium/Firefox/Safari; hard refresh after deploy         |
| Credentials | Changed from seed defaults before external pilot                  |
| Database    | Seed via compose network (`db:5432`), not mistaken host Postgres  |
| Storage     | Writable `LOCAL_STORAGE_DIR` / Docker `uploads` volume            |
| Health      | `/api/health` returns `status: ok` before handoff                 |
| Guidance    | Read redeploy checklist and hard-refresh note in deployment guide |

---

## 11. Rollback / Recovery Assumptions

- PostgreSQL dump available before each deploy
- Uploads volume archived if evidence must be preserved
- Previous Docker image or git tag retained for code rollback
- Rollback checklist in deployment guide (stop → restore DB → restore uploads → redeploy prior build → health + hard refresh)
- No automated rollback — manual operator procedure

---

## 12. Next Roadmap Phase

**Phase:** External pilot execution under controlled baseline

Recommended sequence:

1. Commit and tag stable baseline (`auditos-v0.1-pilot-baseline`)
2. First external operator session with live observer
3. Capture P2 friction log (no feature expansion without gate)
4. Credential rotation and org-specific seed review
5. Optional Wave G — tab boundary parity and dashboard fetch optimization (P2 only)
6. Re-assess Go/No-Go after first external walkthrough

**Target classification after external pilot:** Controlled Pilot Validated (not production-hardened).

---

## References

- Go/No-Go: `docs/reports/auditos-v0.1-go-no-go-review-2026-05-28.md`
- Deployment readiness: `docs/reports/auditos-v0.1-deployment-readiness-2026-05-28.md`
- Post-C.5 readiness: `docs/reports/auditos-v0.1-post-c5-readiness-2026-05-28.md`
- Deployment guide: `docs/deployment/auditos-v0.1-deployment-guide.md`
- Known limitations (platform): `docs/releases/aqliya-v0.1-known-limitations.md`

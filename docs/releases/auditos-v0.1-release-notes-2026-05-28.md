# AuditOS v0.1 — Release Notes

**Release date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-pilot-baseline-2026-05-28`  
**Product:** AuditOS under AQLIYA  
**Classification:** Controlled Pilot Baseline Ready

---

## Summary

AuditOS v0.1 delivers a **governed financial audit workspace** with end-to-end workflow, human approval gates, evidence vault, draft exports, and audit trail — validated for controlled single-instance deployment and internal rehearsal **11/11 PASS**.

> **AI assists. Humans decide. Evidence governs.**

This release is **not** enterprise production, certified audit opinion software, or autonomous audit automation.

---

## 1. Validated Capabilities

| Area                                     | Status |
| ---------------------------------------- | ------ |
| Authenticated workspace (`/audit/*`)     | ✅     |
| Engagement lifecycle                     | ✅     |
| Trial balance upload/import              | ✅     |
| Account mapping + workflow gates         | ✅     |
| Financial statements + traceability      | ✅     |
| Notes, evidence, findings                | ✅     |
| Human review workflow                    | ✅     |
| Approval gates (no auto-approve)         | ✅     |
| Draft PDF/XLSX export                    | ✅     |
| Audit trail                              | ✅     |
| Arabic-first operator UI (core workflow) | ✅     |
| Health endpoints                         | ✅     |

**Validation gate (pre-baseline):** Build pass, 27 test suites / 213 tests pass.

---

## 2. Deployment Validation

| Track                    | Result                                  |
| ------------------------ | --------------------------------------- |
| Docker Compose alignment | PASS                                    |
| Image build              | PASS                                    |
| Seed via compose network | PASS (with localhost caveat documented) |
| Health checks            | PASS                                    |
| Internal rehearsal C.5   | **11/11 PASS**                          |

**Deployment classification:** Controlled Single-Instance Deployment Ready

Guide: `docs/deployment/auditos-v0.1-deployment-guide.md`

---

## 3. Docker Rehearsal Result

- Environment: `aqliya-app-1` + `aqliya-db-1` on `:3000`
- Engagement: `eng-gulf-2025`
- Statements tab: PASS after C.4 server-boundary fix
- Governance: Approval correctly blocked on prerequisites (expected)
- Operator note: Hard refresh required after app rebuild

---

## 4. Governance Principles

- Human approval required for final decisions — no autonomous approval
- Workflow tabs lock until prerequisites complete
- Mutations logged in audit trail with actor identity
- Evidence downloads permissioned server-side
- Draft exports allowed pre-approval for internal review only
- Tenant/organization scoping enforced
- AI outputs framed as assistive — not final decisions

---

## 5. Known Limitations

- Single instance only — no HA / horizontal scaling
- Credentials auth — no SSO/LDAP
- Local storage default — S3/Azure not integrated
- Virus scanning stub
- Hard refresh after deploy (browser cache)
- Draft export before approval (policy)
- Some English labels in platform context deep UI (P2)
- Dashboard N+1 readiness fetch (P2 performance)
- `docs/reports/*` evidence local/gitignored — not in repo bundle

Full disclosure: `docs/releases/auditos-v0.1-release-package-2026-05-28.md`

---

## 6. Approved Usage Scope

- Controlled internal rehearsal
- First external operator walkthrough with observer
- Limited pilot with one organization under supervised deployment
- Draft export for internal review
- Operator training and friction capture

---

## 7. Non-Approved Usage Scope

- Enterprise multi-tenant production at scale
- Regulator or Big 4 certification claims
- Autonomous audit operations
- Using `/auditos/*` demo as operational workspace
- Unsupervised production without credential rotation
- Claims of On-Prem, Air-Gapped, SSO, SIEM, Kubernetes as shipped

---

## 8. Roadmap After v0.1

| Phase             | Focus                                                       |
| ----------------- | ----------------------------------------------------------- |
| **Now**           | Controlled external walkthrough + friction log              |
| **Next**          | P2 polish from pilot feedback (no schema rewrite)           |
| **Later**         | SSO, HA, storage backends — only with explicit product gate |
| **Never implied** | Autonomous audit, certified opinion replacement             |

---

## Walkthrough Prep (this track)

| Document                                           | Purpose                    |
| -------------------------------------------------- | -------------------------- |
| `docs/pilot/auditos-first-operator-walkthrough.md` | External walkthrough guide |
| `docs/pilot/auditos-live-walkthrough-script.md`    | Facilitator script         |
| `docs/pilot/auditos-pilot-faq.md`                  | Operator FAQ               |
| `docs/pilot/auditos-demo-environment.md`           | Environment setup          |

---

## Upgrade / Checkout

```bash
git fetch --tags
git checkout auditos-v0.1-pilot-baseline-2026-05-28
```

Follow `docs/deployment/auditos-v0.1-deployment-guide.md` for deploy.

---

## References

- Release package: `docs/releases/auditos-v0.1-release-package-2026-05-28.md`
- Platform limitations: `docs/releases/aqliya-v0.1-known-limitations.md`
- Internal rehearsal: `docs/deployment/auditos-v0.1-internal-rehearsal.md`

# Strategic Roadmap — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Horizons:** 90-day, 180-day, 12-month

---

## 90-Day Roadmap (Days 1-90)

### Theme: **Restore Ship Confidence**

| Week | Focus | Deliverables | Impact |
|------|-------|-------------|--------|
| 1-2 | **Build & Security Hotfix** | Fix 9 TS errors; remove test-token; delete `(1)` duplicates; MFA JWT fix | Unblocks deploy |
| 3-4 | **Runtime Proof** | DB seed + smoke:local + demo:smoke + Cypress subset; update PRODUCT_STATUS_MATRIX | Pilot confidence |
| 5-6 | **RBAC & API Hardening** | CoreAccessControl decision + implementation; skills API auth; CSRF review | Security +enterprise |
| 7-8 | **LocalContent Pilot Pack** | LC workbook E2E; ERP connector live test; pilot-readiness signoff | Revenue |
| 9-10 | **AuditOS Pilot Hardening** | Cycle 6 remote smoke; independence/materiality regression | Revenue |
| 11-12 | **Ops & DR** | Backup restore drill; Terraform monitoring fix; CI Postgres service | Operational |

**90-day exit criteria:**
- Green build, tsc, tests (>99% suite pass)
- smoke:local PASS
- Security score >70
- AuditOS + LocalContentOS pilot deployments on staging

---

## 180-Day Roadmap (Days 91-180)

### Theme: **Enterprise Credibility**

| Month | Focus | Deliverables |
|-------|-------|-------------|
| 4 | SSO/SAML | Wire DB providers to NextAuth; SAML via supported adapter |
| 4 | File Security | ClamAV or cloud scanning integration |
| 5 | SalesOS Stabilization | Consolidate `_v02`/`vnext`; fix intelligence types; seed in main |
| 5 | Pen Test | External pen test + remediation |
| 6 | Local AI Package | Hybrid deploy runbook; 20-task benchmark; model registry sync |
| 6 | Content Studio | Complete schema or deprecate standalone route |

**180-day exit criteria:**
- Pen test report with no critical open items
- SSO end-to-end demo
- Enterprise readiness score >65

---

## 12-Month Roadmap (Days 181-365)

### Theme: **Scale & Certify**

| Quarter | Focus | Deliverables |
|---------|-------|-------------|
| Q3 | SOC2 Readiness | Control mapping, evidence collection, policy docs |
| Q3 | WorkflowOS L5 | Sunbul consolidation; template seed; SLA automation |
| Q4 | DecisionOS L5 | Full committee workflow; export certification |
| Q4 | Multi-region DR | Active DR drill; cross-region replication |
| Q4 | AQLIYA Studio | L1-L2 discovery only if core products stable |

**12-month exit criteria:**
- SOC2 Type II audit initiated
- 2+ paying pilot customers on AuditOS or LocalContentOS
- L6 path defined for AuditOS (not claimed)

---

## Prioritization Matrix

| Initiative | Revenue | Security | Operations | Technical |
|------------|---------|----------|------------|-----------|
| Build fix | ●●● | ●●● | ●●● | ●●● |
| AuditOS pilot | ●●● | ● | ●● | ● |
| LocalContent pilot | ●●● | ● | ●● | ●● |
| MFA/SSO complete | ●● | ●●● | ● | ●● |
| Pen test | ●● | ●●● | ●● | ● |
| SalesOS consolidation | ● | ● | ● | ●●● |
| SOC2 program | ●● | ●●● | ●●● | ● |
| Local AI packaging | ●● | ●● | ● | ●● |

---

## What NOT to Build (12 months)

- Kubernetes deployment package (no demand evidence)
- Air-gapped appliance (strategic only)
- AQLIYA Studio full builder
- RiskOS standalone product (until AuditOS risk module proves value)
- SimulationOS product (marketing redirect only)

---

## Investment Estimate (Rough)

| Horizon | Engineering | External | Total |
|---------|------------|----------|-------|
| 90 days | 2 FTE | $15K pen test prep | ~$180K equiv |
| 180 days | 2.5 FTE | $30K pen test | ~$350K equiv |
| 12 months | 3 FTE | $80K SOC2 + pen | ~$900K equiv |

*(Order-of-magnitude for planning; not a quote.)*

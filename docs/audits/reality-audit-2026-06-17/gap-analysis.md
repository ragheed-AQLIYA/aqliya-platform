# Gap Analysis — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17

---

## Current State vs Target State

| Dimension | Current (Evidence) | Target (v0.1 Pilot) | Gap |
|-----------|-------------------|---------------------|-----|
| Build | FAIL (9 TS errors) | Green CI | **Critical** |
| Tests | 87.5% suite pass | 100% pass | High |
| Security | 58/100 | 80+ for pilot | High |
| Runtime proof | UNVERIFIED | Smoke + E2E green | High |
| AuditOS | L5 code | L5 pilot deployed | Low (after build) |
| LocalContentOS | L5 conditional | L5 pilot deployed | Medium |
| Enterprise SSO | Env OAuth only | SAML/OIDC from admin UI | High |
| Local AI | Ollama works | Packaged hybrid deploy | Medium |
| Documentation | Stale status | Verified weekly | Medium |
| DR | Documented | Tested quarterly | Medium |

---

## Gap Items (Prioritized)

| ID | Gap | Effort | Risk | Dependencies |
|----|-----|--------|------|--------------|
| GAP-01 | Fix TS/build blockers | 1-2d | Critical | None |
| GAP-02 | Remove security debug routes | 1h | Critical | None |
| GAP-03 | Delete duplicate `(1)` test files | 2h | High | None |
| GAP-04 | Schema drift (platformAuditEvent) | 1d | Critical | GAP-01 |
| GAP-05 | MFA JWT login flow | 4h | High | GAP-01 |
| GAP-06 | CoreAccessControl implementation | 2-5d | Critical | Design decision |
| GAP-07 | Runtime smoke + E2E | 2d | High | GAP-01 |
| GAP-08 | SSO DB → NextAuth wiring | 1-2w | High | GAP-01 |
| GAP-09 | File virus scanning | 1-2w | High | Vendor selection |
| GAP-10 | Backup restore drill automation | 2d | Medium | GAP-01 |
| GAP-11 | Content Studio schema completion | 3d | Medium | GAP-04 |
| GAP-12 | SalesOS consolidation | 2-4w | Medium | GAP-03 |
| GAP-13 | Pen test | 2-4w ext | High | GAP-01,02,05 |
| GAP-14 | SOC2 readiness program | 3-6mo | High | GAP-06,09,13 |
| GAP-15 | Local AI 20-task benchmark | 1d | Low | Ollama + GAP-01 |

---

## Timeline Estimate

| Horizon | Deliverables |
|---------|-------------|
| **Week 1** | GAP-01 through GAP-05 — restore green build + security hotfixes |
| **Week 2-3** | GAP-06,07,10 — RBAC decision, runtime proof, DR drill |
| **Month 2** | GAP-08,09,11 — SSO, scanning, content studio |
| **Month 3** | GAP-13,15 — pen test, AI benchmark, doc automation |
| **Month 4-6** | GAP-12,14 — Sales consolidation, SOC2 program |

---

## Resource Assumptions

- 1 senior full-stack engineer (build/security)
- 0.5 DevOps (Terraform fix, CI Postgres, DR drill)
- External pen test vendor (month 2-3)
- No schema breaking changes without migration review

---

## Risk if Gaps Ignored

| Scenario | Impact |
|----------|--------|
| Deploy with current build | **Impossible** — pipeline fails |
| Enterprise RFP | **Loss** — SSO/MFA/security gaps |
| Pilot with real client data | **Risk** — file scanning stub |
| Investor technical DD | **Credibility damage** — doc vs code drift |

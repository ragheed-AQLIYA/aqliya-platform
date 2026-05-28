# AuditOS v0.1 — Pilot FAQ

**Date:** 2026-05-28  
**Baseline tag:** `auditos-v0.1-pilot-baseline-2026-05-28`  
**Audience:** External operators, reviewers, and institutional stakeholders

---

## Platform Identity

### What is AQLIYA?

AQLIYA is a **Private Governed Institutional Intelligence Platform**. AuditOS is one product built on the platform — a governed financial audit workspace at `/audit/*`.

### What is AuditOS v0.1?

A **controlled pilot baseline** — usable end-to-end audit workflow with human governance, evidence, and audit trail. Not enterprise-scale production. Not a certified audit opinion product.

---

## Security

### Is the workspace authenticated?

Yes. `/audit/*` requires login. Credentials provider (email/password) in v0.1.

### Is SSO / LDAP / Active Directory supported?

**No** in v0.1. Strategic roadmap item only — do not claim implemented.

### Are download routes protected?

Yes. Evidence and export downloads require auth and tenant-safe access checks server-side.

### Is this SOC2 / ISO certified?

**No.** Controlled single-instance deployment ready — not certified enterprise security posture.

---

## Data Privacy

### Where is data stored?

PostgreSQL for structured data; local filesystem (`LOCAL_STORAGE_DIR` or Docker `uploads` volume) for evidence files in default v0.1 configuration.

### Is data sent to external AI providers?

AI features are assistive and optional. Sensitive tasks should stay on configured providers per your deployment policy. v0.1 does not claim local/private AI runtime unless explicitly configured and proven.

### Multi-tenant isolation?

Data is scoped by organization/workspace. Cross-tenant access is blocked by design — report any leak as P0 blocker.

### Can we use real customer data in pilot?

Only under controlled pilot agreement with rotated credentials, dedicated environment, and data handling review. Default seed data is for rehearsal.

---

## Deployment

### What deployment types are supported?

| Type                           | v0.1 status                     |
| ------------------------------ | ------------------------------- |
| Docker Compose single instance | ✅ Validated (C.5 rehearsal)    |
| Bare-metal Node + PostgreSQL   | ✅ Supported                    |
| Kubernetes / multi-region HA   | ❌ Not supported                |
| On-prem packaged product       | ❌ Strategic only — not shipped |
| Air-gapped                     | ❌ Not implemented              |

### Classification

> **Controlled Single-Instance Deployment Ready**

See: `docs/deployment/auditos-v0.1-deployment-guide.md`

### What happens after redeploy?

Operators must **hard refresh** the browser (Ctrl+Shift+R). Stale JavaScript can cause infinite loading or Server Action errors.

### Database seeding caveat

When using Docker, seed via `@db:5432` on the compose network — not host `localhost:5432` if it points to a different Postgres instance.

---

## AI Usage

### Does AI approve audits?

**No.** AI assists only. Humans decide. Evidence governs.

### Can AI replace our auditors?

**No.** AuditOS supports governed workflow — it does not issue audit opinions or replace professional judgment.

### Is this an autonomous audit platform?

**No.** Explicitly not autonomous audit operations. Any AI output is suggestion/draft requiring human review.

---

## Approval Responsibility

### Who approves?

A designated human reviewer/partner with appropriate role. The system records identity and timestamp.

### Can the system auto-approve?

**No.** Approval gates block bypass. Seeded engagements may remain blocked in a single walkthrough — that demonstrates governance.

### What if approval is blocked?

Follow the prerequisite card on the approval page — complete required tabs (review, evidence, etc.) first.

---

## Export Trust

### Can we export before final approval?

Yes — as **draft** for internal review. This is intentional v0.1 policy.

### Is an exported PDF a final certified report?

**No** until human approval path is complete and your organization treats it as final. Exports carry draft/status context.

### Are exports logged?

Yes — export actions should appear in the audit trail.

---

## Evidence Handling

### How are files stored?

Local storage provider by default. S3/Azure not integrated in v0.1.

### Virus scanning?

`SCANNER_PROVIDER` is a stub — not production-grade scanning. Operator responsibility for file policy.

### What happens when evidence is rejected?

State changes in the app; physical file may remain on disk (v0.1 limitation — disclosed).

---

## Limitations

| Limitation                 | Detail                             |
| -------------------------- | ---------------------------------- |
| Single instance            | No horizontal scaling guidance     |
| No HA/failover             | Postgres and app are SPOF          |
| Credentials only           | No SSO                             |
| Draft exports pre-approval | Policy, not bug                    |
| Hard refresh after deploy  | Browser cache reality              |
| Mixed EN/AR in deep admin  | P2 — Arabic-first on core workflow |
| Dashboard N+1 fetch        | P2 performance                     |
| Backup scheduling          | Operator responsibility            |

Full list: `docs/releases/auditos-v0.1-release-package-2026-05-28.md`

---

## Roadmap Boundaries

### In scope after v0.1 pilot

- External operator friction fixes (P2)
- Credential rotation and org-specific seed
- Controlled pilot validation report

### Out of scope for v0.1 claims

- Enterprise rollout
- Certified production deployment
- Autonomous audit operations
- SSO, SIEM, Kubernetes
- On-prem / air-gapped packages
- Regulator certification

---

## Quick Reference

| Question                                    | Answer                       |
| ------------------------------------------- | ---------------------------- |
| Autonomous audit?                           | **No**                       |
| Certified enterprise platform?              | **No**                       |
| Controlled deployment?                      | **Yes**                      |
| Human approval required?                    | **Yes**                      |
| Public demo at `/auditos/*` real workspace? | **No** — mock demo only      |
| Real workspace?                             | **`/audit/*`** authenticated |

---

## References

- Walkthrough: `docs/pilot/auditos-first-operator-walkthrough.md`
- Demo environment: `docs/pilot/auditos-demo-environment.md`
- Release package: `docs/releases/auditos-v0.1-release-package-2026-05-28.md`
- Baseline tag: `auditos-v0.1-pilot-baseline-2026-05-28`

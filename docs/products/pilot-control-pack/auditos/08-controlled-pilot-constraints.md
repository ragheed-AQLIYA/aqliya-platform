# AuditOS Controlled Pilot Constraints

## Current Status

**AuditOS = Controlled Pilot Ready**

This document defines the boundaries within which the controlled pilot operates. These constraints are not optional. Every pilot session must begin by reviewing this document with participants.

---

## 1. What AuditOS IS

- A governed audit intelligence workspace for controlled pilot use
- A system where evidence, review, approval, and audit logs are core design features
- A bilingual (Arabic-first) financial audit workflow tool
- A platform where AI assists but **humans decide**

---

## 2. What AuditOS IS NOT (Pilot Boundaries)

### Not Production-Ready

| Constraint               | Detail                                        |
| ------------------------ | --------------------------------------------- |
| No SLA                   | The pilot environment may have downtime       |
| No backup guarantee      | Database backups are manual, not automated    |
| No multi-instance        | In-memory rate limiting is per-instance only  |
| No cloud storage default | Evidence storage defaults to local filesystem |
| No monitoring            | No production monitoring or alerting          |
| No disaster recovery     | No automated failover or restore procedure    |

### Not Fully AI-Powered

| Constraint              | Detail                                                   |
| ----------------------- | -------------------------------------------------------- |
| Deterministic AI        | AI suggestions are template-based, not LLM-generated     |
| No real LLM             | No external AI provider is called for audit intelligence |
| Confidence levels       | Confidence scores are pre-defined, not computed          |
| No autonomous decisions | AI never approves, exports, or makes final decisions     |

### Not Fully Mature

| Constraint                 | Detail                                                                       |
| -------------------------- | ---------------------------------------------------------------------------- |
| Rate limiting              | In-memory only; lost on server restart                                       |
| Fallback env switch        | `AUDIT_ALLOW_MOCK_FALLBACK=true` can re-enable mock data for protected reads |
| No Redis/S3                | Production deployment needs Redis for rate limiting, S3 for storage          |
| No SSO                     | Authentication is NextAuth credentials only                                  |
| No audit dashboard         | Platform audit logs exist but no dedicated audit event viewer                |
| No real-time collaboration | Single-user workflow per session                                             |

---

## 3. Allowed Use

- [x] Demonstrating governed audit workflow to potential customers
- [x] Collecting user feedback on workflow, UI, and governance
- [x] Testing export output and data integrity
- [x] Training internal operators on AuditOS workflow
- [x] Validating governance requirements (RBAC, audit trail, tenant isolation)
- [x] Gathering evidence for product improvement

---

## 4. Prohibited Use

- [ ] Real financial audit work
- [ ] Storage of real client financial data beyond pilot scope
- [ ] Making audit decisions based on AI output without human review
- [ ] Sharing exports as final audited financial statements
- [ ] Claiming production-readiness to pilot participants
- [ ] Bypassing review or approval workflow
- [ ] Deleting audit logs
- [ ] Using pilot environment for unrelated workloads

---

## 5. Data Rules

### Permitted Data

- Synthetic / demo trial balance data
- Anonymized financial records
- Test evidence files (non-sensitive)

### Prohibited Data

- Real client personal data (PII)
- Real confidential financial statements
- Real audit opinions or certifications
- Passwords, secrets, API keys
- Any data covered by NDA that has not been explicitly approved for pilot use

### Data Retention

- Pilot data will be preserved for the duration of the pilot program
- After pilot ends, data will be archived or deleted within 30 days
- Participants may request deletion of their session data at any time

---

## 6. Session Rules

- Every session must begin with briefing (see runbook Phase 1)
- Every session must have a designated operator
- Every session must use the evidence capture template (05)
- Every session must produce a post-session review (07)
- Incidents must be documented using the incident template (04)
- Operator must have this document accessible during the session
- Operator may abort the session at any time

---

## 7. Governance Guarantees

| Guarantee                           | Status | Notes                                            |
| ----------------------------------- | ------ | ------------------------------------------------ |
| RBAC enforced server-side           | ✅     | role check on export actions and pilot mutations |
| Tenant isolation                    | ✅     | organizationId check on data access              |
| Audit trail on mutations            | ✅     | PlatformAuditLog for all recorded actions        |
| Review before approval              | ✅     | Status workflow requires review step             |
| Export status labels                | ✅     | Draft / Approved shown on exports                |
| Evidence linked to findings         | ✅     | Evidence vault with finding associations         |
| AI suggestions require confirmation | ✅     | Human must accept/reject each suggestion         |

---

## 8. Known Risks

| Risk                                                   | Likelihood | Impact                         | Mitigation                                            |
| ------------------------------------------------------ | ---------- | ------------------------------ | ----------------------------------------------------- |
| DB connection failure causes 500s on protected reads   | Low        | High (workflow stops)          | Error message is clear; fallback env switch available |
| Rate limiter reset on server restart                   | Medium     | Low (only affects rapid retry) | Acceptable for pilot                                  |
| Local storage lost on server restart                   | Medium     | High (evidence files)          | Seed data can be re-uploaded; documented constraint   |
| Pilot participant sees mock data if env switch enabled | Low        | Medium (trust issue)           | Env switch is off by default; checklist verifies      |

---

## 9. Document Version

| Version | Date       | Author   | Change                               |
| ------- | ---------- | -------- | ------------------------------------ |
| 1.0     | 2026-05-28 | OpenCode | Initial controlled pilot constraints |

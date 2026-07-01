# Enterprise Readiness — AQLIYA Deep Reality Audit

**Audit date:** 2026-06-17  
**Overall Enterprise Readiness: 48/100** (Not enterprise procurement ready)

---

## Framework Assessment

| Framework | Readiness | Score | Key Gaps |
|-----------|-----------|------:|----------|
| SOC 2 Type II | Not ready | 45 | Access control stub, no pen test, backup verify ≠ restore |
| ISO 27001 | Not ready | 50 | ISMS docs exist; technical controls incomplete |
| PDPL (Saudi) | Partial | 55 | Audit trails, tenant isolation; DPA/retention ops unverified |
| NCA ECC | Partial | 50 | Logging/monitoring; IAM/MFA gaps |

---

## Control Domain Matrix

| Domain | Implemented | Evidence | Gap |
|--------|-------------|----------|-----|
| **Auditability** | YES | PlatformAuditLog, product audit events | Write fails on schema drift |
| **Traceability** | PARTIAL | Audit events, provenance metadata on AI | Not end-to-end proven in runtime |
| **Governance** | PARTIAL | Review/approval workflows in products | CoreAccessControl stub |
| **RBAC** | PARTIAL | Middleware coarse roles | No fine-grained matrix |
| **Tenant isolation** | YES | organizationId + guards | App-layer only, no RLS |
| **Encryption at rest** | PARTIAL | RDS/S3 via AWS; vault for secrets | SSO secrets in DB unclear |
| **Encryption in transit** | YES | TLS on ALB, HTTPS redirect | VERIFIED in Terraform |
| **MFA** | PARTIAL | TOTP implemented | Login flow incomplete |
| **SSO/SAML** | PARTIAL | Env OAuth + SCIM | DB SSO/SAML not wired |
| **SIEM integration** | PARTIAL | `/api/platform/siem` route exists | Live integration unverified |
| **Backup/DR** | PARTIAL | Scripts + AWS Backup IaC | Restore not routinely tested |
| **Vulnerability mgmt** | NO | No npm audit in CI | Add dependency scanning |
| **Pen testing** | NO | Doc mentions scheduling | No evidence of completion |
| **Data retention** | PARTIAL | Retention API routes | Ops unverified |
| **AI governance** | YES | Eval-gate, spend tracking, human review design | Default deterministic |

---

## Audit Trail Maturity — VERIFIED (design)

Products implement audit events:
- AuditOS: `AuditEvent` model + comprehensive logging
- LocalContentOS: `LocalContentAuditEvent`
- SalesOS: `SalesAuditEvent`
- Platform: `PlatformAuditLog`

**Export controls:** Download tickets, approval gates on exports (workflow, contacts, audit).

---

## Evidence Governance — VERIFIED

- Evidence models across AuditOS, DecisionOS, LocalContentOS
- SHA-256 checksums on uploads (decision evidence)
- AI outputs marked as draft/suggestion requiring human review

---

## Enterprise Sales Blockers

| Blocker | Severity | Effort to resolve |
|---------|----------|-------------------|
| Build/TS failures | Critical | 1-2 days |
| test-token debug route | Critical | 15 minutes |
| CoreAccessControl stub | Critical | 2-5 days |
| MFA incomplete | High | 2-4 hours |
| SSO/SAML not end-to-end | High | 2-4 weeks |
| File scanning stub | High | 1-2 weeks |
| No pen test report | High | 2-4 weeks external |
| Backup restore drill | Medium | 2 days |
| SOC2 audit | High | 3-6 months program |

---

## PDPL-Specific (Saudi Market)

| Requirement | Status |
|-------------|--------|
| Data residency (AWS me-south-1) | VERIFIED in Terraform |
| Purpose limitation (governed AI) | VERIFIED in design |
| Access controls | PARTIAL |
| Breach notification process | UNVERIFIED in ops |
| Data subject rights | UNVERIFIED |

---

## Recommendations for Enterprise Path

**Phase 1 (30 days):** Fix build, remove debug routes, MFA complete, doc truth sync  
**Phase 2 (60 days):** CoreAccessControl, file scanner, backup restore drills, dependency CI scan  
**Phase 3 (90 days):** SSO/SAML wiring, pen test, SOC2 readiness assessment  
**Phase 4 (6-12 months):** Formal SOC2 Type II, ISO 27001 certification program

---

**Verdict:** Strong governance **design** suitable for institutional positioning; **implementation gaps** block enterprise procurement today.

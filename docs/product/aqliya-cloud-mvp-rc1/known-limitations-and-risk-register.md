# AQLIYA Cloud MVP RC1 — Known Limitations & Risk Register

**Release:** RC1
**Status:** Live document — update as risks change

---

## Risk Register

| ID | Risk | Likelihood | Impact | Severity | Mitigation | Owner |
|---|---|---|---|---|---|---|
| R1 | **Migration drift** — `prisma migrate deploy` will fail on production because 6 platform tables have no migration files | **High** | **Critical** | **CRITICAL** | Apply consolidated migration SQL before production deployment. Documented in `aqliya-production-migration-plan.md`. | AQLIYA Dev |
| R2 | **No malware scanning** — uploaded files are not scanned for viruses or malware | **Medium** | **Critical** | **CRITICAL** | Do not upload sensitive files. Implement ClamAV or equivalent before production. | AQLIYA Sec |
| R3 | **No automated backup** — database backup is manual only | **Medium** | **High** | **HIGH** | Document manual backup procedure. Automate before production. | AQLIYA Ops |
| R4 | **No production monitoring** — no alerting for system health, performance, or errors | **Medium** | **High** | **HIGH** | Add health endpoint + alerting before production. | AQLIYA Ops |
| R5 | **No Cloud AI** — deterministic generation limits output quality and flexibility | **Medium** | **Medium** | **MEDIUM** | Document as MVP scope. Cloud AI is Phase 4. | AQLIYA PM |
| R6 | **No OCR** — scanned/image-only PDFs cannot be processed | **Medium** | **Medium** | **MEDIUM** | Document as limitation. OCR is post-MVP. | AQLIYA PM |
| R7 | **No Local AI** — Private/On-Prem deployments cannot run AI locally | **Low** | **Medium** | **MEDIUM** | Local AI is Phase 5. Cloud AI first, then local. | AQLIYA RD |
| R8 | **No Private/On-Prem deployment package** — Cloud only | **Medium** | **High** | **HIGH** | Private deployment is Phase 3. Requires production migration baseline first. | AQLIYA PM |
| R9 | **Deterministic generation is template-based** — outputs are structured but not intelligent | **Low** | **Medium** | **MEDIUM** | Document clearly. Human review is still required. | AQLIYA PM |
| R10 | **Storage provider only local** — S3/Azure Blob not wired for production | **Medium** | **Medium** | **MEDIUM** | Platform storage abstraction exists. Wire S3/Azure before production. | AQLIYA Dev |
| R11 | **No PlatformUser / PlatformRole** — RBAC is per-product, not unified | **Low** | **Medium** | **MEDIUM** | Legacy User/UserRole models work for MVP. Deferred. | AQLIYA PM |
| R12 | **No SSO / SAML / LDAP** — credentials provider only | **Low** | **Medium** | **MEDIUM** | Enterprise requirement deferred. | AQLIYA PM |
| R13 | **No PlatformAuditLog FK constraints** — string fields are nullable | **Low** | **Low** | **LOW** | By design — preserves log immutability. | AQLIYA Arch |
| R14 | **DecisionOS lacks workspace/project context** — audit logs have NULL workspace/project IDs | **Low** | **Low** | **LOW** | By design — DecisionOS has no workspace concept. | AQLIYA Arch |

---

## Known Limitations

### Platform

| Limitation | Detail | Impact | Resolution |
|---|---|---|---|
| Migration drift | 6 platform models have no migration file | Production deployment requires manual SQL | Apply consolidated migration |
| No production monitoring | No alerting, no uptime tracking | Cannot detect outages | Add before production |
| No automated backup | Manual `pg_dump` only | Data loss risk without backup discipline | Automate before production |
| Storage provider | Local filesystem only (dev) | Not suitable for production scale | Wire S3/Azure in Phase 2 |
| PlatformUser/PlatformRole | Not implemented | RBAC per-product still works but not unified | Post-MVP |
| SSO/LDAP | Not available | Credentials only | Post-MVP |

### Security

| Limitation | Detail | Impact | Resolution |
|---|---|---|---|
| No malware scanning | Uploaded files not scanned | Risk if sensitive files uploaded | Before production |
| No file encryption at rest (storage) | Local filesystem only | Acceptable for dev/pilot | Wire S3/Azure encryption |
| No MFA | Password only | Acceptable for pilot | Post-MVP |

### Office AI Assistant

| Limitation | Detail | Impact | Resolution |
|---|---|---|---|
| No Cloud AI | Deterministic generation only | Outputs are template-based, not intelligent | Phase 4 |
| No OCR | Scanned PDFs not supported | Image-based documents cannot be extracted | Post-MVP |
| No memory/conversation | Each task is stateless | No follow-up context | Post-MVP |
| No email integration | Cannot summarize emails | Requires secure connector | Post-MVP |
| No chatbot | Structured task types only | Not a free-form AI assistant | By design |

### AuditOS

| Limitation | Detail | Impact | Resolution |
|---|---|---|---|
| Integration tests require Docker PostgreSQL | Jest integration tests need DB | CI/CD requires Docker setup | Documented |

### Deployment

| Limitation | Detail | Impact | Resolution |
|---|---|---|---|
| Cloud only | No Private/On-Prem package | Sombol cannot self-host | Phase 3 |
| No Local AI | Cannot run AI without Cloud | Private deployment cannot use AI | Phase 5 |
| No Air-Gapped mode | Requires internet | Not suitable for air-gapped environments | Post-Phase 3 |

---

## Risk Severity Legend

| Severity | Meaning | Required Action |
|---|---|---|
| **CRITICAL** | Blocks production deployment | Must resolve before production |
| **HIGH** | Significant operational or security risk | Must mitigate before production |
| **MEDIUM** | Notable gap, acceptable for pilot | Plan resolution within 6 months |
| **LOW** | Minor gap, acceptable for launch | Document and track |

---

## Mitigation Status

| ID | Risk | Status | Target Resolution |
|---|---|---|---|
| R1 | Migration drift | ⚠ Documented | Before production migration |
| R2 | No malware scanning | ❌ Unaddressed | Before production readiness |
| R3 | No automated backup | ❌ Unaddressed | Before production readiness |
| R4 | No monitoring | ❌ Unaddressed | Before production readiness |
| R5 | No Cloud AI | ⚠ Risk gate defined | Phase 4 |
| R6 | No OCR | ⚠ Documented | Post-MVP |
| R7 | No Local AI | ⚠ Documented | Phase 5 |
| R8 | No Private deployment | ⚠ Roadmap defined | Phase 3 |
| R9 | Deterministic generation | ✅ Documented | Client acknowledges |
| R10 | Storage provider local | ⚠ Abstraction exists | Wire S3/Azure Phase 2 |
| R11 | No PlatformUser/Role | ⚠ Deferred | Post-MVP |
| R12 | No SSO/LDAP | ⚠ Deferred | Post-MVP |
| R13 | No FK constraints | ✅ By design | — |
| R14 | DecisionOS NULL contexts | ✅ By design | — |

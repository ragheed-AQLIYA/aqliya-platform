# LocalContentOS RBAC Matrix

> **Status:** Active — Source of Truth | **Version:** 1.0 | **Date:** 2026-07-01 | **Owner:** Security Team | **Last Reviewed:** 2026-07-01
> **RB-02A Reference:** v1.0 §§6–7 — Platform Roles & Role × Permission Matrix
> **Authorization Engine:** `src/lib/authorization/engine/` — 168 tests passing

---

## 1. Platform Roles → LCOS Labels

| Platform Role | LCOS Label | Level |
|--------------|-----------|-------|
| `ORG_ADMIN` | مدير المؤسسة / Org Admin | Organization-wide |
| `BUSINESS_MANAGER` | مدير المحتوى المحلي / LC Manager | Organization-wide |
| `REVIEWER` | مراجع / Reviewer | Project-scoped |
| `ANALYST` | محلل / Analyst | Project-scoped |
| `READ_ONLY` | عرض فقط / Read Only | Read-only |
| `EXTERNAL_AUDITOR` | مدقق خارجي / External Auditor | Read + audit log |
| `INTEGRATION_ACCOUNT` | حساب تكامل / Integration | API-scoped |

---

## 2. Resource × Permission Matrix

| Resource | Permission Code | Actions |
|----------|----------------|---------|
| `project` | `P01` PROJECT_MANAGEMENT | create, read, update, archive |
| `project` | `P02` PROJECT_DELETION | delete |
| `workbook` | `P03` WORKBOOK_MANAGEMENT | create, read, update, delete, calibrate, editContent, editStructure, approve |
| `workbook` | `P04` WORKBOOK_EXPORT | export |
| `supplier` | `P05` SUPPLIER_MANAGEMENT | create, read, update, delete |
| `spend-record` | `P06` SPEND_DATA_ENTRY | create, read, update, delete |
| `evidence` | `P07` EVIDENCE_UPLOAD | upload |
| `evidence` | `P08` EVIDENCE_READ | read, download |
| `evidence` | `P09` EVIDENCE_DELETION | delete |
| `finding` | `P10` FINDING_MANAGEMENT | create, read, update |
| `finding` | `P11` FINDING_CLOSE | close |
| `review` | `P12` REVIEW_MANAGEMENT | create, read |
| `review` | `P13` REVIEW_APPROVAL | approve, reject |
| `review` | `P14` REVIEW_OVERRIDE | override |
| `pattern-suggestion` | `P15` AI_REVIEW | read, accept, reject, archive |
| `match-review` | `P15` AI_REVIEW | read, update, flag |
| `recommendation` | `P15` AI_REVIEW | read, accept, dismiss, archive |
| `classification-rule` | `P16` CLASSIFICATION_MANAGEMENT | create, read, update, delete |
| `import` | `P17` IMPORT | create, read |
| `export` | `P18` EXPORT_MANAGEMENT | create, read, download |
| `report` | `P19` REPORT_MANAGEMENT | create, read, export, delete |
| `audit-log` | `P20` AUDIT_LOG_ACCESS | read, export |
| `settings` | `P21` SETTINGS_MANAGEMENT | read, update |
| `membership` | `P22` ORGANIZATION_MEMBERSHIP | read, invite, activate, deactivate, assignRole, revokeRole |
| `settings` (AI) | `P23` AI_CONFIGURATION | read, update |

---

## 3. Role × Permission Matrix

| Permission | ADMIN | MANAGER | REVIEWER | ANALYST | READ_ONLY | EXT_AUDITOR | INTEGRATION |
|-----------|:-----:|:-------:|:--------:|:-------:|:---------:|:-----------:|:-----------:|
| P01 PROJECT_MANAGEMENT | ✅ | ✅ | — | — | — | — | — |
| P02 PROJECT_DELETION | ✅ | — | — | — | — | — | — |
| P03 WORKBOOK_MANAGEMENT | ✅ | ✅ | — | ✅ | — | — | — |
| P04 WORKBOOK_EXPORT | ✅ | ✅ | — | ✅ (own) | — | — | — |
| P05 SUPPLIER_MANAGEMENT | ✅ | ✅ | — | ✅ | — | — | — |
| P06 SPEND_DATA_ENTRY | ✅ | ✅ | — | ✅ | — | — | — |
| P07 EVIDENCE_UPLOAD | ✅ | ✅ | ✅ | ✅ | — | — | — |
| P08 EVIDENCE_READ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | API |
| P09 EVIDENCE_DELETION | ✅ | ✅ | ✅ | — | — | — | — |
| P10 FINDING_MANAGEMENT | ✅ | ✅ | ✅ | — | — | — | — |
| P11 FINDING_CLOSE | ✅ | ✅ | ✅ | — | — | — | — |
| P12 REVIEW_MANAGEMENT | ✅ | ✅ | ✅ | — | — | — | — |
| P13 REVIEW_APPROVAL | ✅ | ✅ | ✅ | — | — | — | — |
| P14 REVIEW_OVERRIDE | ✅ | — | — | — | — | — | — |
| P15 AI_REVIEW | ✅ | ✅ | ✅ | — | ✅ (read) | ✅ (read) | — |
| P16 CLASSIFICATION_MANAGEMENT | ✅ | ✅ | — | — | — | — | — |
| P17 IMPORT | ✅ | ✅ | — | ✅ | — | — | API |
| P18 EXPORT_MANAGEMENT | ✅ | ✅ | — | ✅ (own) | — | — | — |
| P19 REPORT_MANAGEMENT | ✅ | ✅ | ✅ | ✅ | ✅ (read) | ✅ (read) | — |
| P20 AUDIT_LOG_ACCESS | ✅ | ✅ (scoped) | — | — | — | ✅ | — |
| P21 SETTINGS_MANAGEMENT | ✅ | — | — | — | — | — | — |
| P22 ORGANIZATION_MEMBERSHIP | ✅ | — | — | — | — | — | — |
| P23 AI_CONFIGURATION | ✅ | — | — | — | — | — | — |

---

## 4. Action → Permission Mapping

| Action Group | Files | Required Permission | Notes |
|-------------|-------|-------------------|-------|
| Project CRUD | `localcontent-actions.ts` | P01 (create/update) / P02 (delete) | ADMIN-only for create |
| Workbook CRUD | `localcontent-workbook-actions.ts` | P03 WORKBOOK_MANAGEMENT | |
| Workbook Export | `localcontent-workbook-actions.ts` | P04 WORKBOOK_EXPORT | |
| Supplier CRUD | `localcontent-actions.ts` | P05 SUPPLIER_MANAGEMENT | |
| Spend CRUD | `localcontent-actions.ts` | P06 SPEND_DATA_ENTRY | |
| Evidence Upload | `localcontent-actions.ts` | P07 EVIDENCE_UPLOAD | |
| Evidence Read | `localcontent-actions.ts` | P08 EVIDENCE_READ | |
| Evidence Delete | `localcontent-actions.ts` | P09 EVIDENCE_DELETION | |
| Finding CRUD | `localcontent-actions.ts` | P10 FINDING_MANAGEMENT | |
| Finding Close | `localcontent-actions.ts` | P11 FINDING_CLOSE | |
| Review + Approve | `localcontent-actions.ts` | P12 + P13 REVIEW_APPROVAL | |
| AI Pattern Review | `localcontent-ai-advisor-actions.ts` | P15 AI_REVIEW | |
| AI Recommendations | `localcontent-ai-advisor-v3-actions.ts` | P15 AI_REVIEW | |
| Classification | `localcontent-actions.ts` | P16 CLASSIFICATION_MANAGEMENT | |
| Import CSV | `localcontent-actions.ts` | P17 IMPORT | |
| Report Generate | `localcontent-actions.ts` | P19 REPORT_MANAGEMENT | |
| Audit Log | `localcontent-actions.ts` | P20 AUDIT_LOG_ACCESS | |
| Quality Metrics | `localcontent-quality-actions.ts` | P20 AUDIT_LOG_ACCESS | |
| Pilot Readiness | `localcontent-pilot-readiness-actions.ts` | P01 PROJECT_MANAGEMENT | |
| Review Export PDF | `localcontent-review-export.ts` | P18 EXPORT_MANAGEMENT | |

---

## 5. Implementation Status

| Batch | Scope | Actions | Status |
|-------|-------|---------|:------:|
| RB-01 | Tenant isolation guards (orgId checks) | 89/89 | ✅ Complete |
| B2B-01 | RBAC matrix documented | this doc | ✅ Complete |
| B2B-02 | Role-based permission guards | 89/89 | ⬜ Pending |
| B2B-03 | Fix partial/no-guard gaps | 12 gaps | ⬜ Pending |

---

## 6. References

- RB-02A v1.0 Authorization Model: `docs/platform/authorization/RB-02A_AUTHORIZATION_MODEL.md`
- Authorization Engine: `src/lib/authorization/engine/`
- LocalContentOS Guards: `src/actions/localcontent-guards.ts`
- EXECUTION_BACKLOG: `docs/programs/localcontentos-production-readiness/EXECUTION_BACKLOG.md`
- PRODUCTION_READINESS_MATRIX: `docs/source-of-truth/PRODUCT_STATUS_MATRIX.md`

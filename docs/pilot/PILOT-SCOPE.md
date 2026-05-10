# AQLIYA AuditOS — Pilot Scope Document

## 1. Pilot Objective

Validate AQLIYA AuditOS workflow completeness, AI-assisted drafting capabilities, audit trail integrity, and approval controls using a controlled dataset and supervised stakeholder walkthrough.

**Outcome:** Go/No-Go recommendation for external production deployment.

---

## 2. Included Workflows

| # | Workflow | Status |
|---|----------|--------|
| 1 | Engagement creation | ✅ Supported |
| 2 | Trial Balance CSV/XLSX upload | ✅ Supported |
| 3 | Account mapping to canonical chart | ✅ Supported |
| 4 | Financial statement generation (3 statements) | ✅ Supported |
| 5 | Disclosure notes management | ✅ Supported |
| 6 | Evidence CRUD with lifecycle states | ✅ Supported |
| 7 | Evidence-to-finding linking | ✅ Supported |
| 8 | Finding CRUD with severity levels | ✅ Supported |
| 9 | Recommendation CRUD linked to findings | ✅ Supported |
| 10 | Review comments with entity target selector | ✅ Supported |
| 11 | Approval readiness gate (5 checks) | ✅ Supported |
| 12 | Approval/rejection with rationale | ✅ Supported |
| 13 | Audit trail (18+ event types) | ✅ Supported |
| 14 | TraceabilityDrawer (all entity types) | ✅ Supported |
| 15 | AI draft notes generation | ✅ Supported |
| 16 | AI evidence suggestions | ✅ Supported |
| 17 | AI finding/recommendation drafts | ✅ Supported |
| 18 | AI analytical review flags | ✅ Supported |
| 19 | Financial statement JSON export | ✅ Supported |
| 20 | Audit file JSON export | ✅ Supported |
| 21 | Bilingual export (Arabic/English labels) | ✅ Supported |

---

## 3. Excluded Workflows

| Workflow | Reason |
|----------|--------|
| PDF/Word export | Not yet implemented |
| Virus scanning for uploads | Requires external integration |
| Production authentication | Requires user provisioning setup |
| Multi-tenant isolation validation | Requires second organization test |
| REST API / webhooks | Not yet implemented |
| Optimistic concurrency | Planned for post-pilot |
| Large file chunked upload (>50MB) | Planned for post-pilot |
| Automated period-end close | Out of scope |

---

## 4. Supported File Types

- **Trial Balance upload:** CSV, XLSX
- **Evidence upload:** PDF, XLSX, XLS, DOCX, JPG, JPEG, PNG, CSV
- **Maximum file size:** 20 MB per file
- **Export format:** JSON only

---

## 5. Export Limitations

- **Format:** JSON only (not PDF, DOCX, or XLSX)
- **Status labels:** Draft exports include a clear "DRAFT — Not final" warning
- **Approved exports:** Include approver name, timestamp, and rationale
- **Bilingual:** Statement titles prefixed with Arabic labels; source accounting data unchanged
- **No formatting/PDF rendering:** Export files are structured JSON, not formatted documents

---

## 6. Security Limitations

| Area | Status | Risk |
|------|--------|------|
| Demo fallback | Development only; throws error in production | Low — gated by NODE_ENV |
| Role enforcement | Server-side checks on all audit actions | ✅ Verified |
| File type whitelist | Enforces allowed types; rejects disallowed | ✅ Verified |
| File size limit | 20 MB maximum | ✅ Verified |
| File hashing | SHA-256 hash stored for integrity | ✅ Supported |
| Virus scanning | Not implemented | Medium — files treated as trusted |
| Production auth | Not fully provisioned | High — requires setup before production |
| Multi-tenant isolation | Schema supports it; unvalidated | Medium — requires testing |

---

## 7. AI Limitations

- **All AI output is draft**, never final by default
- **AI requires human acceptance** before affecting real entities
- **AI does not approve, finalize, or override human decisions**
- **AI output is traceable** via `sourceEntityType` and `sourceEntityId` on AIOutput records
- **AI suggestions may be incomplete** — human review is mandatory
- **AI confidence scores** are indicators, not guarantees

---

## 8. Recommended Pilot Data

- **Client:** Gulf Trading Co. (or equivalent structured dataset)
- **Period:** Single fiscal year (e.g., FY2025)
- **Framework:** IFRS for SMEs
- **Currency:** SAR
- **Accounts:** 20–50 trial balance lines
- **Evidence:** 5–10 items across upload, missing, accepted, rejected states
- **Findings:** 3–5 findings with varied severity
- **Reviews:** 2–4 review comments, some open, some resolved

---

## 9. User Roles Included

| Role | Description | Scope |
|------|-------------|-------|
| Admin | Full system access | Setup, configuration |
| Operator | Engagement preparation | Upload, draft, create evidence/findings/recs |
| Reviewer | Review and comment | Review entities, resolve comments |
| Partner | Approval authority | Approve/reject engagements |
| Viewer | Read-only access | View dashboards, reports |

---

## 10. Success Criteria

See `PILOT-SUCCESS-CRITERIA.md` for detailed measurable criteria.

---

## 11. Out-of-Scope Items

- AQLIYA Decision OS tender module (separate product line)
- Local Content module
- Zakat/Tax standalone module
- Internal Audit module
- Automated financial close
- ERM / Enterprise Risk Management
- External regulator filing
- Client portal for evidence upload
- Mobile application
- Real-time collaboration / chat

---

## 12. Required Stakeholder Acknowledgments

By signing this scope document, stakeholders acknowledge:

1. This is a controlled pilot, not a production deployment.
2. AI output is draft and requires human review.
3. Exports are JSON-only; formatted PDF/Word are not yet available.
4. File uploads are not virus-scanned.
5. The system has been validated with a single organization dataset.
6. Production authentication and user provisioning are not fully configured.
7. All feedback will be documented and prioritized for the production roadmap.

---

## 13. Timeline Suggestion

| Phase | Duration | Activities |
|-------|----------|------------|
| Demo walkthrough | 60 minutes | Live product demonstration |
| Stakeholder Q&A | 30 minutes | Questions and feedback collection |
| Sandbox access | 1–2 weeks | Stakeholder self-exploration |
| Feedback review | 1 week | Prioritize and document |
| Production roadmap | 1 week | Schedule production items |

---

## 14. Sign-Off Process

1. Review this scope document
2. Acknowledge limitations
3. Complete success criteria baseline
4. Sign pilot agreement
5. Schedule demo
6. Execute pilot
7. Provide feedback
8. Review go/no-go decision

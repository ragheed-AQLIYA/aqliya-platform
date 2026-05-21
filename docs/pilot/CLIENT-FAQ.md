# AuditOS — Client FAQ

## 1. Is this replacing auditors?

**No.** AuditOS is an audit engagement platform that digitizes and structures the audit workflow. It does not replace auditors. It helps engagement teams work more efficiently with structured data, clear traceability, and AI-assisted drafting. Professional judgment, review, and approval remain with the auditor at every step.

---

## 2. Can AI approve financial statements?

**No.** AI cannot approve, finalize, or override human decisions. All AI output is generated as draft and requires explicit human acceptance before it becomes part of the audit record. Approval is restricted to authorized roles (partner and admin) and requires passing five readiness checks.

---

## 3. Are AI outputs final?

**No.** All AI-generated content is:

- **Draft** by default
- **Marked** as "AI-generated draft" with "Not final" badges
- **Requires human review** before affecting real entities
- **Rejectable** — AI output can be dismissed without creating records
- **Traceable** — every AI output records its source entity, type, and status

Accepted AI output remains in draft/reviewable status until explicitly approved through the workflow.

---

## 4. How is evidence linked?

Evidence is linked to findings using a structured join table (`AuditEvidenceLink`). Each link records:

- The evidence ID and finding ID
- The link type (e.g., "supports")
- The user who created the link
- The timestamp

This creates a traceable, auditable connection that is visible in the TraceabilityDrawer.

---

## 5. Can we trace every number?

**Yes.** From any financial statement line, evidence item, or finding, you can open the TraceabilityDrawer to see:

- **Forward trace:** Source data → Account mapping → Evidence → Finding → Recommendation
- **Backward trace:** Publication ← Approval ← Review ← Statements

Traceability is not fabricated — it reflects real database relationships. If data is incomplete, the trace shows "no data available" rather than showing fake links.

---

## 6. What standards does it support?

The current implementation is configured for **IFRS for SMEs** with the financial statement types and canonical chart of accounts aligned to that framework. The architecture supports additional frameworks (full IFRS, GAAP, etc.) through configuration of the canonical account chart.

---

## 7. Does it support Arabic and English?

**Partially.** The export feature supports bilingual labels:

- Financial statement titles can be prefixed with Arabic labels (`بيان`)
- Source accounting data and user-entered content remain in their original language
- Full Arabic UI translation is under consideration for a future release

---

## 8. Can it export PDF/Word?

**Not yet.** Current export output is JSON (structured data). This allows the export to be consumed programmatically or converted to other formats. PDF and Word export are under evaluation for a future release.

---

## 9. Is file upload secure?

File uploads are protected by:

- **File type whitelist:** Only PDF, XLSX, XLS, DOCX, JPG, JPEG, PNG, and CSV files are accepted
- **File size limit:** Maximum 20 MB per file
- **File hash:** SHA-256 hash is stored for integrity verification
- **Metadata tracking:** Uploader identity and timestamp are recorded

**Note:** Virus/malware scanning is not yet implemented and is a planned production requirement.

---

## 10. Is it production-ready?

**Not yet.** AuditOS is currently in **controlled pilot** status. It is ready for:

- Internal team evaluation
- Controlled client walkthrough
- Workflow validation
- AI capability demonstration

It is **not yet ready** for external production deployment. The following are required before production:

- Virus/malware scanning
- Production authentication with user provisioning
- Multi-tenant isolation validation
- Export format decision (PDF/Word)
- Full security review

---

## 11. What data should we use in pilot?

For the pilot, we recommend using:

- **Synthetic or anonymized data only** — no real client files or personally identifiable information
- A single fiscal year (e.g., FY2025)
- 20–50 trial balance accounts
- 5–10 evidence sample files
- A sample set of findings and recommendations

The product includes seeded demo data for Gulf Trading Co. that covers all workflows.

---

## 12. What happens after pilot?

After the pilot:

1. Stakeholder feedback is collected and documented
2. The product team prioritizes findings into the production roadmap
3. Production blockers (virus scanning, auth, export format) are addressed
4. A production readiness review is conducted
5. A production deployment timeline is established

---

## 13. What are the current limitations?

| Limitation                      | Impact                            |
| ------------------------------- | --------------------------------- |
| JSON-only export                | No PDF/Word formatted reports yet |
| No virus scanning               | Uploaded files treated as trusted |
| Production auth not provisioned | User accounts set up manually     |
| Single-organization validated   | Multi-tenant isolation untested   |
| No optimistic concurrency       | Simultaneous edits can overwrite  |
| Large file parsing ( >50MB)     | Performance may degrade           |

See the full `KNOWN-LIMITATIONS.md` document for details.

---

## 14. What is needed before production deployment?

**Critical:**

1. Virus/malware scanning integration (e.g., ClamAV)
2. Production authentication (NextAuth with real credentials)
3. User provisioning workflow
4. Multi-tenant isolation verification
5. Security review and penetration testing

**High Priority:** 6. Export format decision (PDF, DOCX, or both) 7. Database backup and monitoring

**Post-Launch:** 8. Optimistic concurrency for key workflows 9. REST API for external integration 10. Chunked upload for large files

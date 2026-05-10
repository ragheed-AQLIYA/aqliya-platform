# AQLIYA AuditOS — Risk Disclosure

## 1. Current Pilot Limitations

| Limitation | Impact | Mitigation |
|------------|--------|------------|
| **JSON-only exports** | Reports are machine-readable JSON, not formatted PDF/Word documents. Stakeholders who expect PDF statements will need to use a downstream converter. | Pilot uses JSON for technical validation. PDF/Word roadmap under discussion. |
| **No virus/malware scanning** | Uploaded files are not scanned. Malicious file uploads could theoretically be stored. | Pilot uses controlled, trusted files only. Production deployment requires ClamAV or equivalent. |
| **Production auth not fully provisioned** | User accounts and role assignments require manual setup. No self-service registration. | Pilot uses demo fallback in development mode. Production deployment requires auth configuration. |
| **Demo fallback is development-only** | `getAuditActor()` throws "Authentication required" in production when no session exists. | Gated by NODE_ENV. Safe for dev/demo. Must configure auth for production. |
| **Multi-tenant isolation unvalidated** | Schema supports organizationId on all models. Isolation has not been tested with concurrent organizations. | Single-organization pilot only. Multi-tenant validation is a pre-production requirement. |
| **Large file parsing limitation** | Trial balance files >50MB or >50,000 rows may cause performance issues. | 20MB upload limit in place. CSV recommended for large datasets. Chunked parsing is a post-pilot item. |
| **No optimistic concurrency** | Simultaneous edits from multiple users can overwrite each other. | Pilot uses supervised single-user scenarios. Conflict detection is planned post-pilot. |
| **Prisma/Turbopack warning** | Webpack critical dependency warning for Prisma adapter. Non-blocking. | Documented. No functional impact. |

---

## 2. What These Limitations Mean

**For the pilot:**
- You will see JSON exports, not formatted PDF reports
- All files used in the demo are trusted and pre-approved
- User access is managed manually
- The product is demonstrated with a single organization and single-user scenarios
- No production data should be loaded into the pilot environment

**For a production deployment:**
- Each limitation must be addressed through the production readiness checklist
- Infrastructure decisions (virus scanning, auth provider, export format) need to be made
- A full security review is required before production go-live

---

## 3. What Is Safe for Pilot

✅ Controlled, synthetic dataset  
✅ Internal team or invited stakeholders  
✅ Supervised walkthrough with known scenarios  
✅ No sensitive production client files  
✅ All limitations documented and acknowledged  
✅ AI output clearly marked as draft  
✅ Role enforcement verified server-side  
✅ File type and size validation active  

---

## 4. What Is Required Before Production

| Requirement | Priority | Timeline |
|-------------|----------|----------|
| Production authentication (NextAuth) | Critical | Pre-production |
| User provisioning workflow | Critical | Pre-production |
| Virus/malware scanning integration | Critical | Pre-production |
| Multi-tenant isolation validation | High | Pre-production |
| Export format decision (PDF/DOCX) | High | Pre-production |
| Security review and penetration testing | Critical | Pre-production |
| Database backup and monitoring | High | Pre-production |
| Optimistic concurrency for key workflows | Medium | Post-launch |
| REST API for external integration | Medium | Post-launch |

---

## 5. Suggested Disclosure Language

> **For client-facing communication:**
>
> "AQLIYA AuditOS is currently in controlled pilot. The platform supports the complete audit workflow — from trial balance through publication — with AI-assisted drafting, full traceability, and role-based controls.
>
> Please be aware that:
> - Current export output is JSON. PDF and Word export are under consideration.
> - File uploads are not virus-scanned. The pilot uses controlled, pre-approved files.
> - User accounts are provisioned manually.
> - The product has been validated with single-organization, single-user scenarios.
>
> All AI output is generated as draft and requires human review before it becomes part of the audit record.
>
> We welcome your feedback and will use it to prioritize production readiness."

---

## 6. No False Security Claims

The following statements are **NOT** true about the current product:

- ❌ "Export produces professional PDF statements"
- ❌ "File uploads are scanned for viruses"
- ❌ "Supports self-service user registration"
- ❌ "Validated for multi-organization deployments"
- ❌ "Fully production-ready"
- ❌ "Can replace existing audit software immediately"

The following statements **ARE** true:

- ✅ "Supports complete audit workflow from trial balance to approval"
- ✅ "AI output is draft, requires human review, and is never final by default"
- ✅ "All material actions are recorded in an immutable audit trail"
- ✅ "Evidence-to-finding linkage provides full traceability"
- ✅ "Approval requires passing five readiness checks"
- ✅ "Role-based access control is enforced server-side"
- ✅ "File type and size validation is enforced on uploads"

---

## 7. Disclaimer (Suggested for Pilot Agreements)

> *This pilot version of AQLIYA AuditOS is provided for evaluation purposes only. It is not a production system and should not be used to process real client audit data, generate final audit reports, or fulfill regulatory filing obligations. All AI-generated content is draft and requires human review and approval. The system is provided "as is" without warranty of fitness for a particular purpose. By participating in this pilot, you acknowledge these limitations.*

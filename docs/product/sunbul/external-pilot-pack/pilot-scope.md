# Sunbul — Pilot Scope Document

**Version:** 1.0
**Date:** 2026-05-18
**Classification:** Confidential — Pilot Client

---

## In-Scope Workflow

The pilot covers the following end-to-end workflow:

```
Client Workspace → Create Case → Upload Documents → Submit for Review
  → Review / Return with Notes / Resubmit → Approve
  → Export as PDF → Archive → Audit Trail
```

### Detailed Steps

1. **Platform Admin** creates the client workspace and invites users.
2. **Operator** logs in, selects the client, creates a case with title and description.
3. **Operator** uploads supporting documents (PDF, XLSX, DOCX, JPG, PNG, CSV).
4. **Operator** submits the case for review.
5. **Reviewer** sees the case in the review queue, opens it, reviews documents.
6. **Reviewer** either:
   - **Approves** the case → status becomes "Approved"
   - **Returns** the case with notes → status becomes "Draft" (Operator revises and resubmits)
7. **Operator** (or PlatformAdmin) exports the approved case as a PDF report.
8. **PlatformAdmin** archives the case when complete.
9. Every action is recorded in the **audit trail**.

## Out-of-Scope Features

The following are explicitly excluded from the pilot:

- AI assistance, suggestions, or automation
- Email or in-app notifications
- Document scanning, OCR, or content analysis
- Excel, CSV, or bulk export
- User self-registration or invitation
- Role/ permission management interface
- Case templates or automated workflows
- Real-time collaboration or editing
- Mobile or tablet optimization
- SSO, SAML, LDAP, or Active Directory
- On-Premise or Private Cloud deployment
- File virus scanning
- Digital signatures
- Billing or invoicing

## Supported Roles

| Role | What they do during pilot |
|---|---|
| **PlatformAdmin** | Creates client workspace, invites users, oversees operation, can archive cases |
| **Operator** | Creates cases, uploads documents, submits for review, exports PDF |
| **Reviewer** | Reviews submitted cases, approves or returns with notes, exports PDF |

## Supported File Types

| Type | Extension | Max Size |
|---|---|---|
| PDF | `.pdf` | 20 MB |
| Excel | `.xlsx`, `.xls` | 20 MB |
| Word | `.docx` | 20 MB |
| Image | `.jpg`, `.jpeg`, `.png` | 20 MB |
| CSV | `.csv` | 20 MB |

## Supported Export

| Format | Content | Available for |
|---|---|---|
| PDF | Case info, documents, reviews, audit trail, disclaimer | Approved and Archived cases |

## Known Limitations

1. **No notifications** — Users must check the dashboard for status changes.
2. **No file preview** — Files must be downloaded to view.
3. **Manual user setup** — PlatformAdmin creates users via the server (not UI).
4. **Arabic PDF alignment** — PDF uses left-to-right text layout. Arabic text is readable but may not align perfectly.
5. **File upload overhead** — Files are base64-encoded in the browser before upload. For files >10 MB, upload may take several seconds.
6. **No concurrent edit protection** — If two operators edit the same draft case, the last save wins.
7. **No email/password reset** — Account management is handled by the Sunbul team during pilot.

## Data Handling Assumptions

- All pilot data is stored in a cloud PostgreSQL database.
- Uploaded files are stored on the local filesystem (`uploads/` directory).
- Data is not encrypted at rest beyond database-level encryption.
- No client data is sent to external AI providers — AI is not implemented.
- Sunbul team has admin access to the pilot instance for support.
- Pilot data will be deleted or exported at the client's request after the pilot ends.

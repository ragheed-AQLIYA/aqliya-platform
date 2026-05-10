# AQLIYA AuditOS — Known Limitations

## 1. JSON-Only Exports

Export output is currently JSON format only. PDF, DOCX, and XLSX generation require additional library integration (e.g. `jspdf`, `docx`, `exceljs`). The export structure is designed to be serializable and can be consumed by any downstream formatter.

**Impact:** Users cannot download formatted financial statements or audit reports as PDF/Word directly from the UI.

**Resolution:** Add a rendering layer that converts ExportPackage JSON to PDF/DOCX using one of:
- `@react-pdf/renderer` (server-side PDF)
- `docx` npm package (Word)
- `exceljs` (Excel audit files)

---

## 2. Virus/Malware Scanning — Development Only

File scanning abstraction is implemented at `src/lib/audit/file-scanner.ts`.

**Development mode:** Mock scanner returns `skipped_dev` status. Files are allowed without real scanning.

**Production mode:** Fail-closed. If `SCANNER_PROVIDER` environment variable is not configured, ALL evidence creation is blocked with: `"File scanning is not configured. Upload blocked for production safety."`

**Impact:** In development, no real scanning occurs. In production, evidence upload is blocked until a real scanner provider is integrated.

**Resolution (Production Requirement):**
- Set `SCANNER_PROVIDER` environment variable (e.g., `clamav`, `s3`, `azure`)
- Integrate with ClamAV or cloud-based file scanning
- Remove production fail-closed behavior once scanning is verified

---

## 3. Demo Fallback — Development Only

The `getAuditActor()` function has a demo fallback that executes when no authentication session is available. In `NODE_ENV=production`, this fallback throws "Authentication required" instead of using hardcoded demo credentials.

**Impact:** In development, any unauthenticated request uses a hardcoded demo actor (`usr-ahmed`/`Ahmed Al Ghamdi`/`operator`). Production requests without auth will fail.

**Status:** ✅ Gated behind NODE_ENV check as of Phase 10.

---

## 4. Large XLSX Parsing Limitation

Trial balance XLSX upload parsing happens server-side. Very large files (>50MB or >50,000 rows) may cause:
- Memory pressure on the server
- Long response times
- Timeout errors

**Impact:** Large datasets may fail to upload or process.

**Mitigation:**
- 20MB file size limit enforced on evidence uploads
- Trial balance upload uses server-side streaming where possible
- CSV format is recommended for very large datasets
- Future: add chunked processing and progress indicators

---

## 5. Prisma Dynamic Import Warning

The application shows a webpack warning: `Critical dependency: the request of a dependency is an expression` for `src/lib/prisma.ts`.

This is caused by Prisma client using dynamic imports for database drivers. It is:
- Non-blocking
- Present in all Prisma-based Next.js applications
- Documented in Prisma's official Next.js integration guide

**Impact:** None — compilation succeeds, application functions correctly.

---

## 6. No Optimistic Concurrency

When multiple users edit the same entity simultaneously, the last write wins. There is no:
- Version conflict detection
- Optimistic locking
- Merge resolution

**Impact:** Concurrent edits by different users can overwrite each other without warning.

**Mitigation:**
- Add `version` or `updatedAt` field comparison before writes
- Reject stale updates with a conflict error
- Implement row-level locking for critical mutations (approvals, state transitions)

---

## 7. Turbopack Compatibility

The build uses `--webpack` flag because Turbopack has incomplete support for some Next.js features used in this project. This is a known Next.js 16 limitation.

**Impact:** Build times are slightly slower than Turbopack. No functional impact.

**Resolution:** Remove `--webpack` flag once Turbopack support is complete in a future Next.js 16.x release.

---

## 8. AuditEvent Append-Only Guarantee

AuditEvents are append-only by convention — the UI has no delete/edit capability, and the DB layer only creates events. However, there is no database-level trigger preventing direct SQL edits or deletions.

**Impact:** A user with direct database access could modify or delete AuditEvent records.

**Production Recommendation:** Add database-level protections:
- PostgreSQL row-level security (RLS) policies
- Trigger-based append-only enforcement
- Read-only database user for application queries
- Separate audit log database or table with restricted access

---

## 9. No Webhook / Integration API

There is no REST API or webhook for external system integration. All mutations require a browser session.

**Impact:** Cannot automate data ingestion or integrate with external ERPs, CRMs, or document management systems programmatically.

**Resolution:** Build a REST API layer using Next.js Route Handlers with API key authentication.

---

## 10. Single-Organization Default

The current seeding and demo flow assumes a single organization (`org-aqliya`). Multi-tenancy is supported at the schema level (all models have `organizationId`) but has not been tested with concurrent organizations.

**Impact:** Organization isolation is structural but unvalidated.

**Pre-Launch Recommendation:**
- Create a second test organization
- Verify data isolation
- Verify that users from Org A cannot see Org B's data
- Verify that server actions enforce `organizationId` checks

---

*Last updated: May 2026*

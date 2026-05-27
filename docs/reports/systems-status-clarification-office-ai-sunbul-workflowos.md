# Systems Status Clarification — Office AI Assistant, Sunbul, workflowos — 2026-05-28

## Purpose

Clarify the current implementation status of three systems following the AuditOS Controlled Pilot Status Lock. This report resolves what is real vs. what is claimed differently in documentation, and documents a naming consistency fix.

---

## 1. Office AI Assistant

| Dimension | Status |
|---|---|
| **Routes** | `/assistant`, `/assistant/[taskId]`, `/api/office-ai/download` |
| **Completion level** | **L4 — Usable v0.1** |
| **Auth** | Proxy-protected; `requireUserContext("VIEWER")` on download API |
| **Tenant isolation** | `platformOrganizationId` on `OfficeAiTask` |
| **Audit trail** | Full via `auditLogger` on every mutation |
| **Review/approval** | Yes — status workflow: draft → generated → needs_review → reviewed → approved/rejected/archived |

### What is real

- Full CRUD lifecycle (create task, edit, archive, attach files, generate output)
- File upload with SHA-256 hashing, content extraction (PDF, DOCX, XLSX, CSV, TXT)
- Deterministic AI output generation (template-based, documented as `aiProvider: "deterministic"`)
- Full review/approve/reject workflow with status badges and stepper UI
- Bilingual Arabic-first UI
- Copy/download/print for outputs (.md, .txt, print)
- Rate-limited download API with tenant checks and audit logging

### What is not claimed

- Real LLM/AI integration (intentionally deterministic)
- Standalone product (positioned as shared governed application on Core)

### Docs alignment

**Fully aligned.** `PRODUCT_STATUS_MATRIX.md` accurately reports L4. All docs consistently describe it as a shared governed application.

---

## 2. Sunbul

| Dimension | Status |
|---|---|
| **Routes** | `/sunbul`, `/sunbul/admin`, `/sunbul/clients/[clientId]/records/[recordId]`, download + export APIs |
| **Completion level** | **L4 — Usable v0.1** |
| **Auth** | Proxy-protected; `getCurrentUser()` + `requireClientAccess()` tenant guard |
| **Tenant isolation** | `SunbulUserMembership` + `requireClientAccess()` RBAC |
| **Audit trail** | Full via `SunbulAuditEvent` model (16 action types) |
| **Review/approval** | Yes — Draft → UnderReview → Approved/Archived (with Return to Draft) |

### What is real

- Multi-client architecture with full tenant isolation
- Role hierarchy: PlatformAdmin > Reviewer > Operator
- Records with full workflow (create, submit, review, approve, archive, return)
- Document upload/storage/download (20MB limit, extension whitelist)
- Review system with Approved/Returned status
- PDF export via pdfkit (bilingual, Arabic labels)
- Bilingual Arabic-first UI throughout
- Admin page for client management + membership management
- Dashboard with stat cards, client selector, record list, review queue

### Dashboard placeholders

Some dashboard cards say "سيتم تفعيلها في Phase 2C" — these are honest placeholders for future features, not gaps in the existing v0.1 surface.

### Naming fix applied

The admin page previously titled itself "إدارة WorkflowOS". This has been corrected to **"إدارة سنبل"** in:

- `src/components/sunbul/sunbul-admin-page.tsx` — title + status message
- `src/app/organizations/sunbul/page.tsx` — renamed all `workflowos*` variables to `sunbul*`
- `src/components/organization/organization-workspace.tsx` — updated `OrgData` interface + usage

### Docs alignment

**Fully aligned.** `PRODUCT_STATUS_MATRIX.md` accurately reports L4. All docs describe it as a custom/client-specific workspace.

---

## 3. workflowos

| Dimension | Status |
|---|---|
| **Routes** | `/workflowos` → permanentRedirect to `/sunbul` |
| **Completion level** | **Redirect alias (N/A)** — not a product or prototype |
| **Lib modules** | None (reuses Sunbul) |
| **Actions** | None (reuses Sunbul) |
| **Prisma models** | None (reuses Sunbul) |

### What it is

Pure redirect alias. Every route file is a 5–10 line `permanentRedirect()` to the corresponding `/sunbul/*` route.

### What it is NOT

- Not a separate product
- Not a prototype
- Not a shell
- Not deprecated — it is an intentional alias

### Docs alignment

**Fully aligned.** `PRODUCT_STATUS_MATRIX.md`, `ROUTE_STRATEGY.md`, architecture docs, and dedicated `docs/product/workflowos/README.md` all consistently describe it as a redirect alias.

---

## 4. Verification

### TypeScript

```bash
npx tsc --noEmit
```

Has passed after the naming fix (no type changes introduced — pure rename within same interface).

### Files changed

| File | Change |
|---|---|
| `src/components/sunbul/sunbul-admin-page.tsx` | "إدارة WorkflowOS" → "إدارة سنبل" (2 locations) |
| `src/app/organizations/sunbul/page.tsx` | `workflowos*` → `sunbul*` variable names |
| `src/components/organization/organization-workspace.tsx` | Updated `OrgData` interface + all references |

---

## 5. Summary

| System | Code level | Docs alignment | Remaining issues |
|---|---|---|---|
| Office AI Assistant | L4 — Real governed workflow | Aligned | Deterministic AI (documented) |
| Sunbul | L4 — Real multi-client workspace | Aligned | Dashboard Phase 2C placeholders (honest) |
| workflowos | Redirect alias | Aligned | None |

**No remaining documentation-vs-code gaps were found for these three systems after the naming fix.**

---

## 6. Next Recommended Step

With AuditOS locked (Controlled Pilot Ready) and these three systems clarified, the next logical step is **docs alignment pass** — verifying `PRODUCT_STATUS_MATRIX.md` and `ROUTE_STRATEGY.md` are fully current, or starting a new product task if instructed.

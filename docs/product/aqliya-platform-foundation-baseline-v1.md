# AQLIYA Platform Foundation Baseline v1

**Version:** 1.1
**Status:** Production-ready baseline
**Date:** 2026-05-20
**Aligned with:** official v1.1 vision, roadmap, and architecture docs

---

## Platform Capabilities

### 1. PlatformOrganization Bridge

| Aspect | Status |
|---|---|
| Schema | `PlatformOrganization` model with `slug`, `name`, `status` |
| Legacy links | `Organization.platformOrganizationId` (DecisionOS), `AuditOrganization.platformOrganizationId` (AuditOS) |
| Backfill | Complete — 100% coverage |
| Read helpers | `src/lib/platform/platform-organization-context.ts` |
| Guard | `src/lib/platform/guards/platform-org-guard.ts` (report-only mode) |
| Auth session | `platformOrganizationId` optional on JWT/CurrentUser |
| Admin page | `/settings/platform-organization` |

### 2. ClientWorkspace / Project

| Aspect | Status |
|---|---|
| Schema | `ClientWorkspace` + `Project` models with indexes |
| Legacy links | `AuditClient.clientWorkspaceId`, `AuditEngagement.projectId` |
| Backfill | Complete — 100% coverage |
| Read helpers | `client-workspace-context.ts`, `project-context.ts` |
| Guard | `src/lib/platform/guards/workspace-guard.ts` (report-only mode) |
| Admin page | `/settings/workspaces` |
| AuditOS context | `PlatformContextCard` on engagement detail pages |
| Dashboard badges | Project/workspace badges on engagement list |
| Sidebar links | Platform Organization, Client Workspaces |

### 3. PlatformAuditLog

| Aspect | Status |
|---|---|
| Schema | `PlatformAuditLog` model with 31 fields and 9 indexes |
| Write helper | `src/lib/platform/audit-log.ts` (safe mode, strict mode) |
| AuditOS dual-write | Wired in `recordAuditEvent()` — verified |
| DecisionOS dual-write | Wired in `logAudit()` — verified |
| Write coverage | AuditOS: full via `recordAuditEvent()`; DecisionOS: full via `logAudit()` + 16 refactored sites |
| Admin page | `/settings/audit-logs` (dynamic, with filters) |
| Verification scripts | `verify-platform-audit-logs.ts`, `verify-auditos-dual-write.ts`, `verify-decisionos-dual-write.ts` |
| Sidebar links | Platform Audit Logs |

### 4. Security Prerequisites

| Aspect | Status |
|---|---|
| Middleware auth guard | `src/middleware.ts` — protects all workspace routes |
| Actor fallback | Gated to `NODE_ENV === "development"` only |
| Security headers | Wired into middleware |

### 5. Office AI Assistant (Shared Governed Application)

| Aspect | Status |
|---|---|
| Schema | `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile` models with indexes |
| Service layer | `src/lib/office-ai/office-ai-task-service.ts` — CRUD + lifecycle |
| Deterministic generation | `src/lib/office-ai/deterministic-generators.ts` — 6 task types |
| Server actions | `src/actions/office-ai-actions.ts` — create, generate, review, file attach/remove |
| Route: list | `/assistant` — task creation form + recent task list |
| Route: detail | `/assistant/[taskId]` — task detail, outputs, review, file attachment |
| Review workflow | submit for review, approve, reject |
| File upload | Real file upload via platform storage + metadata fallback |
| File validation | Extension, MIME, size (10 MB max), sanitization, path traversal prevention |
| File removal | Storage + DB deletion with auth check |
| File content extraction (TXT) | ✅ Implemented — UTF-8 text extraction |
| File content extraction (CSV) | ✅ Implemented — headers + sample rows + row count |
| File content extraction (XLSX) | ✅ Implemented — sheet names, column headers, sample rows |
| File content extraction (DOCX) | ✅ Implemented — full text via mammoth |
| File content extraction (PDF text layer) | ✅ Implemented — text extraction via pdf-parse |
| Human review gate | All outputs require review before final use |
| PlatformAuditLog events | `task.created`, `file.attached`, `output.created`, `task.status_changed`, `output.status_changed` |
| Sidebar links | Office AI Assistant link in DecisionOS, AuditOS, SalesOS |
| Content parsing | ❌ Not implemented — extraction complete; OCR not implemented |
| OCR (scanned PDFs) | ❌ Not implemented |
| Malware scanning | ❌ Not implemented |
| Cloud AI | ❌ Not implemented (DeterministicAIProvider only) |
| Local AI | ❌ Not implemented |
| Email integration | ❌ Not implemented |
| Malware scanning | ❌ Not implemented |

### 6. Verification Scripts

| Script | Purpose | Status |
|---|---|---|
| `verify-platform-organization-links.ts` | Org link coverage | ✅ |
| `verify-client-workspace-links.ts` | Workspace/project link coverage | ✅ |
| `verify-platform-audit-logs.ts` | Audit log counts and coverage | ✅ |
| `verify-auditos-dual-write.ts` | AuditOS → PlatformAuditLog | ✅ |
| `verify-decisionos-dual-write.ts` | DecisionOS → PlatformAuditLog | ✅ |
| `verify-office-ai-task-service.ts` | Office AI service CRUD + audit | ✅ |
| `verify-office-ai-file-validation.ts` | File validation + generation | ✅ |
| `verify-office-ai-extraction.ts` | File content extraction (TXT/CSV/XLSX/DOCX/PDF) | ✅ |

### 7. Package Scripts

```bash
# Platform org links
npm run platform:verify-org-links
npm run platform:verify-workspace-links
npm run platform:verify-audit-logs

# Dual-write verification
npm run platform:auditos-dual-write:dry
npm run platform:auditos-dual-write:apply
npm run platform:decisionos-dual-write:dry
npm run platform:decisionos-dual-write:apply

# Office AI Assistant
npm run office-ai:service:dry
npm run office-ai:service:apply
npm run office-ai:validate-files:dry
npm run office-ai:validate-files:apply
npm run office-ai:extraction:dry
npm run office-ai:extraction:apply
```

---

## Current Schema Size (prisma/schema.prisma)

| Metric | Value |
|---|---|
| Total models | ~55+ |
| Platform models | 8 (+ `PlatformOrganization`, `ClientWorkspace`, `Project`, `PlatformAuditLog`, `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile`) |
| Schemas modified additively | `Organization`, `AuditOrganization`, `AuditClient`, `AuditEngagement` |

---

## Known Gaps

| Gap | Impact | Resolution |
|---|---|---|
| No `PlatformUser` model | User management still uses legacy `User`/`AuditUser` | Sprint 3 deferred |
| No `PlatformRole` model | RBAC still per-product | Sprint 3 deferred |
| No `PlatformAuditLog` FK constraints | Fields are nullable strings | By design — preserves immutability |
| DecisionOS lacks workspace/project context | `clientWorkspaceId`/`projectId` NULL for `decision_os` rows | By design — DecisionOS has no workspace concept |
| Migration drift | `ClientWorkspace`, `Project`, `PlatformAuditLog`, `OfficeAiTask`, `OfficeAiOutput`, `OfficeAiFile` applied via `db push`, not migration files | See production migration plan |
| No file content parsing — OCR not implemented | Scanned/image-only PDFs not supported | Post-MVP |
| No Cloud AI integration | DeterministicAIProvider only; CloudAIProvider is a stub | Phase 4 roadmap |
| No email summarization | Office AI MVP scope | Post-MVP |
| No conversational memory | Each task is stateless | Post-MVP |

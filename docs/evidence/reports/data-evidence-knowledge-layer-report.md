# AQLIYA Data, Evidence & Knowledge Layer — Architecture Report (Agent 4)

**Date:** 2026-05-29
**Agent:** 4 — Data, Files, Evidence & Knowledge Layer
**Branch:** `eid-sprint-stabilization-2026-05-29`
**Baseline:** committed `6034950` with an uncommitted working tree on top (per Agent 0 P0-1)
**Mode:** **DOCUMENTATION-ONLY** — no schema migration, no application-code edits, no service implementation
**Trust principle:** AI assists. Humans decide. Evidence governs.

> **Scope of this document.** This report defines the *common institutional data / evidence / knowledge layer concept* shared across AQLIYA products. It is a cross-cutting architecture proposal (Agent 0 §4.2 "Data / Evidence Layer", cross-cutting). It proposes naming/consolidation and shared-service *interfaces only*. It does **not** authorize Core expansion: `EvidenceService` and generic download/export routers are explicitly **deferred / approval-gated** per `CORE_PLATFORM_ARCHITECTURE.md` and AGENTS.md §13. Any physical model consolidation is a separate, approval-gated Agent 5 schema task.

---

## 1. Scope Inspected

### 1.1 Prisma evidence / file models (read-only)

| Model | Schema line | Parent / link | Notable fields |
| ----- | ----------- | ------------- | -------------- |
| `OfficeAiFile` | 260 | `OfficeAiTask` | `filename, fileType, mimeType, storageKey, fileHash, sizeBytes, uploadedById, extractedContent, extractionMeta, extractionStatus` |
| `DecisionEvidence` | 839 | `Decision` + `organizationId` | `filename, fileType, fileSize, fileHash, storageKey, uploadedById, description` |
| `AuditEvidence` | 1073 | `AuditEngagement` | `filename, fileType, fileSize, fileHash, storageKey, uploadedBy, uploadedAt, state` |
| `AuditEvidenceLink` | 1092 | `AuditEvidence` | `targetType, targetId, linkType, context` (polymorphic link table) |
| `SunbulDocument` (WorkflowOS) | 1471 | `SunbulClient` + `SunbulRecord` | `fileName, fileType, fileSize, storageKey (required), uploadedById` (no hash) |
| `LocalContentEvidence` | 1638 | `LocalContentProject` (+ supplier/spend/finding) | `filename, fileType, mimeType, storageKey, fileHash, sizeBytes, evidenceType, status, reviewedById, reviewedAt` |

### 1.2 Storage / file services (read-only)

- `src/lib/platform/storage/{index,types,local-storage-provider,storage-errors}.ts` — **local-only** provider, `getStorageProvider()` singleton on `STORAGE_PROVIDER` env.
- `src/lib/audit/storage/{index,types,local-storage-provider,object-storage-provider}.ts` — **second** provider subsystem; adds `s3` / `azure-blob` via `ObjectStorageProvider`, plus `buildStorageKey()` / `parseStorageKey()`.
- `src/lib/workflowos/storage.ts` — WorkflowOS/Sunbul upload wrapper (`buildWorkflowStorageKey`, own size/extension limits) layered on `platform/storage`.
- `src/lib/office-ai/file-extraction-service.ts` — file content extraction for Office AI.

### 1.3 Download / export / traceability (read-only)

- Download routes: `api/audit/evidence/[id]/download`, `api/decisions/[id]/evidence/[id]/download`, `api/local-content/.../evidence/[id]/download`, `api/local-content/.../reports/[id]/download`, `api/office-ai/download`, `api/workflowos/documents/[id]/download`.
- Export routes/services: `src/lib/platform/export.ts` (shared format helpers), `src/lib/audit/export-service.ts`, `src/lib/local-content/export.ts`, `api/audit/engagements/[id]/exports/[format]`, `api/workflowos/.../export/pdf`, `src/actions/decision-export.ts`.
- Download response builder: `src/lib/platform/download.ts` (`buildDownloadResponse`, `sanitizeFilename`).
- Signed tokens: `src/lib/download-token.ts` (HMAC-SHA256, 5-min expiry) + `src/actions/download-token-actions.ts`.
- File scanning: `src/lib/audit/file-scanner.ts` (`scanEvidenceFile`) — **AuditOS only**.

### 1.4 Knowledge / provenance references (read-only)

- `src/lib/governance/provenance.ts`, `src/lib/governance/retrieval-router.ts` (governance-context / retrieval routing).
- AI evidence handlers: `src/lib/ai/handlers/{evidence-suggestions,finding-drafts}-handler.ts`.
- `src/lib/audit/notes/evidence-requirements.ts`, `src/lib/local-content/services.ts`.
- No `KnowledgeSource` model or institutional-memory store exists in code (DOCUMENTATION-ONLY / L0 per Agent 0 §2.2).

### 1.5 Not run (Low-Load Execution Protocol)

`npm run build/lint/test`, `npx tsc --noEmit`, `prisma validate/generate/migrate`, dev server, Docker, broad scans. Inspection was narrow Glob/Grep/Read only.

---

## 2. Current Reality

### 2.1 Per-product evidence flow map

Lifecycle columns: **Upload → Store → Link → Review → Approve → Export → Audit**.

#### AuditOS (`/audit`) — most mature
| Stage | Implementation |
| ----- | -------------- |
| Upload | `uploadEvidenceFileAction` (base64); RBAC + rate-limit + `scanEvidenceFile` virus scan; validation table `ALLOWED_FILE_TYPES`, `MAX_FILE_SIZE_BYTES` |
| Store | `audit/storage` `getStorageProvider()` → `buildStorageKey(engagement, evidence, file)`; create-record-then-store; `svcUpdateEvidenceStorage` |
| Link | `AuditEvidenceLink` (polymorphic `targetType/targetId/linkType`) — **only product with a link table** |
| Review | `AuditEvidence.state` machine (`missing → uploaded → …`) |
| Approve | Engagement/finding workflow + governance layer |
| Export | `audit/export-service.ts`, `api/.../exports/[format]` (pdf/xlsx) |
| Audit | `svcRecordAuditEvent` → AuditOS-local `AuditEvent` + download logs `evidence.download` |

#### DecisionOS (`/decisions`)
| Stage | Implementation |
| ----- | -------------- |
| Upload | `uploadDecisionEvidenceAction` (base64); own validation table + `MAX_EVIDENCE_PER_DECISION`; sha256 |
| Store | `platform/storage`; key `decisions/{id}/evidence/{ts}-{file}`; store-then-create, **rollback on failure** |
| Link | Implicit FK `decisionId` (+ `organizationId`); no link table |
| Review | Governance approval-state (decision must reach `APPROVED`) |
| Approve | Approval snapshot (immutable) gates export |
| Export | `decision-export.ts` — **export blocked unless `status === APPROVED`**; JSON/Markdown; warnings |
| Audit | platform `auditLogger` (`EVIDENCE_UPLOADED`, `DECISION_EXPORT_PREPARED/BLOCKED`) |

#### LocalContentOS (`/local-content`) — richest lifecycle status
| Stage | Implementation |
| ----- | -------------- |
| Upload | `uploadLocalContentEvidenceFileAction` (**FormData/File**, not base64); 10MB limit; sha256; mimeType captured |
| Store | `platform/storage`; key `localcontent/{project}/evidence/{ts}-{file}` |
| Link | FK to project + optional `supplierId / spendRecordId / findingId` (multi-parent) |
| Review | `status` (`uploaded → linked → reviewed → verified/rejected`) via `updateLocalContentEvidenceStatusAction` + `reviewedById/reviewedAt` |
| Approve | `submitLocalContentReviewAction` / `submitLocalContentApprovalAction` |
| Export | `local-content/export.ts`, report download route |
| Audit | `logToPlatform` wrapper (`localcontent.evidence.uploaded`) + `LocalContentAuditEvent` |

#### WorkflowOS / Sunbul (`/workflowos`, `/sunbul`)
| Stage | Implementation |
| ----- | -------------- |
| Upload | `workflowos/storage.ts` `uploadDocument`; own `ALLOWED_EXTENSIONS`, 20MB; `buildWorkflowStorageKey` |
| Store | `platform/storage`; key `workflowos/clients/{c}/records/{r}/documents/{d}/{file}` |
| Link | FK `clientId` + `recordId` (`SunbulDocument`); no hash stored |
| Review | `SunbulReview` (`Pending/...`) |
| Approve | review workflow |
| Export | `api/workflowos/.../export/pdf` |
| Audit | `createWorkflowAuditEvent` → `SunbulAuditEvent` |

#### Office AI Assistant (`/assistant`)
| Stage | Implementation |
| ----- | -------------- |
| Upload | task-attached `OfficeAiFile`; mimeType + extraction pipeline (`file-extraction-service.ts`) |
| Store | `storageKey` + `fileHash`; `extractedContent/extractionStatus` |
| Link | FK `taskId` |
| Review / Approve | n/a (assistant, not a governed product) |
| Export | output download via signed token (`office_ai_output`) |
| Audit | `download-token-actions` (`download_token.issued/denied`) |

### 2.2 Shared vs duplicated — current state

**Genuinely shared today:** `buildDownloadResponse` / `sanitizeFilename` (`platform/download.ts`), export format helpers (`platform/export.ts`), the signed-token primitive (`download-token.ts`), and the platform `auditLogger`.

**Duplicated / divergent today:** two storage-provider subsystems; five upload implementations; six download routes; four distinct audit-event mechanisms; five evidence table shapes.

---

## 3. Gaps

**E1 — Two parallel storage subsystems (BIGGEST duplication).** `src/lib/platform/storage` and `src/lib/audit/storage` both define `getStorageProvider()` / `createStorageProvider()` reading the **same** `STORAGE_PROVIDER` env, but only the audit copy supports `s3`/`azure-blob`. Non-audit products (Decision, LocalContent, WorkflowOS) are therefore silently **local-only** — an on-prem/object-store deployment would behave inconsistently across products. WorkflowOS adds a third wrapper layer.

**E2 — Upload logic reimplemented per product (≈5×).** Each product re-creates: an allowed-type table, a size limit (**inconsistent: 10MB LocalContent vs 20MB Audit/Decision/WorkflowOS**), sha256 hashing, a bespoke `storageKey` convention, store↔create ordering, and rollback. Only AuditOS runs `scanEvidenceFile` (virus scan) — **the other four upload paths have no malware scanning.**

**E3 — Download routes reimplemented per product (6×).** All share the same shape (auth → fetch record → ownership check → storage retrieve → audit → respond), but Decision/LocalContent use `buildDownloadResponse` while Audit hand-builds headers and Office-AI uses tokens — inconsistent 404/401/403 handling and header behavior.

**E4 — Traceability/audit fragmentation.** Evidence events are written four different ways: platform `auditLogger`, LocalContent `logToPlatform` (+`LocalContentAuditEvent`), AuditOS `svcRecordAuditEvent` (+`AuditEvent`), WorkflowOS `createWorkflowAuditEvent` (+`SunbulAuditEvent`). No single evidence-lifecycle trace spans products.

**E5 — Evidence model divergence.** Field names differ for identical concepts: `fileSize` vs `sizeBytes`; `uploadedById` vs `uploadedBy`; `mimeType` present (LocalContent/OfficeAi) vs absent (Decision/Audit/Sunbul); lifecycle `state` (Audit) vs `status` (LocalContent) vs none (Decision/Sunbul); only LocalContent has `reviewedById/reviewedAt`; only AuditOS has a link table; Sunbul stores no `fileHash`.

**E6 — No knowledge-source / institutional-memory layer.** Governance provenance and AI evidence handlers exist, but there is no `KnowledgeSource` model or shared citation/reference registry. Knowledge references are L0 / DOCUMENTATION-ONLY.

**E7 — Classify stage is implicit.** Only LocalContent has an explicit `evidenceType` taxonomy (certificate/contract/attestation/…). Other products carry no classification, so the program's "Classify" lifecycle stage is unmodeled elsewhere.

---

## 4. Proposed Architecture

### 4.1 Common evidence lifecycle (target, shared across products)

```text
Upload → Validate → Classify → Link → Review → Approve → Export → Audit
  │         │          │         │        │        │         │        │
  │         │          │         │        │        │         │        └─ single TraceabilityService event per transition
  │         │          │         │        │        │         └─ ExportService (gated: e.g. Decision requires APPROVED)
  │         │          │         │        │        └─ governance approval-state (existing)
  │         │          │         │        └─ review status + reviewer identity
  │         │          │         └─ EvidenceService.link(target) (generalize AuditEvidenceLink)
  │         │          └─ evidenceType taxonomy (generalize LocalContent)
  │         └─ FileService: type allow-list, size cap, sha256, malware scan (generalize scanEvidenceFile)
  └─ FileService.store() over a single storage provider
```

### 4.2 Unified evidence model concept — current vs target

| Concern | Current (5 shapes) | Unified target (logical) |
| ------- | ------------------ | ------------------------ |
| Identity | per-model `id` | `id`, `product`, `tenant` (platformOrganizationId) |
| File | `fileSize`/`sizeBytes`, `mimeType?`, `fileHash?` | `sizeBytes`, `mimeType`, `sha256` (always) |
| Storage | per-product key conventions | `storageKey` from one key-builder |
| Owner | `uploadedById`/`uploadedBy` | `uploadedById`, `uploadedAt` |
| Classify | only LocalContent `evidenceType` | `evidenceType` (shared enum, optional) |
| Link | only `AuditEvidenceLink` | polymorphic `EvidenceLink{ targetType,targetId,linkType }` |
| Review | `state`/`status`/none | shared `status` enum + `reviewedById/reviewedAt` |
| Trace | 4 mechanisms | one `TraceabilityService` |

**Two delivery stages (deliberately separated for risk):**
- **Stage A — service unification (NO schema change):** shared interfaces wrap the *existing* five models. Immediately removes E1–E4 duplication, adds malware scanning everywhere, and standardizes downloads — without touching `prisma/schema.prisma`.
- **Stage B — physical model consolidation (schema change, approval-gated):** collapse to one `Evidence` (+ `EvidenceLink`) table. Requires an Agent-5 migration and is Core-FROZEN-gated; **out of scope for this report**.

### 4.3 Proposed unified services (interface sketches — NOT implemented)

> Sketches only. No file is created/edited beyond this report. Placement/approval is an Agent 5 / Core decision.

```ts
// FileService — single storage entrypoint (consolidates platform+audit+workflowos providers)
interface FileService {
  store(input: { key: string; filename: string; mimeType: string; content: Buffer }): Promise<string>;
  retrieve(key: string): Promise<StorageFile | null>;
  delete(key: string): Promise<boolean>;
  exists(key: string): Promise<boolean>;
  buildKey(scope: { product: string; parentType: string; parentId: string; filename: string }): string;
  validate(input: { filename: string; mimeType: string; sizeBytes: number }): ValidationResult; // shared allow-list + size cap
  scan(input: { filename: string; content: Buffer }): Promise<ScanResult>; // generalize scanEvidenceFile to ALL products
}

// EvidenceService — lifecycle over existing per-product models (Stage A) then unified model (Stage B)
interface EvidenceService {
  create(input: EvidenceCreateInput): Promise<EvidenceRef>;          // Upload+Validate+Classify+Store, with rollback
  link(input: { evidenceId: string; targetType: string; targetId: string; linkType?: string }): Promise<void>;
  setReviewStatus(input: { evidenceId: string; status: EvidenceStatus; reviewerId: string }): Promise<void>;
  list(filter: { product: string; parentType: string; parentId: string }): Promise<EvidenceRef[]>;
}

// ExportService — format + gating + response (extends platform/export.ts)
interface ExportService {
  assertFormat(format: string): ExportFormat;
  assertExportable(ctx: { product: string; resourceId: string }): Promise<void>; // e.g. Decision requires APPROVED
  buildResponse(output: ExportOutput): Response;                                  // reuse buildDownloadResponse
}

// TraceabilityService — one evidence-lifecycle trace across products
interface TraceabilityService {
  record(evt: { product: string; action: string; target: TraceTarget; actor: Actor; metadata?: Json }): Promise<void>;
  timeline(filter: { targetType: string; targetId: string }): Promise<TraceEvent[]>;
}

// KnowledgeSourceService — registry for institutional knowledge/citations (currently L0)
interface KnowledgeSourceService {
  register(src: { kind: "evidence" | "document" | "policy" | "memory"; ref: string; title: string }): Promise<KnowledgeRef>;
  cite(input: { fromType: string; fromId: string; sourceId: string }): Promise<void>;
  resolve(sourceId: string): Promise<KnowledgeRef | null>;
}
```

### 4.4 Low-risk service naming improvements (propose only)

1. Rename `src/lib/audit/storage` → fold into a single `src/lib/platform/storage` so there is **one** `getStorageProvider()`; keep `ObjectStorageProvider` there. (Removes E1.)
2. Standardize evidence column names in any *new* model work: `sizeBytes` (not `fileSize`), `uploadedById` (not `uploadedBy`), `mimeType` always present, `sha256` always present, lifecycle field named `status` (not `state`). (Naming convention only; no migration here.)
3. Name the shared download builder path consistently: route handlers should all call `buildDownloadResponse` (Audit route currently hand-builds). (Removes E3 drift.)
4. Adopt one verb vocabulary for evidence trace actions (`evidence.uploaded`, `evidence.linked`, `evidence.reviewed`, `evidence.exported`, `evidence.downloaded`) across the four audit mechanisms. (Removes E4 drift.)
5. Reserve the names `FileService` / `EvidenceService` for the consolidated services so per-product `svc*` helpers (AuditOS) become thin adapters, not parallel implementations.

---

## 5. Files Changed

| File | Change |
| ---- | ------ |
| `docs/reports/data-evidence-knowledge-layer-report.md` | **Created** — this report |

No application code, schema, route, or config changes. Single-owner files (`PRODUCT_STATUS_MATRIX.md`, `AGENTS.md`, `aqliya-product-taxonomy-v1.1.md`) untouched.

---

## 6. Commands Run

```text
move_agent_to_root → C:\Users\PC\Documents\Aqliya   (MCP, workspace root)
Glob:  src/lib/**/{storage,export,file,evidence,download,traceability}*.ts
Glob:  src/actions/*.ts
Glob:  src/app/api/**/{download,export,evidence}*/**/route.ts
Glob:  src/lib/{platform,audit}/storage/*.ts
Grep:  ^model \w*(Evidence|File|Document|Attachment|Export|Download|Storage|Upload)\w* {  (prisma/schema.prisma)
Grep:  knowledge|KnowledgeSource|citation|reference  (src/lib)
Read:  schema evidence models; storage indexes + local provider; download-token(+actions);
       platform/download; platform/export; decision-evidence-actions; decision-export;
       audit-actions (upload); localcontent-actions (evidence); workflowos/storage;
       audit/decision/local-content download routes
```

No heavy commands (no build/lint/test/tsc/prisma/dev-server/Docker/scans) — Low-Load Execution Protocol observed.

---

## 7. Validation Result

| Check | Result |
| ----- | ------ |
| Documentation-only constraint | **Pass** — only this report created |
| Schema unchanged | **Pass** — `prisma/schema.prisma` read-only |
| Application code unchanged | **Pass** — services proposed as interface sketches only |
| Single-owner files untouched | **Pass** |
| `npx tsc --noEmit` / `prisma validate` / build / lint / test | **Not run** (Low-Load; delegate to QA Agent 13) |

**Interpretation:** No engineering validation is claimed; this is an architecture/inspection deliverable. Any consolidation work must be re-validated by the QA agent on a committed tree (Agent 0 P0-1 still open).

---

## 8. Risks

| ID | Risk | Severity | Mitigation |
| -- | ---- | -------- | ---------- |
| D1 | `EvidenceService` is explicitly **deferred / Core-FROZEN**; this report could be read as authorizing it | High | Stage A (service wrappers, no schema) vs Stage B (model consolidation, gated) kept separate; Stage B needs Agent 5 + approval |
| D2 | Storage consolidation (E1) changes runtime behavior for object stores | Medium | Treat as a Core Services (Agent 2) task with tests; non-audit products gain S3/Azure only after validation |
| D3 | Adding malware scanning to all upload paths (E2) could break existing flows | Medium | Introduce via shared `FileService.scan` behind a flag; default to AuditOS behavior |
| D4 | Schema field renames (E5) imply a migration | Medium→gated | Naming convention applies to *new* fields only here; renames are an Agent 5 approval-gated migration |
| D5 | `KnowledgeSourceService` (E6) could be over-claimed as institutional memory | High | Keep L0/DOCUMENTATION-ONLY; interface sketch only, no store |
| D6 | Working tree not committed (Agent 0 P0-1) | High (inherited) | Do not begin consolidation until baseline is committed and QA re-validates |

---

## 9. Next Lowest-Load Step

**Cheapest next action:** circulate this report to Agent 2 (Core Services) and Agent 5 (Data/Evidence) for a **Stage-A-only** decision — i.e. approve consolidating the *two* `getStorageProvider()` subsystems into one `src/lib/platform/storage` and routing all upload paths through a shared `FileService.validate/scan/store`, **with no schema change**. This removes the biggest duplication (E1–E3) and closes the malware-scan gap with zero migration risk. Physical model consolidation (Stage B / `Evidence` table) stays parked behind Agent 5's approval-gated schema pass and the Agent 0 P0-1 commit decision.

---

## Agent 4 Sign-off

| Field | Value |
| ----- | ----- |
| **Status** | **DONE** (documentation-only) |
| **Code changed** | No |
| **Schema changed** | No |
| **Single-owner files touched** | No |
| **Deliverable** | `docs/reports/data-evidence-knowledge-layer-report.md` |

*Agent 4 — Data, Files, Evidence & Knowledge Layer. Five evidence models, two storage subsystems, and four audit mechanisms mapped; a two-stage unification (services now, schema later) proposed. AI assists. Humans decide. Evidence governs.*

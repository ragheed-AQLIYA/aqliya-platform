# AQLIYA Core Platform Architecture

> **Status:** Level 2 — Active source-of-truth. Supersedes theoretical references.  
> **Last updated:** 2026-05-28  
> **Phase:** 1 (Foundation) — **FROZEN**  
> **Next phase:** Not defined. No further Core abstraction without explicit approval.

---

## 1. Purpose

This document defines the shared Core Platform primitives built for AQLIYA. These are thin, stateless, single-responsibility utilities that sit below all products. They implement no product logic, no auth, no tenant isolation, and no business rules.

The Core Layer exists to eliminate copy-paste patterns that are identical across all products. It does NOT exist to abstract away product-specific logic.

---

## 2. Primitives

### 2.1 `auditLogger()` — Centralized Audit Logger

**File:** `src/lib/platform/audit-logger.ts`

**Purpose:** Thin factory that binds product key, actor context, and organization context once, then records PlatformAuditLog entries with less boilerplate.

**API:**

```typescript
const log = auditLogger({
  productKey: "my_product", // Product key (use Product constants)
  sourceSystem: "my_system", // Defaults to productKey
  organization: {
    // Optional: bind once
    platformOrganizationId: "...",
    clientWorkspaceId: "...",
    projectId: "...",
  },
  actor: {
    // Optional: bind once
    id: "...",
    name: "...",
    type: "...",
    email: "...",
  },
});

await log.record(
  "my.action",
  {
    type: "MyEntity",
    id: entityId,
    label: "Display name",
  },
  {
    // Extra PlatformAuditLog fields
    metadata: { key: "value" },
    severity: "info",
    status: "success",
  },
);
```

**Lifetime:** Create per-operation (inline). Not a singleton.

**Product key constants:**

```typescript
Product.AUDIT; // "audit"
Product.AUDIT_OS; // "audit_os"
Product.OFFICE_AI; // "office_ai"
Product.OFFICE_AI_ASSISTANT; // "office_ai_assistant"
Product.LOCAL_CONTENT; // "local_content"
Product.SUNBUL; // "sunbul" (legacy — retained for backward audit log compatibility)
Product.WORKFLOWOS; // "workflowos" (canonical product key for WorkflowOS)
Product.DECISION_OS; // "decision_os"
Product.PLATFORM; // "platform"
```

**Must NOT do:**

- Replace `writePlatformAuditLog` — it remains the underlying implementation
- Add auth, tenant checks, or business logic
- Auto-fill fields that would change payload shape (status, severity, sourceModel)
- Dual-write to product-specific audit tables
- Be used in contexts where the original `writePlatformAuditLog` raw access is needed

**Migration status:** 19 call sites migrated across 8 files. 1 remaining (AuditOS dual-write — deferred).

**Related:** `src/lib/platform/audit-log.ts` (base implementation — unchanged)

---

### 2.2 `buildDownloadResponse()` — Safe Download Response

**File:** `src/lib/platform/download.ts`

**Purpose:** Constructs a `NextResponse` for file download with consistent security headers. Separates response construction from auth, audit, and business logic.

**API:**

```typescript
return buildDownloadResponse({
  content: fileBuffer, // Buffer | Uint8Array | string
  filename: "document.pdf", // Sanitized for HTTP header safety
  mimeType: "application/pdf",
  sizeBytes: 1024, // Optional
  cacheControl: "private, no-store", // Optional, defaults to "private, no-store"
});
```

**Headers set:**

| Header                   | Value                                       |
| ------------------------ | ------------------------------------------- |
| `Content-Type`           | input.mimeType                              |
| `Content-Disposition`    | `attachment; filename="<sanitized>"`        |
| `X-Content-Type-Options` | `nosniff`                                   |
| `Cache-Control`          | input.cacheControl or `"private, no-store"` |
| `Content-Length`         | input.sizeBytes (if provided)               |

**Must NOT do:**

- Handle auth, tokens, or rate limiting
- Call any database or service
- Write audit logs
- Enforce tenant isolation
- Accept a resource ID or entity reference (pure content-in/content-out)

**Migration status:** 2 routes migrated (Sunbul document download, Sunbul PDF export).

**Related utility:** `sanitizeFilename(name)` — removes `"`, `\r`, `\n` for header safety.

---

### 2.3 `buildExportResponse()` — Export Response Builder

**File:** `src/lib/platform/export.ts`

**Purpose:** Extends `buildDownloadResponse` with export-specific MIME type resolution. Thin wrapper that maps `ExportFormat` to MIME type and delegates to the download builder.

**API:**

```typescript
return buildExportResponse({
  format: "pdf",
  filename: "report.pdf",
  content: pdfBuffer,
  sizeBytes: pdfBuffer.length,
});
```

**MIME type map:**

| Format | MIME type                                                           |
| ------ | ------------------------------------------------------------------- |
| `pdf`  | `application/pdf`                                                   |
| `xlsx` | `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `json` | `application/json`                                                  |
| `csv`  | `text/csv`                                                          |

**Related:** `assertExportFormat(format)` — validates format string, throws on invalid.

**Must NOT do:**

- Handle auth, tenant, or business logic
- Call any database or service
- Write audit logs
- Generate actual export content (PDF/XLSX generation lives in product modules)

**Migration status:** 1 route migrated (Sunbul PDF export).

---

## 3. Architecture Rules

### 3.1 Dependency Direction

```
Products (AuditOS, Office AI, Sunbul, LocalContent, DecisionOS)
    ↓
Core Platform Layer (auditLogger, buildDownloadResponse, buildExportResponse)
    ↓
Next.js / Prisma / Platform Infrastructure
```

Products import from Core. Core never imports from products.

### 3.2 What Core MUST NOT contain

- Authentication or session handling
- Tenant isolation or organization guards
- Product-specific business logic
- Database queries
- File system access
- AI provider calls
- Schema or migration logic
- UI components
- Route definitions or middleware
- Stateful services or singletons

### 3.3 What Core MAY contain

- Stateless utility functions
- Response construction helpers
- Type definitions shared across products
- Constants and maps (MIME types, product keys)
- Logging wrappers (over existing infrastructure)

---

## 4. Freeze Declaration

The current Core Platform Architecture is **FROZEN** as of 2026-05-28.

No new Core primitives may be added without explicit approval. This includes, but is not limited to:

| Primitive                 | Status                                              |
| ------------------------- | --------------------------------------------------- |
| OrgResolver               | 🚫 Deferred — higher risk, touches tenant isolation |
| PermissionEnforcer        | 🚫 Deferred — higher risk, touches auth             |
| WorkflowEngine            | 🚫 Deferred — scope not yet defined                 |
| EvidenceService           | 🚫 Deferred — too product-specific                  |
| Product Key Normalization | 🚫 Deferred — separate phase                        |
| Generic Download Router   | 🚫 Deferred — would have to centralize auth         |
| Generic Export Controller | 🚫 Deferred — same risk                             |

---

## 5. Defers with Rationale

| Item                                             | Why deferred                                                                                                                                                                      |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AuditOS dual-write (`src/lib/audit/services.ts`) | Sensitive dual-write to product-specific `AuditEvent` table. Higher risk of breaking AuditOS evidence trail. Deferred to Phase 3+ if/when full AuditOS resilience review is done. |
| Product key normalization                        | Cosmetic change with wide blast radius. Current values work. Normalization is a standalone migration, not part of Core.                                                           |
| OrgResolver                                      | Touches tenant isolation logic. Every mistake is a security issue. Needs separate design and permissions review.                                                                  |
| PermissionEnforcer                               | Would centralize RBAC — high risk of breaking existing permission patterns.                                                                                                       |

---

## 6. Migration Summary

| Product area                 | Call sites | Status      |
| ---------------------------- | ---------- | ----------- |
| Evidence download route      | 1          | ✅ Migrated |
| Office AI download route     | 1          | ✅ Migrated |
| Office AI task service       | 8          | ✅ Migrated |
| Office AI file extraction    | 4          | ✅ Migrated |
| Sunbul document download     | 1          | ✅ Migrated |
| LocalContent report download | 1          | ✅ Migrated |
| Download token action        | 1          | ✅ Migrated |
| DecisionOS platform-audit    | 1          | ✅ Migrated |
| LocalContent actions helper  | 1          | ✅ Migrated |
| **Total migrated**           | **19**     |             |
| AuditOS dual-write           | 1          | 🚫 Deferred |

All migrations validated with `npx tsc --noEmit`.

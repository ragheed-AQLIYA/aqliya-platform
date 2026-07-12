---
name: aqliya-export-gate
description: Export, download, evidence package, and file output governance — AGENTS.md §17 enforcement
version: 1.0
date: 2026-07-12
status: active
---

# AQLIYA Export Gate

> **Purpose:** Ensure all exports, downloads, and file outputs follow governance rules — permission checks, audit trails, evidence links, and approval gates.

## When to Load
Load when task involves: exports, PDF/XLSX generation, file downloads, evidence packages, report generation, output publishing.

## Core Rules (from AGENTS.md §17)

### Every export must include:
- Status/disclaimer (DRAFT, REVIEWED, APPROVED)
- Generated timestamp
- Organization/workspace identification
- Reviewer/approver where applicable
- Source/evidence reference where appropriate
- Approval status
- No false certification claims

### Download routes must:
- Require authentication
- Verify file ownership (organizationId check)
- Log the download event to audit trail
- Prevent path traversal attacks
- Use signed URLs or token-based access for S3 files
- Have rate limiting

### Evidence files must:
- Have ownership and permissions
- Store metadata (checksum, uploader, timestamp)
- Be permission-gated for downloads
- Have deletion/archival logged

## Export Implementation Checklist

Before creating an export:
- [ ] Permission check: does user have export permission?
- [ ] Tenant scoping: only exporting data from user's organization
- [ ] Audit log: `OUTPUT_PUBLISHED` or `EXPORT_GENERATED` event
- [ ] Approval gate: does this export require human approval?
- [ ] File security: no path traversal, proper content types
- [ ] Disclaimer: clear status label on output
- [ ] Evidence: linked to source data where applicable
- [ ] Rate limiting: exports are rate-limited
- [ ] Cleanup: temporary export files are cleaned up

## Anti-Patterns

```typescript
// ❌ Export without permission check
export async function GET(req: Request) {
  const data = await prisma.model.findMany();
  return new Response(JSON.stringify(data));
}

// ❌ Download without ownership verification
export async function GET(req: Request, { params }: { params: { id: string } }) {
  const file = await prisma.file.findUnique({ where: { id: params.id } });
  return new Response(file.content); // No org check, no audit
}
```

## Correct Pattern

```typescript
// ✅ Export with full governance
export async function exportData(ids: string[]) {
  const user = await getCurrentUser();
  // 1. Permission check
  if (!canExport(user.role)) throw new Error("FORBIDDEN");
  // 2. Tenant scoping
  const data = await prisma.model.findMany({
    where: { id: { in: ids }, organizationId: user.organizationId },
  });
  // 3. Generate output
  const output = await generatePdf(data);
  // 4. Audit log
  await writePlatformAuditLog({
    action: "export.generated",
    organizationId: user.organizationId,
    actorId: user.id,
    metadata: { count: data.length, format: "pdf" },
  });
  // 5. Return with disclaimer
  return { output, disclaimer: "DRAFT — not final", generatedAt: new Date().toISOString() };
}
```
